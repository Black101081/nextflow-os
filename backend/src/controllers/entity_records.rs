use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::Row;
use uuid::Uuid;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Serialize)]
pub struct EntitySchemaResponse {
    pub entity_id: Uuid,
    pub system_name: String,
    pub schema_json: Value,
    pub schema_version_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct CreateRecordRequest {
    pub entity_id: Uuid,
    pub schema_version_id: Uuid,
    pub data: Value,
}

#[derive(Debug, Deserialize)]
pub struct CreateEntityRequest {
    pub name: String,
    pub system_name: String,
    pub description: Option<String>,
    pub schema_json: Value,
}

#[derive(Debug, Serialize)]
pub struct EntityInfo {
    pub id: Uuid,
    pub name: String,
    pub system_name: String,
    pub description: Option<String>,
}

/// Lấy danh sách Thực thể (Entities) của một Tenant
pub async fn get_entities(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, name, system_name, description
        FROM nf_meta.entities
        WHERE tenant_id = $1
        ORDER BY created_at ASC
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    match rows {
        Ok(results) => {
            let entities: Vec<EntityInfo> = results.iter().map(|r| EntityInfo {
                id: r.get("id"),
                name: r.get("name"),
                system_name: r.get("system_name"),
                description: r.get("description"),
            }).collect();
            (StatusCode::OK, Json(entities)).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Tạo mới một Thực thể (Entity) và Schema đầu tiên của nó
pub async fn create_entity(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateEntityRequest>,
) -> Response {
    let mut tx = match state.pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response(),
    };

    let entity_query = r#"
        INSERT INTO nf_meta.entities (tenant_id, name, system_name, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    "#;

    let entity_row = sqlx::query(entity_query)
        .bind(tenant.tenant_id)
        .bind(&payload.name)
        .bind(&payload.system_name)
        .bind(&payload.description)
        .fetch_one(&mut *tx)
        .await;

    let entity_id: Uuid = match entity_row {
        Ok(r) => r.get("id"),
        Err(e) => {
            let _ = tx.rollback().await;
            return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": e.to_string()}))).into_response();
        }
    };

    let schema_query = r#"
        INSERT INTO nf_meta.entity_schemas (entity_id, tenant_id, version, schema_json)
        VALUES ($1, $2, 1, $3)
        RETURNING id
    "#;

    match sqlx::query(schema_query)
        .bind(entity_id)
        .bind(tenant.tenant_id)
        .bind(&payload.schema_json)
        .execute(&mut *tx)
        .await
    {
        Ok(_) => {
            let _ = tx.commit().await;
            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "entity_id": entity_id
            }))).into_response()
        },
        Err(e) => {
            let _ = tx.rollback().await;
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Lấy JSON Schema của một Thực thể (Entity) để Frontend tự động vẽ Form
pub async fn get_entity_schema(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(system_name): Path<String>,
) -> Response {
    let query = r#"
        SELECT e.id as entity_id, e.system_name, s.schema_json, s.id as schema_version_id
        FROM nf_meta.entities e
        JOIN nf_meta.entity_schemas s ON s.entity_id = e.id
        WHERE e.tenant_id = $1 AND e.system_name = $2 AND s.is_active = true
        ORDER BY s.version DESC
        LIMIT 1
    "#;

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(&system_name)
        .fetch_optional(&state.pool)
        .await;

    match row {
        Ok(Some(r)) => {
            let schema_json: Value = r.get("schema_json");
            let res = EntitySchemaResponse {
                entity_id: r.get("entity_id"),
                system_name: r.get("system_name"),
                schema_json,
                schema_version_id: r.get("schema_version_id"),
            };
            (StatusCode::OK, Json(res)).into_response()
        },
        Ok(None) => {
            (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Schema not found"}))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Tạo một Record động (Dynamic Record) vào JSONB Database
pub async fn create_entity_record(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateRecordRequest>,
) -> Response {
    // Lưu ý: Ở một hệ thống thực tế, backend sẽ dùng một thư viện Validate (như jsonschema) 
    // để kiểm tra xem payload.data có khớp với schema_json trước khi Insert.
    // Ở bản MVP này, ta giả định dữ liệu đã hợp lệ từ Frontend.
    
    let query = r#"
        INSERT INTO nf_meta.entity_records (tenant_id, entity_id, schema_version_id, data)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    "#;

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(payload.entity_id)
        .bind(payload.schema_version_id)
        .bind(&payload.data)
        .fetch_one(&state.pool)
        .await;

    match row {
        Ok(r) => {
            let record_id: Uuid = r.get("id");
            
            // 1. Fetch system_name to trigger workflow
            let entity_query = "SELECT system_name FROM nf_meta.entities WHERE id = $1";
            if let Ok(Some(e_row)) = sqlx::query(entity_query).bind(payload.entity_id).fetch_optional(&state.pool).await {
                let system_name: String = e_row.get("system_name");
                let event_name = format!("entity.{}.created", system_name);
                
                // 2. Trigger workflow in the background
                let pool_clone = state.pool.clone();
                let tenant_id = tenant.tenant_id;
                let payload_data = payload.data.clone();
                
                tokio::spawn(async move {
                    // 2a. Trigger Workflow Internal
                    if let Err(err) = crate::services::workflow_engine::trigger_workflow_for_event(&pool_clone, tenant_id, &event_name, payload_data.clone()).await {
                        eprintln!("[Workflow Trigger Error] {}", err);
                    }
                    
                    // 2b. Fire External Webhooks (Phase 7B)
                    crate::services::webhook_dispatcher::dispatch_event(&pool_clone, tenant_id, &event_name, payload_data).await;
                });
            }

            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "record_id": record_id
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

#[derive(Debug, Serialize)]
pub struct EntityRecordResponse {
    pub id: Uuid,
    pub entity_id: Uuid,
    pub data: Value,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Lấy danh sách các bản ghi của một thực thể (dùng cho Data Table)
pub async fn get_entity_records(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(system_name): Path<String>,
) -> Response {
    let query = r#"
        SELECT r.id, r.entity_id, r.data, r.created_at
        FROM nf_meta.entity_records r
        JOIN nf_meta.entities e ON e.id = r.entity_id
        WHERE e.tenant_id = $1 AND e.system_name = $2 AND r.tenant_id = $1
        ORDER BY r.created_at DESC
        LIMIT 100
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(&system_name)
        .fetch_all(&state.pool)
        .await;

    match rows {
        Ok(results) => {
            let records: Vec<EntityRecordResponse> = results.iter().map(|r| EntityRecordResponse {
                id: r.get("id"),
                entity_id: r.get("entity_id"),
                data: r.get("data"),
                created_at: r.get("created_at"),
            }).collect();
            (StatusCode::OK, Json(records)).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}
