use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use sqlx::Row;

use crate::{
    middleware::{rbac::RbacContext, tenant_isolation::TenantIsolation},
    services::blockchain::{compute_invoice_data_hash, anchor_data_on_chain},
    AppState,
};

// --- Models ---

#[derive(Deserialize)]
pub struct CreateInvoicePayload {
    pub work_item_id: Uuid,
    pub amount: f64,
    pub due_date: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Serialize)]
pub struct InvoiceResponse {
    pub id: Uuid,
    pub work_item_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub payment_link_url: Option<String>,
    pub due_date: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct StripeWebhookPayload {
    pub type_field: String, // e.g., "checkout.session.completed"
    pub data: StripeWebhookData,
}

#[derive(Deserialize)]
pub struct StripeWebhookData {
    pub object: StripeWebhookObject,
}

#[derive(Deserialize)]
pub struct StripeWebhookObject {
    pub client_reference_id: Option<String>, // Dùng để map với invoice_id
    pub payment_intent: Option<String>,
    pub amount_total: Option<i64>,
}

// --- Handlers ---

/// POST /api/v1/billing/invoices
/// Bắt buộc quyền `manage_financials` (SME_LEADER)
pub async fn create_invoice(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<CreateInvoicePayload>,
) -> impl IntoResponse {
    // 1. Kiểm tra phân quyền (RBAC)
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    let tenant_id = tenant.tenant_id;

    // 2. Giả lập tích hợp Stripe API để sinh Payment Link
    let mock_payment_link = format!("https://checkout.stripe.com/pay/cs_test_{}", Uuid::new_v4());
    let mock_stripe_invoice_id = format!("in_{}", Uuid::new_v4());

    // 2.1 Sinh mã Blockchain Trust Layer
    let invoice_id = Uuid::new_v4();
    let data_hash = compute_invoice_data_hash(invoice_id, payload.amount, "USD", "UNPAID");
    let tx_hash = anchor_data_on_chain(&data_hash).await;

    // 3. Insert vào DB
    let result = sqlx::query(
        r#"
        INSERT INTO nf_core.invoices (id, tenant_id, work_item_id, amount, status, due_date, payment_link_url, stripe_invoice_id, data_hash, tx_hash)
        VALUES ($1, $2, $3, $4, 'UNPAID', $5, $6, $7, $8, $9)
        RETURNING id, work_item_id, amount::FLOAT, currency, status, payment_link_url, due_date, created_at
        "#
    )
    .bind(invoice_id)
    .bind(tenant_id)
    .bind(payload.work_item_id)
    .bind(payload.amount)
    .bind(payload.due_date)
    .bind(&mock_payment_link)
    .bind(&mock_stripe_invoice_id)
    .bind(&data_hash)
    .bind(&tx_hash)
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(record) => {
            let res = InvoiceResponse {
                id: record.get("id"),
                work_item_id: record.get("work_item_id"),
                amount: record.get::<f64, _>("amount"),
                currency: record.get("currency"),
                status: record.get("status"),
                payment_link_url: record.get("payment_link_url"),
                due_date: record.get("due_date"),
                created_at: record.get::<Option<chrono::DateTime<chrono::Utc>>, _>("created_at").unwrap_or_default(),
            };
            (axum::http::StatusCode::CREATED, Json(json!({ "invoice": res }))).into_response()
        }
        Err(e) => {
            let err = json!({
                "error": {
                    "code": "DB_ERROR",
                    "message": format!("Không thể tạo hóa đơn: {}", e)
                }
            });
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response()
        }
    }
}

/// GET /api/v1/billing/invoices
/// Bắt buộc quyền `view_financials` (SME_LEADER, SME_OPS)
pub async fn get_invoices(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_financials") {
        return e.into_response();
    }

    let tenant_id = tenant.tenant_id;
    
    // 2. Query từ CSDL
    let records = sqlx::query(
        r#"
        SELECT id, work_item_id, amount::FLOAT as amount, currency, status, payment_link_url, due_date, created_at
        FROM nf_core.invoices
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant_id)
    .fetch_all(&state.pool)
    .await;

    match records {
        Ok(rows) => {
            let mut invoices = Vec::new();
            for r in rows {
                invoices.push(json!({
                    "id": r.get::<Uuid, _>("id"),
                    "work_item_id": r.get::<Uuid, _>("work_item_id"),
                    "amount": r.get::<f64, _>("amount"),
                    "currency": r.get::<String, _>("currency"),
                    "status": r.get::<String, _>("status"),
                    "payment_link_url": r.get::<Option<String>, _>("payment_link_url"),
                    "due_date": r.get::<Option<chrono::DateTime<chrono::Utc>>, _>("due_date"),
                    "created_at": r.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }));
            }
            Json(json!({ "invoices": invoices })).into_response()
        }
        Err(e) => {
            let err = json!({
                "error": {
                    "code": "DB_ERROR",
                    "message": format!("Không thể lấy danh sách hóa đơn: {}", e)
                }
            });
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response()
        }
    }
}

/// POST /api/v1/billing/webhooks/stripe
/// Endpoint Public: Không nhận Auth Header
/// Nhận sự kiện từ Stripe khi khách hàng thanh toán thành công
pub async fn stripe_webhook(
    State(state): State<AppState>,
    // Trong môi trường thật, cần nhận raw body và Stripe-Signature để verify. Ở đây ta dùng JSON thẳng cho MVP.
    Json(payload): Json<serde_json::Value>, 
) -> impl IntoResponse {
    // Ép kiểu một phần
    let type_field = payload.get("type").and_then(|v| v.as_str()).unwrap_or("");
    
    if type_field == "checkout.session.completed" {
        if let Some(obj) = payload.get("data").and_then(|d| d.get("object")) {
            if let Some(client_ref) = obj.get("client_reference_id").and_then(|c| c.as_str()) {
                if let Ok(invoice_id) = Uuid::parse_str(client_ref) {
                    
                    let payment_intent = obj.get("payment_intent").and_then(|pi| pi.as_str()).unwrap_or("unknown");
                    let amount_total = obj.get("amount_total").and_then(|a| a.as_f64()).unwrap_or(0.0) / 100.0;

                    // 1. Sinh mã băm Blockchain mới cho trạng thái PAID
                    let new_data_hash = compute_invoice_data_hash(invoice_id, amount_total, "USD", "PAID");
                    let new_tx_hash = anchor_data_on_chain(&new_data_hash).await;

                    // 2. Cập nhật Invoices -> PAID và lưu trữ mã Hash mới
                    let inv_result = sqlx::query(
                        "UPDATE nf_core.invoices SET status = 'PAID', data_hash = $2, tx_hash = $3 WHERE id = $1 RETURNING tenant_id"
                    )
                    .bind(invoice_id)
                    .bind(&new_data_hash)
                    .bind(&new_tx_hash)
                    .fetch_one(&state.pool)
                    .await;

                    if let Ok(record) = inv_result {
                        let tenant_id: Uuid = record.get("tenant_id");
                        crate::services::webhook_dispatcher::dispatch_event(
                            &state.pool,
                            tenant_id,
                            "INVOICE_PAID",
                            serde_json::json!({
                                "invoice_id": invoice_id,
                                "amount_total": amount_total,
                                "status": "PAID",
                                "tx_hash": new_tx_hash
                            }),
                        ).await;
                    }

                    // 2. Lưu vào Transactions
                    let _ = sqlx::query(
                        r#"
                        INSERT INTO nf_core.transactions (invoice_id, gateway, gateway_transaction_id, amount, status, raw_payload)
                        VALUES ($1, 'stripe', $2, $3, 'succeeded', $4)
                        "#
                    )
                    .bind(invoice_id)
                    .bind(&payment_intent)
                    .bind(amount_total)
                    .bind(&payload)
                    .execute(&state.pool).await;
                }
            }
        }
    }

    // Luôn trả về 200 OK cho Webhook provider
    (axum::http::StatusCode::OK, "Webhook received").into_response()
}
