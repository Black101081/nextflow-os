use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::Row;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;
use sha2::{Sha256, Digest};
use hex;
use chrono::Utc;
use crate::services::blockchain::anchor_data_on_chain;

#[derive(Debug, Deserialize)]
pub struct DateRangeQuery {
    pub from_date: Option<String>,
    pub to_date:   Option<String>,
}

// ============================================================
// GET /api/v1/analytics/sla-compliance
// Tỉ lệ tuân thủ SLA theo ngày cho tenant hiện tại
// ============================================================
pub async fn get_sla_compliance(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Query(params): Query<DateRangeQuery>,
) -> Result<impl IntoResponse, Response> {
    let from_date = params.from_date.unwrap_or_else(|| "2000-01-01".to_string());
    let to_date   = params.to_date.unwrap_or_else(|| "2099-12-31".to_string());

    let rows = sqlx::query(r#"
        SELECT
            date_record::TEXT AS date_record,
            total_work_items,
            total_sla_violations,
            COALESCE(sla_compliance_percentage, 100.0)::FLOAT8 AS sla_compliance_percentage
        FROM nf_analytics.vw_tenant_sla_compliance_daily
        WHERE tenant_id = $1
          AND date_record BETWEEN $2::DATE AND $3::DATE
        ORDER BY date_record DESC
        LIMIT 90
    "#)
    .bind(tenant.tenant_id)
    .bind(&from_date)
    .bind(&to_date)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    let data: Vec<Value> = rows.iter().map(|r| json!({
        "date":                    r.get::<String, _>("date_record"),
        "total_work_items":        r.get::<i64, _>("total_work_items"),
        "total_sla_violations":    r.get::<i64, _>("total_sla_violations"),
        "sla_compliance_percent":  r.get::<f64, _>("sla_compliance_percentage"),
    })).collect();

    Ok(Json(json!({
        "tenant_id": tenant.tenant_id,
        "data":      data,
        "count":     data.len()
    })))
}

// ============================================================
// GET /api/v1/analytics/queue-throughput
// Số lượng task hoàn thành và avg handling time theo giờ
// ============================================================
pub async fn get_queue_throughput(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(r#"
        SELECT
            queue_id,
            queue_name,
            completed_hour::TEXT AS completed_hour,
            items_completed_count,
            COALESCE(avg_handling_time_seconds, 0.0)::FLOAT8 AS avg_handling_time_seconds
        FROM nf_analytics.vw_queue_throughput_hourly
        WHERE tenant_id = $1
          AND completed_hour >= NOW() - INTERVAL '7 days'
        ORDER BY completed_hour DESC
        LIMIT 200
    "#)
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    let data: Vec<Value> = rows.iter().map(|r| json!({
        "queue_id":                r.get::<String, _>("queue_id"),
        "queue_name":              r.get::<String, _>("queue_name"),
        "hour":                    r.get::<String, _>("completed_hour"),
        "items_completed":         r.get::<i64, _>("items_completed_count"),
        "avg_handling_time_secs":  r.get::<f64, _>("avg_handling_time_seconds"),
    })).collect();

    Ok(Json(json!({
        "tenant_id": tenant.tenant_id,
        "data":      data,
        "count":     data.len()
    })))
}

// ============================================================
// GET /api/v1/analytics/operator-performance
// Năng suất xử lý của từng operator trong tenant
// ============================================================
pub async fn get_operator_performance(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(r#"
        SELECT
            user_id::TEXT AS user_id,
            full_name,
            role,
            total_tasks_handled,
            tasks_completed,
            tasks_violated_sla,
            COALESCE(avg_handling_time_seconds, 0.0)::FLOAT8 AS avg_handling_time_seconds,
            COALESCE(on_time_completion_rate, 100.0)::FLOAT8  AS on_time_completion_rate
        FROM nf_analytics.vw_operator_performance_summary
        WHERE tenant_id = $1
        ORDER BY tasks_completed DESC
        LIMIT 50
    "#)
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response()
    })?;

    let data: Vec<Value> = rows.iter().map(|r| json!({
        "user_id":                  r.get::<String, _>("user_id"),
        "full_name":                r.get::<String, _>("full_name"),
        "role":                     r.get::<String, _>("role"),
        "total_tasks_handled":      r.get::<i64, _>("total_tasks_handled"),
        "tasks_completed":          r.get::<i64, _>("tasks_completed"),
        "tasks_violated_sla":       r.get::<i64, _>("tasks_violated_sla"),
        "avg_handling_time_secs":   r.get::<f64, _>("avg_handling_time_seconds"),
        "on_time_completion_rate":  r.get::<f64, _>("on_time_completion_rate"),
    })).collect();

    Ok(Json(json!({
        "tenant_id": tenant.tenant_id,
        "data":      data,
        "count":     data.len()
    })))
}

// ============================================================
// POST /api/v1/analytics/generate-daily-report
// Tổng hợp số liệu ngày, sinh AI insights và neo lên Blockchain
// ============================================================
pub async fn generate_daily_report(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let today = Utc::now().naive_utc().date();

    // 1. Lấy metrics tổng quan
    let metrics_row = sqlx::query(r#"
        SELECT
            SUM(total_work_items) as total_tasks,
            SUM(total_work_items - total_sla_violations) as completed_tasks,
            SUM(total_sla_violations) as sla_violations
        FROM nf_analytics.vw_tenant_sla_compliance_daily
        WHERE tenant_id = $1 AND date_record = $2::DATE
    "#)
    .bind(tenant.tenant_id)
    .bind(today)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response())?;

    let mut total_tasks = 0;
    let mut completed_tasks = 0;
    let mut sla_violations = 0;

    if let Some(r) = metrics_row {
        total_tasks = r.try_get::<i64, _>("total_tasks").unwrap_or(0);
        completed_tasks = r.try_get::<i64, _>("completed_tasks").unwrap_or(0);
        sla_violations = r.try_get::<i64, _>("sla_violations").unwrap_or(0);
    }

    let metrics_json = json!({
        "date": today.to_string(),
        "total": total_tasks,
        "completed": completed_tasks,
        "sla_violations": sla_violations
    });

    // 2. Tự động sinh AI Insights
    let ai_insights = if total_tasks > 0 && sla_violations > 0 {
        format!("Cảnh báo từ AI: Có {} tác vụ vi phạm SLA. Cần bổ sung thêm nhân sự xử lý để giải quyết tình trạng nghẽn cổ chai (bottleneck) đang xảy ra.", sla_violations)
    } else if total_tasks > 0 {
        "Phân tích AI: Hiệu suất vận hành trong ngày đạt mức xuất sắc. Toàn bộ các tác vụ đều hoàn thành đúng thời hạn SLA cam kết.".to_string()
    } else {
        "Phân tích AI: Chưa có dữ liệu tác vụ nào được ghi nhận trong hệ thống ngày hôm nay.".to_string()
    };

    // 3. Tính toán Data Hash (Hash(metrics + insights))
    let payload_to_hash = format!("{}:{}", metrics_json.to_string(), ai_insights);
    let mut hasher = Sha256::new();
    hasher.update(payload_to_hash.as_bytes());
    let data_hash = format!("0x{}", hex::encode(hasher.finalize()));

    // 4. Gọi hàm Neo dữ liệu lên Blockchain giả lập
    let tx_hash = anchor_data_on_chain(&data_hash).await;

    // 5. Lưu xuống DB
    let _result = sqlx::query(r#"
        INSERT INTO nf_analytics.daily_performance_reports
        (tenant_id, report_date, total_tasks, completed_tasks, sla_violations, avg_handling_time_seconds, metrics_snapshot, ai_insights, data_hash, tx_hash)
        VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, $9)
        RETURNING report_id, data_hash, tx_hash, created_at
    "#)
    .bind(tenant.tenant_id)
    .bind(today)
    .bind(total_tasks as i32)
    .bind(completed_tasks as i32)
    .bind(sla_violations as i32)
    .bind(&metrics_json)
    .bind(&ai_insights)
    .bind(&data_hash)
    .bind(&tx_hash)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Lỗi lưu báo cáo: {}", e) }))).into_response()
    })?;

    Ok(Json(json!({
        "success": true,
        "report_date": today.to_string(),
        "data_hash": data_hash,
        "tx_hash": tx_hash,
        "insights": ai_insights
    })))
}

// ============================================================
// GET /api/v1/analytics/daily-reports
// Lịch sử báo cáo đã được neo lên chuỗi khối
// ============================================================
pub async fn get_daily_reports(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(r#"
        SELECT 
            report_id, report_date::TEXT as report_date, total_tasks, completed_tasks, sla_violations, 
            metrics_snapshot, ai_insights, data_hash, tx_hash, created_at
        FROM nf_analytics.daily_performance_reports
        WHERE tenant_id = $1
        ORDER BY report_date DESC
        LIMIT 30
    "#)
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response())?;

    let data: Vec<Value> = rows.iter().map(|r| json!({
        "report_id": r.get::<i64, _>("report_id"),
        "report_date": r.get::<String, _>("report_date"),
        "total_tasks": r.get::<i32, _>("total_tasks"),
        "completed_tasks": r.get::<i32, _>("completed_tasks"),
        "sla_violations": r.get::<i32, _>("sla_violations"),
        "metrics_snapshot": r.get::<Value, _>("metrics_snapshot"),
        "ai_insights": r.get::<String, _>("ai_insights"),
        "data_hash": r.get::<String, _>("data_hash"),
        "tx_hash": r.get::<String, _>("tx_hash"),
        "created_at": r.get::<chrono::DateTime<Utc>, _>("created_at").to_rfc3339(),
    })).collect();

    Ok(Json(json!({
        "tenant_id": tenant.tenant_id,
        "reports": data
    })))
}
