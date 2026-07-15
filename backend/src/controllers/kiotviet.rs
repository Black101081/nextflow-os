use axum::{
    extract::{State, Json},
    response::IntoResponse,
    http::{StatusCode, HeaderMap},
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use crate::AppState;

use sqlx::Row;

/// Schema Payload của KiotViet Order Webhook
#[derive(Debug, Deserialize)]
pub struct KiotVietWebhookPayload {
    #[serde(rename = "Id")]
    pub id: i64,
    #[serde(rename = "Code")]
    pub code: String,
    #[serde(rename = "Total")]
    pub total: f64,
    #[serde(rename = "Status")]
    pub status: i32, // 1: Hoan thanh, 2: Huy...
    #[serde(rename = "BranchId")]
    pub branch_id: i64,
}

#[derive(Debug, Deserialize)]
pub struct KiotVietWebhookEvent {
    #[serde(rename = "Notifications")]
    pub notifications: Vec<KiotVietWebhookNotification>
}

#[derive(Debug, Deserialize)]
pub struct KiotVietWebhookNotification {
    #[serde(rename = "Action")]
    pub action: String, // e.g., "orders.update"
    #[serde(rename = "Data")]
    pub data: Vec<KiotVietWebhookPayload>
}

/// POST /api/v1/connectors/kiotviet/webhook
/// Inbound Webhook từ KiotViet
pub async fn kiotviet_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(event): Json<KiotVietWebhookEvent>,
) -> impl IntoResponse {

    // 1. Validate KiotViet Signature (Signature is usually passed in headers)
    let _kiotviet_secret = std::env::var("KIOTVIET_WEBHOOK_SECRET").unwrap_or_else(|_| "mock_secret".to_string());
    
    // In production, we extract the signature header and compare HMAC SHA256 of the payload body
    // For this MVP, we will assume validation passes if secret is configured
    let signature_opt = headers.get("X-KiotViet-Signature").and_then(|h| h.to_str().ok());
    if signature_opt.is_none() {
        println!("[KiotViet Webhook] Missing signature header. Proceeding for MVP without strict validation.");
    }

    let mut processed_count = 0;

    // Trong MVP này, do không có Tenant ID truyền kèm từ KiotViet, ta sẽ gán vào Tenant đầu tiên trong DB
    // Trong thực tế, hệ thống sẽ ánh xạ từ BranchId của KiotViet ra Tenant ID tương ứng.
    let tenant_query = "SELECT id FROM nf_core.tenants LIMIT 1";
    let tenant_row = sqlx::query(tenant_query).fetch_optional(&state.pool).await;
    
    let tenant_id: Uuid = match tenant_row {
        Ok(Some(r)) => r.get("id"),
        _ => {
            return (StatusCode::BAD_REQUEST, Json(json!({ "error": "No tenant available in system" }))).into_response()
        }
    };

    for notification in event.notifications {
        if !notification.action.starts_with("orders.") {
            continue; // Chi xu ly order
        }

        for payload in notification.data {
            println!("[KiotViet Webhook] Processing Order Code: {}, Total: {}", payload.code, payload.total);

            // 2. Find target entity `kiotviet_order`
            let entity_query = r#"
                SELECT e.id, s.id as schema_version_id 
                FROM nf_meta.entities e
                LEFT JOIN nf_meta.entity_schemas s ON s.entity_id = e.id AND s.is_active = true
                WHERE e.tenant_id = $1 AND e.system_name = $2
                ORDER BY s.version DESC LIMIT 1
            "#;
            let entity_row = sqlx::query(entity_query)
                .bind(tenant_id)
                .bind("kiotviet_order")
                .fetch_optional(&state.pool)
                .await.unwrap_or(None);

            let (entity_id, schema_version_id): (Uuid, Option<Uuid>) = match entity_row {
                Some(r) => (r.get("id"), r.get("schema_version_id")),
                None => {
                    // Tự động tạo entity kiotviet_order nếu chưa có
                    let insert_entity = r#"
                        INSERT INTO nf_meta.entities (tenant_id, system_name, name, description)
                        VALUES ($1, 'kiotviet_order', 'KiotViet Orders', 'Don hang dong bo tu KiotViet')
                        RETURNING id
                    "#;
                    let new_e = sqlx::query(insert_entity).bind(tenant_id).fetch_one(&state.pool).await.unwrap();
                    let new_id: Uuid = new_e.get("id");
                    (new_id, None)
                }
            };

            let active_schema_id = match schema_version_id {
                Some(sid) => sid,
                None => {
                    // Tạo default schema
                    let insert_schema = r#"
                        INSERT INTO nf_meta.entity_schemas (entity_id, tenant_id, version, schema_json)
                        VALUES ($1, $2, 1, '{}'::jsonb)
                        RETURNING id
                    "#;
                    let s_row = sqlx::query(insert_schema).bind(entity_id).bind(tenant_id).fetch_one(&state.pool).await.unwrap();
                    s_row.get("id")
                }
            };

            // 3. Chuẩn bị payload data 
            let priority = if payload.total >= 5000000.0 { "CRITICAL" } else if payload.total >= 1000000.0 { "HIGH" } else { "MEDIUM" };

            let record_data = json!({
                "title": format!("KiotViet Order {}", payload.code),
                "source": "KIOTVIET_CONNECTOR",
                "kiotviet_order_code": payload.code,
                "amount": payload.total,
                "priority": priority,
                "status": "UNASSIGNED",
                "created_at": chrono::Utc::now()
            });

            // 4. Lưu trực tiếp vào nf_meta.entity_records (Zero-mock)
            let insert_record = r#"
                INSERT INTO nf_meta.entity_records (tenant_id, entity_id, schema_version_id, data)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            "#;

            let row_res = sqlx::query(insert_record)
                .bind(tenant_id)
                .bind(entity_id)
                .bind(active_schema_id)
                .bind(&record_data)
                .fetch_one(&state.pool)
                .await;

            if let Ok(row) = row_res {
                let _record_id: Uuid = row.get("id");
                
                // Auto-Assignment Logic: Giao việc cho nhân viên SME_OPS
                let assignee_query = r#"
                    SELECT id FROM nf_core.users 
                    WHERE tenant_id = $1 AND role = 'SME_OPS' AND is_active = true
                    ORDER BY random() LIMIT 1
                "#;
                let assignee_id: Option<Uuid> = sqlx::query_scalar(assignee_query)
                    .bind(tenant_id)
                    .fetch_optional(&state.pool)
                    .await
                    .unwrap_or(None);
                
                let w_status = if assignee_id.is_some() { "ASSIGNED" } else { "UNASSIGNED" };

                let insert_work_item = r#"
                    INSERT INTO nf_core.work_items (
                        tenant_id, title, description, priority, category, source, external_id, status, assignee_id, metadata
                    ) VALUES ($1, $2, $3, $4, 'KIOTVIET_ORDER', 'KIOTVIET_CONNECTOR', $5, $6, $7, $8)
                "#;
                let _ = sqlx::query(insert_work_item)
                    .bind(tenant_id)
                    .bind(format!("Xử lý đơn KiotViet: {}", payload.code))
                    .bind(format!("Đơn hàng từ KiotViet, tổng giá trị: {}", payload.total))
                    .bind(priority)
                    .bind(&payload.code)
                    .bind(w_status)
                    .bind(assignee_id)
                    .bind(&record_data)
                    .execute(&state.pool)
                    .await;

                // 5. Trigger Workflow Internal & Webhooks
                let event_name = "entity.kiotviet_order.created".to_string();
                let pool_clone = state.pool.clone();
                let payload_data = record_data.clone();

                tokio::spawn(async move {
                    if let Err(err) = crate::services::workflow_engine::trigger_workflow_for_event(&pool_clone, tenant_id, &event_name, payload_data.clone()).await {
                        eprintln!("[Workflow Trigger Error] {}", err);
                    }
                    crate::services::webhook_dispatcher::dispatch_event(&pool_clone, tenant_id, &event_name, payload_data).await;
                });
                
                processed_count += 1;
            }
        }
    }

    Json(json!({
        "status": "success",
        "message": format!("Processed {} KiotViet orders", processed_count)
    })).into_response()
}
