use axum::{
    extract::{State, Query},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::Row;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct LedgerQueryParams {
    pub tenant_id: Option<uuid::Uuid>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct LedgerRecord {
    pub id: uuid::Uuid,
    pub tenant_id: uuid::Uuid,
    pub tx_hash: String,
    pub payload_snapshot: Value,
    pub network: String,
    pub status: String,
    pub created_at: String,
}

pub async fn get_ledger(
    State(state): State<AppState>,
    Query(params): Query<LedgerQueryParams>,
) -> Result<impl IntoResponse, Response> {
    let limit = params.limit.unwrap_or(50);
    
    // Nếu có tenant_id thì lọc, không thì lấy toàn bộ
    let query = if params.tenant_id.is_some() {
        r#"
        SELECT id, tenant_id, tx_hash, payload_snapshot, network, status, created_at 
        FROM nf_core.blockchain_ledger 
        WHERE tenant_id = $1
        ORDER BY created_at DESC 
        LIMIT $2
        "#
    } else {
        r#"
        SELECT id, tenant_id, tx_hash, payload_snapshot, network, status, created_at 
        FROM nf_core.blockchain_ledger 
        ORDER BY created_at DESC 
        LIMIT $1
        "#
    };
    
    let rows_result = if let Some(tenant_id) = params.tenant_id {
        sqlx::query(query)
            .bind(tenant_id)
            .bind(limit)
            .fetch_all(&state.pool)
            .await
    } else {
        sqlx::query(query)
            .bind(limit)
            .fetch_all(&state.pool)
            .await
    };

    let rows = match rows_result {
        Ok(r) => r,
        Err(e) => {
            let err_res = serde_json::json!({ "error": e.to_string() });
            return Ok((axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response());
        }
    };

    let mut records = Vec::new();
    for r in rows {
        let created_at: chrono::DateTime<chrono::Utc> = r.get("created_at");
        records.push(LedgerRecord {
            id: r.get("id"),
            tenant_id: r.get("tenant_id"),
            tx_hash: r.get("tx_hash"),
            payload_snapshot: r.get("payload_snapshot"),
            network: r.get("network"),
            status: r.get("status"),
            created_at: created_at.to_rfc3339(),
        });
    }

    Ok(Json(records).into_response())
}
