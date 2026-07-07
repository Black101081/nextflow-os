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
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Serialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,         // client_id
    pub tenant_id: Uuid,     // tenant_id
    pub role: String,        // role
    pub exp: i64,            // Expiration time
    pub user_id: Option<Uuid>,
}

pub async fn oauth_token(
    State(state): State<AppState>,
    Json(payload): Json<TokenRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra grant_type
    if payload.grant_type != "client_credentials" {
        let err_body = json!({
            "error": "unsupported_grant_type",
            "error_description": "Chỉ hỗ trợ grant_type = client_credentials."
        });
        return Err((StatusCode::BAD_REQUEST, Json(err_body)).into_response());
    }

    // 2. Kiểm tra Client Credentials
    // client_id phải là một Tenant ID (UUID v4) hợp lệ
    let tenant_id = match Uuid::parse_str(&payload.client_id) {
        Ok(uid) => uid,
        Err(_) => {
            let err_body = json!({
                "error": "invalid_client",
                "error_description": "client_id phải là một Tenant ID (UUID) hợp lệ."
            });
            return Err((StatusCode::UNAUTHORIZED, Json(err_body)).into_response());
        }
    };

    // client_secret phải có định dạng: nf_secret_<tenant_id> hoặc nf_live_test_<tenant_id>
    let expected_secret_1 = format!("nf_secret_{}", tenant_id);
    let expected_secret_2 = format!("nf_live_test_{}", tenant_id);
    if payload.client_secret != expected_secret_1 && payload.client_secret != expected_secret_2 {
        let err_body = json!({
            "error": "invalid_client",
            "error_description": "client_secret không chính xác."
        });
        return Err((StatusCode::UNAUTHORIZED, Json(err_body)).into_response());
    }

    // 3. Tìm tài khoản người dùng đại diện của Tenant trong Database (ưu tiên SME_LEADER)
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

    // 4. Tạo JWT Token
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "nf_gateway_secret_key_123!".to_string());
    let exp_duration = Duration::hours(1);
    let expiration = Utc::now() + exp_duration;
    
    let claims = Claims {
        sub: payload.client_id,
        tenant_id,
        role,
        exp: expiration.timestamp(),
        user_id,
    };

    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    ) {
        Ok(t) => t,
        Err(err) => {
            eprintln!("[OAuth Controller] JWT Encode error: {}", err);
            let err_body = json!({
                "error": "server_error",
                "error_description": "Không thể sinh JWT token."
            });
            return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(err_body)).into_response());
        }
    };

    Ok(Json(TokenResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        expires_in: exp_duration.num_seconds(),
    }))
}
