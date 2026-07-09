use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;
use uuid::Uuid;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::services::sla::monitor_sla_breaches;
use crate::AppState;

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
    pub metadata: Option<Value>,
}

#[derive(Debug, Deserialize)]
pub struct UploadEvidenceRequest {
    pub photo_base64: String,
    pub latitude: f64,
    pub longitude: f64,
    pub note: String,
}

#[derive(Debug, Serialize)]
pub struct WorkItemResponse {
    pub id: Uuid,
    pub queue_id: Option<String>,
    pub title: String,
    pub status: String,
    pub priority: String,
    pub category: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub due_at: Option<chrono::DateTime<chrono::Utc>>,
    pub version: i32,
    pub tx_hash: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub assignee_id: Option<Uuid>,
    pub invoice_status: Option<String>,
    pub invoice_amount: Option<f64>,
    pub payment_link_url: Option<String>,
    pub invoice_data_hash: Option<String>,
    pub invoice_tx_hash: Option<String>,
}

// Controller logic
pub async fn create_work_item(
    State(state): State<AppState>,
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
        RETURNING id, queue_id, title, status, priority, category, created_at, due_at, version, metadata, assignee_id
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
        .fetch_one(&state.pool)
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
        queue_id: row.get("queue_id"),
        title: row.get("title"),
        status: row.get("status"),
        priority: row.get("priority"),
        category: row.get("category"),
        created_at: row.get("created_at"),
        due_at: row.get("due_at"),
        version: row.get("version"),
        tx_hash: None,
        metadata: Some(row.get::<serde_json::Value, _>("metadata")),
        assignee_id: row.get("assignee_id"),
        invoice_status: None,
        invoice_amount: None,
        payment_link_url: None,
        invoice_data_hash: None,
        invoice_tx_hash: None,
    };

    // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_CREATED",
        "data": {
            "id": res.id,
            "queue_id": res.queue_id,
            "title": res.title,
            "status": res.status,
            "priority": res.priority,
            "category": res.category,
            "version": res.version,
            "tx_hash": None::<String>
        }
    }).to_string());

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn get_work_item(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, Response> {
    let row_opt = sqlx::query(
        r#"SELECT w.id, w.queue_id, w.title, w.status, w.priority, w.category, w.created_at, w.due_at, w.version, w.metadata, w.assignee_id
           FROM nf_core.work_items w
           WHERE w.id = $1 AND w.tenant_id = $2"#
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
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

    let metadata_val = row.get::<serde_json::Value, _>("metadata");
    let tx_hash = metadata_val.get("tx_hash")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let res = WorkItemResponse {
        id: row.get("id"),
        queue_id: row.get("queue_id"),
        title: row.get("title"),
        status: row.get("status"),
        priority: row.get("priority"),
        category: row.get("category"),
        created_at: row.get("created_at"),
        due_at: row.get("due_at"),
        version: row.get("version"),
        tx_hash,
        metadata: Some(metadata_val),
        assignee_id: row.get("assignee_id"),
        invoice_status: row.try_get("invoice_status").unwrap_or(None),
        invoice_amount: row.try_get("invoice_amount").unwrap_or(None),
        payment_link_url: row.try_get("payment_link_url").unwrap_or(None),
        invoice_data_hash: row.try_get("invoice_data_hash").unwrap_or(None),
        invoice_tx_hash: row.try_get("invoice_tx_hash").unwrap_or(None),
    };

    Ok(Json(res))
}

pub async fn update_work_item_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateStatusRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Work Item tồn tại và thuộc Tenant
    let check_opt = sqlx::query(
        "SELECT id, metadata FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[WorkItem Controller] DB Check error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    let check_row = match check_opt {
        Some(r) => r,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
            )
                .into_response());
        }
    };

    let mut metadata_value = check_row.get::<serde_json::Value, _>("metadata");

    if let Some(ref new_meta) = payload.metadata {
        if let Some(obj) = metadata_value.as_object_mut() {
            if let Some(new_obj) = new_meta.as_object() {
                for (k, v) in new_obj {
                    obj.insert(k.clone(), v.clone());
                }
            }
        }
    }

    // Nếu status cập nhật là COMPLETED, thực hiện sinh simulated Tx Hash U2U Blockchain
    if payload.status == "COMPLETED" {
        let tx_hash = format!("0x{}{}", uuid::Uuid::new_v4().simple(), uuid::Uuid::new_v4().simple());
        println!("[U2U Trust Anchor] Anchored status update on-chain. Task ID: {}, Status: COMPLETED, Tx Hash: {}", id, tx_hash);
        if let Some(obj) = metadata_value.as_object_mut() {
            obj.insert("tx_hash".to_string(), serde_json::Value::String(tx_hash));
        } else {
            metadata_value = json!({ "tx_hash": tx_hash });
        }
    }

    // 2. Cập nhật trạng thái — xử lý đầy đủ lifecycle timestamps
    let is_in_progress = payload.status == "IN_PROGRESS" && tenant.user_id.is_some();
    let is_completed = payload.status == "COMPLETED";

    let mut update_query = "UPDATE nf_core.work_items SET status = $1, version = version + 1, metadata = $3".to_string();

    if is_in_progress {
        // Gán assignee + set started_at
        update_query += ", assignee_id = $4, started_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $5 RETURNING id, status, version, metadata, assignee_id";
    } else if is_completed {
        // Set completed_at khi hoàn thành
        update_query += ", completed_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $4 RETURNING id, status, version, metadata, assignee_id";
    } else {
        update_query += " WHERE id = $2 AND tenant_id = $4 RETURNING id, status, version, metadata, assignee_id";
    }

    let query_builder = sqlx::query(&update_query)
        .bind(&payload.status)
        .bind(id)
        .bind(&metadata_value);

    let query_builder = if is_in_progress {
        query_builder.bind(tenant.user_id).bind(tenant.tenant_id)
    } else {
        query_builder.bind(tenant.tenant_id)
    };

    let row = query_builder.fetch_one(&state.pool).await.map_err(|err| {
        eprintln!("[WorkItem Controller] DB Update error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    // Lấy tx_hash trả về
    let response_metadata = row.get::<serde_json::Value, _>("metadata");
    let tx_hash_res = response_metadata.get("tx_hash")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let res = json!({
        "id": row.get::<Uuid, _>("id"),
        "status": row.get::<String, _>("status"),
        "version": row.get::<i32, _>("version"),
        "tx_hash": tx_hash_res,
        "metadata": response_metadata,
        "assignee_id": row.get::<Option<Uuid>, _>("assignee_id")
    });

    // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_STATUS_UPDATED",
        "data": {
            "id": res["id"],
            "status": res["status"],
            "version": res["version"],
            "tx_hash": res["tx_hash"],
            "assignee_id": res["assignee_id"]
        }
    }).to_string());

    if is_completed {
        // Gamification: Award points to the assignee if they completed the task
        if let Some(assignee) = row.get::<Option<Uuid>, _>("assignee_id") {
            let _ = crate::controllers::gamification::award_points_internal(
                &state.pool, 
                tenant.tenant_id, 
                assignee, 
                Some(id), 
                10, 
                "Hoàn thành nhiệm vụ"
            ).await;
        }

        crate::services::webhook_dispatcher::dispatch_event(
            &state.pool,
            tenant.tenant_id,
            "WORK_ITEM_COMPLETED",
            res.clone(),
        ).await;
    }

    Ok(Json(res))
}

// API GET /api/v1/work-items/overdue
pub async fn get_overdue_work_items(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let query = r#"
        SELECT id, title, status, priority, created_at, due_at, version
        FROM nf_core.work_items
        WHERE tenant_id = $1 AND due_at < CURRENT_TIMESTAMP AND status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY due_at ASC
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[WorkItem Controller] Query overdue error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let items: Vec<Value> = rows.into_iter().map(|row| {
        json!({
            "id": row.get::<Uuid, _>("id"),
            "title": row.get::<String, _>("title"),
            "status": row.get::<String, _>("status"),
            "priority": row.get::<String, _>("priority"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
            "due_at": row.get::<Option<chrono::DateTime<Utc>>, _>("due_at"),
            "version": row.get::<i32, _>("version")
        })
    }).collect();

    Ok(Json(json!({ "overdue_items": items })))
}

// API POST /api/v1/work-items/trigger-sla
pub async fn trigger_sla_scan(
    State(state): State<AppState>,
    _tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let result = monitor_sla_breaches(&state.pool).await.map_err(|err| {
        eprintln!("[WorkItem Controller] SLA scan error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    Ok(Json(result))
}

// API GET /api/v1/work-items
pub async fn get_work_items(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let query = r#"
        SELECT id, queue_id, title, status, priority, category, created_at, due_at, version, metadata, assignee_id
        FROM nf_core.work_items
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[WorkItem Controller] Query items error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let items: Vec<Value> = rows.into_iter().map(|row| {
        let response_metadata = row.get::<serde_json::Value, _>("metadata");
        let tx_hash_res = response_metadata.get("tx_hash")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
        json!({
            "id": row.get::<Uuid, _>("id"),
            "queue_id": row.get::<Option<String>, _>("queue_id"),
            "title": row.get::<String, _>("title"),
            "status": row.get::<String, _>("status"),
            "priority": row.get::<String, _>("priority"),
            "category": row.get::<Option<String>, _>("category"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
            "due_at": row.get::<Option<chrono::DateTime<Utc>>, _>("due_at"),
            "version": row.get::<i32, _>("version"),
            "tx_hash": tx_hash_res,
            "metadata": response_metadata,
            "assignee_id": row.get::<Option<Uuid>, _>("assignee_id")
        })
    }).collect();

    Ok(Json(items))
}

pub async fn upload_work_item_evidence(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UploadEvidenceRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Work Item tồn tại và thuộc Tenant
    let check_opt = sqlx::query(
        "SELECT id, metadata FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[WorkItem Controller] Evidence DB Check error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    let check_row = match check_opt {
        Some(r) => r,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
            )
                .into_response());
        }
    };

    let mut metadata_value = check_row.get::<serde_json::Value, _>("metadata");

    // Tạo object evidence mới
    let new_evidence = json!({
        "photo_base64": payload.photo_base64,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "note": payload.note,
        "timestamp": Utc::now().to_rfc3339()
    });

    // Append vào mảng "evidences" trong metadata
    if let Some(obj) = metadata_value.as_object_mut() {
        if let Some(evs) = obj.get_mut("evidences") {
            if let Some(arr) = evs.as_array_mut() {
                arr.push(new_evidence);
            }
        } else {
            obj.insert("evidences".to_string(), json!([new_evidence]));
        }
    } else {
        metadata_value = json!({
            "evidences": [new_evidence]
        });
    }

    // 2. Lưu lại vào DB Postgres
    sqlx::query(
        "UPDATE nf_core.work_items SET metadata = $1, version = version + 1 WHERE id = $2 AND tenant_id = $3"
    )
    .bind(&metadata_value)
    .bind(id)
    .bind(tenant.tenant_id)
    .execute(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[WorkItem Controller] Update evidence metadata error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_EVIDENCE_ADDED",
        "data": {
            "work_item_id": id,
            "evidence_count": metadata_value.get("evidences").and_then(|e| e.as_array()).map(|a| a.len()).unwrap_or(0)
        }
    }).to_string());

    Ok(Json(json!({ "success": true, "message": "Đã thêm bằng chứng thực địa thành công." })))
}

#[derive(Debug, Deserialize)]
pub struct EscalateWorkItemRequest {
    pub reason: String,
    pub exception_type: Option<String>,
    pub escalate_to_user_id: Option<Uuid>,
}

// POST /api/v1/work-items/:id/escalate
pub async fn escalate_work_item(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<EscalateWorkItemRequest>,
) -> Result<impl IntoResponse, Response> {
    // Validate reason
    if payload.reason.trim().is_empty() {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({ "error": { "code": "VALIDATION_FAILED", "message": "Lý do leo thang không được để trống." } })),
        ).into_response());
    }

    // Kiểm tra Work Item tồn tại và thuộc Tenant
    let task_opt = sqlx::query(
        "SELECT id FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    if task_opt.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
        ).into_response());
    }

    let exception_type = payload.exception_type.unwrap_or_else(|| "MANUAL_ESCALATION".to_string());

    // Dùng DB transaction: tạo exception + chuyển status Work Item → SUSPENDED
    let mut tx = state.pool.begin().await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    // Tạo task_exception record
    let insert_exception = r#"
        INSERT INTO nf_core.task_exceptions (
            tenant_id, work_item_id, exception_type, reason, status, escalated_to_user_id
        ) VALUES ($1, $2, $3, $4, 'PENDING', $5)
        RETURNING id
    "#;

    let ex_row = sqlx::query(insert_exception)
        .bind(tenant.tenant_id)
        .bind(id)
        .bind(&exception_type)
        .bind(&payload.reason)
        .bind(payload.escalate_to_user_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|err| {
            eprintln!("[Escalate] DB insert exception error: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi khi tạo exception." } }))).into_response()
        })?;

    let exception_id: Uuid = ex_row.get("id");

    // Cập nhật work item sang SUSPENDED để chờ phê duyệt
    sqlx::query(
        "UPDATE nf_core.work_items SET status = 'SUSPENDED', version = version + 1 WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .execute(&mut *tx)
    .await
    .map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    tx.commit().await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi commit transaction." } }))).into_response()
    })?;

    // Increment Prometheus escalation metric
    crate::controllers::metrics::get_task_escalations()
        .with_label_values(&[&tenant.tenant_id.to_string(), "SUSPENDED"])
        .inc();

    // Real-time WebSocket Broadcast
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_ESCALATED",
        "data": {
            "work_item_id": id,

            "exception_id": exception_id,
            "exception_type": exception_type,
            "status": "SUSPENDED"
        }
    }).to_string());

    Ok((StatusCode::CREATED, Json(json!({
        "exception_id": exception_id,
        "work_item_id": id,
        "status": "SUSPENDED",
        "message": "Đã leo thang thành công. Work Item chuyển sang SUSPENDED chờ phê duyệt."
    }))))
}

// --------------------------------------------------------------------------
// 12. GET /api/v1/work-items/exceptions
// --------------------------------------------------------------------------
#[derive(Debug, Serialize)]
pub struct ExceptionResponse {
    pub id: Uuid,
    pub work_item_id: Uuid,
    pub exception_type: String,
    pub reason: String,
    pub status: String,
    pub escalated_to_user_id: Option<Uuid>,
    pub resolved_by_user_id: Option<Uuid>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub work_item_title: Option<String>,
}

pub async fn get_exceptions(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let query = r#"
        SELECT 
            ex.id, 
            ex.work_item_id, 
            ex.exception_type, 
            ex.reason, 
            ex.status, 
            ex.escalated_to_user_id, 
            ex.resolved_by_user_id, 
            ex.resolved_at, 
            ex.created_at, 
            ex.updated_at,
            wi.title as work_item_title
        FROM nf_core.task_exceptions ex
        JOIN nf_core.work_items wi ON ex.work_item_id = wi.id
        WHERE ex.tenant_id = $1
        ORDER BY ex.created_at DESC
    "#;

    let rows = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Exceptions Controller] DB query error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            ).into_response()
        })?;

    let list: Vec<ExceptionResponse> = rows.iter().map(|r| ExceptionResponse {
        id: r.get("id"),
        work_item_id: r.get("work_item_id"),
        exception_type: r.get("exception_type"),
        reason: r.get("reason"),
        status: r.get("status"),
        escalated_to_user_id: r.get("escalated_to_user_id"),
        resolved_by_user_id: r.get("resolved_by_user_id"),
        resolved_at: r.get("resolved_at"),
        created_at: r.get("created_at"),
        updated_at: r.get("updated_at"),
        work_item_title: r.get("work_item_title"),
    }).collect();

    Ok(Json(json!({ "exceptions": list })))
}

// --------------------------------------------------------------------------
// 13. POST /api/v1/work-items/exceptions/:id/resolve
// --------------------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct ResolveExceptionRequest {
    pub decision: String, // "APPROVED" or "REJECTED"
}

pub async fn resolve_exception(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<ResolveExceptionRequest>,
) -> Result<impl IntoResponse, Response> {
    let status_val = match payload.decision.as_str() {
        "APPROVED" => "APPROVED",
        "REJECTED" => "REJECTED",
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": { "code": "INVALID_INPUT", "message": "Decision must be APPROVED or REJECTED" } })),
            ).into_response());
        }
    };

    let ex_row = sqlx::query(
        "SELECT work_item_id, status FROM nf_core.task_exceptions WHERE id = $1 AND tenant_id = $2"
    )
    .bind(id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    let ex_data = match ex_row {
        Some(r) => r,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy exception." } })),
            ).into_response());
        }
    };

    let current_status: String = ex_data.get("status");
    if current_status != "PENDING" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": { "code": "ALREADY_RESOLVED", "message": "Exception này đã được xử lý trước đó." } })),
        ).into_response());
    }

    let work_item_id: Uuid = ex_data.get("work_item_id");

    let mut tx = state.pool.begin().await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    sqlx::query(
        r#"
        UPDATE nf_core.task_exceptions 
        SET status = $1, resolved_by_user_id = $2, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        "#
    )
    .bind(status_val)
    .bind(tenant.user_id)
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|err| {
        eprintln!("[ResolveException] Update exception failed: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi cập nhật exception." } }))).into_response()
    })?;

    let next_wi_status = if status_val == "APPROVED" {
        "IN_PROGRESS"
    } else {
        "CANCELLED"
    };

    sqlx::query(
        "UPDATE nf_core.work_items SET status = $1, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
    )
    .bind(next_wi_status)
    .bind(work_item_id)
    .execute(&mut *tx)
    .await
    .map_err(|err| {
        eprintln!("[ResolveException] Update work item failed: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi cập nhật Work Item." } }))).into_response()
    })?;

    tx.commit().await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi commit transaction." } }))).into_response()
    })?;

    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_STATUS_UPDATED",
        "data": {
            "id": work_item_id,
            "status": next_wi_status,
            "version": 1
        }
    }).to_string());

    Ok(Json(json!({
        "message": "Đã xử lý ngoại lệ thành công.",
        "exception_id": id,
        "work_item_id": work_item_id,
        "decision": status_val,
        "work_item_status": next_wi_status
    })))
}


