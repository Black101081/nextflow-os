use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use bcrypt::hash;
use serde::Deserialize;
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;

use crate::AppState;

// Verification helper
fn verify_admin_key(headers: &HeaderMap) -> Result<(), Response> {
    let admin_key = headers
        .get("x-platform-admin-key")
        .and_then(|h| h.to_str().ok());

    let expected = std::env::var("PLATFORM_ADMIN_KEY")
        .unwrap_or_else(|_| "nf_platform_secret_admin_key_2026".to_string());

    if admin_key == Some(&expected[..]) {
        Ok(())
    } else {
        Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Không có quyền quản trị Platform."
                }
            })),
        )
            .into_response())
    }
}

// Request payloads
#[derive(Debug, Deserialize)]
pub struct CreateTenantRequest {
    pub company_name: String,
    pub domain: String,
    pub subscription_tier: Option<String>,
    pub admin_email: String,
    pub admin_first_name: String,
    pub admin_last_name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTenantRequest {
    pub status: Option<String>,
    pub subscription_tier: Option<String>,
}

// 1. GET /api/v1/platform/tenants - List all tenants
pub async fn list_tenants(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, Response> {
    verify_admin_key(&headers)?;

    let query = r#"
        SELECT id, company_name, domain, status, subscription_tier, created_at
        FROM nf_core.tenants
        ORDER BY created_at DESC
    "#;

    let rows = sqlx::query(query)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response()
        })?;

    let mut tenants = Vec::new();
    for row in rows {
        tenants.push(json!({
            "id": row.get::<Uuid, _>("id"),
            "company_name": row.get::<String, _>("company_name"),
            "domain": row.get::<String, _>("domain"),
            "status": row.get::<String, _>("status"),
            "subscription_tier": row.get::<String, _>("subscription_tier"),
            "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
        }));
    }

    Ok(Json(tenants))
}

// 2. POST /api/v1/platform/tenants - Create new tenant + admin user + policies
pub async fn create_tenant(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<CreateTenantRequest>,
) -> Result<impl IntoResponse, Response> {
    verify_admin_key(&headers)?;

    if payload.company_name.trim().is_empty()
        || payload.domain.trim().is_empty()
        || payload.admin_email.trim().is_empty()
    {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Tên công ty, domain và email quản trị là bắt buộc."
                }
            })),
        )
            .into_response());
    }

    let tier = payload
        .subscription_tier
        .unwrap_or_else(|| "STANDARD".to_string());

    let mut tx = state.pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    // Check if domain already exists
    let domain_exists = sqlx::query("SELECT 1 FROM nf_core.tenants WHERE domain = $1")
        .bind(&payload.domain)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response()
        })?;

    if domain_exists.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({
                "error": {
                    "code": "DOMAIN_CONFLICT",
                    "message": "Domain đăng ký đã tồn tại trong hệ thống."
                }
            })),
        )
            .into_response());
    }

    // Insert Tenant
    let tenant_row = sqlx::query(
        r#"
        INSERT INTO nf_core.tenants (company_name, domain, status, subscription_tier)
        VALUES ($1, $2, 'ACTIVE', $3)
        RETURNING id
        "#,
    )
    .bind(&payload.company_name)
    .bind(&payload.domain)
    .bind(&tier)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    let tenant_id: Uuid = tenant_row.get("id");

    // Insert Default Policies
    sqlx::query(
        r#"
        INSERT INTO nf_core.tenant_policies (tenant_id, sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode)
        VALUES ($1, 60, 30, FALSE, 'FIFO')
        "#,
    )
    .bind(tenant_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    // Create Admin User
    let default_password_hash = hash("Sme_Nextflow_2026!", 4).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    sqlx::query(
        r#"
        INSERT INTO nf_core.users (tenant_id, email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, 'SME_LEADER', TRUE)
        "#,
    )
    .bind(tenant_id)
    .bind(&payload.admin_email.to_lowercase())
    .bind(&default_password_hash)
    .bind(&payload.admin_first_name)
    .bind(&payload.admin_last_name)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    let api_key = format!("nf_live_test_{}", tenant_id);

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "SUCCESS",
            "tenant": {
                "id": tenant_id,
                "company_name": payload.company_name,
                "domain": payload.domain,
                "subscription_tier": tier,
                "api_key": api_key,
                "default_admin": {
                    "email": payload.admin_email,
                    "password": "Sme_Nextflow_2026!"
                }
            }
        })),
    ))
}

// 3. PATCH /api/v1/platform/tenants/:id - Update tenant tier or status
pub async fn update_tenant(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateTenantRequest>,
) -> Result<impl IntoResponse, Response> {
    verify_admin_key(&headers)?;

    let mut query_parts = Vec::new();
    let mut param_index = 1;

    if payload.status.is_some() {
        query_parts.push(format!("status = ${}", param_index));
        param_index += 1;
    }
    if payload.subscription_tier.is_some() {
        query_parts.push(format!("subscription_tier = ${}", param_index));
        param_index += 1;
    }

    if query_parts.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": {
                    "code": "BAD_REQUEST",
                    "message": "Không có trường nào để cập nhật."
                }
            })),
        )
            .into_response());
    }

    let update_query = format!(
        "UPDATE nf_core.tenants SET {}, updated_at = CURRENT_TIMESTAMP WHERE id = ${} RETURNING id",
        query_parts.join(", "),
        param_index
    );

    let mut q = sqlx::query(&update_query);

    if let Some(status) = &payload.status {
        q = q.bind(status);
    }
    if let Some(tier) = &payload.subscription_tier {
        q = q.bind(tier);
    }
    q = q.bind(id);

    let row = q.fetch_optional(&state.pool).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response()
    })?;

    match row {
        Some(_) => Ok(Json(json!({
            "status": "SUCCESS",
            "message": "Cập nhật thông tin Tenant thành công."
        }))),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": {
                    "code": "TENANT_NOT_FOUND",
                    "message": "Tenant không tồn tại."
                }
            })),
        )
            .into_response()),
    }
}
