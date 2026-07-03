use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use sqlx::Row;
use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

pub async fn get_tenant_kpis(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    // 1. Thống kê số lượng Task theo từng trạng thái
    let status_query = r#"
        SELECT status, COUNT(*) as count 
        FROM nf_core.work_items 
        WHERE tenant_id = $1 
        GROUP BY status
    "#;
    
    let status_rows = sqlx::query(status_query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Analytics Controller] Status count query error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let mut unassigned_count = 0;
    let mut in_progress_count = 0;
    let mut completed_count = 0;
    let mut cancelled_count = 0;

    for row in status_rows {
        let status: String = row.get("status");
        let count: i64 = row.get("count");
        match status.as_str() {
            "UNASSIGNED" => unassigned_count = count,
            "IN_PROGRESS" => in_progress_count = count,
            "COMPLETED" => completed_count = count,
            "CANCELLED" => cancelled_count = count,
            _ => {}
        }
    }

    let total_tasks = unassigned_count + in_progress_count + completed_count + cancelled_count;

    // 2. Tính toán SLA Breach Rate
    // Đếm số task bị trễ hạn (due_at < NOW() mà không phải COMPLETED/CANCELLED) hoặc due_at < started_at
    let breach_query = r#"
        SELECT COUNT(*) as count 
        FROM nf_core.work_items 
        WHERE tenant_id = $1 AND due_at < CURRENT_TIMESTAMP AND status NOT IN ('COMPLETED', 'CANCELLED')
    "#;

    let breach_row = sqlx::query(breach_query)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Analytics Controller] Breach query error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;
    
    let breached_count: i64 = breach_row.get("count");
    let sla_breach_rate = if total_tasks > 0 {
        (breached_count as f64 / total_tasks as f64) * 100.0
    } else {
        0.0
    };

    // 3. Tính Average Resolution Time (giây) cho các task đã COMPLETED
    let resolution_query = r#"
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - started_at))), 0)::double precision as avg_resolution
        FROM nf_core.work_items 
        WHERE tenant_id = $1 AND status = 'COMPLETED' AND started_at IS NOT NULL
    "#;

    let resolution_row = sqlx::query(resolution_query)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Analytics Controller] Resolution query error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let avg_resolution_seconds: f64 = resolution_row.get("avg_resolution");

    // 4. Lấy danh sách throughput (số lượng hoàn thành trong 24 giờ qua)
    let throughput_query = r#"
        SELECT COUNT(*) as count 
        FROM nf_core.work_items 
        WHERE tenant_id = $1 AND status = 'COMPLETED' AND updated_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    "#;

    let throughput_row = sqlx::query(throughput_query)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Analytics Controller] Throughput query error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;
    let completed_24h: i64 = throughput_row.get("count");

    let res = json!({
        "tenant_id": tenant.tenant_id,
        "metrics": {
            "total_tasks": total_tasks,
            "unassigned_count": unassigned_count,
            "in_progress_count": in_progress_count,
            "completed_count": completed_count,
            "cancelled_count": cancelled_count,
            "completed_24h": completed_24h,
            "sla_breach_rate": (sla_breach_rate * 10.0).round() / 10.0, // làm tròn 1 chữ số thập phân
            "avg_resolution_seconds": avg_resolution_seconds.round()
        }
    });

    Ok(Json(res))
}
