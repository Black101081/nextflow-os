use axum::{
    extract::{State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::Row;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateWebhookPayload {
    pub url: String,
    pub secret_key: Option<String>,
    pub events: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct WebhookEndpointResponse {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub url: String,
    pub events: Vec<String>,
    pub is_active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Tạo cấu hình webhook mới
pub async fn create_webhook(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWebhookPayload>,
) -> Response {
    let query = r#"
        INSERT INTO nf_core.webhook_endpoints (tenant_id, url, secret_key, events)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    "#;

    let events_json = serde_json::to_value(&payload.events).unwrap_or(serde_json::json!([]));

    match sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(&payload.url)
        .bind(&payload.secret_key)
        .bind(&events_json)
        .fetch_one(&state.pool)
        .await
    {
        Ok(row) => {
            let id: Uuid = row.get("id");
            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "webhook_id": id
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

/// Lấy danh sách webhook của tenant
pub async fn get_webhooks(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, url, events, is_active, created_at
        FROM nf_core.webhook_endpoints
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    match sqlx::query(query).bind(tenant.tenant_id).fetch_all(&state.pool).await {
        Ok(rows) => {
            let mut endpoints = Vec::new();
            for r in rows {
                let events_val: serde_json::Value = r.get("events");
                let events: Vec<String> = serde_json::from_value(events_val).unwrap_or_default();
                
                endpoints.push(WebhookEndpointResponse {
                    id: r.get("id"),
                    tenant_id: r.get("tenant_id"),
                    url: r.get("url"),
                    events,
                    is_active: r.get("is_active"),
                    created_at: r.get("created_at"),
                });
            }
            (StatusCode::OK, Json(serde_json::json!({
                "status": "success",
                "data": endpoints
            }))).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}
