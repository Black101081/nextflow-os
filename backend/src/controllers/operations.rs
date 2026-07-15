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
pub struct ContractPayload {
    pub contract_number: String,
    pub contract_type: String,
    pub title: String,
    pub counterpart_name: Option<String>,
    pub value: Option<f64>,
    pub start_date: String,
    pub end_date: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct AssetPayload {
    pub asset_code: String,
    pub name: String,
    pub category: Option<String>,
    pub location: Option<String>,
    pub purchase_date: Option<String>,
    pub purchase_price: Option<f64>,
    pub useful_life_years: Option<i32>,
}

#[derive(Deserialize, Serialize)]
pub struct ProjectPayload {
    pub project_code: String,
    pub name: String,
    pub description: Option<String>,
    pub project_type: Option<String>,
    pub budget: Option<f64>,
    pub start_date: Option<String>,
    pub target_end_date: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct ChannelPayload {
    pub channel_type: String, // SHOPEE, LAZADA, TIKTOK
    pub channel_name: Option<String>,
    pub shop_id: Option<String>,
}

// --- Handlers ---

/// GET /api/v1/operations/contracts
pub async fn get_contracts(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_contracts") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, contract_number, contract_type, title, counterpart_name, value::FLOAT, start_date, end_date, status, created_at
        FROM nf_core.contracts
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let contracts: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "contract_number": row.get::<String, _>("contract_number"),
                    "contract_type": row.get::<String, _>("contract_type"),
                    "title": row.get::<String, _>("title"),
                    "counterpart_name": row.get::<Option<String>, _>("counterpart_name"),
                    "value": row.get::<Option<f64>, _>("value"),
                    "start_date": row.get::<chrono::NaiveDate, _>("start_date").to_string(),
                    "end_date": row.get::<Option<chrono::NaiveDate>, _>("end_date").map(|d| d.to_string()),
                    "status": row.get::<String, _>("status"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": contracts })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/operations/contracts
pub async fn create_contract(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<ContractPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_contracts") {
        return e.into_response();
    }

    let start_date = match chrono::NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid start date format: {}", err) }))).into_response(),
    };
    let end_date = payload.end_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    match sqlx::query(
        r#"
        INSERT INTO nf_core.contracts (tenant_id, contract_number, contract_type, title, counterpart_name, value, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, contract_number, title, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.contract_number)
    .bind(payload.contract_type)
    .bind(payload.title)
    .bind(payload.counterpart_name)
    .bind(payload.value)
    .bind(start_date)
    .bind(end_date)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "contract_number": row.get::<String, _>("contract_number"),
                    "title": row.get::<String, _>("title"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/operations/assets
pub async fn get_assets(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_assets") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, asset_code, name, category, location, purchase_date, purchase_price::FLOAT, current_value::FLOAT, status, created_at
        FROM nf_core.assets
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let assets: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "asset_code": row.get::<String, _>("asset_code"),
                    "name": row.get::<String, _>("name"),
                    "category": row.get::<Option<String>, _>("category"),
                    "location": row.get::<Option<String>, _>("location"),
                    "purchase_date": row.get::<Option<chrono::NaiveDate>, _>("purchase_date").map(|d| d.to_string()),
                    "purchase_price": row.get::<Option<f64>, _>("purchase_price"),
                    "current_value": row.get::<Option<f64>, _>("current_value"),
                    "status": row.get::<String, _>("status"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": assets })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/operations/assets
pub async fn create_asset(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<AssetPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_assets") {
        return e.into_response();
    }

    let purchase_date = payload.purchase_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    match sqlx::query(
        r#"
        INSERT INTO nf_core.assets (tenant_id, asset_code, name, category, location, purchase_date, purchase_price, current_value, useful_life_years)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
        RETURNING id, asset_code, name, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.asset_code)
    .bind(payload.name)
    .bind(payload.category)
    .bind(payload.location)
    .bind(purchase_date)
    .bind(payload.purchase_price)
    .bind(payload.useful_life_years)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "asset_code": row.get::<String, _>("asset_code"),
                    "name": row.get::<String, _>("name"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/operations/projects
pub async fn get_projects(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_projects") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, project_code, name, description, project_type, status, budget::FLOAT, actual_cost::FLOAT, completion_percentage::FLOAT, created_at
        FROM nf_core.projects
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let projects: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "project_code": row.get::<String, _>("project_code"),
                    "name": row.get::<String, _>("name"),
                    "description": row.get::<Option<String>, _>("description"),
                    "project_type": row.get::<Option<String>, _>("project_type"),
                    "status": row.get::<String, _>("status"),
                    "budget": row.get::<Option<f64>, _>("budget"),
                    "actual_cost": row.get::<f64, _>("actual_cost"),
                    "completion_percentage": row.get::<f64, _>("completion_percentage"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": projects })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/operations/projects
pub async fn create_project(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<ProjectPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_projects") {
        return e.into_response();
    }

    let start_date = payload.start_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
    let target_end_date = payload.target_end_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    match sqlx::query(
        r#"
        INSERT INTO nf_core.projects (tenant_id, project_code, name, description, project_type, budget, start_date, target_end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, project_code, name, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.project_code)
    .bind(payload.name)
    .bind(payload.description)
    .bind(payload.project_type)
    .bind(payload.budget)
    .bind(start_date)
    .bind(target_end_date)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "project_code": row.get::<String, _>("project_code"),
                    "name": row.get::<String, _>("name"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/operations/channels
pub async fn get_channels(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_channels") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, channel_type, channel_name, shop_id, is_active, total_orders, total_revenue::FLOAT, created_at
        FROM nf_core.sales_channels
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let channels: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "channel_type": row.get::<String, _>("channel_type"),
                    "channel_name": row.get::<Option<String>, _>("channel_name"),
                    "shop_id": row.get::<Option<String>, _>("shop_id"),
                    "is_active": row.get::<bool, _>("is_active"),
                    "total_orders": row.get::<i32, _>("total_orders"),
                    "total_revenue": row.get::<f64, _>("total_revenue"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": channels })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/operations/channels
pub async fn create_channel(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<ChannelPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_channels") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_core.sales_channels (tenant_id, channel_type, channel_name, shop_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, channel_type, channel_name, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.channel_type)
    .bind(payload.channel_name)
    .bind(payload.shop_id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "channel_type": row.get::<String, _>("channel_type"),
                    "channel_name": row.get::<Option<String>, _>("channel_name"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
