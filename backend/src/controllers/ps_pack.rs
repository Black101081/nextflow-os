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
pub struct PsClient {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub company_name: String,
    pub tax_code: Option<String>,
    pub legal_rep: Option<String>,
    pub accounting_email: Option<String>,
    pub phone: Option<String>,
    pub status: String,
    pub contract_value: f64,
    pub assigned_cpa: Option<Uuid>,
    pub nda_signed: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePsClientRequest {
    pub company_name: String,
    #[serde(default)]
    pub tax_code: Option<String>,
    #[serde(default)]
    pub legal_rep: Option<String>,
    #[serde(default)]
    pub accounting_email: Option<String>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default)]
    pub contract_value: Option<f64>,
    #[serde(default)]
    pub nda_signed: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PsContract {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub client_id: Option<Uuid>,
    pub contract_type: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub monthly_fee: f64,
    pub auto_renewal: bool,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateContractRequest {
    pub client_id: Uuid,
    pub contract_type: String,
    #[serde(default)]
    pub start_date: Option<NaiveDate>,
    #[serde(default)]
    pub end_date: Option<NaiveDate>,
    #[serde(default)]
    pub monthly_fee: Option<f64>,
    #[serde(default)]
    pub auto_renewal: Option<bool>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PsTaxFiling {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub client_id: Option<Uuid>,
    pub filing_type: Option<String>,
    pub period: Option<String>,
    pub due_date: NaiveDate,
    pub filed_date: Option<NaiveDate>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaxFilingRequest {
    pub client_id: Uuid,
    pub filing_type: String,
    pub period: String,
    pub due_date: NaiveDate,
    #[serde(default)]
    pub notes: Option<String>,
}

// 1. GET /api/v1/ps/clients
pub async fn get_clients(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, company_name, tax_code, legal_rep, accounting_email, phone, status, contract_value::FLOAT8 as contract_value, assigned_cpa, nda_signed, created_at
        FROM nf_tenant.ps_clients
        WHERE tenant_id = $1
        ORDER BY company_name ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Professional Services Pack] Error fetching B2B clients: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let clients: Vec<PsClient> = rows.into_iter().map(|row| {
        PsClient {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            company_name: row.get("company_name"),
            tax_code: row.get("tax_code"),
            legal_rep: row.get("legal_rep"),
            accounting_email: row.get("accounting_email"),
            phone: row.get("phone"),
            status: row.get("status"),
            contract_value: row.get("contract_value"),
            assigned_cpa: row.get("assigned_cpa"),
            nda_signed: row.get("nda_signed"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(clients)).into_response()
}

// 2. POST /api/v1/ps/clients
pub async fn create_client(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreatePsClientRequest>,
) -> Response {
    if payload.company_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên công ty không được để trống"}))).into_response();
    }

    let c_val = payload.contract_value.unwrap_or(0.0);
    let nda = payload.nda_signed.unwrap_or(false);

    let insert_query = r#"
        INSERT INTO nf_tenant.ps_clients (tenant_id, company_name, tax_code, legal_rep, accounting_email, phone, contract_value, nda_signed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tenant_id, company_name, tax_code, legal_rep, accounting_email, phone, status, contract_value::FLOAT8 as contract_value, assigned_cpa, nda_signed, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.company_name)
        .bind(payload.tax_code)
        .bind(payload.legal_rep)
        .bind(payload.accounting_email)
        .bind(payload.phone)
        .bind(c_val)
        .bind(nda)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Professional Services Pack] Error creating B2B client: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let client = PsClient {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        company_name: row.get("company_name"),
        tax_code: row.get("tax_code"),
        legal_rep: row.get("legal_rep"),
        accounting_email: row.get("accounting_email"),
        phone: row.get("phone"),
        status: row.get("status"),
        contract_value: row.get("contract_value"),
        assigned_cpa: row.get("assigned_cpa"),
        nda_signed: row.get("nda_signed"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(client)).into_response()
}

// 3. GET /api/v1/ps/contracts
pub async fn get_contracts(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, client_id, contract_type, start_date, end_date, monthly_fee::FLOAT8 as monthly_fee, auto_renewal, status, notes, created_at
        FROM nf_tenant.ps_contracts
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
            eprintln!("[Professional Services Pack] Error fetching contracts: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let contracts: Vec<PsContract> = rows.into_iter().map(|row| {
        PsContract {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            client_id: row.get("client_id"),
            contract_type: row.get("contract_type"),
            start_date: row.get("start_date"),
            end_date: row.get("end_date"),
            monthly_fee: row.get("monthly_fee"),
            auto_renewal: row.get("auto_renewal"),
            status: row.get("status"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(contracts)).into_response()
}

// 4. POST /api/v1/ps/contracts
pub async fn create_contract(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateContractRequest>,
) -> Response {
    let fee = payload.monthly_fee.unwrap_or(0.0);
    let auto_renew = payload.auto_renewal.unwrap_or(false);

    let insert_query = r#"
        INSERT INTO nf_tenant.ps_contracts (tenant_id, client_id, contract_type, start_date, end_date, monthly_fee, auto_renewal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, client_id, contract_type, start_date, end_date, monthly_fee::FLOAT8 as monthly_fee, auto_renewal, status, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.client_id)
        .bind(payload.contract_type)
        .bind(payload.start_date)
        .bind(payload.end_date)
        .bind(fee)
        .bind(auto_renew)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Professional Services Pack] Error creating contract: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let contract = PsContract {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        client_id: row.get("client_id"),
        contract_type: row.get("contract_type"),
        start_date: row.get("start_date"),
        end_date: row.get("end_date"),
        monthly_fee: row.get("monthly_fee"),
        auto_renewal: row.get("auto_renewal"),
        status: row.get("status"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(contract)).into_response()
}

// 5. GET /api/v1/ps/tax-filings
pub async fn get_tax_filings(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, client_id, filing_type, period, due_date, filed_date, status, notes, created_at
        FROM nf_tenant.ps_tax_filings
        WHERE tenant_id = $1
        ORDER BY due_date ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Professional Services Pack] Error fetching tax filings: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let filings: Vec<PsTaxFiling> = rows.into_iter().map(|row| {
        PsTaxFiling {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            client_id: row.get("client_id"),
            filing_type: row.get("filing_type"),
            period: row.get("period"),
            due_date: row.get("due_date"),
            filed_date: row.get("filed_date"),
            status: row.get("status"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(filings)).into_response()
}

// 6. POST /api/v1/ps/tax-filings
pub async fn create_tax_filing(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateTaxFilingRequest>,
) -> Response {
    let insert_query = r#"
        INSERT INTO nf_tenant.ps_tax_filings (tenant_id, client_id, filing_type, period, due_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, tenant_id, client_id, filing_type, period, due_date, filed_date, status, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.client_id)
        .bind(payload.filing_type)
        .bind(payload.period)
        .bind(payload.due_date)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Professional Services Pack] Error creating tax filing schedule: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let filing = PsTaxFiling {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        client_id: row.get("client_id"),
        filing_type: row.get("filing_type"),
        period: row.get("period"),
        due_date: row.get("due_date"),
        filed_date: row.get("filed_date"),
        status: row.get("status"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(filing)).into_response()
}
