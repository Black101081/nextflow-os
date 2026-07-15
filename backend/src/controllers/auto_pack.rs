use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveDate};

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct AutoVehicle {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub license_plate: String,
    pub brand: Option<String>,
    pub model: Option<String>,
    pub year: Option<i32>,
    pub owner_customer_id: Option<Uuid>,
    pub current_mileage: i32,
    pub last_service_date: Option<NaiveDate>,
    pub next_service_date: Option<NaiveDate>,
    pub next_service_mileage: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct SearchVehicleQuery {
    #[serde(default)]
    pub license_plate: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RegisterVehicleRequest {
    pub license_plate: String,
    #[serde(default)]
    pub brand: Option<String>,
    #[serde(default)]
    pub model: Option<String>,
    #[serde(default)]
    pub year: Option<i32>,
    #[serde(default)]
    pub owner_customer_id: Option<Uuid>,
    #[serde(default)]
    pub current_mileage: Option<i32>,
    #[serde(default)]
    pub last_service_date: Option<NaiveDate>,
    #[serde(default)]
    pub next_service_date: Option<NaiveDate>,
    #[serde(default)]
    pub next_service_mileage: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AutoRepairOrder {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub vehicle_id: Option<Uuid>,
    pub check_in_time: Option<DateTime<Utc>>,
    pub symptoms: Option<String>,
    pub diagnosis_items: serde_json::Value,
    pub total_estimate: f64,
    pub customer_approved: bool,
    pub technician_id: Option<Uuid>,
    pub status: String,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRepairOrderRequest {
    pub vehicle_id: Uuid,
    #[serde(default)]
    pub symptoms: Option<String>,
    #[serde(default)]
    pub diagnosis_items: Option<serde_json::Value>,
    #[serde(default)]
    pub total_estimate: Option<f64>,
    #[serde(default)]
    pub technician_id: Option<Uuid>,
}

// 1. GET /api/v1/garage/vehicles - Search vehicles by license plate
pub async fn search_vehicles(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Query(params): Query<SearchVehicleQuery>,
) -> Response {
    let plate_opt = params.license_plate.as_deref().map(|s| s.trim());

    let query = if let Some(plate) = plate_opt {
        if plate.is_empty() {
            r#"SELECT id, tenant_id, license_plate, brand, model, year, owner_customer_id, current_mileage, last_service_date, next_service_date, next_service_mileage, created_at, updated_at
               FROM nf_tenant.auto_vehicles
               WHERE tenant_id = $1"#
                .to_string()
        } else {
            r#"SELECT id, tenant_id, license_plate, brand, model, year, owner_customer_id, current_mileage, last_service_date, next_service_date, next_service_mileage, created_at, updated_at
               FROM nf_tenant.auto_vehicles
               WHERE tenant_id = $1 AND license_plate ILIKE $2"#
                .to_string()
        }
    } else {
        r#"SELECT id, tenant_id, license_plate, brand, model, year, owner_customer_id, current_mileage, last_service_date, next_service_date, next_service_mileage, created_at, updated_at
           FROM nf_tenant.auto_vehicles
           WHERE tenant_id = $1"#
            .to_string()
    };

    let rows_res = if let Some(plate) = plate_opt {
        if !plate.is_empty() {
            let wild_plate = format!("%{}%", plate);
            sqlx::query(&query)
                .bind(tenant.tenant_id)
                .bind(wild_plate)
                .fetch_all(&state.pool)
                .await
        } else {
            sqlx::query(&query)
                .bind(tenant.tenant_id)
                .fetch_all(&state.pool)
                .await
        }
    } else {
        sqlx::query(&query)
            .bind(tenant.tenant_id)
            .fetch_all(&state.pool)
            .await
    };

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Auto Pack] Error searching vehicles: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut vehicles = Vec::new();
    for row in rows {
        vehicles.push(AutoVehicle {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            license_plate: row.get("license_plate"),
            brand: row.get("brand"),
            model: row.get("model"),
            year: row.get("year"),
            owner_customer_id: row.get("owner_customer_id"),
            current_mileage: row.get("current_mileage"),
            last_service_date: row.get("last_service_date"),
            next_service_date: row.get("next_service_date"),
            next_service_mileage: row.get("next_service_mileage"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(vehicles)).into_response()
}

// 2. POST /api/v1/garage/vehicles - Register new vehicle
pub async fn register_vehicle(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<RegisterVehicleRequest>,
) -> Response {
    if payload.license_plate.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Biển số xe không được để trống"}))).into_response();
    }

    let insert_query = r#"
        INSERT INTO nf_tenant.auto_vehicles (tenant_id, license_plate, brand, model, year, owner_customer_id, current_mileage, last_service_date, next_service_date, next_service_mileage)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, tenant_id, license_plate, brand, model, year, owner_customer_id, current_mileage, last_service_date, next_service_date, next_service_mileage, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.license_plate)
        .bind(payload.brand)
        .bind(payload.model)
        .bind(payload.year)
        .bind(payload.owner_customer_id)
        .bind(payload.current_mileage.unwrap_or(0))
        .bind(payload.last_service_date)
        .bind(payload.next_service_date)
        .bind(payload.next_service_mileage)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Auto Pack] Error registering vehicle: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let vehicle = AutoVehicle {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        license_plate: row.get("license_plate"),
        brand: row.get("brand"),
        model: row.get("model"),
        year: row.get("year"),
        owner_customer_id: row.get("owner_customer_id"),
        current_mileage: row.get("current_mileage"),
        last_service_date: row.get("last_service_date"),
        next_service_date: row.get("next_service_date"),
        next_service_mileage: row.get("next_service_mileage"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(vehicle)).into_response()
}

// 3. GET /api/v1/garage/repair-orders - List repair orders
pub async fn get_repair_orders(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, vehicle_id, check_in_time, symptoms, diagnosis_items, total_estimate::FLOAT8 as total_estimate, customer_approved, technician_id, status, completed_at, created_at, updated_at
        FROM nf_tenant.auto_repair_orders
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
            eprintln!("[Auto Pack] Error fetching repair orders: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut orders = Vec::new();
    for row in rows {
        orders.push(AutoRepairOrder {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            vehicle_id: row.get("vehicle_id"),
            check_in_time: row.get("check_in_time"),
            symptoms: row.get("symptoms"),
            diagnosis_items: row.get("diagnosis_items"),
            total_estimate: row.get("total_estimate"),
            customer_approved: row.get("customer_approved"),
            technician_id: row.get("technician_id"),
            status: row.get("status"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(orders)).into_response()
}

// 4. POST /api/v1/garage/repair-orders - Create repair order
pub async fn create_repair_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateRepairOrderRequest>,
) -> Response {
    let diagnosis_items = payload.diagnosis_items.unwrap_or_else(|| json!([]));
    let total_est = payload.total_estimate.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.auto_repair_orders (tenant_id, vehicle_id, symptoms, diagnosis_items, total_estimate, technician_id)
        VALUES ($1, $2, $3, $4, $5::numeric, $6)
        RETURNING id, tenant_id, vehicle_id, check_in_time, symptoms, diagnosis_items, total_estimate::FLOAT8 as total_estimate, customer_approved, technician_id, status, completed_at, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.vehicle_id)
        .bind(payload.symptoms)
        .bind(diagnosis_items)
        .bind(total_est)
        .bind(payload.technician_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Auto Pack] Error creating repair order: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let order = AutoRepairOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        vehicle_id: row.get("vehicle_id"),
        check_in_time: row.get("check_in_time"),
        symptoms: row.get("symptoms"),
        diagnosis_items: row.get("diagnosis_items"),
        total_estimate: row.get("total_estimate"),
        customer_approved: row.get("customer_approved"),
        technician_id: row.get("technician_id"),
        status: row.get("status"),
        completed_at: row.get("completed_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(order)).into_response()
}

// 5. PUT /api/v1/garage/repair-orders/:id/approve - Approve budget by customer
pub async fn approve_repair_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.auto_repair_orders
        SET customer_approved = TRUE, status = 'Approved', updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
        RETURNING id, tenant_id, vehicle_id, check_in_time, symptoms, diagnosis_items, total_estimate::FLOAT8 as total_estimate, customer_approved, technician_id, status, completed_at, created_at, updated_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(r)) => r,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy phiếu sửa chữa"}))).into_response(),
        Err(e) => {
            eprintln!("[Auto Pack] Error approving repair order: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let order = AutoRepairOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        vehicle_id: row.get("vehicle_id"),
        check_in_time: row.get("check_in_time"),
        symptoms: row.get("symptoms"),
        diagnosis_items: row.get("diagnosis_items"),
        total_estimate: row.get("total_estimate"),
        customer_approved: row.get("customer_approved"),
        technician_id: row.get("technician_id"),
        status: row.get("status"),
        completed_at: row.get("completed_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(order)).into_response()
}

// 6. PUT /api/v1/garage/repair-orders/:id/complete - Complete repair order
pub async fn complete_repair_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.auto_repair_orders
        SET status = 'Completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
        RETURNING id, tenant_id, vehicle_id, check_in_time, symptoms, diagnosis_items, total_estimate::FLOAT8 as total_estimate, customer_approved, technician_id, status, completed_at, created_at, updated_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(r)) => r,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy phiếu sửa chữa"}))).into_response(),
        Err(e) => {
            eprintln!("[Auto Pack] Error completing repair order: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let order = AutoRepairOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        vehicle_id: row.get("vehicle_id"),
        check_in_time: row.get("check_in_time"),
        symptoms: row.get("symptoms"),
        diagnosis_items: row.get("diagnosis_items"),
        total_estimate: row.get("total_estimate"),
        customer_approved: row.get("customer_approved"),
        technician_id: row.get("technician_id"),
        status: row.get("status"),
        completed_at: row.get("completed_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(order)).into_response()
}
