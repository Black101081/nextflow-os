use crate::AppState;
use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// DTOs
#[derive(Deserialize)]
pub struct StartChatRequest {
    pub tenant_id: Uuid,
    pub work_item_id: Option<Uuid>,
    pub customer_id: Option<String>,
}

#[derive(Serialize)]
pub struct ChatConversation {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub work_item_id: Option<Uuid>,
    pub customer_id: Option<String>,
    pub operator_id: Option<Uuid>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ChatMessage {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_type: String,
    pub sender_id: Option<String>,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct SendMessageRequest {
    pub sender_type: String,
    pub sender_id: Option<String>,
    pub content: String,
}

#[derive(Deserialize)]
pub struct AiProxyResponse {
    pub answer: String,
}

// Handlers
pub async fn start_chat(
    State(state): State<AppState>,
    Json(payload): Json<StartChatRequest>,
) -> impl IntoResponse {
    let pool = state.pool;
    let row = match sqlx::query(
        r#"
        INSERT INTO nf_core.chat_conversations (tenant_id, work_item_id, customer_id)
        VALUES ($1, $2, $3)
        RETURNING id, tenant_id, work_item_id, customer_id, operator_id, status, created_at, updated_at
        "#
    )
    .bind(payload.tenant_id)
    .bind(payload.work_item_id)
    .bind(payload.customer_id)
    .fetch_one(&pool)
    .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json::<serde_json::Value>(serde_json::json!({ "error": e.to_string() }))).into_response(),
    };

    use sqlx::Row;
    let conv = ChatConversation {
        id: row.try_get("id").unwrap_or_default(),
        tenant_id: row.try_get("tenant_id").unwrap_or_default(),
        work_item_id: row.try_get("work_item_id").ok(),
        customer_id: row.try_get("customer_id").ok(),
        operator_id: row.try_get("operator_id").ok(),
        status: row.try_get("status").unwrap_or_default(),
        created_at: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: row.try_get("updated_at").unwrap_or_else(|_| chrono::Utc::now()),
    };

    (StatusCode::CREATED, Json(conv)).into_response()
}

pub async fn get_messages(
    State(state): State<AppState>,
    Path(conversation_id): Path<Uuid>,
) -> impl IntoResponse {
    let rows = match sqlx::query(
        r#"
        SELECT id, conversation_id, sender_type, sender_id, content, created_at
        FROM nf_core.chat_messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        "#
    )
    .bind(conversation_id)
    .fetch_all(&state.pool)
    .await
    {
        Ok(r) => r,
        Err(e) => {
            let e: sqlx::Error = e;
            return (StatusCode::INTERNAL_SERVER_ERROR, Json::<serde_json::Value>(serde_json::json!({ "error": e.to_string() }))).into_response();
        }
    };

    let mut messages = Vec::new();
    for r in rows {
        use sqlx::Row;
        messages.push(ChatMessage {
            id: r.try_get::<Uuid, &str>("id").unwrap_or_default(),
            conversation_id: r.try_get::<Uuid, &str>("conversation_id").unwrap_or_default(),
            sender_type: r.try_get::<String, &str>("sender_type").unwrap_or_default(),
            sender_id: r.try_get::<Option<String>, &str>("sender_id").unwrap_or(None),
            content: r.try_get::<String, &str>("content").unwrap_or_default(),
            created_at: r.try_get::<DateTime<Utc>, &str>("created_at").unwrap_or_else(|_| chrono::Utc::now()),
        });
    }

    (StatusCode::OK, Json(messages)).into_response()
}

pub async fn send_message(
    State(state): State<AppState>,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<SendMessageRequest>,
) -> impl IntoResponse {
    let pool = state.pool;
    // 1. Insert message
    let msg_row = match sqlx::query(
        r#"
        INSERT INTO nf_core.chat_messages (conversation_id, sender_type, sender_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, conversation_id, sender_type, sender_id, content, created_at
        "#
    )
    .bind(conversation_id)
    .bind(&payload.sender_type)
    .bind(&payload.sender_id)
    .bind(&payload.content)
    .fetch_one(&pool)
    .await
    {
        Ok(r) => r,
        Err(e) => return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, axum::Json::<serde_json::Value>(serde_json::json!({ "error": e.to_string() }))).into_response(),
    };

    use sqlx::Row;
    let mut response_messages = vec![ChatMessage {
        id: msg_row.try_get("id").unwrap_or_default(),
        conversation_id: msg_row.try_get("conversation_id").unwrap_or_default(),
        sender_type: msg_row.try_get("sender_type").unwrap_or_default(),
        sender_id: msg_row.try_get("sender_id").ok(),
        content: msg_row.try_get("content").unwrap_or_default(),
        created_at: msg_row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
    }];

    // 2. AI Triage if CUSTOMER sends message
    if payload.sender_type == "CUSTOMER" {
        // Check if conversation has an operator
        let conv_row_opt = sqlx::query(
            r#"SELECT operator_id FROM nf_core.chat_conversations WHERE id = $1"#
        )
        .bind(conversation_id)
        .fetch_optional(&pool)
        .await
        .ok()
        .flatten();

        if let Some(conv_row) = conv_row_opt {
            let operator_id: Option<uuid::Uuid> = conv_row.try_get("operator_id").ok();
            if operator_id.is_none() {
                // Call AI Service
                let ai_payload = serde_json::json!({
                    "query": payload.content,
                    "tenant_id": "00000000-0000-0000-0000-000000000000" // Mock or get from conversation
                });

                let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string());
                let client = reqwest::Client::new();
                let ai_res = client.post(&format!("{}/api/v1/ai/triage", ai_service_url))
                    .json(&ai_payload)
                    .send()
                    .await;

                if let Ok(res) = ai_res {
                    if let Ok(ai_data) = res.json::<AiProxyResponse>().await {
                        // Insert AI message
                        if let Ok(ai_msg_row) = sqlx::query(
                            r#"
                            INSERT INTO nf_core.chat_messages (conversation_id, sender_type, sender_id, content)
                            VALUES ($1, $2, $3, $4)
                            RETURNING id, conversation_id, sender_type, sender_id, content, created_at
                            "#
                        )
                        .bind(conversation_id)
                        .bind("AI")
                        .bind("AI_ASSISTANT")
                        .bind(&ai_data.answer)
                        .fetch_one(&pool)
                        .await
                        {
                            response_messages.push(ChatMessage {
                                id: ai_msg_row.try_get("id").unwrap_or_default(),
                                conversation_id: ai_msg_row.try_get("conversation_id").unwrap_or_default(),
                                sender_type: ai_msg_row.try_get("sender_type").unwrap_or_default(),
                                sender_id: ai_msg_row.try_get("sender_id").ok(),
                                content: ai_msg_row.try_get("content").unwrap_or_default(),
                                created_at: ai_msg_row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
                            });
                        }
                    }
                } else {
                    // If AI service is down or endpoint /triage is not there, insert a fallback message
                    if let Ok(ai_msg_row) = sqlx::query(
                        r#"
                        INSERT INTO nf_core.chat_messages (conversation_id, sender_type, sender_id, content)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id, conversation_id, sender_type, sender_id, content, created_at
                        "#
                    )
                    .bind(conversation_id)
                    .bind("AI")
                    .bind("AI_ASSISTANT")
                    .bind("Hiện tại các chuyên viên đang bận. Yêu cầu của bạn đã được ghi nhận và chúng tôi sẽ phản hồi sớm nhất.")
                    .fetch_one(&pool)
                    .await
                    {
                        response_messages.push(ChatMessage {
                            id: ai_msg_row.try_get("id").unwrap_or_default(),
                            conversation_id: ai_msg_row.try_get("conversation_id").unwrap_or_default(),
                            sender_type: ai_msg_row.try_get("sender_type").unwrap_or_default(),
                            sender_id: ai_msg_row.try_get("sender_id").ok(),
                            content: ai_msg_row.try_get("content").unwrap_or_default(),
                            created_at: ai_msg_row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
                        });
                    }
                }
            }
        }
    }

    (StatusCode::CREATED, Json(response_messages)).into_response()
}

pub async fn list_open_conversations(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let pool = state.pool;
    let rows = match sqlx::query(
        r#"
        SELECT id, tenant_id, work_item_id, customer_id, operator_id, status, created_at, updated_at
        FROM nf_core.chat_conversations
        WHERE status = 'OPEN'
        ORDER BY updated_at DESC
        "#
    )
    .fetch_all(&pool)
    .await
    {
        Ok(r) => r,
        Err(e) => return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, axum::Json::<serde_json::Value>(serde_json::json!({ "error": e.to_string() }))).into_response(),
    };

    let mut convs = Vec::new();
    for r in rows {
        use sqlx::Row;
        convs.push(ChatConversation {
            id: r.try_get("id").unwrap_or_default(),
            tenant_id: r.try_get("tenant_id").unwrap_or_default(),
            work_item_id: r.try_get("work_item_id").ok(),
            customer_id: r.try_get("customer_id").ok(),
            operator_id: r.try_get("operator_id").ok(),
            status: r.try_get("status").unwrap_or_default(),
            created_at: r.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
            updated_at: r.try_get("updated_at").unwrap_or_else(|_| chrono::Utc::now()),
        });
    }

    (StatusCode::OK, Json(convs)).into_response()
}
