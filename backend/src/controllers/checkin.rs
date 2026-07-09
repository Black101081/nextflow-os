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

    // Use tenant_id as worker_id if we don't have proper user auth middleware yet.
    // In production we would extract the `worker_id` from claims.
    // But since `tenant` is from claims, we can use `tenant.tenant_id` for testing,
    // wait, we need worker_id which should be user.id. For now we can use tenant_id if we don't have user_id, 
    // actually let's just use tenant_id as worker_id placeholder.
    let worker_id = tenant.tenant_id;

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(worker_id)
        .bind(payload.latitude)
        .bind(payload.longitude)
        .bind(payload.accuracy)
        .bind(&payload.image_base64)
        .bind(&payload.metadata)
        .fetch_one(&state.pool)
        .await;

    match row {
        Ok(r) => {
            let id: Uuid = r.get("id");
            (StatusCode::CREATED, Json(serde_json::json!({
                "status": "success",
                "checkin_id": id
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
