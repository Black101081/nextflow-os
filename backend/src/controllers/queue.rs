use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use chrono::Utc;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

// Requests structs
#[derive(Debug, Deserialize)]
pub struct CreateQueueRequest {
    pub id: String,
    pub name: String,
    pub category: String,
    pub routing_algorithm: Option<String>,
    pub sla_target_seconds: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct AddMemberRequest {
    pub user_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct RouteWorkItemRequest {
    pub target_queue_id: Option<String>,
    pub assignee_id: Option<Uuid>,
    pub note: Option<String>,
}

// Controller Actions
pub async fn create_queue(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateQueueRequest>,
) -> Result<impl IntoResponse, Response> {
    if payload.id.trim().is_empty() || payload.name.trim().is_empty() || payload.category.trim().is_empty() {
        let error_body = json!({
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Các trường id, name, và category không được để trống.",
                "details": [{ "field": "id/name/category", "issue": "missing_required_fields" }]
            }
        });
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
    }

    // Kiểm tra trùng ID
    let check_opt = sqlx::query("SELECT id FROM nf_core.queues WHERE id = $1")
        .bind(&payload.id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    if check_opt.is_some() {
        let error_body = json!({
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Queue ID đã tồn tại trong hệ thống.",
                "details": [{ "field": "id", "issue": "queue_id_already_exists" }]
            }
        });
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
    }

    let insert_query = r#"
        INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, category, routing_algorithm, sla_target_seconds
    "#;

    let routing_algo = payload.routing_algorithm.unwrap_or_else(|| "FIFO".to_string());
    let sla_target = payload.sla_target_seconds.unwrap_or(3600);

    let row = sqlx::query(insert_query)
        .bind(&payload.id)
        .bind(tenant.tenant_id)
        .bind(&payload.name)
        .bind(&payload.category)
        .bind(routing_algo)
        .bind(sla_target)
        .fetch_one(&state.pool)
        .await
        .map_err(|err| {
            eprintln!("[Queue Controller] DB Insert error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let res = json!({
        "id": row.get::<String, _>("id"),
        "name": row.get::<String, _>("name"),
        "category": row.get::<String, _>("category"),
        "routing_algorithm": row.get::<String, _>("routing_algorithm"),
        "sla_target_seconds": row.get::<i32, _>("sla_target_seconds")
    });

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn add_queue_member(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<String>,
    Json(payload): Json<AddMemberRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Queue tồn tại và thuộc Tenant
    let queue_opt = sqlx::query("SELECT id FROM nf_core.queues WHERE id = $1 AND tenant_id = $2")
        .bind(&id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    if queue_opt.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Queue." } })),
        )
            .into_response());
    }

    // 2. Kiểm tra User tồn tại và thuộc Tenant
    let user_opt = sqlx::query("SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2")
        .bind(payload.user_id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    if user_opt.is_none() {
        let error_body = json!({
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Không tìm thấy người dùng tương ứng với Tenant này.",
                "details": [{ "field": "user_id", "issue": "user_not_found_in_tenant" }]
            }
        });
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
    }

    // 3. Thêm vào bảng queue_members
    sqlx::query("INSERT INTO nf_core.queue_members (queue_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
        .bind(&id)
        .bind(payload.user_id)
        .execute(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let res = json!({
        "queue_id": id,
        "user_id": payload.user_id,
        "status": "ADDED"
    });

        // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_ROUTED",
        "data": {
            "work_item_id": res["work_item_id"],
            "routed_to_queue": res["routed_to_queue"],
            "assigned_to": res["assigned_to"],
            "status": res["status"]
        }
    }).to_string());

    Ok(Json(res))
}

pub async fn get_queue_members(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, Response> {
    // Kiểm tra Queue tồn tại và thuộc Tenant
    let queue_opt = sqlx::query("SELECT id, name FROM nf_core.queues WHERE id = $1 AND tenant_id = $2")
        .bind(&id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let queue = queue_opt.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Queue." } })),
        )
            .into_response()
    })?;

    let members_query = r#"
        SELECT u.id AS user_id, u.first_name || ' ' || u.last_name AS name, u.role, u.is_active
        FROM nf_core.queue_members qm
        JOIN nf_core.users u ON qm.user_id = u.id
        WHERE qm.queue_id = $1 AND u.tenant_id = $2
    "#;

    let rows = sqlx::query(members_query)
        .bind(&id)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let mut members = Vec::new();
    for row in rows {
        members.push(json!({
            "user_id": row.get::<Uuid, _>("user_id"),
            "name": row.get::<String, _>("name"),
            "role": row.get::<String, _>("role"),
            "is_active": row.get::<bool, _>("is_active")
        }));
    }

    let res = json!({
        "queue_id": id,
        "name": queue.get::<String, _>("name"),
        "members": members
    });

        // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_ROUTED",
        "data": {
            "work_item_id": res["work_item_id"],
            "routed_to_queue": res["routed_to_queue"],
            "assigned_to": res["assigned_to"],
            "status": res["status"]
        }
    }).to_string());

    Ok(Json(res))
}

pub async fn route_work_item(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<RouteWorkItemRequest>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Work Item tồn tại và thuộc Tenant
    let task_opt = sqlx::query("SELECT id FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2")
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    if task_opt.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Work Item." } })),
        )
            .into_response());
    }

    // 2. Validate Queue đích (nếu có)
    if let Some(ref q_id) = payload.target_queue_id {
        let q_opt = sqlx::query("SELECT id FROM nf_core.queues WHERE id = $1 AND tenant_id = $2")
            .bind(q_id)
            .bind(tenant.tenant_id)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
                )
                    .into_response()
            })?;
        if q_opt.is_none() {
            let error_body = json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Queue đích không tồn tại.",
                    "details": [{ "field": "target_queue_id", "issue": "queue_not_found" }]
                }
            });
            return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
        }
    }

    // 3. Validate Assignee (nếu có)
    if let Some(ref u_id) = payload.assignee_id {
        let u_opt = sqlx::query("SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2")
            .bind(u_id)
            .bind(tenant.tenant_id)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
                )
                    .into_response()
            })?;
        if u_opt.is_none() {
            let error_body = json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Người nhận không tồn tại trong Tenant này.",
                    "details": [{ "field": "assignee_id", "issue": "user_not_found" }]
                }
            });
            return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
        }
    }

    // 4. Update
    let mut update_query = "UPDATE nf_core.work_items SET version = version + 1".to_string();
    let mut param_idx = 3;

    let next_status = if payload.assignee_id.is_some() { "IN_PROGRESS" } else { "UNASSIGNED" };
    update_query += &format!(", status = $1");

    if payload.target_queue_id.is_some() {
        update_query += &format!(", queue_id = ${}", param_idx);
        param_idx += 1;
    }
    if payload.assignee_id.is_some() {
        update_query += &format!(", assignee_id = ${}", param_idx);
        param_idx += 1;
    }

    update_query += &format!(" WHERE id = $2 AND tenant_id = ${} RETURNING id, queue_id, assignee_id, status", param_idx);

    let mut query_builder = sqlx::query(&update_query)
        .bind(next_status)
        .bind(id);

    if let Some(ref q_id) = payload.target_queue_id {
        query_builder = query_builder.bind(q_id);
    }
    if let Some(ref u_id) = payload.assignee_id {
        query_builder = query_builder.bind(u_id);
    }
    query_builder = query_builder.bind(tenant.tenant_id);

    let row = query_builder.fetch_one(&state.pool).await.map_err(|err| {
        eprintln!("[Queue Controller] Route update error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    let res = json!({
        "work_item_id": row.get::<Uuid, _>("id"),
        "routed_to_queue": row.get::<Option<String>, _>("queue_id"),
        "assigned_to": row.get::<Option<Uuid>, _>("assignee_id"),
        "status": row.get::<String, _>("status"),
        "routed_at": Utc::now().to_rfc3339()
    });

        // Real-time WebSocket Broadcast notification
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_ROUTED",
        "data": {
            "work_item_id": res["work_item_id"],
            "routed_to_queue": res["routed_to_queue"],
            "assigned_to": res["assigned_to"],
            "status": res["status"]
        }
    }).to_string());

    Ok(Json(res))
}

// GET /api/v1/queues — Lấy danh sách tất cả Queues của Tenant
pub async fn get_queues(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(
        "SELECT id, name, category, routing_algorithm, sla_target_seconds, created_at FROM nf_core.queues WHERE tenant_id = $1 ORDER BY created_at DESC"
    )
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[Queue] Fetch queues error: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    let queues: Vec<serde_json::Value> = rows.iter().map(|row| {
        json!({
            "id": row.get::<String, _>("id"),
            "name": row.get::<String, _>("name"),
            "category": row.get::<String, _>("category"),
            "routing_algorithm": row.get::<String, _>("routing_algorithm"),
            "sla_target_seconds": row.get::<i32, _>("sla_target_seconds"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at")
        })
    }).collect();

    Ok(Json(json!({ "queues": queues })))
}

// POST /api/v1/queues/:id/claim-next — Claim Task tiếp theo theo thuật toán routing
pub async fn claim_next_task(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(queue_id): Path<String>,
) -> Result<impl IntoResponse, Response> {
    // Lấy queue để biết routing_algorithm
    let queue_opt = sqlx::query(
        "SELECT id, routing_algorithm FROM nf_core.queues WHERE id = $1 AND tenant_id = $2"
    )
    .bind(&queue_id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } }))).into_response()
    })?;

    let queue = queue_opt.ok_or_else(|| {
        (StatusCode::NOT_FOUND, Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Queue." } }))).into_response()
    })?;

    let routing_algo = queue.get::<String, _>("routing_algorithm");

    // Lấy user_id từ Bearer token (bắt buộc cho claim)
    let user_id = tenant.user_id.ok_or_else(|| {
        (StatusCode::UNAUTHORIZED, Json(json!({ "error": { "code": "UNAUTHORIZED", "message": "Cần Bearer token chứa User ID để claim task." } }))).into_response()
    })?;

    // Tìm task theo thuật toán routing
    let task_opt = match routing_algo.as_str() {
        "ROUND_ROBIN" => {
            // ROUND_ROBIN: Gán cho người này nếu họ có ít task IN_PROGRESS nhất trong queue
            // Lấy task UNASSIGNED cũ nhất chưa gán cho user này lần cuối
            let q = r#"
                SELECT id, title, priority, created_at
                FROM nf_core.work_items
                WHERE queue_id = $1 AND tenant_id = $2 AND status = 'UNASSIGNED'
                ORDER BY created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            "#;
            sqlx::query(q).bind(&queue_id).bind(tenant.tenant_id).fetch_optional(&state.pool).await.ok().flatten()
        },
        "CAPACITY_BASED" => {
            // CAPACITY_BASED: Chỉ claim nếu user đang có < 5 tasks IN_PROGRESS
            let count_q = "SELECT COUNT(*) as cnt FROM nf_core.work_items WHERE assignee_id = $1 AND status = 'IN_PROGRESS' AND tenant_id = $2";
            let count_row = sqlx::query(count_q).bind(user_id).bind(tenant.tenant_id).fetch_one(&state.pool).await;
            let current_load: i64 = count_row.map(|r| r.get::<i64, _>("cnt")).unwrap_or(0);
            if current_load >= 5 {
                return Err((
                    StatusCode::CONFLICT,
                    Json(json!({ "error": { "code": "CAPACITY_FULL", "message": "Bạn đang xử lý đủ 5 tasks. Vui lòng hoàn thành trước khi nhận thêm." } }))
                ).into_response());
            }
            let q = r#"
                SELECT id, title, priority, created_at
                FROM nf_core.work_items
                WHERE queue_id = $1 AND tenant_id = $2 AND status = 'UNASSIGNED'
                ORDER BY CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            "#;
            sqlx::query(q).bind(&queue_id).bind(tenant.tenant_id).fetch_optional(&state.pool).await.ok().flatten()
        },
        _ => {
            // FIFO (default): Task cũ nhất, ưu tiên CRITICAL > HIGH > MEDIUM > LOW
            let q = r#"
                SELECT id, title, priority, created_at
                FROM nf_core.work_items
                WHERE queue_id = $1 AND tenant_id = $2 AND status = 'UNASSIGNED'
                ORDER BY CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            "#;
            sqlx::query(q).bind(&queue_id).bind(tenant.tenant_id).fetch_optional(&state.pool).await.ok().flatten()
        }
    };

    let task_row = match task_opt {
        Some(r) => r,
        None => {
            return Ok(Json(json!({
                "claimed": false,
                "message": "Không có task nào đang chờ trong hàng đợi này."
            })).into_response());
        }
    };

    let task_id: Uuid = task_row.get("id");

    // Gán task cho user: status IN_PROGRESS, assignee_id = user, started_at = NOW()
    let update_row = sqlx::query(r#"
        UPDATE nf_core.work_items
        SET status = 'IN_PROGRESS', assignee_id = $1, started_at = CURRENT_TIMESTAMP, version = version + 1
        WHERE id = $2 AND tenant_id = $3 AND status = 'UNASSIGNED'
        RETURNING id, title, priority, status, version
    "#)
    .bind(user_id)
    .bind(task_id)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|err| {
        eprintln!("[ClaimNext] DB update error: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi khi claim task." } }))).into_response()
    })?;

    let claimed_row = match update_row {
        Some(r) => r,
        None => {
            // Race condition: task đã bị người khác claim
            return Ok(Json(json!({
                "claimed": false,
                "message": "Task vừa được người khác nhận trước. Vui lòng thử lại."
            })).into_response());
        }
    };

    // Real-time WebSocket Broadcast
    let _ = state.tx.send(json!({
        "event": "WORK_ITEM_CLAIMED",
        "data": {
            "work_item_id": claimed_row.get::<Uuid, _>("id"),
            "assigned_to": user_id,
            "routing_algorithm": routing_algo
        }
    }).to_string());

    Ok(Json(json!({
        "claimed": true,
        "work_item": {
            "id": claimed_row.get::<Uuid, _>("id"),
            "title": claimed_row.get::<String, _>("title"),
            "priority": claimed_row.get::<String, _>("priority"),
            "status": claimed_row.get::<String, _>("status"),
            "version": claimed_row.get::<i32, _>("version"),
            "assigned_to": user_id
        },
        "routing_algorithm": routing_algo
    })).into_response())
}

pub async fn remove_queue_member(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path((id, user_id)): Path<(String, Uuid)>,
) -> Result<impl IntoResponse, Response> {
    // 1. Kiểm tra Queue tồn tại và thuộc Tenant
    let queue_opt = sqlx::query("SELECT id FROM nf_core.queues WHERE id = $1 AND tenant_id = $2")
        .bind(&id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    if queue_opt.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": { "code": "NOT_FOUND", "message": "Không tìm thấy Queue." } })),
        )
            .into_response());
    }

    // 2. Thực hiện xoá khỏi bảng queue_members
    sqlx::query("DELETE FROM nf_core.queue_members WHERE queue_id = $1 AND user_id = $2")
        .bind(&id)
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
            )
                .into_response()
        })?;

    let res = json!({
        "queue_id": id,
        "user_id": user_id,
        "status": "REMOVED"
    });

    Ok(Json(res))
}

