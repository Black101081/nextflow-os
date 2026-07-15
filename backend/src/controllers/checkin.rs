use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::Row;
use uuid::Uuid;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct FieldCheckinRequest {
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub accuracy: Option<f64>,
    pub image_base64: Option<String>,
    pub metadata: Option<Value>,
}

pub async fn create_checkin(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<FieldCheckinRequest>,
) -> Response {
    let query = r#"
        INSERT INTO nf_core.field_checkins (tenant_id, worker_id, latitude, longitude, accuracy, image_base64, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    "#;

    // Use tenant.user_id if present from JWT, otherwise fallback to tenant_id (for compatibility/older tests)
    let worker_id = tenant.user_id.unwrap_or(tenant.tenant_id);

    // Blockchain Anchoring
    let payload_to_anchor = serde_json::json!({
        "event": "FIELD_CHECKIN_ANCHOR",
        "tenant_id": tenant.tenant_id.to_string(),
        "worker_id": worker_id.to_string(),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    let hash = crate::services::blockchain::compute_data_hash(&payload_to_anchor);
    let tx_hash = crate::services::blockchain::anchor_data_on_chain(&state.pool, tenant.tenant_id, &hash, &payload_to_anchor).await;
    
    let mut enriched_metadata = payload.metadata.unwrap_or(serde_json::json!({}));
    if let Some(obj) = enriched_metadata.as_object_mut() {
        obj.insert("tx_hash".to_string(), serde_json::json!(tx_hash));
    }

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(worker_id)
        .bind(payload.latitude)
        .bind(payload.longitude)
        .bind(payload.accuracy)
        .bind(&payload.image_base64)
        .bind(&enriched_metadata)
        .fetch_one(&state.pool)
        .await;

    match row {
        Ok(r) => {
            let id: Uuid = r.get("id");
            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "checkin_id": id,
                "tx_hash": tx_hash
            }))).into_response()
        },
        Err(e) => {
            eprintln!("[Checkin] Error inserting checkin: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}

pub async fn get_checkins(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, worker_id, latitude, longitude, accuracy, image_base64, metadata, created_at
        FROM nf_core.field_checkins
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    match rows {
        Ok(results) => {
            let list: Vec<serde_json::Value> = results.iter().map(|r| {
                let id: Uuid = r.get("id");
                let worker_id: Uuid = r.get("worker_id");
                let latitude: Option<f64> = r.get("latitude");
                let longitude: Option<f64> = r.get("longitude");
                let accuracy: Option<f64> = r.get("accuracy");
                let image_base64: Option<String> = r.get("image_base64");
                let metadata: Option<serde_json::Value> = r.get("metadata");
                let created_at: chrono::DateTime<chrono::Utc> = r.get("created_at");

                serde_json::json!({
                    "id": id,
                    "worker_id": worker_id,
                    "latitude": latitude,
                    "longitude": longitude,
                    "accuracy": accuracy,
                    "image_base64": image_base64,
                    "metadata": metadata,
                    "created_at": created_at
                })
            }).collect();
            (StatusCode::OK, Json(list)).into_response()
        },
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response()
        }
    }
}
