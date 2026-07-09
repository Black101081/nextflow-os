use axum::{
    extract::{State, Json},
    response::IntoResponse,
    http::{StatusCode, HeaderMap},
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use crate::AppState;

/// Zalo OA Webhook Payload
#[derive(Debug, Deserialize)]
pub struct ZaloWebhookPayload {
    pub event_name: String, // e.g., "user_send_text", "user_submit_info"
    pub app_id: String,
    pub sender: ZaloUser,
    pub recipient: ZaloUser,
    pub message: Option<ZaloMessage>,
    pub timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct ZaloUser {
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct ZaloMessage {
    pub text: Option<String>,
    pub msg_id: String,
}

/// Request để trigger gửi ZNS
#[derive(Debug, Deserialize)]
pub struct SendZnsRequest {
    pub phone_number: String,
    pub template_id: String,
    pub template_data: serde_json::Value,
}

/// POST /api/v1/connectors/zalo/webhook
/// Inbound Webhook từ Zalo OA
pub async fn zalo_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<ZaloWebhookPayload>,
) -> impl IntoResponse {
    println!("[Zalo Webhook] Received event: {}", payload.event_name);

    // TODO: Verify X-ZEVT-Signature using Zalo OA App Secret

    // Trong MVP này, do không có Tenant ID truyền kèm từ Zalo, ta sẽ gán vào Tenant đầu tiên trong DB
    let tenant_query = "SELECT id FROM nf_core.tenants LIMIT 1";
    let tenant_row = sqlx::query(tenant_query).fetch_optional(&state.pool).await;
    
    let tenant_id: Uuid = match tenant_row {
        Ok(Some(r)) => {
            use sqlx::Row;
            r.get("id")
        },
        _ => {
            return (StatusCode::BAD_REQUEST, Json(json!({ "error": "No tenant available in system" }))).into_response()
        }
    };

    // Trigger internal workflow event
    let event_name = format!("zalo.oa.{}", payload.event_name);
    let payload_data = json!({
        "sender_id": payload.sender.id,
        "text": payload.message.as_ref().and_then(|m| m.text.clone()).unwrap_or_default(),
        "timestamp": payload.timestamp
    });

    let pool_clone = state.pool.clone();
    tokio::spawn(async move {
        if let Err(err) = crate::services::workflow_engine::trigger_workflow_for_event(&pool_clone, tenant_id, &event_name, payload_data.clone()).await {
            eprintln!("[Workflow Trigger Error Zalo] {}", err);
        }
    });

    Json(json!({
        "status": "success",
        "message": "Webhook processed"
    })).into_response()
}

/// POST /api/v1/connectors/zalo/zns/send
pub async fn send_zns(
    State(_state): State<AppState>,
    Json(req): Json<SendZnsRequest>,
) -> impl IntoResponse {
    println!("[Zalo ZNS] Sending template {} to {}", req.template_id, req.phone_number);
    println!("[Zalo ZNS] Data: {:?}", req.template_data);

    // Call actual Zalo Open API here
    // POST https://business.openapi.zalo.me/message/template

    Json(json!({
        "status": "success",
        "message": "ZNS Message queued for sending",
        "tracking_id": Uuid::new_v4().to_string()
    })).into_response()
}
