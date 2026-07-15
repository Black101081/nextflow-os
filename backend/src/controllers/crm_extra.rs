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
pub struct DealPayload {
    pub title: String,
    pub stage: String, // lead, contact, proposal, won, lost
    pub value: f64,
    pub customer_id: Option<Uuid>,
}

#[derive(Deserialize, Serialize)]
pub struct CampaignPayload {
    pub name: String,
    pub status: String, // draft, active, paused, completed
    pub budget: f64,
    pub channel: String, // email, facebook, sms, zalo
}

#[derive(Deserialize, Serialize)]
pub struct ExpenseClaimPayload {
    pub employee_id: Uuid,
    pub amount: f64,
    pub category: String,
    pub description: Option<String>,
    pub claim_date: String,
}

// --- Handlers ---

/// GET /api/v1/crm/deals
pub async fn get_deals(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_customers") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, title, stage, value::FLOAT, customer_id, created_at
        FROM nf_core.customers
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            // Mock map customer records to pipeline deals for demonstration
            let deals: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "title": format!("Cơ hội - {}", row.get::<String, _>("full_name")),
                    "stage": row.get::<String, _>("segment"),
                    "value": row.get::<f64, _>("total_spent"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": deals })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/finance/expense-claims
pub async fn get_expense_claims(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT c.id, c.employee_id, e.full_name as employee_name, c.amount::FLOAT, c.category, c.description, c.claim_date, c.status, c.created_at
        FROM nf_finance.expense_claims c
        JOIN nf_hr.employees e ON c.employee_id = e.id
        WHERE c.tenant_id = $1
        ORDER BY c.claim_date DESC
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
                    "employee_id": row.get::<Uuid, _>("employee_id"),
                    "employee_name": row.get::<String, _>("employee_name"),
                    "amount": row.get::<f64, _>("amount"),
                    "category": row.get::<String, _>("category"),
                    "description": row.get::<Option<String>, _>("description"),
                    "claim_date": row.get::<chrono::NaiveDate, _>("claim_date").to_string(),
                    "status": row.get::<String, _>("status"),
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

/// POST /api/v1/finance/expense-claims
pub async fn create_expense_claim(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<ExpenseClaimPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    let claim_date = match chrono::NaiveDate::parse_from_str(&payload.claim_date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid date format: {}", err) }))).into_response(),
    };

    match sqlx::query(
        r#"
        INSERT INTO nf_finance.expense_claims (tenant_id, employee_id, amount, category, description, claim_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, amount::FLOAT, status, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.employee_id)
    .bind(payload.amount)
    .bind(payload.category)
    .bind(payload.description)
    .bind(claim_date)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "amount": row.get::<f64, _>("amount"),
                    "status": row.get::<String, _>("status"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// PATCH /api/v1/finance/expense-claims/:id/approve
pub async fn approve_expense_claim(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        UPDATE nf_finance.expense_claims
        SET status = 'APPROVED'
        WHERE id = $1 AND tenant_id = $2
        RETURNING id, status
        "#
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "status": row.get::<String, _>("status"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
