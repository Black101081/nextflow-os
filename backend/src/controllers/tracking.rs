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

    let result = sqlx::query!(
        r#"
        SELECT 
            wi.id, wi.tenant_id, wi.title, wi.status, wi.metadata, wi.created_at, wi.updated_at,
            tu.email as "operator_email?"
        FROM nf_core.work_items wi
        LEFT JOIN nf_core.users tu ON wi.assignee_id = tu.id
        WHERE wi.id = $1
        "#,
        work_item_id
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e: sqlx::Error| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    let invoice = sqlx::query!(
        r#"
        SELECT id, amount::FLOAT as amount, currency, status, vietqr_string, tx_hash
        FROM nf_core.invoices
        WHERE work_item_id = $1
        ORDER BY created_at DESC
        LIMIT 1
        "#,
        work_item_id
    )
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    match result {
        Some(row) => {
            Ok(Json(json!({
                "id": row.id,
                "tenant_id": row.tenant_id,
                "title": row.title,
                "status": row.status,
                "metadata": row.metadata,
                "created_at": row.created_at,
                "updated_at": row.updated_at,
                "operator": row.operator_email.unwrap_or_else(|| "System".to_string()),
                "invoice": invoice.map(|i| json!({
                    "id": i.id,
                    "amount": i.amount,
                    "currency": i.currency,
                    "status": i.status,
                    "vietqr_string": i.vietqr_string,
                    "tx_hash": i.tx_hash
                }))
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
