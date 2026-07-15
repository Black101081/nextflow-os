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
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct MfgWorkOrder {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub order_ref: Option<String>,
    pub product_id: Option<Uuid>,
    pub product_name: Option<String>,
    pub target_quantity: i32,
    pub produced_quantity: i32,
    pub defect_quantity: i32,
    pub line_id: Option<Uuid>,
    pub supervisor_id: Option<Uuid>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorkOrderRequest {
    #[serde(default)]
    pub order_ref: Option<String>,
    #[serde(default)]
    pub product_id: Option<Uuid>,
    pub product_name: String,
    pub target_quantity: i32,
    #[serde(default)]
    pub produced_quantity: Option<i32>,
    #[serde(default)]
    pub defect_quantity: Option<i32>,
    #[serde(default)]
    pub line_id: Option<Uuid>,
    #[serde(default)]
    pub supervisor_id: Option<Uuid>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MfgBom {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub product_id: Uuid,
    pub product_name: Option<String>,
    pub version: Option<String>,
    pub materials: serde_json::Value,
    pub labor_hours: f64,
    pub approved: bool,
    pub approved_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBomRequest {
    pub product_id: Uuid,
    pub product_name: String,
    #[serde(default)]
    pub version: Option<String>,
    pub materials: serde_json::Value,
    #[serde(default)]
    pub labor_hours: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MfgQcReport {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub work_order_id: Option<Uuid>,
    pub checked_quantity: Option<i32>,
    pub pass_quantity: Option<i32>,
    pub defect_types: serde_json::Value,
    pub disposition: Option<String>,
    pub inspector_id: Option<Uuid>,
    pub inspected_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateQcReportRequest {
    pub work_order_id: Uuid,
    pub checked_quantity: i32,
    pub pass_quantity: i32,
    pub defect_types: serde_json::Value,
    pub disposition: String,
}

// 1. GET /api/v1/mfg/work-orders
pub async fn get_work_orders(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, order_ref, product_id, product_name, target_quantity, produced_quantity, defect_quantity, line_id, supervisor_id, start_time, end_time, status, notes, created_at
        FROM nf_tenant.mfg_work_orders
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
            eprintln!("[Manufacturing Pack] Error fetching work orders: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let orders: Vec<MfgWorkOrder> = rows.into_iter().map(|row| {
        MfgWorkOrder {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            order_ref: row.get("order_ref"),
            product_id: row.get("product_id"),
            product_name: row.get("product_name"),
            target_quantity: row.get("target_quantity"),
            produced_quantity: row.get("produced_quantity"),
            defect_quantity: row.get("defect_quantity"),
            line_id: row.get("line_id"),
            supervisor_id: row.get("supervisor_id"),
            start_time: row.get("start_time"),
            end_time: row.get("end_time"),
            status: row.get("status"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(orders)).into_response()
}

// 2. POST /api/v1/mfg/work-orders
pub async fn create_work_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWorkOrderRequest>,
) -> Response {
    if payload.product_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên sản phẩm không được để trống"}))).into_response();
    }

    let p_qty = payload.produced_quantity.unwrap_or(0);
    let d_qty = payload.defect_quantity.unwrap_or(0);
    let order_ref = payload.order_ref.unwrap_or_else(|| format!("WO-{}", Utc::now().timestamp_millis() % 10000));

    let insert_query = r#"
        INSERT INTO nf_tenant.mfg_work_orders (tenant_id, order_ref, product_id, product_name, target_quantity, produced_quantity, defect_quantity, line_id, supervisor_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, tenant_id, order_ref, product_id, product_name, target_quantity, produced_quantity, defect_quantity, line_id, supervisor_id, start_time, end_time, status, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(order_ref)
        .bind(payload.product_id)
        .bind(payload.product_name)
        .bind(payload.target_quantity)
        .bind(p_qty)
        .bind(d_qty)
        .bind(payload.line_id)
        .bind(payload.supervisor_id)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Manufacturing Pack] Error creating work order: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let order = MfgWorkOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        order_ref: row.get("order_ref"),
        product_id: row.get("product_id"),
        product_name: row.get("product_name"),
        target_quantity: row.get("target_quantity"),
        produced_quantity: row.get("produced_quantity"),
        defect_quantity: row.get("defect_quantity"),
        line_id: row.get("line_id"),
        supervisor_id: row.get("supervisor_id"),
        start_time: row.get("start_time"),
        end_time: row.get("end_time"),
        status: row.get("status"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(order)).into_response()
}

// 3. GET /api/v1/mfg/boms
pub async fn get_boms(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, product_id, product_name, version, materials, labor_hours::FLOAT8 as labor_hours, approved, approved_by, created_at
        FROM nf_tenant.mfg_boms
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
            eprintln!("[Manufacturing Pack] Error fetching BOMs: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let boms: Vec<MfgBom> = rows.into_iter().map(|row| {
        MfgBom {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            product_id: row.get("product_id"),
            product_name: row.get("product_name"),
            version: row.get("version"),
            materials: row.get("materials"),
            labor_hours: row.get("labor_hours"),
            approved: row.get("approved"),
            approved_by: row.get("approved_by"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(boms)).into_response()
}

// 4. POST /api/v1/mfg/boms
pub async fn create_bom(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateBomRequest>,
) -> Response {
    let labor_hours = payload.labor_hours.unwrap_or(0.0);
    let version = payload.version.unwrap_or_else(|| "1.0".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.mfg_boms (tenant_id, product_id, product_name, version, materials, labor_hours)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tenant_id, product_id, product_name, version, materials, labor_hours::FLOAT8 as labor_hours, approved, approved_by, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.product_id)
        .bind(payload.product_name)
        .bind(version)
        .bind(payload.materials)
        .bind(labor_hours)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Manufacturing Pack] Error creating BOM: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let bom = MfgBom {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        product_id: row.get("product_id"),
        product_name: row.get("product_name"),
        version: row.get("version"),
        materials: row.get("materials"),
        labor_hours: row.get("labor_hours"),
        approved: row.get("approved"),
        approved_by: row.get("approved_by"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(bom)).into_response()
}

// 5. GET /api/v1/mfg/qc-reports
pub async fn get_qc_reports(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, work_order_id, checked_quantity, pass_quantity, defect_types, disposition, inspector_id, inspected_at, created_at
        FROM nf_tenant.mfg_qc_reports
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
            eprintln!("[Manufacturing Pack] Error fetching QC reports: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let reports: Vec<MfgQcReport> = rows.into_iter().map(|row| {
        MfgQcReport {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            work_order_id: row.get("work_order_id"),
            checked_quantity: row.get("checked_quantity"),
            pass_quantity: row.get("pass_quantity"),
            defect_types: row.get("defect_types"),
            disposition: row.get("disposition"),
            inspector_id: row.get("inspector_id"),
            inspected_at: row.get("inspected_at"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(reports)).into_response()
}

// 6. POST /api/v1/mfg/qc-reports
pub async fn create_qc_report(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateQcReportRequest>,
) -> Response {
    let insert_query = r#"
        INSERT INTO nf_tenant.mfg_qc_reports (tenant_id, work_order_id, checked_quantity, pass_quantity, defect_types, disposition)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tenant_id, work_order_id, checked_quantity, pass_quantity, defect_types, disposition, inspector_id, inspected_at, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.work_order_id)
        .bind(payload.checked_quantity)
        .bind(payload.pass_quantity)
        .bind(payload.defect_types)
        .bind(payload.disposition)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Manufacturing Pack] Error creating QC report: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // Update work order produced & defect quantities accordingly
    let defect_qty = payload.checked_quantity - payload.pass_quantity;
    let _ = sqlx::query("UPDATE nf_tenant.mfg_work_orders SET produced_quantity = produced_quantity + $1, defect_quantity = defect_quantity + $2, status = 'InQC' WHERE id = $3 AND tenant_id = $4")
        .bind(payload.pass_quantity)
        .bind(defect_qty)
        .bind(payload.work_order_id)
        .bind(tenant.tenant_id)
        .execute(&state.pool)
        .await;

    let report = MfgQcReport {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        work_order_id: row.get("work_order_id"),
        checked_quantity: row.get("checked_quantity"),
        pass_quantity: row.get("pass_quantity"),
        defect_types: row.get("defect_types"),
        disposition: row.get("disposition"),
        inspector_id: row.get("inspector_id"),
        inspected_at: row.get("inspected_at"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(report)).into_response()
}
