use axum::{
    async_trait,
    extract::{FromRequestParts},
    http::request::Parts,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use sqlx::Row;
use crate::AppState;

pub struct RbacContext {
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub role_id: String,
    pub permissions: Vec<String>,
}

impl RbacContext {
    /// Hàm kiểm tra xem user có quyền thực thi thao tác không
    pub fn require(&self, permission: &str) -> Result<(), Response> {
        if self.permissions.contains(&permission.to_string()) {
            Ok(())
        } else {
            let body = Json(json!({
                "error": {
                    "code": "FORBIDDEN",
                    "message": format!("Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền: {}", permission)
                }
            }));
            Err((axum::http::StatusCode::FORBIDDEN, body).into_response())
        }
    }
    
    /// Hàm kiểm tra nhiều quyền (chỉ cần có 1 trong các quyền)
    pub fn require_any(&self, permissions: &[&str]) -> Result<(), Response> {
        if permissions.iter().any(|&p| self.permissions.contains(&p.to_string())) {
            Ok(())
        } else {
            let body = Json(json!({
                "error": {
                    "code": "FORBIDDEN",
                    "message": format!("Bạn không có quyền thực hiện thao tác này. Yêu cầu một trong các quyền: {:?}", permissions)
                }
            }));
            Err((axum::http::StatusCode::FORBIDDEN, body).into_response())
        }
    }
}

#[async_trait]
impl FromRequestParts<AppState> for RbacContext {
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        // 1. Trích xuất TenantIsolation (Xác thực IP, Token, Tenant ID)
        let isolation = TenantIsolation::from_request_parts(parts, &()).await.map_err(|e| e.into_response())?;
        
        let user_id = match isolation.user_id {
            Some(uid) => uid,
            None => {
                let err = Json(json!({
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Yêu cầu phải có user_id (Đăng nhập qua Bearer token)."
                    }
                }));
                return Err((axum::http::StatusCode::UNAUTHORIZED, err).into_response());
            }
        };

        // 2. Truy vấn Database lấy Role của User
        let user_record = sqlx::query!(
            r#"
            SELECT role 
            FROM nf_core.users 
            WHERE id = $1 AND tenant_id = $2 AND is_active = true
            "#,
            user_id,
            isolation.tenant_id
        )
        .fetch_optional(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[RBAC] DB Error fetching user: {}", err);
            let err_body = Json(json!({"error": "Lỗi truy xuất dữ liệu người dùng"}));
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, err_body).into_response()
        })?;

        let user = match user_record {
            Some(u) => u,
            None => {
                let err = Json(json!({"error": "Tài khoản không tồn tại, sai tenant_id hoặc đã bị khóa."}));
                return Err((axum::http::StatusCode::UNAUTHORIZED, err).into_response());
            }
        };

        // 3. Lấy toàn bộ Permissions của Role đó
        let permissions_records = sqlx::query(
            r#"
            SELECT permission_id 
            FROM nf_core.role_permissions 
            WHERE role_id = $1
            "#
        )
        .bind(&user.role)
        .fetch_all(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[RBAC] DB Error fetching permissions: {}", err);
            let err_body = Json(json!({"error": "Lỗi truy xuất quyền hạn"}));
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, err_body).into_response()
        })?;

        let permissions: Vec<String> = permissions_records.into_iter().map(|r| r.get("permission_id")).collect();

        // 4. Trả về Context
        Ok(RbacContext {
            tenant_id: isolation.tenant_id,
            user_id,
            role_id: user.role,
            permissions,
        })
    }
}
