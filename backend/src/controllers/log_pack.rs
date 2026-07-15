use crate::AppState;
use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use sqlx::Row;
use chrono::{DateTime, Utc, NaiveDate};

#[derive(Debug, Serialize, Deserialize)]
pub struct LogWaybill {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub tracking_code: String,
    pub sender_id: Option<Uuid>,
    pub receiver_name: Option<String>,
    pub receiver_phone: Option<String>,
    pub receiver_address: Option<String>,
    pub cod_amount: f64,
    pub weight: Option<f64>,
    pub dimensions: serde_json::Value,
    pub status: String,
    pub driver_id: Option<Uuid>,
    pub hub_id: Option<Uuid>,
    pub failed_attempts: i32,
    pub delivered_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWaybillRequest {
    pub tracking_code: String,
    #[serde(default)]
    pub sender_id: Option<Uuid>,
    #[serde(default)]
    pub receiver_name: Option<String>,
    #[serde(default)]
    pub receiver_phone: Option<String>,
    #[serde(default)]
    pub receiver_address: Option<String>,
    #[serde(default)]
    pub cod_amount: Option<f64>,
    #[serde(default)]
    pub weight: Option<f64>,
    #[serde(default)]
    pub dimensions: Option<serde_json::Value>,
    #[serde(default)]
    pub driver_id: Option<Uuid>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogCodReconciliation {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub driver_id: Uuid,
    pub recon_date: NaiveDate,
    pub total_orders: i32,
    pub success_orders: i32,
    pub expected_cash: f64,
    pub actual_cash: f64,
    pub discrepancy: f64,
    pub status: String,
    pub approved_by: Option<Uuid>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReconciliationRequest {
    pub driver_id: Uuid,
    pub recon_date: NaiveDate,
    #[serde(default)]
    pub total_orders: Option<i32>,
    #[serde(default)]
    pub success_orders: Option<i32>,
    #[serde(default)]
    pub expected_cash: Option<f64>,
    #[serde(default)]
    pub actual_cash: Option<f64>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateReconciliationStatusRequest {
    pub status: String,
}

// 1. GET /api/v1/log/waybills
pub async fn get_waybills(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, tracking_code, sender_id, receiver_name, receiver_phone, receiver_address, cod_amount::FLOAT8 as cod_amount, weight::FLOAT8 as weight, dimensions, status, driver_id, hub_id, failed_attempts, delivered_at, notes, created_at
        FROM nf_tenant.log_waybills
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Logistics Pack] Error fetching waybills: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let waybills: Vec<LogWaybill> = rows.into_iter().map(|row| {
        LogWaybill {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            tracking_code: row.get("tracking_code"),
            sender_id: row.get("sender_id"),
            receiver_name: row.get("receiver_name"),
            receiver_phone: row.get("receiver_phone"),
            receiver_address: row.get("receiver_address"),
            cod_amount: row.get("cod_amount"),
            weight: row.get("weight"),
            dimensions: row.get("dimensions"),
            status: row.get("status"),
            driver_id: row.get("driver_id"),
            hub_id: row.get("hub_id"),
            failed_attempts: row.get("failed_attempts"),
            delivered_at: row.get("delivered_at"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(waybills)).into_response()
}

// 2. POST /api/v1/log/waybills
pub async fn create_waybill(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWaybillRequest>,
) -> Response {
    if payload.tracking_code.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Mã vận đơn không được để trống"}))).into_response();
    }

    let cod_amount = payload.cod_amount.unwrap_or(0.0);
    let weight = payload.weight.unwrap_or(0.0);
    let dimensions = payload.dimensions.unwrap_or_else(|| json!({}));

    let insert_query = r#"
        INSERT INTO nf_tenant.log_waybills (tenant_id, tracking_code, sender_id, receiver_name, receiver_phone, receiver_address, cod_amount, weight, dimensions, driver_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, tenant_id, tracking_code, sender_id, receiver_name, receiver_phone, receiver_address, cod_amount::FLOAT8 as cod_amount, weight::FLOAT8 as weight, dimensions, status, driver_id, hub_id, failed_attempts, delivered_at, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.tracking_code)
        .bind(payload.sender_id)
        .bind(payload.receiver_name)
        .bind(payload.receiver_phone)
        .bind(payload.receiver_address)
        .bind(cod_amount)
        .bind(weight)
        .bind(dimensions)
        .bind(payload.driver_id)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Logistics Pack] Error creating waybill: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let waybill = LogWaybill {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        tracking_code: row.get("tracking_code"),
        sender_id: row.get("sender_id"),
        receiver_name: row.get("receiver_name"),
        receiver_phone: row.get("receiver_phone"),
        receiver_address: row.get("receiver_address"),
        cod_amount: row.get("cod_amount"),
        weight: row.get("weight"),
        dimensions: row.get("dimensions"),
        status: row.get("status"),
        driver_id: row.get("driver_id"),
        hub_id: row.get("hub_id"),
        failed_attempts: row.get("failed_attempts"),
        delivered_at: row.get("delivered_at"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(waybill)).into_response()
}

// 3. GET /api/v1/log/cod-reconciliations
pub async fn get_reconciliations(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, driver_id, recon_date, total_orders, success_orders, expected_cash::FLOAT8 as expected_cash, actual_cash::FLOAT8 as actual_cash, discrepancy::FLOAT8 as discrepancy, status, approved_by, notes, created_at
        FROM nf_tenant.log_cod_reconciliations
        WHERE tenant_id = $1
        ORDER BY recon_date DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Logistics Pack] Error fetching reconciliations: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let reconciliations: Vec<LogCodReconciliation> = rows.into_iter().map(|row| {
        LogCodReconciliation {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            driver_id: row.get("driver_id"),
            recon_date: row.get("recon_date"),
            total_orders: row.get("total_orders"),
            success_orders: row.get("success_orders"),
            expected_cash: row.get("expected_cash"),
            actual_cash: row.get("actual_cash"),
            discrepancy: row.get("discrepancy"),
            status: row.get("status"),
            approved_by: row.get("approved_by"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(reconciliations)).into_response()
}

// 4. POST /api/v1/log/cod-reconciliations
pub async fn create_reconciliation(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateReconciliationRequest>,
) -> Response {
    let total_orders = payload.total_orders.unwrap_or(0);
    let success_orders = payload.success_orders.unwrap_or(0);
    let expected_cash = payload.expected_cash.unwrap_or(0.0);
    let actual_cash = payload.actual_cash.unwrap_or(0.0);
    let discrepancy = actual_cash - expected_cash;

    let insert_query = r#"
        INSERT INTO nf_tenant.log_cod_reconciliations (tenant_id, driver_id, recon_date, total_orders, success_orders, expected_cash, actual_cash, discrepancy)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tenant_id, driver_id, recon_date, total_orders, success_orders, expected_cash::FLOAT8 as expected_cash, actual_cash::FLOAT8 as actual_cash, discrepancy::FLOAT8 as discrepancy, status, approved_by, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.driver_id)
        .bind(payload.recon_date)
        .bind(total_orders)
        .bind(success_orders)
        .bind(expected_cash)
        .bind(actual_cash)
        .bind(discrepancy)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Logistics Pack] Error creating reconciliation: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let reconciliation = LogCodReconciliation {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        driver_id: row.get("driver_id"),
        recon_date: row.get("recon_date"),
        total_orders: row.get("total_orders"),
        success_orders: row.get("success_orders"),
        expected_cash: row.get("expected_cash"),
        actual_cash: row.get("actual_cash"),
        discrepancy: row.get("discrepancy"),
        status: row.get("status"),
        approved_by: row.get("approved_by"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(reconciliation)).into_response()
}

// 5. PUT /api/v1/log/cod-reconciliations/:id/status
pub async fn update_reconciliation_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateReconciliationStatusRequest>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.log_cod_reconciliations
        SET status = $1
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, tenant_id, driver_id, recon_date, total_orders, success_orders, expected_cash::FLOAT8 as expected_cash, actual_cash::FLOAT8 as actual_cash, discrepancy::FLOAT8 as discrepancy, status, approved_by, notes, created_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(&payload.status)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Logistics Pack] Error updating reconciliation: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let reconciliation = LogCodReconciliation {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        driver_id: row.get("driver_id"),
        recon_date: row.get("recon_date"),
        total_orders: row.get("total_orders"),
        success_orders: row.get("success_orders"),
        expected_cash: row.get("expected_cash"),
        actual_cash: row.get("actual_cash"),
        discrepancy: row.get("discrepancy"),
        status: row.get("status"),
        approved_by: row.get("approved_by"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::OK, Json(reconciliation)).into_response()
}
