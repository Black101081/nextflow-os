use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::middleware::tenant_isolation::TenantIsolation;

// Structs cho requests và responses
#[derive(Debug, Deserialize)]
pub struct CreateWorkItemRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub category: Option<String>,
    pub source: Option<String>,
    pub external_id: Option<String>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct WorkItemResponse {
    pub id: Uuid,
    pub title: String,
    pub status: String,
    pub priority: String,
    pub created_at: DateTime<Utc>,
    pub due_at: Option<DateTime<Utc>>,
    pub version: i32,
}

// Controller logic
pub async fn create_work_item(
    State(pool): State<PgPool>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateWorkItemRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Validation: Tiêu đề không được để trống
    let title = match &payload.title {
        Some(t) if !t.trim().is_empty() => t,
        _ => {
            let error_body = json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Dữ liệu yêu cầu không hợp lệ.",
                    "details": [
                        { "field": "title", "issue": "title_is_required" }
                    ]
                }
            });
            return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
        }
    };

    // 2. Validation: due_date không được là ngày quá khứ
    if let Some(due) = payload.due_date {
        if due < Utc::now() {
            let error_body = json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Dữ liệu yêu cầu không hợp lệ.",
                    "details": [
                        { "field": "due_date", "issue": "due_date_must_be_in_future" }
                    ]
                }
            });
            return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
        }
    }

    // 3. Thực hiện insert thật vào DB Postgres
    let insert_query = r#"
        INSERT INTO nf_core.work_items (
            tenant_id, title, description, priority, due_at, category, source, external_id, metadata, creator_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'UNASSIGNED')
        RETURNING id, title, status, priority, created_at, due_at, version
    "#;

    let priority = payload.priority.unwrap_or_else(|| "MEDIUM".to_string());
    let source = payload.source.unwrap_or_else(|| "MANUAL".to_string());
    let metadata = payload.metadata.unwrap_or_else(|| json!({}));

    let row = sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(title)
        .bind(&payload.description)
        .bind(&priority)
        .bind(payload.due_date)
        .bind(&payload.category)
        .bind(&source)
        .bind(&payload.external_id)
        .bind(metadata)
        .bind(tenant.user_id)
        .fetch_one(&pool)
        .await
        .map_err(|err| {
            eprintln!("[WorkItem Controller] DB Insert error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let res = WorkItemResponse {
        id: row.get("id"),
        title: row.get("title"),
        status: row.get("status"),
        priority: row.get("priority"),
        created_at: row.get("created_at"),
        due_at: row.get("due_at"),
        version: row.get("version"),
    };

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn get_work_item(
    State(pool): State<PgPool>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, Response> {
    // Rule 4: Tenant Isolation - Bắt buộc lọc theo tenant_id
    let row_opt = sqlx::query(
        "SELECT id, title, status, priority, created_at, due_at, version FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&pool)
    .await
    .map_err(|err| {
        eprintln!("[WorkItem Controller] DB Fetch error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    let row = row_opt.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
        )
            .into_response()
    })?;

    let res = WorkItemResponse {
        id: row.get("id"),
        title: row.get("title"),
        status: row.get("status"),
        priority: row.get("priority"),
        created_at: row.get("created_at"),
        due_at: row.get("due_at"),
        version: row.get("version"),
    };

    Ok(Json(res))
}

pub async fn update_work_item_status(
    State(pool): State<PgPool>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateStatusRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Work Item tồn tại và thuộc Tenant
    let check_opt = sqlx::query(
        "SELECT id FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&pool)
    .await
    .map_err(|err| {
        eprintln!("[WorkItem Controller] DB Check error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    if check_opt.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
        )
            .into_response());
    }

    // 2. Cập nhật trạng thái
    let mut update_query = "UPDATE nf_core.work_items SET status = $1, version = version + 1".to_string();
    
    // Nếu status chuyển sang IN_PROGRESS, gán assignee_id bằng user_id hiện tại và set started_at
    if payload.status == "IN_PROGRESS" && tenant.user_id.is_some() {
        update_query += ", assignee_id = $3, started_at = CURRENT_TIMESTAMP";
    }

    update_query += " WHERE id = $2 AND tenant_id = $4 RETURNING id, status, version";

    let query_builder = sqlx::query(&update_query)
        .bind(&payload.status)
        .bind(id);

    let query_builder = if payload.status == "IN_PROGRESS" && tenant.user_id.is_some() {
        query_builder.bind(tenant.user_id).bind(tenant.tenant_id)
    } else {
        query_builder.bind(tenant.tenant_id)
    };

    let row = query_builder.fetch_one(&pool).await.map_err(|err| {
        eprintln!("[WorkItem Controller] DB Update error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    let res = json!({
        "id": row.get::<Uuid, _>("id"),
        "status": row.get::<String, _>("status"),
        "version": row.get::<i32, _>("version")
    });

    Ok(Json(res))
}
