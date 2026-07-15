use axum::{
    extract::{State, Path},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::Row;

use crate::{
    middleware::{rbac::RbacContext, tenant_isolation::TenantIsolation},
    AppState,
};

// --- Models ---
#[derive(Deserialize, Serialize)]
pub struct WhitelistPayload {
    pub ip_address: String,
    pub description: Option<String>,
}

// --- Handlers ---

/// GET /api/v1/health-security/whitelist
pub async fn get_whitelist(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_security") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, ip_address, description, is_active, created_at
        FROM nf_core.ip_whitelist
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let list: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "ip_address": row.get::<String, _>("ip_address"),
                    "description": row.get::<Option<String>, _>("description"),
                    "is_active": row.get::<bool, _>("is_active"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": list })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/health-security/whitelist
pub async fn add_to_whitelist(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<WhitelistPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_security") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_core.ip_whitelist (tenant_id, ip_address, description)
        VALUES ($1, $2, $3)
        RETURNING id, ip_address, description, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.ip_address)
    .bind(payload.description)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "ip_address": row.get::<String, _>("ip_address"),
                    "description": row.get::<Option<String>, _>("description"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// DELETE /api/v1/health-security/whitelist/:id
pub async fn remove_from_whitelist(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_security") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        DELETE FROM nf_core.ip_whitelist
        WHERE id = $1 AND tenant_id = $2
        "#
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .execute(&state.pool)
    .await
    {
        Ok(_) => Json(serde_json::json!({ "status": "success", "message": "IP removed successfully" })).into_response(),
        Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

/// GET /api/v1/health-security/events
pub async fn get_security_events(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_security") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, event_type, severity, description, ip_address, created_at
        FROM nf_core.security_events
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let list: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "event_type": row.get::<String, _>("event_type"),
                    "severity": row.get::<String, _>("severity"),
                    "description": row.get::<String, _>("description"),
                    "ip_address": row.get::<Option<String>, _>("ip_address"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": list })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/health-security/score
pub async fn get_health_score(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_security") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT score::FLOAT, db_size_bytes::FLOAT, api_latency_ms::FLOAT, error_rate::FLOAT, checked_at
        FROM nf_core.tenant_health_scores
        WHERE tenant_id = $1
        ORDER BY checked_at DESC
        LIMIT 1
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    {
        Ok(Some(row)) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "score": row.get::<f64, _>("score"),
                    "db_size_bytes": row.get::<f64, _>("db_size_bytes"),
                    "api_latency_ms": row.get::<f64, _>("api_latency_ms"),
                    "error_rate": row.get::<f64, _>("error_rate"),
                    "checked_at": row.get::<chrono::DateTime<chrono::Utc>, _>("checked_at"),
                }
            })).into_response()
        }
        Ok(None) => {
            // Default mockup health score if not calculated yet
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "score": 98.0,
                    "db_size_bytes": 1048576.0,
                    "api_latency_ms": 12.5,
                    "error_rate": 0.0,
                    "checked_at": chrono::Utc::now(),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
