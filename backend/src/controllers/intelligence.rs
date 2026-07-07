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
    Json(_payload): Json<AskAssistantRequest>,
) -> Response {
    // 1. Giả lập quá trình RAG: Vector Search trong Database để tìm SOP liên quan
    let query = r#"
        SELECT id, title, content, content_hash, tx_hash 
        FROM nf_intelligence.knowledge_base 
        WHERE tenant_id = $1 AND is_active = true
        LIMIT 1
    "#;

    let row = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await;

    match row {
        Ok(Some(r)) => {
            let title: String = r.get("title");
            let content: String = r.get("content");
            let tx_hash: Option<String> = r.get("tx_hash");

            // Giả lập AI sinh câu trả lời từ content
            let ai_answer = format!("Theo tài liệu '{}': {}", title, content);

            let response = json!({
                "status": "success",
                "data": {
                    "answer": ai_answer,
                    "source": title,
                    "is_blockchain_verified": tx_hash.is_some(),
                    "verification_tx_hash": tx_hash
                }
            });
            (StatusCode::OK, Json(response)).into_response()
        },
        Ok(None) => {
            let response = json!({
                "status": "success",
                "data": {
                    "answer": "Xin lỗi, tôi không tìm thấy tài liệu quy trình nào liên quan đến câu hỏi của bạn.",
                    "is_blockchain_verified": false
                }
            });
            (StatusCode::OK, Json(response)).into_response()
        },
        Err(e) => {
            let err_response = json!({ "status": "error", "message": e.to_string() });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(err_response)).into_response()
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
