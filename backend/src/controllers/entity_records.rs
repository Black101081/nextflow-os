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
}

#[derive(Debug, Deserialize)]
pub struct CreateRecordRequest {
    pub entity_id: Uuid,
    pub schema_version_id: Uuid,
    pub data: Value,
}

/// Lấy JSON Schema của một Thực thể (Entity) để Frontend tự động vẽ Form
pub async fn get_entity_schema(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(system_name): Path<String>,
) -> Response {
    let query = r#"
        SELECT e.id as entity_id, e.system_name, s.schema_json
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
