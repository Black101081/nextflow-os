use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use bcrypt::hash;
use serde::Deserialize;
use serde_json::json;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::middleware::tenant_isolation::TenantIsolation;

// Requests structs
#[derive(Debug, Deserialize)]
pub struct SyncUserItem {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SyncUsersRequest {
    pub users: Vec<SyncUserItem>,
}

pub async fn sync_tenant_users(
    State(pool): State<PgPool>,
    tenant: TenantIsolation,
    Path(tenant_id): Path<Uuid>,
    Json(payload): Json<SyncUsersRequest>,
) -> Result<impl IntoResponse, Response> {
    // Rule 4: Tenant Isolation - Bảo vệ ranh giới Tenant
    if tenant_id != tenant.tenant_id {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Bạn không có quyền đồng bộ người dùng cho Tenant ID này."
                }
            })),
        )
            .into_response());
    }

    if payload.users.is_empty() {
        let error_body = json!({
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Mảng users không được rỗng.",
                "details": [{ "field": "users", "issue": "must_be_non_empty_array" }]
            }
        });
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
    }

    let mut results = Vec::new();
    let mut success_count = 0;
    let mut failed_count = 0;

    // Băm mật khẩu mặc định (sử dụng cost 4 để chạy test siêu nhanh)
    let default_password_hash = hash("Sme_Nextflow_2026!", 4).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    for user in payload.users {
        if user.email.trim().is_empty() || user.first_name.trim().is_empty() || user.last_name.trim().is_empty() {
            failed_count += 1;
            results.push(json!({
                "email": user.email,
                "status": "FAILED",
                "error": "Thiếu thông tin bắt buộc."
            }));
            continue;
        }

        let upsert_query = r#"
            INSERT INTO nf_core.users (tenant_id, email, password_hash, first_name, last_name, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (tenant_id, email) 
            DO UPDATE SET 
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              role = EXCLUDED.role,
              is_active = EXCLUDED.is_active,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id
        "#;

        let role = user.role.unwrap_or_else(|| "SME_OPS".to_string());
        let is_active = user.status.map(|s| s == "ACTIVE").unwrap_or(true);
        let email = user.email.to_lowercase().trim().to_string();

        match sqlx::query(upsert_query)
            .bind(tenant.tenant_id)
            .bind(&email)
            .bind(&default_password_hash)
            .bind(&user.first_name)
            .bind(&user.last_name)
            .bind(&role)
            .bind(is_active)
            .fetch_one(&pool)
            .await
        {
            Ok(row) => {
                success_count += 1;
                results.push(json!({
                    "email": user.email,
                    "status": "SYNCED",
                    "user_id": row.get::<Uuid, _>("id")
                }));
            }
            Err(err) => {
                eprintln!("[Tenant Controller] UPSERT failed: {}", err);
                failed_count += 1;
                results.push(json!({
                    "email": user.email,
                    "status": "FAILED",
                    "error": "Lỗi Database."
                }));
            }
        }
    }

    // Trả về mã 207 Multi-Status chuẩn
    let body = json!({
        "success_count": success_count,
        "failed_count": failed_count,
        "results": results
    });

    // 207 Multi-Status
    let status_207 = StatusCode::from_u16(207).unwrap_or(StatusCode::OK);
    Ok((status_207, Json(body)))
}
