use axum::{
    extract::State,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use reqwest::StatusCode;
use serde_json::json;
use crate::AppState;
use std::sync::Arc;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/ai-insight", get(get_ai_insight))
}

pub async fn get_ai_insight(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    // 1. Get real metrics from DB
    let row = match sqlx::query(
        r#"
        SELECT 
            (SELECT COUNT(*) FROM nf_analytics.change_events WHERE processed = false) as pending_cdc_events,
            (SELECT COALESCE(SUM(total_tasks), 0) FROM nf_analytics.daily_performance_reports) as total_tasks,
            (SELECT COALESCE(SUM(sla_violations), 0) FROM nf_analytics.daily_performance_reports) as total_sla_violations
        "#
    ).fetch_one(&state.pool).await {
        Ok(r) => r,
        Err(e) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": format!("DB Error: {}", e) }))
            ).into_response();
        }
    };

    use sqlx::Row;
    let pending_cdc: i64 = row.try_get("pending_cdc_events").unwrap_or(0);
    let total_tasks: i64 = row.try_get("total_tasks").unwrap_or(0);
    let sla_violations: i64 = row.try_get("total_sla_violations").unwrap_or(0);

    // 2. Prepare the AI prompt based on metrics
    let prompt = format!(
        "System Metrics: Pending CDC Events={}, Total Tasks={}, SLA Violations={}. Analyze the health and provide a brief actionable insight in Vietnamese.",
        pending_cdc, total_tasks, sla_violations
    );

    // 3. Call AI Service
    let client = reqwest::Client::new();
    let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string());
    let predict_url = format!("{}/predict", ai_service_url);
    let res = client.post(&predict_url)
        .json(&json!({
            "model": "@cf/meta/llama-3.1-8b-instruct",
            "prompt": prompt
        }))
        .send()
        .await;

    let ai_report = match res {
        Ok(resp) if resp.status().is_success() => {
            let json_resp: serde_json::Value = resp.json().await.unwrap_or_default();
            json_resp["response"].as_str().unwrap_or("Không thể trích xuất phản hồi từ AI").to_string()
        },
        _ => {
            // Fallback heuristics
            let mut report = String::from("Hệ thống phân tích AI tạm thời không khả dụng. ");
            if pending_cdc > 100 {
                report.push_str("Cảnh báo: Lượng dữ liệu chờ đồng bộ (CDC) đang tăng cao. Vui lòng kiểm tra tiến trình ETL Runner. ");
            } else {
                report.push_str("Hệ thống đồng bộ dữ liệu hoạt động bình thường. ");
            }
            if sla_violations > 0 {
                report.push_str(&format!("Phát hiện {} vi phạm SLA, cần phân bổ lại nhân sự.", sla_violations));
            } else {
                report.push_str("Không phát hiện vi phạm SLA.");
            }
            report
        }
    };

    (
        axum::http::StatusCode::OK,
        Json(serde_json::json!({
            "metrics": {
                "pending_cdc_events": pending_cdc,
                "total_tasks": total_tasks,
                "sla_violations": sla_violations
            },
            "insight": ai_report
        }))
    ).into_response()
}
