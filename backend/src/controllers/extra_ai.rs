use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::{json, Value};
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

fn get_ai_service_url() -> String {
    std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string())
}

async fn proxy_call(endpoint: &str, body: Value, tenant_id: uuid::Uuid) -> Result<Value, Response> {
    let url = format!("{}/{}", get_ai_service_url(), endpoint);
    let client = reqwest::Client::new();
    
    let response = client.post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            (StatusCode::SERVICE_UNAVAILABLE, Json(json!({
                "error": {
                    "code": "AI_SERVICE_UNAVAILABLE",
                    "message": "AI service is currently offline.",
                    "detail": e.to_string()
                }
            }))).into_response()
        })?;

    if !response.status().is_success() {
        let err_text = response.text().await.unwrap_or_default();
        return Err((StatusCode::BAD_GATEWAY, Json(json!({ "error": err_text }))).into_response());
    }

    let result: Value = response.json().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    println!("[Extra AI Proxy] tenant={} endpoint={} → ok", tenant_id, endpoint);
    Ok(result)
}

// 1. POST /api/v1/ai/finance/cashflow-forecast
pub async fn ai_cashflow_forecast(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("finance/cashflow-forecast", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 2. POST /api/v1/ai/finance/expense-categorize
pub async fn ai_expense_categorize(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("finance/expense-categorize", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 3. POST /api/v1/ai/finance/debt-collection
pub async fn ai_debt_collection(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("finance/debt-collection", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 4. POST /api/v1/ai/hr/payroll-calculate
pub async fn ai_payroll_calculate(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("hr/payroll-calculate", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 5. POST /api/v1/ai/hr/burnout-detect
pub async fn ai_burnout_detect(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("hr/burnout-detect", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 6. POST /api/v1/ai/inventory/demand-plan
pub async fn ai_demand_plan(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("inventory/demand-plan", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 7. POST /api/v1/ai/inventory/supplier-score
pub async fn ai_supplier_score(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("inventory/supplier-score", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 8. POST /api/v1/ai/crm/churn-predict
pub async fn ai_churn_predict(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("crm/churn-predict", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 9. POST /api/v1/ai/crm/upsell-recommend
pub async fn ai_upsell_recommend(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("crm/upsell-recommend", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 10. POST /api/v1/ai/booking/smart-schedule
pub async fn ai_smart_schedule(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("booking/smart-schedule", req, tenant.tenant_id).await?;
    Ok(Json(res))
}

// 11. POST /api/v1/ai/feedback/sentiment-analyze
pub async fn ai_sentiment_analyze(
    State(_state): State<AppState>,
    tenant: TenantIsolation,
    Json(req): Json<Value>,
) -> Result<impl IntoResponse, Response> {
    let res = proxy_call("feedback/sentiment-analyze", req, tenant.tenant_id).await?;
    Ok(Json(res))
}
