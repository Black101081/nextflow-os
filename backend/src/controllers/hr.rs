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
pub struct EmployeePayload {
    pub employee_code: Option<String>,
    pub full_name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub position: Option<String>,
    pub department: Option<String>,
    pub start_date: String,
    pub base_salary: Option<f64>,
}

#[derive(Deserialize, Serialize)]
pub struct AttendancePayload {
    pub employee_id: Uuid,
    pub date: String,
    pub check_in_time: Option<String>,
    pub check_out_time: Option<String>,
    pub status: String,
}

#[derive(Deserialize, Serialize)]
pub struct PayrollRunPayload {
    pub period: String,
}

// --- Handlers ---

/// GET /api/v1/hr/employees
pub async fn get_employees(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_employees") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT id, employee_code, full_name, phone, email, position, department, start_date, base_salary::FLOAT, status, created_at
        FROM nf_hr.employees
        WHERE tenant_id = $1
        ORDER BY full_name ASC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let employees: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "employee_code": row.get::<Option<String>, _>("employee_code"),
                    "full_name": row.get::<String, _>("full_name"),
                    "phone": row.get::<Option<String>, _>("phone"),
                    "email": row.get::<Option<String>, _>("email"),
                    "position": row.get::<Option<String>, _>("position"),
                    "department": row.get::<Option<String>, _>("department"),
                    "start_date": row.get::<chrono::NaiveDate, _>("start_date").to_string(),
                    "base_salary": row.get::<Option<f64>, _>("base_salary"),
                    "status": row.get::<String, _>("status"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": employees })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/hr/employees
pub async fn create_employee(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<EmployeePayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_employees") {
        return e.into_response();
    }

    let start_date = match chrono::NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid date format: {}", err) }))).into_response(),
    };

    match sqlx::query(
        r#"
        INSERT INTO nf_hr.employees (tenant_id, employee_code, full_name, phone, email, position, department, start_date, base_salary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, employee_code, full_name, start_date, base_salary::FLOAT, status, created_at
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.employee_code)
    .bind(payload.full_name)
    .bind(payload.phone)
    .bind(payload.email)
    .bind(payload.position)
    .bind(payload.department)
    .bind(start_date)
    .bind(payload.base_salary)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "employee_code": row.get::<Option<String>, _>("employee_code"),
                    "full_name": row.get::<String, _>("full_name"),
                    "start_date": row.get::<chrono::NaiveDate, _>("start_date").to_string(),
                    "base_salary": row.get::<Option<f64>, _>("base_salary"),
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

/// GET /api/v1/hr/attendance
pub async fn get_attendance(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("view_attendance") {
        return e.into_response();
    }

    match sqlx::query(
        r#"
        SELECT a.id, a.employee_id, e.full_name as employee_name, a.date, a.check_in_time, a.check_out_time, a.status, a.total_hours::FLOAT
        FROM nf_hr.attendance_records a
        JOIN nf_hr.employees e ON a.employee_id = e.id
        WHERE a.tenant_id = $1
        ORDER BY a.date DESC
        "#
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(rows) => {
            let records: Vec<serde_json::Value> = rows.into_iter().map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id"),
                    "employee_id": row.get::<Uuid, _>("employee_id"),
                    "employee_name": row.get::<String, _>("employee_name"),
                    "date": row.get::<chrono::NaiveDate, _>("date").to_string(),
                    "check_in_time": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("check_in_time"),
                    "check_out_time": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("check_out_time"),
                    "status": row.get::<String, _>("status"),
                    "total_hours": row.get::<Option<f64>, _>("total_hours"),
                })
            }).collect();
            Json(serde_json::json!({ "status": "success", "data": records })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}

/// POST /api/v1/hr/attendance
pub async fn create_attendance(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    rbac: RbacContext,
    Json(payload): Json<AttendancePayload>,
) -> impl IntoResponse {
    if let Err(e) = rbac.require("manage_attendance") {
        return e.into_response();
    }

    let date = match chrono::NaiveDate::parse_from_str(&payload.date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(err) => return (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Invalid date format: {}", err) }))).into_response(),
    };

    let check_in_time = payload.check_in_time.and_then(|t| chrono::DateTime::parse_from_rfc3339(&t).ok());
    let check_out_time = payload.check_out_time.and_then(|t| chrono::DateTime::parse_from_rfc3339(&t).ok());

    match sqlx::query(
        r#"
        INSERT INTO nf_hr.attendance_records (tenant_id, employee_id, date, check_in_time, check_out_time, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (tenant_id, employee_id, date) DO UPDATE
        SET check_in_time = EXCLUDED.check_in_time, check_out_time = EXCLUDED.check_out_time, status = EXCLUDED.status
        RETURNING id, employee_id, date, status, check_in_time, check_out_time
        "#
    )
    .bind(tenant.tenant_id)
    .bind(payload.employee_id)
    .bind(date)
    .bind(check_in_time)
    .bind(check_out_time)
    .bind(payload.status)
    .fetch_one(&state.pool)
    .await
    {
        Ok(row) => {
            Json(serde_json::json!({
                "status": "success",
                "data": {
                    "id": row.get::<Uuid, _>("id"),
                    "employee_id": row.get::<Uuid, _>("employee_id"),
                    "date": row.get::<chrono::NaiveDate, _>("date").to_string(),
                    "status": row.get::<String, _>("status"),
                    "check_in_time": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("check_in_time"),
                    "check_out_time": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("check_out_time"),
                }
            })).into_response()
        }
        Err(e) => {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response()
        }
    }
}
