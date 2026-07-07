use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

fn get_ai_service_url() -> String {
    std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string())
}

// --------------------------------------------------------------------------
// Request schemas (mirror của Python Pydantic models)
// --------------------------------------------------------------------------
#[derive(Debug, Deserialize, Serialize)]
pub struct SlaRiskRequest {
    pub work_item_id: String,
    pub age_minutes: f64,
    pub time_to_sla_minutes: f64,
    pub priority: String,
    #[serde(default = "default_general")]
    pub category: String,
    #[serde(default)]
    pub queue_load: i32,
    #[serde(default)]
    pub historical_breach_rate: f64,
    #[serde(default)]
    pub assignee_load: i32,
    #[serde(default)]
    pub recent_reopen_count: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct OperatorProfile {
    pub user_id: String,
    pub full_name: String,
    pub role: String,
    pub current_load: i32,
    pub tasks_completed: i32,
    pub on_time_completion_rate: f64,
    pub avg_handling_time_secs: f64,
    #[serde(default)]
    pub specialty_categories: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoutingRequest {
    pub queue_id: String,
    pub task_category: String,
    pub task_priority: String,
    pub operators: Vec<OperatorProfile>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RagQueryRequest {
    pub question: String,
    #[serde(default = "default_top_k")]
    pub top_k: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BatchSlaRiskRequest {
    pub items: Vec<SlaRiskRequest>,
}

fn default_general() -> String { "GENERAL".to_string() }
fn default_top_k() -> i32 { 5 }

// --------------------------------------------------------------------------
// Helper: proxy request sang AI service
// --------------------------------------------------------------------------
async fn proxy_to_ai(
    endpoint: &str,
    body: Value,
    tenant_id: uuid::Uuid,
) -> Result<Value, Response> {
    let url = format!("{}/{}", get_ai_service_url(), endpoint);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR,
             Json(json!({"error": {"code": "AI_CLIENT_BUILD_FAILED", "message": e.to_string()}}))).into_response()
        })?;

    let response = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("[AI Proxy] Service unreachable at {}: {}", url, e);
            (StatusCode::SERVICE_UNAVAILABLE, Json(json!({
                "error": {
                    "code": "AI_SERVICE_UNAVAILABLE",
                    "message": "AI service (port 8001) không khả dụng. Hãy chạy: cd ai-service && python main.py",
                    "detail": e.to_string()
                }
            }))).into_response()
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let err_body = response.text().await.unwrap_or_default();
        eprintln!("[AI Proxy] AI service returned {}: {}", status, err_body);
        return Err((
            StatusCode::BAD_GATEWAY,
            Json(json!({"error": {"code": "AI_SERVICE_ERROR", "message": err_body}}))
        ).into_response());
    }

    let result: Value = response.json().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR,
         Json(json!({"error": {"code": "AI_PARSE_ERROR", "message": e.to_string()}}))).into_response()
    })?;

    // Governance log (Doc 123 §2.6 — observability by design)
    println!("[AI Proxy] tenant={} endpoint={} → ok", tenant_id, endpoint);

    Ok(result)
}

// --------------------------------------------------------------------------
// Endpoint 1: POST /api/v1/ai/sla-risk
// --------------------------------------------------------------------------
pub async fn ai_sla_risk(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<SlaRiskRequest>,
) -> Result<impl IntoResponse, Response> {
    let body = serde_json::to_value(&req).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let result = proxy_to_ai("sla-risk", body, tenant.tenant_id).await?;
    Ok(Json(result))
}

// --------------------------------------------------------------------------
// Endpoint 2: POST /api/v1/ai/sla-risk/batch
// --------------------------------------------------------------------------
pub async fn ai_sla_risk_batch(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<BatchSlaRiskRequest>,
) -> Result<impl IntoResponse, Response> {
    let body = serde_json::to_value(&req).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let result = proxy_to_ai("sla-risk/batch", body, tenant.tenant_id).await?;
    Ok(Json(result))
}

// --------------------------------------------------------------------------
// Endpoint 3: POST /api/v1/ai/routing-recommend
// --------------------------------------------------------------------------
pub async fn ai_routing_recommend(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<RoutingRequest>,
) -> Result<impl IntoResponse, Response> {
    // Nếu operators trống → query từ DB để lấy danh sách operator trong queue
    let operators = if req.operators.is_empty() {
        fetch_queue_operators(&state, tenant.tenant_id, &req.queue_id).await
            .unwrap_or_default()
    } else {
        req.operators
    };

    let enriched_req = RoutingRequest {
        queue_id: req.queue_id.clone(),
        task_category: req.task_category.clone(),
        task_priority: req.task_priority.clone(),
        operators,
    };

    let body = serde_json::to_value(&enriched_req).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let result = proxy_to_ai("routing-recommend", body, tenant.tenant_id).await?;
    Ok(Json(result))
}

/// Lấy danh sách operators trong queue từ nf_analytics
async fn fetch_queue_operators(
    state: &AppState,
    tenant_id: uuid::Uuid,
    _queue_id: &str,
) -> Option<Vec<OperatorProfile>> {
    use sqlx::Row;
    let rows = sqlx::query(r#"
        SELECT
            u.user_id::TEXT,
            u.full_name,
            u.role,
            COALESCE(p.total_tasks_handled, 0)::INT      AS current_load,
            COALESCE(p.tasks_completed, 0)::INT           AS tasks_completed,
            COALESCE(p.on_time_completion_rate, 80.0)     AS on_time_completion_rate,
            COALESCE(p.avg_handling_time_seconds, 1800.0) AS avg_handling_time_secs
        FROM nf_analytics.dim_user u
        LEFT JOIN nf_analytics.vw_operator_performance_summary p
            ON u.user_id = p.user_id AND u.tenant_id = p.tenant_id
        WHERE u.tenant_id = $1
          AND u.is_active = TRUE
        LIMIT 20
    "#)
    .bind(tenant_id)
    .fetch_all(&state.pool)
    .await
    .ok()?;

    Some(rows.iter().map(|r| OperatorProfile {
        user_id:                r.get::<String, _>("user_id"),
        full_name:              r.get::<String, _>("full_name"),
        role:                   r.get::<String, _>("role"),
        current_load:           r.get::<i32, _>("current_load"),
        tasks_completed:        r.get::<i32, _>("tasks_completed"),
        on_time_completion_rate:r.get::<f64, _>("on_time_completion_rate"),
        avg_handling_time_secs: r.get::<f64, _>("avg_handling_time_secs"),
        specialty_categories:   vec![],
    }).collect())
}

// --------------------------------------------------------------------------
// Endpoint 4: POST /api/v1/ai/rag-query
// --------------------------------------------------------------------------
pub async fn ai_rag_query(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<RagQueryRequest>,
) -> Result<impl IntoResponse, Response> {
    let body = json!({
        "question":  req.question,
        "top_k":     req.top_k,
        "tenant_id": tenant.tenant_id.to_string(),
    });

    let result = proxy_to_ai("rag-query", body, tenant.tenant_id).await?;
    Ok(Json(result))
}

// --------------------------------------------------------------------------
// Endpoint 5: GET /api/v1/ai/health
// --------------------------------------------------------------------------
pub async fn ai_health_check() -> impl IntoResponse {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build();

    match client {
        Ok(c) => match c.get(&format!("{}/health", get_ai_service_url())).send().await {
            Ok(resp) if resp.status().is_success() => {
                let body: Value = resp.json().await.unwrap_or_default();
                Json(json!({"ai_service": "UP", "detail": body}))
            }
            Ok(resp) => Json(json!({"ai_service": "DEGRADED", "status": resp.status().as_u16()})),
            Err(e) => Json(json!({"ai_service": "DOWN", "reason": e.to_string()})),
        },
        Err(e) => Json(json!({"ai_service": "DOWN", "reason": e.to_string()})),
    }
}
