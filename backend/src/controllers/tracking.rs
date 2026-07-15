use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use crate::AppState;
use uuid::Uuid;

// GET /api/v1/tracking/:id
pub async fn get_order_tracking(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, Response> {
    // Parsing UUID để tránh SQL Injection và invalid lookup
    let work_item_id = match Uuid::parse_str(&id) {
        Ok(uuid) => uuid,
        Err(_) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "Mã tra cứu không hợp lệ." })),
            ).into_response());
        }
    };

    let result = sqlx::query(
        r#"
        SELECT 
            wi.id, wi.tenant_id, wi.title, wi.status, wi.metadata, wi.created_at, wi.updated_at,
            tu.email as operator_email
        FROM nf_core.work_items wi
        LEFT JOIN nf_core.users tu ON wi.assignee_id = tu.id
        WHERE wi.id = $1
        "#
    )
    .bind(work_item_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e: sqlx::Error| {
        (StatusCode::INTERNAL_SERVER_ERROR, axum::Json::<serde_json::Value>(json!({ "error": e.to_string() }))).into_response()
    })?;

    let invoice_opt = sqlx::query(
        r#"
        SELECT id, amount::FLOAT as amount, currency, status, vietqr_string, tx_hash
        FROM nf_core.invoices
        WHERE work_item_id = $1
        ORDER BY created_at DESC
        LIMIT 1
        "#
    )
    .bind(work_item_id)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    match result {
        Some(row) => {
            use sqlx::Row;
            let id: Uuid = row.try_get("id").unwrap_or_default();
            let tenant_id: Uuid = row.try_get("tenant_id").unwrap_or_default();
            let title: String = row.try_get("title").unwrap_or_default();
            let status: String = row.try_get("status").unwrap_or_default();
            let metadata: serde_json::Value = row.try_get("metadata").unwrap_or(json!({}));
            let created_at: chrono::DateTime<chrono::Utc> = row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now());
            let updated_at: chrono::DateTime<chrono::Utc> = row.try_get("updated_at").unwrap_or_else(|_| chrono::Utc::now());
            let operator_email: Option<String> = row.try_get("operator_email").ok();

            let invoice_json = invoice_opt.map(|i| {
                let i_id: Uuid = i.try_get("id").unwrap_or_default();
                let i_amount: f64 = i.try_get("amount").unwrap_or(0.0);
                let i_currency: String = i.try_get("currency").unwrap_or_default();
                let i_status: String = i.try_get("status").unwrap_or_default();
                let i_vietqr_string: Option<String> = i.try_get("vietqr_string").ok();
                let i_tx_hash: Option<String> = i.try_get("tx_hash").ok();
                json!({
                    "id": i_id,
                    "amount": i_amount,
                    "currency": i_currency,
                    "status": i_status,
                    "vietqr_string": i_vietqr_string,
                    "tx_hash": i_tx_hash
                })
            });

            Ok(Json(json!({
                "id": id,
                "tenant_id": tenant_id,
                "title": title,
                "status": status,
                "metadata": metadata,
                "created_at": created_at,
                "updated_at": updated_at,
                "operator": operator_email.unwrap_or_else(|| "System".to_string()),
                "invoice": invoice_json
            })))
        },
        None => {
            Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Không tìm thấy đơn hàng với mã tra cứu này." })),
            ).into_response())
        }
    }
}
