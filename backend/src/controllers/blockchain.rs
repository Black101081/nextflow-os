use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Sha256, Digest};
use hex;
use chrono::Utc;

use crate::AppState;
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::services::blockchain::anchor_data_on_chain;

#[derive(Debug, Deserialize)]
pub struct AnchorPayload {
    pub data: String,
    pub context: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AnchorResponse {
    pub tx_hash: String,
    pub timestamp: String,
    pub network: String,
}

pub async fn anchor_data(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<AnchorPayload>,
) -> Result<impl IntoResponse, Response> {
    // Hash payload using SHA-256 to simulate Blockchain tx_hash securely
    let mut hasher = Sha256::new();
    hasher.update(payload.data.as_bytes());
    if let Some(ctx) = &payload.context {
        hasher.update(ctx.as_bytes());
    }
    
    // Add salt/timestamp to make hash unique for each tx
    let now_str = Utc::now().to_rfc3339();
    hasher.update(now_str.as_bytes());

    let result = hasher.finalize();
    let hash_hex = format!("0x{}", hex::encode(result));

    // Thực sự lưu vết neo dữ liệu vào Blockchain Ledger trong CSDL (Zero-Mock)
    let tx_hash = anchor_data_on_chain(
        &state.pool,
        tenant.tenant_id,
        &hash_hex,
        &json!({
            "data": payload.data,
            "context": payload.context.unwrap_or_default(),
            "timestamp": now_str
        })
    ).await;

    let res = AnchorResponse {
        tx_hash,
        timestamp: now_str,
        network: "U2U_TESTNET_SIMULATED".to_string(),
    };

    Ok(Json(res))
}
