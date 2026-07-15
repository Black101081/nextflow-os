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
pub struct WarehousePayload {
    pub name: String,
    pub address: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct ProductPayload {
    pub sku: String,
    pub name: String,
    pub category: Option<String>,
    pub unit: Option<String>,
    pub cost_price: Option<f64>,
    pub sell_price: Option<f64>,
    pub min_stock: Option<i32>,
    pub barcode: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct StockMovementPayload {
    pub product_id: Uuid,
    pub warehouse_id: Uuid,
    pub movement_type: String, // IN, OUT, ADJUST
    pub quantity: i32,
    pub unit_cost: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct SupplierPayload {
    pub name: String,
    pub contact_person: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
}

// --- Handlers ---

/// GET /api/v1/inventory/warehouses
pub async fn get_warehouses(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_inventory") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, name, address, is_default, created_at
        FROM nf_inventory.warehouses
        WHERE tenant_id = $1
        ORDER BY name ASC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let warehouses: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "address": row.get::<Option<String>, _>("address"),
                    "is_default": row.get::<bool, _>("is_default"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": warehouses })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/inventory/warehouses
pub async fn create_warehouse(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<WarehousePayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_inventory") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_inventory.warehouses (tenant_id, name, address)
        VALUES ($1, $2, $3)
        RETURNING id, name, address, is_default, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.name)
    .bind(payload.address)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "name": row.get::<String, _>("name"),
                    "address": row.get::<Option<String>, _>("address"),
                    "is_default": row.get::<bool, _>("is_default"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// GET /api/v1/inventory/products
pub async fn get_products(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_inventory") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, sku, name, category, unit, cost_price::FLOAT, sell_price::FLOAT, min_stock, barcode, is_active, created_at
        FROM nf_inventory.products
        WHERE tenant_id = $1
        ORDER BY name ASC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let products: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "sku": row.get::<String, _>("sku"),
                    "name": row.get::<String, _>("name"),
                    "category": row.get::<Option<String>, _>("category"),
                    "unit": row.get::<Option<String>, _>("unit"),
                    "cost_price": row.get::<Option<f64>, _>("cost_price"),
                    "sell_price": row.get::<Option<f64>, _>("sell_price"),
                    "min_stock": row.get::<Option<i32>, _>("min_stock"),
                    "barcode": row.get::<Option<String>, _>("barcode"),
                    "is_active": row.get::<bool, _>("is_active"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": products })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/inventory/products
pub async fn create_product(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<ProductPayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_inventory") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        INSERT INTO nf_inventory.products (tenant_id, sku, name, category, unit, cost_price, sell_price, min_stock, barcode)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, sku, name, cost_price::FLOAT, sell_price::FLOAT, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.sku)
    .bind(payload.name)
    .bind(payload.category)
    .bind(payload.unit)
    .bind(payload.cost_price)
    .bind(payload.sell_price)
    .bind(payload.min_stock.unwrap_or(0))
    .bind(payload.barcode)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "sku": row.get::<String, _>("sku"),
                    "name": row.get::<String, _>("name"),
                    "cost_price": row.get::<Option<f64>, _>("cost_price"),
                    "sell_price": row.get::<Option<f64>, _>("sell_price"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
