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
pub struct AccountPayload {
    pub name: String,
    pub account_type: String,
    pub balance: f64,
    pub currency: String,
    pub bank_name: Option<String>,
    pub account_number: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct TransactionPayload {
    pub account_id: Uuid,
    pub transaction_type: String,
    pub category: String,
    pub amount: f64,
    pub description: Option<String>,
    pub counterpart_name: Option<String>,
    pub payment_method: Option<String>,
    pub transaction_date: String,
}

#[derive(Deserialize, Serialize)]
pub struct InvoicePayload {
    pub invoice_number: String,
    pub invoice_type: String,
    pub customer_id: Option<Uuid>,
    pub supplier_id: Option<Uuid>,
    pub subtotal: f64,
    pub tax_rate: f64,
    pub tax_amount: f64,
    pub total: f64,
    pub due_date: Option<String>,
    pub items: serde_json::Value,
    pub notes: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct TaxFilingPayload {
    pub tax_type: String,
    pub period: String,
    pub taxable_amount: f64,
    pub tax_amount: f64,
    pub due_date: Option<String>,
    pub details: serde_json::Value,
}

// --- Handlers ---

/// GET /api/v1/finance/accounts
pub async fn get_accounts(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, name, account_type, balance::FLOAT, currency, bank_name, account_number, is_active, created_at
        FROM nf_finance.accounts
        WHERE tenant_id = $1
        ORDER BY name ASC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let accounts: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "account_type": row.get::<String, _>("account_type"),
                    "balance": row.get::<f64, _>("balance"),
                    "currency": row.get::<String, _>("currency"),
                    "bank_name": row.get::<Option<String>, _>("bank_name"),
                    "account_number": row.get::<Option<String>, _>("account_number"),
                    "is_active": row.get::<bool, _>("is_active"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": accounts })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/finance/accounts
pub async fn create_account(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<AccountPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_finance.accounts (tenant_id, name, account_type, balance, currency, bank_name, account_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, account_type, balance::FLOAT, currency, bank_name, account_number, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.name)
    .bind(payload.account_type)
    .bind(payload.balance)
    .bind(payload.currency)
    .bind(payload.bank_name)
    .bind(payload.account_number)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "account_type": row.get::<String, _>("account_type"),
                    "balance": row.get::<f64, _>("balance"),
                    "currency": row.get::<String, _>("currency"),
                    "bank_name": row.get::<Option<String>, _>("bank_name"),
                    "account_number": row.get::<Option<String>, _>("account_number"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/finance/transactions
pub async fn get_transactions(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT t.id, t.account_id, a.name as account_name, t.transaction_type, t.category, t.amount::FLOAT, t.description, t.counterpart_name, t.payment_method, t.transaction_date, t.created_at
        FROM nf_finance.transactions t
        JOIN nf_finance.accounts a ON t.account_id = a.id
        WHERE t.tenant_id = $1
        ORDER BY t.transaction_date DESC, t.created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let txs: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "account_id": row.get::<Uuid, _>("account_id"),
                    "account_name": row.get::<String, _>("account_name"),
                    "transaction_type": row.get::<String, _>("transaction_type"),
                    "category": row.get::<String, _>("category"),
                    "amount": row.get::<f64, _>("amount"),
                    "description": row.get::<Option<String>, _>("description"),
                    "counterpart_name": row.get::<Option<String>, _>("counterpart_name"),
                    "payment_method": row.get::<Option<String>, _>("payment_method"),
                    "transaction_date": row.get::<chrono::NaiveDate, _>("transaction_date").to_string(),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": txs })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/finance/transactions
pub async fn create_transaction(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<TransactionPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    let tx_date = match chrono::NaiveDate::parse_from_str(&payload.transaction_date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid date format: {}", err) }))).into_response(),
    };

    // Begin Transaction to sync account balance
    let mut tx = match state.pool.begin().await {
        Ok(t) => t,
        Err(e) => return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    };

    // 1. Insert transaction
    let insert_query = r#"
        INSERT INTO nf_finance.transactions (tenant_id, account_id, transaction_type, category, amount, description, counterpart_name, payment_method, transaction_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    "#;

    let tx_id: Uuid = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.account_id)
        .bind(&payload.transaction_type)
        .bind(&payload.category)
        .bind(payload.amount)
        .bind(&payload.description)
        .bind(&payload.counterpart_name)
        .bind(&payload.payment_method)
        .bind(tx_date)
        .fetch_one(&mut *tx)
        .await
    {
        Ok(row) => row.get("id"),
        Err(e) => {
            let _ = tx.rollback().await;
            return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response();
        }
    };

    // 2. Update account balance
    let multiplier = if payload.transaction_type == "INCOME" { 1.0 } else { -1.0 };
    let update_query = r#"
        UPDATE nf_finance.accounts
        SET balance = balance + $1
        WHERE id = $2 AND tenant_id = $3
    "#;

    if let Err(e) = sqlx::query(update_query)
        .bind(payload.amount * multiplier)
        .bind(payload.account_id)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
    {
        let _ = tx.rollback().await;
        return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response();
    }

    if let Err(e) = tx.commit().await {
        return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response();
    }

    Json(serde_json::json!({ "status": "success", "data": { "transaction_id": tx_id } })).into_response()
}

/// GET /api/v1/finance/invoices
pub async fn get_invoices(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_financials") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, invoice_number, invoice_type, customer_id, supplier_id, subtotal::FLOAT, tax_rate::FLOAT, tax_amount::FLOAT, discount_amount::FLOAT, total::FLOAT, status, due_date, items, notes, created_at
        FROM nf_finance.invoices
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let invoices: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "invoice_number": row.get::<String, _>("invoice_number"),
                    "invoice_type": row.get::<String, _>("invoice_type"),
                    "customer_id": row.get::<Option<Uuid>, _>("customer_id"),
                    "supplier_id": row.get::<Option<Uuid>, _>("supplier_id"),
                    "subtotal": row.get::<f64, _>("subtotal"),
                    "tax_rate": row.get::<f64, _>("tax_rate"),
                    "tax_amount": row.get::<f64, _>("tax_amount"),
                    "discount_amount": row.get::<f64, _>("discount_amount"),
                    "total": row.get::<f64, _>("total"),
                    "status": row.get::<String, _>("status"),
                    "due_date": row.get::<Option<chrono::NaiveDate>, _>("due_date").map(|d| d.to_string()),
                    "items": row.get::<serde_json::Value, _>("items"),
                    "notes": row.get::<Option<String>, _>("notes"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": invoices })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/finance/invoices
pub async fn create_invoice(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<InvoicePayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_financials") {
        return e.into_response();
    }

    let due_date = payload.due_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    match sqlx::query(
        r#"
        INSERT INTO nf_finance.invoices (tenant_id, invoice_number, invoice_type, customer_id, supplier_id, subtotal, tax_rate, tax_amount, total, due_date, items, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, invoice_number, total::FLOAT, status, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.invoice_number)
    .bind(payload.invoice_type)
    .bind(payload.customer_id)
    .bind(payload.supplier_id)
    .bind(payload.subtotal)
    .bind(payload.tax_rate)
    .bind(payload.tax_amount)
    .bind(payload.total)
    .bind(due_date)
    .bind(payload.items)
    .bind(payload.notes)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "invoice_number": row.get::<String, _>("invoice_number"),
                    "total": row.get::<f64, _>("total"),
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
