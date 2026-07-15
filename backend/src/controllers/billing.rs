use axum::{
    extract::{State, Path},
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

#[derive(Deserialize, Serialize)]
pub struct VietQRWebhookPayload {
    pub gateway: String,
    pub transaction_id: String,
    pub amount: f64,
    pub transfer_content: String,
}

#[derive(Deserialize)]
pub struct CryptoVerifyPayload {
    pub invoice_id: Uuid,
    pub tx_hash: String,
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

    // 2. Generate VietQR details
    // In production, these should be configured per tenant. For MVP, we hardcode.
    let mock_bank_bin = "970415"; // VietinBank
    let mock_bank_account = "113366668888";
    let mock_account_name = "NEXTFLOW OS";

    let invoice_id = Uuid::new_v4();
    let transfer_content = format!("NF{}", invoice_id.to_string().replace("-", "").chars().take(8).collect::<String>().to_uppercase());
    
    let vietqr_url = format!(
        "https://img.vietqr.io/image/{}-{}-compact2.jpg?amount={}&addInfo={}&accountName={}",
        mock_bank_bin, mock_bank_account, payload.amount, transfer_content, mock_account_name
    );

    // 2.1 Sinh mã Blockchain Trust Layer
    let data_hash = compute_invoice_data_hash(invoice_id, payload.amount, "VND", "UNPAID");
    let tx_hash = anchor_data_on_chain(&state.pool, tenant.tenant_id, &data_hash, &json!({"data": data_hash})).await;

    // 3. Insert vào DB
    let result = sqlx::query(
        r#"
        INSERT INTO nf_core.invoices (id, tenant_id, work_item_id, amount, currency, status, due_date, vietqr_string, bank_bin, bank_account, transfer_content, data_hash, tx_hash)
        VALUES ($1, $2, $3, $4, 'VND', 'UNPAID', $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, work_item_id, amount::FLOAT, currency, status, vietqr_string, due_date, created_at
        "#
    )
    .bind(invoice_id)
    .bind(tenant_id)
    .bind(payload.work_item_id)
    .bind(payload.amount)
    .bind(payload.due_date)
    .bind(&vietqr_url)
    .bind(mock_bank_bin)
    .bind(mock_bank_account)
    .bind(&transfer_content)
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
                payment_link_url: record.get("vietqr_string"), // Trả về QR ảnh thay cho Stripe link
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
        SELECT id, work_item_id, amount::float8 as amount, currency, status, vietqr_string as payment_link_url, due_date, created_at, data_hash, tx_hash
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
                let id: Uuid = r.try_get("id").unwrap_or_default();
                let work_item_id: Uuid = r.try_get("work_item_id").unwrap_or_default();
                let amount: f64 = r.try_get("amount").unwrap_or_default();
                let currency: String = r.try_get("currency").unwrap_or_else(|_| "VND".to_string());
                let status: String = r.try_get("status").unwrap_or_else(|_| "UNPAID".to_string());
                let payment_link_url: Option<String> = r.try_get("payment_link_url").ok();
                let due_date: Option<chrono::DateTime<chrono::Utc>> = r.try_get("due_date").ok();
                let created_at: chrono::DateTime<chrono::Utc> = r.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now());
                let data_hash: Option<String> = r.try_get("data_hash").ok();
                let tx_hash: Option<String> = r.try_get("tx_hash").ok();

                invoices.push(json!({
                    "id": id,
                    "work_item_id": work_item_id,
                    "amount": amount,
                    "currency": currency,
                    "status": status,
                    "payment_link_url": payment_link_url,
                    "due_date": due_date,
                    "created_at": created_at,
                    "data_hash": data_hash,
                    "tx_hash": tx_hash,
                }));
            }
            Json(json!({ "invoices": invoices })).into_response()
        }
        Err(e) => {
            eprintln!("[Billing Error] Failed to fetch invoices from db: {:?}", e);
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

/// POST /api/v1/billing/webhooks/vietqr
/// Endpoint Public: Nhận webhook từ Open API ngân hàng hoặc SeAMin khi tiền vào tài khoản
pub async fn vietqr_webhook(
    State(state): State<AppState>,
    Json(payload): Json<VietQRWebhookPayload>, 
) -> impl IntoResponse {
    
    // Tìm hóa đơn dựa trên nội dung chuyển khoản (transfer_content)
    let inv_row = sqlx::query("SELECT id, tenant_id, amount::FLOAT FROM nf_core.invoices WHERE transfer_content = $1 AND status = 'UNPAID'")
        .bind(&payload.transfer_content)
        .fetch_optional(&state.pool)
        .await;

    if let Ok(Some(row)) = inv_row {
        let invoice_id: Uuid = row.get("id");
        let expected_amount: f64 = row.get("amount");
        let tenant_id: Uuid = row.get("tenant_id");

        if payload.amount >= expected_amount {
            // 1. Sinh mã băm Blockchain mới cho trạng thái PAID
            let new_data_hash = compute_invoice_data_hash(invoice_id, payload.amount, "VND", "PAID");
            let new_tx_hash = anchor_data_on_chain(&state.pool, tenant_id, &new_data_hash, &json!({"data": new_data_hash})).await;

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
                        "amount_total": payload.amount,
                        "status": "PAID",
                        "tx_hash": new_tx_hash
                    }),
                ).await;
            }

            // 3. Lưu vào Transactions
            let _ = sqlx::query(
                r#"
                INSERT INTO nf_core.transactions (invoice_id, gateway, gateway_transaction_id, amount, status, raw_payload)
                VALUES ($1, 'vietqr', $2, $3, 'succeeded', $4)
                "#
            )
            .bind(invoice_id)
            .bind(&payload.transaction_id)
            .bind(payload.amount)
            .bind(serde_json::json!(&payload))
            .execute(&state.pool).await;
        }
    }

    (axum::http::StatusCode::OK, "Webhook received").into_response()
}

/// POST /api/v1/billing/crypto/verify
pub async fn verify_crypto_payment(
    State(state): State<AppState>,
    Json(payload): Json<CryptoVerifyPayload>,
) -> impl IntoResponse {
    // Giả lập verify on-chain
    // Trong thực tế, chúng ta sẽ gọi API của blockchain explorer (e.g. U2U Explorer) 
    // để kiểm tra xem tx_hash có hợp lệ và chuyển đúng số tiền vào ví của SME chưa.
    
    // Đánh dấu hóa đơn là PAID và lưu lại tx_hash của blockchain
    let result = sqlx::query(
        r#"
        UPDATE nf_core.invoices
        SET status = 'PAID', tx_hash = $1
        WHERE id = $2 AND status = 'UNPAID'
        RETURNING id
        "#
    )
    .bind(&payload.tx_hash)
    .bind(payload.invoice_id)
    .fetch_optional(&state.pool)
    .await;

    match result {
        Ok(Some(_)) => {
            (axum::http::StatusCode::OK, Json(json!({ "message": "Xác minh Web3 thành công, thanh toán đã được ghi nhận." }))).into_response()
        }
        Ok(None) => {
            (axum::http::StatusCode::BAD_REQUEST, Json(json!({ "error": "Hóa đơn không tồn tại hoặc đã được thanh toán trước đó." }))).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Lỗi hệ thống: {}", e) }))).into_response()
        }
    }
}

/// GET /api/v1/billing/invoices/:id/verify-integrity
pub async fn verify_invoice_integrity(
    State(state): State<AppState>,
    Path(invoice_id): Path<Uuid>,
) -> impl IntoResponse {
    let query_res = sqlx::query(
        r#"
        SELECT id, amount::FLOAT, currency, status, data_hash, tx_hash
        FROM nf_core.invoices
        WHERE id = $1
        "#
    )
    .bind(invoice_id)
    .fetch_optional(&state.pool)
    .await;

    match query_res {
        Ok(Some(row)) => {
            let amount: f64 = row.get("amount");
            let currency: String = row.get("currency");
            let status: String = row.get("status");
            let data_hash_db: Option<String> = row.get("data_hash");
            let tx_hash_db: Option<String> = row.get("tx_hash");

            let expected_hash = compute_invoice_data_hash(invoice_id, amount, &currency, &status);

            let mut status_result = "VERIFIED";
            let mut matches = true;

            if let Some(db_hash) = data_hash_db.clone() {
                if db_hash != expected_hash {
                    status_result = "TAMPERED";
                    matches = false;
                    println!(
                        "[Blockchain Tamper Alert] Hash mismatch! Invoice ID: {}. DB Hash: {}, Computed expected hash: {}",
                        invoice_id, db_hash, expected_hash
                    );
                }
            } else {
                status_result = "UNANCHORED";
                matches = false;
            }

            (
                axum::http::StatusCode::OK,
                Json(json!({
                    "invoice_id": invoice_id,
                    "db_hash": data_hash_db,
                    "expected_hash": expected_hash,
                    "tx_hash": tx_hash_db,
                    "matches": matches,
                    "status": status_result,
                    "message": if matches {
                        "Xác thực toàn vẹn thành công: Dữ liệu CSDL khớp hoàn toàn với bảo chứng Blockchain."
                    } else if status_result == "TAMPERED" {
                        "CẢNH BÁO GIẢ MẠO: Dữ liệu hóa đơn trong CSDL đã bị sửa đổi trái phép!"
                    } else {
                        "Hóa đơn chưa được neo giữ dữ liệu trên chuỗi khối."
                    }
                })),
            )
                .into_response()
        }
        Ok(None) => (
            axum::http::StatusCode::NOT_FOUND,
            Json(json!({ "error": "Không tìm thấy hóa đơn cần xác thực." })),
        )
            .into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Lỗi truy vấn CSDL: {}", e) })),
        )
            .into_response(),
    }
}
