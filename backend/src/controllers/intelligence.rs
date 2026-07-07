use axum::{
    extract::{State},
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
use crate::services::blockchain::{anchor_data_on_chain, trigger_automated_payout};
use sha2::{Sha256, Digest};

#[derive(Debug, Deserialize)]
pub struct AskAssistantRequest {
    pub question: String,
}

#[derive(Debug, Deserialize)]
pub struct AutoTriageRequest {
    pub task_id: Uuid,
    pub title: String,
    pub description: Option<String>,
}

// 1. AI Assistant (RAG Chatbot với Blockchain Verification)
pub async fn ask_assistant(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<AskAssistantRequest>,
) -> Response {
    let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string());
    let url = format!("{}/rag-query", ai_service_url);

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build() {
            Ok(c) => c,
            Err(e) => {
                let err_res = json!({ "status": "error", "message": format!("Failed to build HTTP client: {}", e) });
                return (StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response();
            }
        };

    let body = json!({
        "question": payload.question,
        "top_k": 3,
        "tenant_id": tenant.tenant_id.to_string(),
    });

    let ai_res = client.post(&url).json(&body).send().await;

    match ai_res {
        Ok(resp) => {
            if resp.status().is_success() {
                let val: serde_json::Value = match resp.json().await {
                    Ok(v) => v,
                    Err(e) => {
                        let err_res = json!({ "status": "error", "message": format!("Failed to parse RAG JSON response: {}", e) });
                        return (StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response();
                    }
                };

                let ai_answer = val.get("answer").and_then(|a| a.as_str()).unwrap_or("Không thể tạo câu trả lời.");
                let warning = val.get("warning").and_then(|w| w.as_str());

                // Find citations
                let mut source_title = "Tài liệu SOP nội bộ".to_string();
                let mut tx_hash: Option<String> = None;

                if let Some(citations) = val.get("citations").and_then(|c| c.as_array()) {
                    if !citations.is_empty() {
                        if let Some(first_citation) = citations.get(0) {
                            if let Some(src_file) = first_citation.get("source_file").and_then(|sf| sf.as_str()) {
                                source_title = src_file.to_string();

                                // Query DB for real tx_hash of this source title
                                let db_query = r#"
                                    SELECT tx_hash 
                                    FROM nf_intelligence.knowledge_base 
                                    WHERE tenant_id = $1 AND title = $2 AND is_active = true
                                    LIMIT 1
                                "#;
                                if let Ok(Some(row)) = sqlx::query(db_query)
                                    .bind(tenant.tenant_id)
                                    .bind(&source_title)
                                    .fetch_optional(&state.pool)
                                    .await {
                                        tx_hash = row.get("tx_hash");
                                    }
                            }
                        }
                    }
                }

                let final_answer = if let Some(warn) = warning {
                    format!("{}\n\n⚠️ *Cảnh báo:* {}", ai_answer, warn)
                } else {
                    ai_answer.to_string()
                };

                let response = json!({
                    "status": "success",
                    "data": {
                        "answer": final_answer,
                        "source": source_title,
                        "is_blockchain_verified": tx_hash.is_some(),
                        "verification_tx_hash": tx_hash
                    }
                });
                (StatusCode::OK, Json(response)).into_response()
            } else {
                let status_err = resp.text().await.unwrap_or_default();
                let err_res = json!({ "status": "error", "message": format!("AI service error: {}", status_err) });
                (StatusCode::BAD_GATEWAY, Json(err_res)).into_response()
            }
        },
        Err(e) => {
            let err_res = json!({ "status": "error", "message": format!("Failed to connect to AI service: {}", e) });
            (StatusCode::BAD_GATEWAY, Json(err_res)).into_response()
        }
    }
}

// 2. Auto-Triage & Auto-Payout Execution
pub async fn auto_triage(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<AutoTriageRequest>,
) -> Response {
    // Giả lập AI phân tích text để quyết định Priority và Tự động hoàn thành/thanh toán
    let (priority, action, rationale, confidence) = if payload.title.to_lowercase().contains("khẩn cấp") {
        ("HIGH", "ESCALATE", "Phát hiện từ khóa 'khẩn cấp', cần xử lý ngay", 0.95)
    } else if payload.title.to_lowercase().contains("thanh toán") {
        ("MEDIUM", "AUTO_PAYOUT", "Điều kiện hợp đồng đã thỏa mãn, tự động kích hoạt thanh toán", 0.92)
    } else {
        ("LOW", "ASSIGN", "Task thông thường, đưa vào hàng đợi", 0.85)
    };

    // 1. Nếu là AUTO_PAYOUT, gọi Smart Contract kích hoạt chuyển tiền ngay lập tức
    let mut payout_tx = None;
    if action == "AUTO_PAYOUT" {
        payout_tx = Some(trigger_automated_payout(payload.task_id, "0xReceiverWallet123", 500.0).await);
    }

    // 2. Neo dữ liệu suy luận (Inference Log) lên Blockchain để Audit
    let anchor_payload = format!(
        "TaskID:{}|Action:{}|Rationale:{}|Confidence:{}", 
        payload.task_id, action, rationale, confidence
    );
    let audit_tx_hash = anchor_data_on_chain(&anchor_payload).await;

    // 3. Lưu lịch sử vào CSDL
    let log_query = r#"
        INSERT INTO nf_intelligence.ai_decisions_log (
            tenant_id, task_id, decision_type, rationale, confidence_score, input_snapshot, tx_hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    "#;

    let input_snapshot = json!({ "title": payload.title, "description": payload.description });

    let _ = sqlx::query(log_query)
        .bind(tenant.tenant_id)
        .bind(payload.task_id)
        .bind(action)
        .bind(rationale)
        .bind(confidence)
        .bind(&input_snapshot)
        .bind(&audit_tx_hash)
        .execute(&state.pool)
        .await;

    let response = json!({
        "status": "success",
        "message": "AI Triage completed",
        "data": {
            "task_id": payload.task_id,
            "predicted_priority": priority,
            "automated_action": action,
            "rationale": rationale,
            "confidence_score": confidence,
            "audit_tx_hash": audit_tx_hash,
            "payout_tx_hash": payout_tx
        }
    });

    (StatusCode::OK, Json(response)).into_response()
}

// --------------------------------------------------------------------------
// SOP Knowledge Base Management & AI Reindexing
// --------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct CreateSopRequest {
    pub title: String,
    pub content: String,
}

async fn trigger_ai_reindex(
    state: &AppState,
    tenant_id: Uuid,
) -> Result<(), String> {
    // 1. Fetch all active documents for this tenant from DB
    let rows = sqlx::query(r#"
        SELECT id, title, content 
        FROM nf_intelligence.knowledge_base 
        WHERE tenant_id = $1 AND is_active = true
    "#)
    .bind(tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let documents: Vec<serde_json::Value> = rows.into_iter().map(|r| {
        json!({
            "id": r.get::<Uuid, _>("id").to_string(),
            "title": r.get::<String, _>("title"),
            "content": r.get::<String, _>("content"),
        })
    }).collect();

    // 2. Call /reindex on python service
    let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string());
    let url = format!("{}/reindex", ai_service_url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let body = json!({
        "tenant_id": tenant_id.to_string(),
        "documents": documents,
    });

    let resp = client.post(&url).json(&body).send().await;
    match resp {
        Ok(r) => {
            if r.status().is_success() {
                Ok(())
            } else {
                Err(format!("AI service reindex returned status {}", r.status()))
            }
        }
        Err(e) => Err(format!("Failed to connect to AI service for reindexing: {}", e))
    }
}

// GET /api/v1/intelligence/knowledge-base
pub async fn list_knowledge_base(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let rows_res = sqlx::query(r#"
        SELECT id, title, content, content_hash, tx_hash, created_at 
        FROM nf_intelligence.knowledge_base 
        WHERE tenant_id = $1 AND is_active = true
        ORDER BY created_at DESC
    "#)
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await;

    match rows_res {
        Ok(rows) => {
            let docs: Vec<serde_json::Value> = rows.into_iter().map(|r| {
                json!({
                    "id": r.get::<Uuid, _>("id"),
                    "title": r.get::<String, _>("title"),
                    "content": r.get::<String, _>("content"),
                    "content_hash": r.get::<String, _>("content_hash"),
                    "tx_hash": r.get::<Option<String>, _>("tx_hash"),
                    "created_at": r.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
                })
            }).collect();

            let response = json!({ "status": "success", "data": docs });
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let err_res = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response()
        }
    }
}

// POST /api/v1/intelligence/knowledge-base
pub async fn create_knowledge_base(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateSopRequest>,
) -> Response {
    if payload.title.trim().is_empty() || payload.content.trim().is_empty() {
        let err_res = json!({ "status": "error", "message": "Tiêu đề và nội dung không được để trống." });
        return (StatusCode::BAD_REQUEST, Json(err_res)).into_response();
    }

    // 1. Calculate SHA-256 content hash
    let mut hasher = Sha256::new();
    hasher.update(payload.content.as_bytes());
    let content_hash = hex::encode(hasher.finalize());

    // 2. Anchor to Blockchain
    let tx_hash = anchor_data_on_chain(&content_hash).await;

    // 3. Save to database
    let db_res = sqlx::query(r#"
        INSERT INTO nf_intelligence.knowledge_base (tenant_id, title, content, content_hash, tx_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
    "#)
    .bind(tenant.tenant_id)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(&content_hash)
    .bind(&tx_hash)
    .fetch_one(&state.pool)
    .await;

    match db_res {
        Ok(row) => {
            let doc_id = row.get::<Uuid, _>("id");

            // 4. Trigger AI Service reindexing asynchronously in background so we don't block response
            let state_clone = state.clone();
            let tenant_id = tenant.tenant_id;
            tokio::spawn(async move {
                if let Err(e) = trigger_ai_reindex(&state_clone, tenant_id).await {
                    eprintln!("[KnowledgeBase] Error reindexing AI service: {}", e);
                }
            });

            let response = json!({
                "status": "success",
                "message": "Đã thêm quy trình và neo thông tin lên blockchain thành công.",
                "data": {
                    "id": doc_id,
                    "content_hash": content_hash,
                    "tx_hash": tx_hash
                }
            });
            (StatusCode::CREATED, Json(response)).into_response()
        }
        Err(e) => {
            let err_res = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response()
        }
    }
}

// DELETE /api/v1/intelligence/knowledge-base/:id
pub async fn delete_knowledge_base(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Response {
    let db_res = sqlx::query(r#"
        UPDATE nf_intelligence.knowledge_base 
        SET is_active = false, updated_at = NOW() 
        WHERE id = $1 AND tenant_id = $2
    "#)
    .bind(id)
    .bind(tenant.tenant_id)
    .execute(&state.pool)
    .await;

    match db_res {
        Ok(result) => {
            if result.rows_affected() == 0 {
                let err_res = json!({ "status": "error", "message": "Không tìm thấy quy trình hoặc không thuộc quyền quản lý." });
                return (StatusCode::NOT_FOUND, Json(err_res)).into_response();
            }

            // Trigger AI Service reindexing
            let state_clone = state.clone();
            let tenant_id = tenant.tenant_id;
            tokio::spawn(async move {
                if let Err(e) = trigger_ai_reindex(&state_clone, tenant_id).await {
                    eprintln!("[KnowledgeBase] Error reindexing AI service: {}", e);
                }
            });

            let response = json!({ "status": "success", "message": "Đã xóa quy trình thành công." });
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let err_res = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_res)).into_response()
        }
    }
}
