use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, Header, EncodingKey};
use uuid::Uuid;

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
    pub role: String,        // role (ví dụ: "INTEGRATION_CLIENT")
    pub exp: i64,            // Expiration time
}

pub async fn oauth_token(
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

    // client_secret phải có định dạng: nf_secret_<tenant_id>
    let expected_secret = format!("nf_secret_{}", tenant_id);
    if payload.client_secret != expected_secret {
        let err_body = json!({
            "error": "invalid_client",
            "error_description": "client_secret không chính xác."
        });
        return Err((StatusCode::UNAUTHORIZED, Json(err_body)).into_response());
    }

    // 3. Tạo JWT Token
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "nf_gateway_secret_key_123!".to_string());
    let exp_duration = Duration::hours(1);
    let expiration = Utc::now() + exp_duration;
    
    let claims = Claims {
        sub: payload.client_id,
        tenant_id,
        role: "INTEGRATION_CLIENT".to_string(),
        exp: expiration.timestamp(),
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
