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
pub struct WorkflowDefinitionResponse {
    pub id: Uuid,
    pub name: String,
    pub trigger_event: String,
    pub dag_json: Value,
    pub is_active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorkflowRequest {
    pub name: String,
    pub trigger_event: String,
    pub dag_json: Value,
}

#[derive(Debug, Deserialize)]
pub struct ToggleWorkflowRequest {
    pub is_active: bool,
}


/// Lấy danh sách quy trình làm việc (Workflow DAGs) của một Tenant
pub async fn get_workflows(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, name, trigger_event, dag_json, is_active, created_at
        FROM nf_meta.workflow_definitions
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    match rows {
        Ok(results) => {
            let workflows: Vec<WorkflowDefinitionResponse> = results.iter().map(|r| WorkflowDefinitionResponse {
                id: r.get("id"),
                name: r.get("name"),
                trigger_event: r.get("trigger_event"),
                dag_json: r.get("dag_json"),
                is_active: r.get("is_active"),
                created_at: r.get("created_at"),
            }).collect();
            (StatusCode::OK, Json(serde_json::json!({ "data": workflows }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Tạo mới một Workflow DAG
pub async fn create_workflow(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWorkflowRequest>,
) -> Response {
    let query = r#"
        INSERT INTO nf_meta.workflow_definitions (tenant_id, name, trigger_event, dag_json)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    "#;

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(&payload.name)
        .bind(&payload.trigger_event)
        .bind(&payload.dag_json)
        .fetch_one(&state.pool)
        .await;

    match row {
        Ok(r) => {
            let workflow_id: Uuid = r.get("id");
            // Reload cache
            let _ = crate::services::workflow_engine::reload_all_workflows(&state.pool).await;
            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "workflow_id": workflow_id
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Bật tắt một Workflow DAG
pub async fn toggle_workflow(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<ToggleWorkflowRequest>,
) -> Response {
    let query = r#"
        UPDATE nf_meta.workflow_definitions
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
    "#;

    let result = sqlx::query(query)
        .bind(payload.is_active)
        .bind(id)
        .bind(tenant.tenant_id)
        .execute(&state.pool)
        .await;

    match result {
        Ok(_) => {
            // Reload cache
            let _ = crate::services::workflow_engine::reload_all_workflows(&state.pool).await;
            (StatusCode::OK, Json(serde_json::json!({
                "status": "success",
                "message": if payload.is_active { "Đã kích hoạt Workflow" } else { "Đã tạm dừng Workflow" }
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}
