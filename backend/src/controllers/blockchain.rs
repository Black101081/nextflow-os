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
    State(_state): State<AppState>,
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

    let res = AnchorResponse {
        tx_hash: hash_hex,
        timestamp: now_str,
        network: "U2U_TESTNET_SIMULATED".to_string(), // Fake network, REAL crypto hash
    };

    Ok(Json(res))
}
