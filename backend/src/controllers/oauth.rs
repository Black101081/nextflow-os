use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
    extract::State,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, Header, EncodingKey};
use uuid::Uuid;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct TokenRequest {
    pub grant_type: String,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,         // client_id or user_id
    pub tenant_id: Uuid,     // tenant_id
    pub role: String,        // role
    pub exp: i64,            // Expiration time
    pub user_id: Option<Uuid>,
}

pub async fn oauth_token(
    State(state): State<AppState>,
    Json(payload): Json<TokenRequest>,
) -> Result<impl IntoResponse, Response> {
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "nf_gateway_secret_key_123!".to_string());
    let exp_duration = Duration::hours(1);
    let expiration = Utc::now() + exp_duration;

    // 1. Hỗ trợ Đăng nhập bằng Email/Password (grant_type = password)
    if payload.grant_type == "password" {
        let username = payload.username.ok_or_else(|| {
            (StatusCode::BAD_REQUEST, Json(json!({
                "error": "invalid_request",
                "error_description": "Thiếu tham số 'username'."
            }))).into_response()
        })?;
        let password = payload.password.ok_or_else(|| {
            (StatusCode::BAD_REQUEST, Json(json!({
                "error": "invalid_request",
                "error_description": "Thiếu tham số 'password'."
            }))).into_response()
        })?;

        // 1.1 Kiểm tra Platform Admin
        if username == "admin@platform.com" {
            let admin_key = std::env::var("PLATFORM_ADMIN_KEY").unwrap_or_else(|_| "nf_platform_secret_admin_key_2026".to_string());
            if password != admin_key {
                return Err((StatusCode::UNAUTHORIZED, Json(json!({
                    "error": "invalid_grant",
                    "error_description": "Mật khẩu Platform Admin không chính xác."
                }))).into_response());
            }

            let claims = Claims {
                sub: "ffffffff-ffff-ffff-ffff-ffffffffffff".to_string(),
                tenant_id: Uuid::nil(),
                role: "PLATFORM_ADMIN".to_string(),
                exp: expiration.timestamp(),
                user_id: None,
            };

            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes())).unwrap();
            return Ok(Json(TokenResponse {
                access_token: token,
                token_type: "Bearer".to_string(),
                expires_in: exp_duration.num_seconds(),
            }));
        }

        // 1.2 Tìm Tenant User trong Database
        let user_row = sqlx::query(
            r#"
            SELECT id, tenant_id, role, password_hash 
            FROM nf_core.users 
            WHERE email = $1 AND is_active = true
            LIMIT 1
            "#
        )
        .bind(&username)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("[OAuth Controller] DB Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "server_error", "error_description": "Lỗi cơ sở dữ liệu." }))).into_response()
        })?;

        let row = match user_row {
            Some(r) => r,
            None => {
                return Err((StatusCode::UNAUTHORIZED, Json(json!({
                    "error": "invalid_grant",
                    "error_description": "Tài khoản hoặc mật khẩu không chính xác."
                }))).into_response());
            }
        };

        use sqlx::Row;
        let password_hash = row.get::<String, _>("password_hash");
        let tenant_id = row.get::<Uuid, _>("tenant_id");
        let user_id = row.get::<Uuid, _>("id");
        let role = row.get::<String, _>("role");

        // Verify password
        if !bcrypt::verify(&password, &password_hash).unwrap_or(false) {
            return Err((StatusCode::UNAUTHORIZED, Json(json!({
                "error": "invalid_grant",
                "error_description": "Tài khoản hoặc mật khẩu không chính xác."
            }))).into_response());
        }

        let claims = Claims {
            sub: user_id.to_string(),
            tenant_id,
            role,
            exp: expiration.timestamp(),
            user_id: Some(user_id),
        };

        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes())).unwrap();
        return Ok(Json(TokenResponse {
            access_token: token,
            token_type: "Bearer".to_string(),
            expires_in: exp_duration.num_seconds(),
        }));
    }

    // 2. Hỗ trợ Đăng nhập bằng Client Credentials (grant_type = client_credentials)
    if payload.grant_type == "client_credentials" {
        let client_id = payload.client_id.ok_or_else(|| {
            (StatusCode::BAD_REQUEST, Json(json!({
                "error": "invalid_request",
                "error_description": "Thiếu tham số 'client_id'."
            }))).into_response()
        })?;
        let client_secret = payload.client_secret.ok_or_else(|| {
            (StatusCode::BAD_REQUEST, Json(json!({
                "error": "invalid_request",
                "error_description": "Thiếu tham số 'client_secret'."
            }))).into_response()
        })?;

        // 2.1 Platform Admin
        if client_id == "ffffffff-ffff-ffff-ffff-ffffffffffff" {
            let admin_key = std::env::var("PLATFORM_ADMIN_KEY").unwrap_or_else(|_| "nf_platform_secret_admin_key_2026".to_string());
            if client_secret != admin_key {
                return Err((StatusCode::UNAUTHORIZED, Json(json!({
                    "error": "invalid_client",
                    "error_description": "client_secret không chính xác cho PLATFORM_ADMIN."
                }))).into_response());
            }

            let claims = Claims {
                sub: client_id,
                tenant_id: Uuid::nil(),
                role: "PLATFORM_ADMIN".to_string(),
                exp: expiration.timestamp(),
                user_id: None,
            };

            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes())).unwrap();
            return Ok(Json(TokenResponse {
                access_token: token,
                token_type: "Bearer".to_string(),
                expires_in: exp_duration.num_seconds(),
            }));
        }

        // 2.2 client_id phải là một Tenant ID (UUID v4) hợp lệ
        let tenant_id = match Uuid::parse_str(&client_id) {
            Ok(uid) => uid,
            Err(_) => {
                return Err((StatusCode::UNAUTHORIZED, Json(json!({
                    "error": "invalid_client",
                    "error_description": "client_id phải là một Tenant ID (UUID) hợp lệ."
                }))).into_response());
            }
        };

        // client_secret phải có định dạng: nf_secret_<tenant_id> hoặc nf_live_test_<tenant_id>
        let expected_secret_1 = format!("nf_secret_{}", tenant_id);
        let expected_secret_2 = format!("nf_live_test_{}", tenant_id);
        if client_secret != expected_secret_1 && client_secret != expected_secret_2 {
            return Err((StatusCode::UNAUTHORIZED, Json(json!({
                "error": "invalid_client",
                "error_description": "client_secret không chính xác."
            }))).into_response());
        }

        // Tìm tài khoản người dùng đại diện của Tenant trong Database (ưu tiên SME_LEADER)
        let user_row = sqlx::query(
            r#"
            SELECT id, role 
            FROM nf_core.users 
            WHERE tenant_id = $1 AND is_active = true
            ORDER BY CASE WHEN role = 'SME_LEADER' THEN 1 ELSE 2 END ASC, created_at ASC
            LIMIT 1
            "#
        )
        .bind(tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("[OAuth Controller] DB Error fetching user: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "server_error", "error_description": "Lỗi kết nối cơ sở dữ liệu." }))).into_response()
        })?;

        let (user_id, role) = match user_row {
            Some(row) => {
                use sqlx::Row;
                (Some(row.get::<Uuid, _>("id")), row.get::<String, _>("role"))
            }
            None => (None, "INTEGRATION_CLIENT".to_string()),
        };

        let claims = Claims {
            sub: client_id,
            tenant_id,
            role,
            exp: expiration.timestamp(),
            user_id,
        };

        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes())).unwrap();
        return Ok(Json(TokenResponse {
            access_token: token,
            token_type: "Bearer".to_string(),
            expires_in: exp_duration.num_seconds(),
        }));
    }

    // Nếu grant_type không được hỗ trợ
    Err((StatusCode::BAD_REQUEST, Json(json!({
        "error": "unsupported_grant_type",
        "error_description": "Chỉ hỗ trợ grant_type = client_credentials hoặc password."
    }))).into_response())
}
