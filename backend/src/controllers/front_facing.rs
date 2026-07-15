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
pub struct BookingPayload {
    pub customer_name: String,
    pub customer_phone: String,
    pub service_name: String,
    pub booking_time: String, // ISO String or YYYY-MM-DD HH:MM
    pub notes: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct PosSessionPayload {
    pub opening_balance: f64,
}

#[derive(Deserialize, Serialize)]
pub struct PosOrderPayload {
    pub session_id: Uuid,
    pub total_amount: f64,
    pub items: serde_json::Value,
}

#[derive(Deserialize, Serialize)]
pub struct LoyaltyTransactionPayload {
    pub customer_id: Uuid,
    pub points: i32,
    pub transaction_type: String, // EARN, REDEEM
}

// --- Handlers ---

/// GET /api/v1/front/bookings
pub async fn get_bookings(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_bookings") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, customer_name, customer_phone, service_name, booking_time, status, notes, created_at
        FROM nf_core.customer_bookings
        WHERE tenant_id = $1
        ORDER BY booking_time ASC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let bookings: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "customer_name": row.get::<String, _>("customer_name"),
                    "customer_phone": row.get::<String, _>("customer_phone"),
                    "service_name": row.get::<String, _>("service_name"),
                    "booking_time": row.get::<chrono::DateTime<chrono::Utc>, _>("booking_time"),
                    "status": row.get::<String, _>("status"),
                    "notes": row.get::<Option<String>, _>("notes"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": bookings })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/front/bookings
pub async fn create_booking(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<BookingPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_bookings") {
        return e.into_response();
    }

    let booking_time = match chrono::DateTime::parse_from_rfc3339(&payload.booking_time) {
        Ok(dt) => dt.with_timezone(&chrono::Utc),
        Err(_) => {
            // fallback parse if needed
            match chrono::NaiveDateTime::parse_from_str(&payload.booking_time, "%Y-%m-%d %H:%M:%S") {
                Ok(ndt) => ndt.and_local_timezone(chrono::Utc).unwrap(),
                Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid booking time format: {}", err) }))).into_response(),
            }
        }
    };

    match sqlx::query(
        r#"
        INSERT INTO nf_core.customer_bookings (tenant_id, customer_name, customer_phone, service_name, booking_time, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, customer_name, service_name, booking_time, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.customer_name)
    .bind(payload.customer_phone)
    .bind(payload.service_name)
    .bind(booking_time)
    .bind(payload.notes)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "customer_name": row.get::<String, _>("customer_name"),
                    "service_name": row.get::<String, _>("service_name"),
                    "booking_time": row.get::<chrono::DateTime<chrono::Utc>, _>("booking_time"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/front/pos-sessions
pub async fn get_pos_sessions(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_pos") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, opening_balance::FLOAT, closing_balance::FLOAT, status, opened_at, closed_at
        FROM nf_core.pos_sessions
        WHERE tenant_id = $1
        ORDER BY opened_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let sessions: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "opening_balance": row.get::<f64, _>("opening_balance"),
                    "closing_balance": row.get::<Option<f64>, _>("closing_balance"),
                    "status": row.get::<String, _>("status"),
                    "opened_at": row.get::<chrono::DateTime<chrono::Utc>, _>("opened_at"),
                    "closed_at": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("closed_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": sessions })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/front/pos-sessions
pub async fn open_pos_session(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<PosSessionPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_pos") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_core.pos_sessions (tenant_id, opening_balance)
        VALUES ($1, $2)
        RETURNING id, status, opened_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.opening_balance)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "status": row.get::<String, _>("status"),
                    "opened_at": row.get::<chrono::DateTime<chrono::Utc>, _>("opened_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/front/pos-orders
pub async fn create_pos_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<PosOrderPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_pos") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_core.pos_orders (tenant_id, session_id, total_amount, items)
        VALUES ($1, $2, $3, $4)
        RETURNING id, total_amount::FLOAT, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.session_id)
    .bind(payload.total_amount)
    .bind(payload.items)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "total_amount": row.get::<f64, _>("total_amount"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
