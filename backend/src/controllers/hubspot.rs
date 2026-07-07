use axum::{
    extract::{State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use sqlx::Row;
use hmac::{Hmac, Mac};
use sha2::Sha256;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Deserialize, Serialize)]
pub struct HubSpotWebhookPayload {
    pub object_id: i64,
    pub property_name: String,
    pub property_value: String,
}

// Mock structure cho HubSpot Deal Details
#[derive(Debug, Serialize)]
pub struct HubSpotDealDetails {
    pub dealname: String,
    pub amount: f64,
    pub description: String,
}

// Giả lập cuộc gọi API HubSpot CRM
async fn mock_fetch_hubspot_deal(object_id: i64) -> Result<HubSpotDealDetails, String> {
    if object_id == 99999 {
        return Err("HubSpot API Gateway Timeout (Transient Error)".to_string());
    }
    
    Ok(HubSpotDealDetails {
        dealname: format!("Hop dong cung cap thiet bi SME - Deal #{}", object_id),
        amount: 45000.0,
        description: "Yeu cau trien khai lap dat thiet bi ha tang ky thuat cho doi tac.".to_string(),
    })
}

// Thuật toán ánh xạ độ ưu tiên dựa trên giá trị hợp đồng
fn map_amount_to_priority(amount: f64) -> &'static str {
    if amount < 10000.0 {
        "LOW"
    } else if amount >= 10000.0 && amount < 50000.0 {
        "MEDIUM"
    } else {
        "HIGH"
    }
}

pub async fn hubspot_webhook(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    headers: HeaderMap,
    Json(payload): Json<HubSpotWebhookPayload>,
) -> Result<impl IntoResponse, Response> {
    // Phase 4: HubSpot Webhook Signature v3 Verification (HMAC-SHA256)
    let hub_secret = std::env::var("HUBSPOT_WEBHOOK_SECRET").unwrap_or_default();
    if !hub_secret.is_empty() {
        let signature_opt = headers
            .get("x-hubspot-signature-v3")
            .and_then(|h| h.to_str().ok());

        match signature_opt {
            None => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": { "code": "MISSING_SIGNATURE", "message": "Thieu header x-hubspot-signature-v3." } }))
                ).into_response());
            }
            Some(signature) => {
                // Compute HMAC-SHA256 of raw body using the webhook secret
                type HmacSha256 = Hmac<Sha256>;
                let raw_body = serde_json::to_string(&payload).unwrap_or_default();
                let mut mac = HmacSha256::new_from_slice(hub_secret.as_bytes())
                    .expect("HMAC key invalid");
                mac.update(raw_body.as_bytes());
                let expected_sig = hex::encode(mac.finalize().into_bytes());

                if signature != expected_sig {
                    return Err((
                        StatusCode::UNAUTHORIZED,
                        Json(json!({ "error": { "code": "INVALID_SIGNATURE", "message": "Chu ky HubSpot khong hop le. Yeu cau bi tu choi." } }))
                    ).into_response());
                }
            }
        }
    }

    println!(
        "[HubSpot Webhook] Received webhook event for Tenant: {}, Object ID: {}, Property: {} = {}",
        tenant.tenant_id, payload.object_id, payload.property_name, payload.property_value
    );

    // 1. Chỉ xử lý khi Deal được cập nhật sang giai đoạn "closedwon"
    if payload.property_name != "dealstage" || payload.property_value != "closedwon" {
        return Ok(Json(json!({
            "status": "skipped",
            "message": "Chi quan tam den su kien dealstage = closedwon."
        })).into_response());
    }

    let mut attempt = 0;
    let max_attempts = 3;
    let mut deal_details_opt = None;
    let mut error_msg = String::new();

    // 2. Exponential Backoff with Jitter (Giả lập trong Webhook)
    while attempt < max_attempts {
        attempt += 1;
        match mock_fetch_hubspot_deal(payload.object_id).await {
            Ok(details) => {
                deal_details_opt = Some(details);
                break;
            }
            Err(err) => {
                error_msg = err.clone();
                println!(
                    "[HubSpot Webhook] Attempt {} failed for Deal {}: {}. Retrying...",
                    attempt, payload.object_id, err
                );
                // Giả lập backoff delay
                tokio::time::sleep(tokio::time::Duration::from_millis(attempt * 100)).await;
            }
        }
    }

    let deal_details = match deal_details_opt {
        Some(d) => d,
        None => {
            // Lỗi permanent sau khi retry thất bại -> Đẩy vào Integration Exception Queue
            println!(
                "[HubSpot Webhook] Permanent Failure for Deal {}. Logging task exception.",
                payload.object_id
            );
            
            // Để chèn exception vào DB mà không vi phạm khoá ngoại work_item_id, ta tạo một Work Item đặc biệt đại diện cho lỗi
            let error_title = format!("Loi dong bo HubSpot Deal: Deal ID #{}", payload.object_id);
            let error_desc = format!("Quy trinh dong bo deal tu HubSpot bi loi: {}. Can can thiep thu cong.", error_msg);
            let external_id = format!("hubspot_error_{}_{}", payload.object_id, Uuid::new_v4().simple());
            
            let mut tx = state.pool.begin().await.map_err(|err| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err.to_string() }))).into_response()
            })?;

            // Insert work item loi
            let insert_work_item_query = r#"
                INSERT INTO nf_core.work_items (
                    tenant_id, title, description, priority, category, source, external_id, metadata, status
                ) VALUES ($1, $2, $3, 'HIGH', 'OPERATIONS', 'HUBSPOT_CONNECTOR', $4, $5, 'UNASSIGNED')
                RETURNING id
            "#;
            
            let row = sqlx::query(insert_work_item_query)
                .bind(tenant.tenant_id)
                .bind(&error_title)
                .bind(&error_desc)
                .bind(&external_id)
                .bind(json!({ "hubspot_object_id": payload.object_id, "error": error_msg }))
                .fetch_one(&mut *tx)
                .await
                .map_err(|err| {
                    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err.to_string() }))).into_response()
                })?;

            let work_item_id: Uuid = row.get("id");

            // Insert integration task exception
            let insert_exception_query = r#"
                INSERT INTO nf_core.task_exceptions (
                    tenant_id, work_item_id, exception_type, reason, status
                ) VALUES ($1, $2, 'INTEGRATION_FAULT', $3, 'PENDING')
            "#;

            sqlx::query(insert_exception_query)
                .bind(tenant.tenant_id)
                .bind(work_item_id)
                .bind(&error_msg)
                .execute(&mut *tx)
                .await
                .map_err(|err| {
                    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err.to_string() }))).into_response()
                })?;

            tx.commit().await.map_err(|err| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err.to_string() }))).into_response()
            })?;

            return Ok((
                StatusCode::ACCEPTED,
                Json(json!({
                    "status": "failed",
                    "error": error_msg,
                    "message": "Loi dong bo. Da tao exception de quan tri vien kiem tra."
                })),
            ).into_response());
        }
    };

    // 3. Mapping data sang Nextflow Canonical Model
    let external_id = format!("hubspot_deal_{}", payload.object_id);
    let title = format!("Ho so trien khai dich vu: {}", deal_details.dealname);
    let description = format!("{} | Tao tu dong tu HubSpot Deal ID: {}", deal_details.description, payload.object_id);
    let priority = map_amount_to_priority(deal_details.amount);
    let metadata = json!({
        "deal_amount": deal_details.amount,
        "hubspot_object_id": payload.object_id
    });

    // 4. Idempotency Check: Kiểm tra xem external_id đã tồn tại chưa
    let exist_opt = sqlx::query("SELECT id FROM nf_core.work_items WHERE external_id = $1 AND tenant_id = $2")
        .bind(&external_id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|err| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err.to_string() }))).into_response()
        })?;

    if exist_opt.is_some() {
        return Ok(Json(json!({
            "status": "idempotent",
            "message": "Deal nay da duoc dong bo tu truoc."
        })).into_response());
    }

    // 5. Thực hiện insert Work Item mới vào DB
    let insert_query = r#"
        INSERT INTO nf_core.work_items (
            tenant_id, title, description, priority, category, source, external_id, metadata, status
        ) VALUES ($1, $2, $3, $4, 'OPERATIONS', 'HUBSPOT_CONNECTOR', $5, $6, 'UNASSIGNED')
        RETURNING id, status, priority, created_at, version
    "#;

    let row = sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(&title)
        .bind(&description)
        .bind(priority)
        .bind(&external_id)
        .bind(metadata)
        .fetch_one(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[HubSpot Webhook] DB Insert error: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Loi ghi nhan du lieu vao database." }))).into_response()
        })?;

    let work_item_id: Uuid = row.get("id");
    let status: String = row.get("status");
    let priority: String = row.get("priority");
    let version: i32 = row.get("version");

    // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_CREATED",
        "data": {
            "id": work_item_id,
            "title": title,
            "status": status,
            "priority": priority,
            "version": version
        }
    }).to_string());

    Ok(Json(json!({
        "status": "success",
        "work_item_id": work_item_id,
        "message": "Dong bo Deal tu HubSpot sang Nextflow Work Item thanh cong."
    })).into_response())
}
