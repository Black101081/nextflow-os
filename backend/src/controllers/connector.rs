use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use aes_gcm::aead::rand_core::RngCore;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

fn get_master_key() -> Key<Aes256Gcm> {
    let raw = std::env::var("CONNECTOR_MASTER_KEY")
        .unwrap_or_else(|_| "nextflow_aes256_master_key_dev_01".to_string());
    let mut key_bytes = [0u8; 32];
    let src = raw.as_bytes();
    let len = src.len().min(32);
    key_bytes[..len].copy_from_slice(&src[..len]);
    *Key::<Aes256Gcm>::from_slice(&key_bytes)
}

pub fn encrypt_credentials(plaintext: &str) -> Result<String, String> {
    let key = get_master_key();
    let cipher = Aes256Gcm::new(&key);
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encrypt error: {}", e))?;
    Ok(format!("{}.{}", BASE64.encode(nonce_bytes), BASE64.encode(ciphertext)))
}

pub fn _decrypt_credentials(encrypted: &str) -> Result<String, String> {
    let parts: Vec<&str> = encrypted.splitn(2, '.').collect();
    if parts.len() != 2 { return Err("Invalid encrypted format".to_string()); }
    let nonce_bytes = BASE64.decode(parts[0]).map_err(|e| format!("Nonce: {}", e))?;
    let ciphertext = BASE64.decode(parts[1]).map_err(|e| format!("Cipher: {}", e))?;
    let key = get_master_key();
    let cipher = Aes256Gcm::new(&key);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let plaintext = cipher.decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decrypt error: {}", e))?;
    String::from_utf8(plaintext).map_err(|e| format!("UTF-8: {}", e))
}

#[derive(Debug, Deserialize)]
pub struct CreateConnectorRequest {
    pub connector_name: String,
    pub credentials: String,
    pub settings: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConnectorRequest {
    pub status: Option<String>,
    pub credentials: Option<String>,
    pub settings: Option<serde_json::Value>,
}

// GET /api/v1/connectors/configs
pub async fn list_connectors(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(
        "SELECT id, connector_name, status, settings, last_run_at, created_at FROM nf_core.connector_configurations WHERE tenant_id = $1 ORDER BY created_at DESC"
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[Connector] List error: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Loi may chu." } }))).into_response()
    })?;

    let connectors: Vec<serde_json::Value> = rows.iter().map(|row| {
        json!({
            "id": row.get::<Uuid, _>("id"),
            "connector_name": row.get::<String, _>("connector_name"),
            "status": row.get::<String, _>("status"),
            "settings": row.get::<serde_json::Value, _>("settings"),
            "last_run_at": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("last_run_at"),
            "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
        })
    }).collect();

    Ok(Json(json!({ "connectors": connectors })))
}

// POST /api/v1/connectors/configs
pub async fn create_connector(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateConnectorRequest>,
) -> Result<impl IntoResponse, Response> {
    if payload.connector_name.trim().is_empty() {
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(json!({ "error": { "code": "VALIDATION_FAILED", "message": "connector_name required." } }))).into_response());
    }
    let encrypted = encrypt_credentials(&payload.credentials).map_err(|e| {
        eprintln!("[Connector] Encrypt error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Loi ma hoa credentials." } }))).into_response()
    })?;
    let settings = payload.settings.unwrap_or(json!({}));
    let row = sqlx::query(
        "INSERT INTO nf_core.connector_configurations (tenant_id, connector_name, encrypted_credentials, settings, status) VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id, connector_name, status, created_at"
    )
    .bind(tenant.tenant_id)
    .bind(&payload.connector_name)
    .bind(&encrypted)
    .bind(&settings)
    .fetch_one(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[Connector] Insert error: {}", err);
        (StatusCode::UNPROCESSABLE_ENTITY, Json(json!({ "error": { "code": "CONFLICT", "message": "Connector da ton tai hoac loi." } }))).into_response()
    })?;
    Ok((StatusCode::CREATED, Json(json!({
        "id": row.get::<Uuid, _>("id"),
        "connector_name": row.get::<String, _>("connector_name"),
        "status": row.get::<String, _>("status"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
        "message": "Credentials duoc ma hoa AES-256-GCM."
    }))))
}

// PATCH /api/v1/connectors/configs/:id
pub async fn update_connector(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateConnectorRequest>,
) -> Result<impl IntoResponse, Response> {
    let conn_opt = sqlx::query("SELECT id FROM nf_core.connector_configurations WHERE id = $1 AND tenant_id = $2")
        .bind(id).bind(tenant.tenant_id).fetch_optional(&state.pool).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Loi." } }))).into_response())?;
    if conn_opt.is_none() {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": { "code": "NOT_FOUND", "message": "Khong tim thay." } }))).into_response());
    }
    let new_status = payload.status.unwrap_or_else(|| "ACTIVE".to_string());
    let row = sqlx::query(
        "UPDATE nf_core.connector_configurations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING id, connector_name, status, updated_at"
    )
    .bind(&new_status).bind(id).bind(tenant.tenant_id)
    .fetch_one(&state.pool).await
    .map_err(|err| {
        eprintln!("[Connector] Update error: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Loi cap nhat." } }))).into_response()
    })?;
    Ok(Json(json!({
        "id": row.get::<Uuid, _>("id"),
        "connector_name": row.get::<String, _>("connector_name"),
        "status": row.get::<String, _>("status"),
        "updated_at": row.get::<chrono::DateTime<chrono::Utc>, _>("updated_at")
    })))
}

// DELETE /api/v1/connectors/configs/:id
pub async fn delete_connector(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, Response> {
    let result = sqlx::query("DELETE FROM nf_core.connector_configurations WHERE id = $1 AND tenant_id = $2")
        .bind(id).bind(tenant.tenant_id).execute(&state.pool).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Loi." } }))).into_response())?;
    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": { "code": "NOT_FOUND", "message": "Khong tim thay." } }))).into_response());
    }
    Ok(Json(json!({ "deleted": true, "id": id })))
}
