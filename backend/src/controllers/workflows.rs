use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Deserialize)]
pub struct CreateWorkflowRequest {
    pub name: String,
    pub trigger_event: String,
    pub dag_json: Value,
}

#[derive(Deserialize)]
pub struct ToggleWorkflowRequest {
    pub is_active: bool,
}

// POST /api/v1/workflows
pub async fn create_workflow(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWorkflowRequest>,
) -> Result<impl IntoResponse, Response> {
    let workflow_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO nf_meta.workflow_definitions (id, tenant_id, name, trigger_event, dag_json, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        "#
    )
    .bind(workflow_id)
    .bind(tenant.tenant_id)
    .bind(&payload.name)
    .bind(&payload.trigger_event)
    .bind(&payload.dag_json)
    .execute(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Database error: {}", e)}))).into_response()
    })?;

    // Reload cache in memory
    let _ = crate::services::workflow_engine::reload_all_workflows(&state.pool).await;

    Ok((StatusCode::CREATED, Json(json!({
        "status": "success",
        "message": "Đã lưu Workflow thành công.",
        "data": {
            "id": workflow_id
        }
    }))))
}

// GET /api/v1/workflows
pub async fn list_workflows(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    // DO NOT USE query! macro because the DB is not running during cargo check
    let rows: Vec<(Uuid, String, String, Value, bool, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        r#"
        SELECT id, name, trigger_event, dag_json, is_active, updated_at
        FROM nf_meta.workflow_definitions
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Database error: {}", e)}))).into_response()
    })?;

    let workflows: Vec<Value> = rows.into_iter().map(|(id, name, trigger_event, dag_json, is_active, updated_at)| {
        json!({
            "id": id,
            "name": name,
            "trigger_event": trigger_event,
            "dag_json": dag_json,
            "is_active": is_active,
            "updated_at": updated_at
        })
    }).collect();

    Ok(Json(json!({ "data": workflows })))
}

// PUT /api/v1/workflows/:id/toggle
pub async fn toggle_workflow(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<ToggleWorkflowRequest>,
) -> Result<impl IntoResponse, Response> {
    let result = sqlx::query(
        r#"
        UPDATE nf_meta.workflow_definitions
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        "#
    )
    .bind(payload.is_active)
    .bind(id)
    .bind(tenant.tenant_id)
    .execute(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Database error: {}", e)}))).into_response()
    })?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy Workflow"}))).into_response());
    }

    // Reload cache in memory
    let _ = crate::services::workflow_engine::reload_all_workflows(&state.pool).await;

    Ok(Json(json!({
        "status": "success",
        "message": if payload.is_active { "Đã kích hoạt Workflow" } else { "Đã tạm dừng Workflow" }
    })))
}
