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
pub struct ConstProject {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub project_name: String,
    pub client_id: Option<Uuid>,
    pub client_name: Option<String>,
    pub client_phone: Option<String>,
    pub contract_value: f64,
    pub address: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub progress: i32,
    pub site_manager_id: Option<Uuid>,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub project_name: String,
    #[serde(default)]
    pub client_id: Option<Uuid>,
    #[serde(default)]
    pub client_name: Option<String>,
    #[serde(default)]
    pub client_phone: Option<String>,
    #[serde(default)]
    pub contract_value: Option<f64>,
    #[serde(default)]
    pub address: Option<String>,
    #[serde(default)]
    pub start_date: Option<NaiveDate>,
    #[serde(default)]
    pub end_date: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConstDailyLog {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub project_id: Option<Uuid>,
    pub log_date: NaiveDate,
    pub workers_count: i32,
    pub summary: Option<String>,
    pub completed_items: Option<Vec<String>>,
    pub issues: Option<String>,
    pub photos: Option<Vec<String>>,
    pub weather: Option<String>,
    pub supervisor_id: Option<Uuid>,
    pub ai_report: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDailyLogRequest {
    pub project_id: Uuid,
    pub log_date: NaiveDate,
    #[serde(default)]
    pub workers_count: Option<i32>,
    #[serde(default)]
    pub summary: Option<String>,
    #[serde(default)]
    pub completed_items: Option<Vec<String>>,
    #[serde(default)]
    pub issues: Option<String>,
    #[serde(default)]
    pub weather: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConstMaterialRequest {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub project_id: Option<Uuid>,
    pub items: serde_json::Value,
    pub requested_by: Option<Uuid>,
    pub approved_by: Option<Uuid>,
    pub urgency: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMaterialRequest {
    pub project_id: Uuid,
    pub items: serde_json::Value,
    #[serde(default)]
    pub urgency: Option<String>,
}

// 1. GET /api/v1/const/projects
pub async fn get_projects(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, project_name, client_id, client_name, client_phone, contract_value::FLOAT8 as contract_value, address, start_date, end_date, progress, site_manager_id, status, created_at
        FROM nf_tenant.const_projects
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
            eprintln!("[Contractor Pack] Error fetching projects: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let projects: Vec<ConstProject> = rows.into_iter().map(|row| {
        ConstProject {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            project_name: row.get("project_name"),
            client_id: row.get("client_id"),
            client_name: row.get("client_name"),
            client_phone: row.get("client_phone"),
            contract_value: row.get("contract_value"),
            address: row.get("address"),
            start_date: row.get("start_date"),
            end_date: row.get("end_date"),
            progress: row.get("progress"),
            site_manager_id: row.get("site_manager_id"),
            status: row.get("status"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(projects)).into_response()
}

// 2. POST /api/v1/const/projects
pub async fn create_project(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateProjectRequest>,
) -> Response {
    if payload.project_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên dự án không được để trống"}))).into_response();
    }

    let c_val = payload.contract_value.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.const_projects (tenant_id, project_name, client_id, client_name, client_phone, contract_value, address, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, tenant_id, project_name, client_id, client_name, client_phone, contract_value::FLOAT8 as contract_value, address, start_date, end_date, progress, site_manager_id, status, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.project_name)
        .bind(payload.client_id)
        .bind(payload.client_name)
        .bind(payload.client_phone)
        .bind(c_val)
        .bind(payload.address)
        .bind(payload.start_date)
        .bind(payload.end_date)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Contractor Pack] Error creating project: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let project = ConstProject {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        project_name: row.get("project_name"),
        client_id: row.get("client_id"),
        client_name: row.get("client_name"),
        client_phone: row.get("client_phone"),
        contract_value: row.get("contract_value"),
        address: row.get("address"),
        start_date: row.get("start_date"),
        end_date: row.get("end_date"),
        progress: row.get("progress"),
        site_manager_id: row.get("site_manager_id"),
        status: row.get("status"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(project)).into_response()
}

// 3. GET /api/v1/const/daily-logs
pub async fn get_daily_logs(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, project_id, log_date, workers_count, summary, completed_items, issues, photos, weather, supervisor_id, ai_report, created_at
        FROM nf_tenant.const_daily_logs
        WHERE tenant_id = $1
        ORDER BY log_date DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Contractor Pack] Error fetching daily logs: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let logs: Vec<ConstDailyLog> = rows.into_iter().map(|row| {
        ConstDailyLog {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            project_id: row.get("project_id"),
            log_date: row.get("log_date"),
            workers_count: row.get("workers_count"),
            summary: row.get("summary"),
            completed_items: row.get("completed_items"),
            issues: row.get("issues"),
            photos: row.get("photos"),
            weather: row.get("weather"),
            supervisor_id: row.get("supervisor_id"),
            ai_report: row.get("ai_report"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(logs)).into_response()
}

// 4. POST /api/v1/const/daily-logs
pub async fn create_daily_log(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateDailyLogRequest>,
) -> Response {
    let w_count = payload.workers_count.unwrap_or(0);
    
    // Simulate AI summary generator
    let ai_summary = format!("Dự án ghi nhận {} nhân công ngày {}. Tiến độ ổn định, không ghi nhận rủi ro vật tư.", w_count, payload.log_date);

    let insert_query = r#"
        INSERT INTO nf_tenant.const_daily_logs (tenant_id, project_id, log_date, workers_count, summary, completed_items, issues, weather, ai_report)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, tenant_id, project_id, log_date, workers_count, summary, completed_items, issues, photos, weather, supervisor_id, ai_report, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.project_id)
        .bind(payload.log_date)
        .bind(w_count)
        .bind(payload.summary)
        .bind(payload.completed_items)
        .bind(payload.issues)
        .bind(payload.weather)
        .bind(ai_summary)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Contractor Pack] Error creating daily log: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // Auto-update project progress
    let _ = sqlx::query("UPDATE nf_tenant.const_projects SET progress = LEAST(100, progress + 5) WHERE id = $1 AND tenant_id = $2")
        .bind(payload.project_id)
        .bind(tenant.tenant_id)
        .execute(&state.pool)
        .await;

    let log = ConstDailyLog {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        project_id: row.get("project_id"),
        log_date: row.get("log_date"),
        workers_count: row.get("workers_count"),
        summary: row.get("summary"),
        completed_items: row.get("completed_items"),
        issues: row.get("issues"),
        photos: row.get("photos"),
        weather: row.get("weather"),
        supervisor_id: row.get("supervisor_id"),
        ai_report: row.get("ai_report"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(log)).into_response()
}

// 5. GET /api/v1/const/material-requests
pub async fn get_material_requests(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, project_id, items, requested_by, approved_by, urgency, status, created_at
        FROM nf_tenant.const_material_requests
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
            eprintln!("[Contractor Pack] Error fetching material requests: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let requests: Vec<ConstMaterialRequest> = rows.into_iter().map(|row| {
        ConstMaterialRequest {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            project_id: row.get("project_id"),
            items: row.get("items"),
            requested_by: row.get("requested_by"),
            approved_by: row.get("approved_by"),
            urgency: row.get("urgency"),
            status: row.get("status"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(requests)).into_response()
}

// 6. POST /api/v1/const/material-requests
pub async fn create_material_request(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateMaterialRequest>,
) -> Response {
    let urgency = payload.urgency.unwrap_or_else(|| "Normal".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.const_material_requests (tenant_id, project_id, items, urgency)
        VALUES ($1, $2, $3, $4)
        RETURNING id, tenant_id, project_id, items, requested_by, approved_by, urgency, status, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.project_id)
        .bind(payload.items)
        .bind(urgency)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Contractor Pack] Error creating material request: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let request = ConstMaterialRequest {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        project_id: row.get("project_id"),
        items: row.get("items"),
        requested_by: row.get("requested_by"),
        approved_by: row.get("approved_by"),
        urgency: row.get("urgency"),
        status: row.get("status"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(request)).into_response()
}
