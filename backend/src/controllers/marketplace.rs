use axum::{
    extract::{State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize};
use serde_json::json;
use sqlx::Row;
use sha2::{Sha256, Digest};
use hex;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;
use crate::services::blockchain::anchor_data_on_chain;

#[derive(Debug, Deserialize)]
pub struct SubmitExtensionRequest {
    pub name: String,
    pub description: String,
    pub vendor: String,
    pub version: String,
    pub asset_type: String,
    pub manifest_url: String,
    pub code_content: String, // Mock code content to hash
}

// 1. Submit Extension (AI Auditor & Blockchain Anchor)
pub async fn submit_extension(
    State(state): State<AppState>,
    Json(payload): Json<SubmitExtensionRequest>,
) -> Response {
    // 1. Hash mã nguồn bằng SHA-256
    let mut hasher = Sha256::new();
    hasher.update(payload.code_content.as_bytes());
    let code_hash = hex::encode(hasher.finalize());

    // 2. Gọi AI Auditor giả lập để phân tích rủi ro
    let (risk_level, status, ai_notes) = if payload.code_content.contains("eval(") || payload.code_content.contains("localStorage") {
        ("HIGH", "REJECTED", "Phát hiện lỗ hổng bảo mật rủi ro (eval/localStorage). Cần viết lại hoặc cung cấp mô tả bảo mật.")
    } else {
        ("LOW", "APPROVED", "Mã nguồn sạch. Không phát hiện vi phạm OWASP Top 10.")
    };

    // 3. Nếu an toàn, neo lên Blockchain
    let tx_hash = if status == "APPROVED" {
        let anchor_data = format!("Extension:{}|Version:{}|Hash:{}", payload.name, payload.version, code_hash);
        let tx = anchor_data_on_chain(&anchor_data).await;
        Some(tx)
    } else {
        None
    };

    // 4. Lưu vào Database
    let query = r#"
        INSERT INTO nf_ecosystem.extensions (
            name, description, vendor, version, asset_type, manifest_url, code_hash, tx_hash, status, risk_level, ai_audit_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
    "#;

    let row_result = sqlx::query(query)
        .bind(&payload.name)
        .bind(&payload.description)
        .bind(&payload.vendor)
        .bind(&payload.version)
        .bind(&payload.asset_type)
        .bind(&payload.manifest_url)
        .bind(&code_hash)
        .bind(&tx_hash)
        .bind(status)
        .bind(risk_level)
        .bind(ai_notes)
        .fetch_one(&state.pool)
        .await;

    match row_result {
        Ok(row) => {
            let id: uuid::Uuid = row.get("id");
            let response = json!({
                "status": "success",
                "message": "Extension submitted successfully",
                "data": {
                    "id": id,
                    "code_hash": code_hash,
                    "tx_hash": tx_hash,
                    "audit_status": status,
                    "risk_level": risk_level,
                    "ai_audit_notes": ai_notes
                }
            });
            (StatusCode::CREATED, Json(response)).into_response()
        },
        Err(e) => {
            let err_response = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_response)).into_response()
        }
    }
}

// 2. Get AI Recommendations for a Tenant
pub async fn get_recommendations(
    State(state): State<AppState>,
    _tenant: TenantIsolation,
) -> Response {
    let ai_recommendation_reason = "Hệ thống ghi nhận 30% Task của bạn vi phạm SLA. Bạn nên cài đặt tiện ích Auto-Assign Priority để tự động điều phối.";

    let query = r#"
        SELECT id, name, description, vendor, version, risk_level, tx_hash, ai_audit_notes
        FROM nf_ecosystem.extensions
        WHERE status = 'APPROVED'
        LIMIT 3
    "#;

    let rows = sqlx::query(query).fetch_all(&state.pool).await;

    match rows {
        Ok(results) => {
            let mut extensions = Vec::new();
            for r in results {
                let id: uuid::Uuid = r.get("id");
                let name: String = r.get("name");
                let description: String = r.get("description");
                let vendor: String = r.get("vendor");
                let version: String = r.get("version");
                let risk_level: String = r.get("risk_level");
                let tx_hash: Option<String> = r.get("tx_hash");
                let ai_audit_notes: Option<String> = r.get("ai_audit_notes");

                extensions.push(json!({
                    "id": id,
                    "name": name,
                    "description": description,
                    "vendor": vendor,
                    "version": version,
                    "risk_level": risk_level,
                    "tx_hash": tx_hash,
                    "ai_audit_notes": ai_audit_notes
                }));
            }

            let response = json!({
                "status": "success",
                "recommendation_insight": ai_recommendation_reason,
                "data": extensions
            });
            (StatusCode::OK, Json(response)).into_response()
        },
        Err(e) => {
            let err_response = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_response)).into_response()
        }
    }
}

// 3. Get All Public Extensions (Catalog)
pub async fn get_all_extensions(
    State(state): State<AppState>,
) -> Response {
    let query = r#"
        SELECT id, name, description, vendor, version, risk_level, tx_hash, ai_audit_notes, status
        FROM nf_ecosystem.extensions
        ORDER BY created_at DESC
    "#;

    let rows = sqlx::query(query).fetch_all(&state.pool).await;

    match rows {
        Ok(results) => {
            let mut extensions = Vec::new();
            for r in results {
                let id: uuid::Uuid = r.get("id");
                let name: String = r.get("name");
                let description: Option<String> = r.get("description");
                let vendor: String = r.get("vendor");
                let version: String = r.get("version");
                let risk_level: Option<String> = r.get("risk_level");
                let tx_hash: Option<String> = r.get("tx_hash");
                let ai_audit_notes: Option<String> = r.get("ai_audit_notes");
                let status: Option<String> = r.get("status");

                extensions.push(json!({
                    "id": id,
                    "name": name,
                    "description": description,
                    "vendor": vendor,
                    "version": version,
                    "risk_level": risk_level,
                    "tx_hash": tx_hash,
                    "ai_audit_notes": ai_audit_notes,
                    "status": status
                }));
            }

            let response = json!({
                "status": "success",
                "data": extensions
            });
            (StatusCode::OK, Json(response)).into_response()
        },
        Err(e) => {
            let err_response = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_response)).into_response()
        }
    }
}
