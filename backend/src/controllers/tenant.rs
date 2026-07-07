use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use bcrypt::hash;
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::Row;
use uuid::Uuid;
use chrono::Utc;

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

// Requests structs
#[derive(Debug, Deserialize)]
pub struct SyncUserItem {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SyncUsersRequest {
    pub users: Vec<SyncUserItem>,
}

pub async fn sync_tenant_users(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(tenant_id): Path<Uuid>,
    Json(payload): Json<SyncUsersRequest>,
) -> Result<impl IntoResponse, Response> {
    // Rule 4: Tenant Isolation - Bảo vệ ranh giới Tenant
    if tenant_id != tenant.tenant_id {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Bạn không có quyền đồng bộ người dùng cho Tenant ID này."
                }
            })),
        )
            .into_response());
    }

    if payload.users.is_empty() {
        let error_body = json!({
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Mảng users không được rỗng.",
                "details": [{ "field": "users", "issue": "must_be_non_empty_array" }]
            }
        });
        return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error_body)).into_response());
    }

    let mut results = Vec::new();
    let mut success_count = 0;
    let mut failed_count = 0;

    // Băm mật khẩu mặc định (sử dụng cost 4 để chạy test siêu nhanh)
    let default_password_hash = hash("Sme_Nextflow_2026!", 4).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ." } })),
        )
            .into_response()
    })?;

    for user in payload.users {
        if user.email.trim().is_empty() || user.first_name.trim().is_empty() || user.last_name.trim().is_empty() {
            failed_count += 1;
            results.push(json!({
                "email": user.email,
                "status": "FAILED",
                "error": "Thiếu thông tin bắt buộc."
            }));
            continue;
        }

        let upsert_query = r#"
            INSERT INTO nf_core.users (tenant_id, email, password_hash, first_name, last_name, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (tenant_id, email) 
            DO UPDATE SET 
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              role = EXCLUDED.role,
              is_active = EXCLUDED.is_active,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id
        "#;

        let role = user.role.unwrap_or_else(|| "SME_OPS".to_string());
        let is_active = user.status.map(|s| s == "ACTIVE").unwrap_or(true);
        let email = user.email.to_lowercase().trim().to_string();

        match sqlx::query(upsert_query)
            .bind(tenant.tenant_id)
            .bind(&email)
            .bind(&default_password_hash)
            .bind(&user.first_name)
            .bind(&user.last_name)
            .bind(&role)
            .bind(is_active)
            .fetch_one(&state.pool)
            .await
        {
            Ok(row) => {
                success_count += 1;
                results.push(json!({
                    "email": user.email,
                    "status": "SYNCED",
                    "user_id": row.get::<Uuid, _>("id")
                }));
            }
            Err(err) => {
                eprintln!("[Tenant Controller] UPSERT failed: {}", err);
                failed_count += 1;
                results.push(json!({
                    "email": user.email,
                    "status": "FAILED",
                    "error": "Lỗi Database."
                }));
            }
        }
    }

    // Trả về mã 207 Multi-Status chuẩn
    let body = json!({
        "success_count": success_count,
        "failed_count": failed_count,
        "results": results
    });

    // 207 Multi-Status
    let status_207 = StatusCode::from_u16(207).unwrap_or(StatusCode::OK);
    Ok((status_207, Json(body)))
}

// --------------------------------------------------------------------------
// 1. Cấu hình & Khởi tạo Template Pack cho Tenant
// --------------------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct InitializeTemplateRequest {
    pub template_id: String,
    pub wipe_existing: bool,
}

pub async fn initialize_tenant_template(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<InitializeTemplateRequest>,
) -> Result<impl IntoResponse, Response> {
    // Verify tenant exists in the database
    let tenant_exists = sqlx::query("SELECT 1 FROM nf_core.tenants WHERE id = $1")
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": {"code": "DATABASE_ERROR", "message": e.to_string()}}))).into_response()
        })?;

    if tenant_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": {
                    "code": "TENANT_NOT_FOUND",
                    "message": "Tenant ID không tồn tại trong hệ thống. Vui lòng đăng ký Tenant hoặc sử dụng Tenant hợp lệ."
                }
            }))
        ).into_response());
    }

    // 1. Fetch template metadata
    let template_row = sqlx::query(r#"
        SELECT id, name, config_metadata
        FROM nf_core.template_packs
        WHERE id = $1
    "#)
    .bind(&payload.template_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let template = match template_row {
        Some(t) => t,
        None => return Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": {"code": "TEMPLATE_NOT_FOUND", "message": "Gói mẫu không tồn tại."}}))
        ).into_response()),
    };

    let config_metadata: Value = template.get("config_metadata");
    let queues_list = config_metadata.get("queues").and_then(|q| q.as_array());

    // Start database transaction
    let mut tx = state.pool.begin().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    // 2. Wipe existing queues if requested
    if payload.wipe_existing {
        sqlx::query("DELETE FROM nf_core.queues WHERE tenant_id = $1")
            .bind(tenant.tenant_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
            })?;
    }

    // 3. Create Queues
    if let Some(queues) = queues_list {
        for q in queues {
            let q_id = q.get("id").and_then(|i| i.as_str()).unwrap_or_default();
            let q_name = q.get("name").and_then(|n| n.as_str()).unwrap_or_default();
            let q_category = q.get("category").and_then(|c| c.as_str()).unwrap_or("OPERATIONS");
            let q_routing = q.get("routing").and_then(|r| r.as_str()).unwrap_or("FIFO");
            let q_sla = q.get("sla_seconds").and_then(|s| s.as_i64()).unwrap_or(3600);

            sqlx::query(r#"
                INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE 
                SET name = EXCLUDED.name, routing_algorithm = EXCLUDED.routing_algorithm, sla_target_seconds = EXCLUDED.sla_target_seconds
            "#)
            .bind(q_id)
            .bind(tenant.tenant_id)
            .bind(q_name)
            .bind(q_category)
            .bind(q_routing)
            .bind(q_sla as i32)
            .execute(&mut *tx)
            .await
            .map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
            })?;
        }
    }

    // 4. Upsert default tenant policies
    sqlx::query(r#"
        INSERT INTO nf_core.tenant_policies (tenant_id, sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode)
        VALUES ($1, 60, 30, FALSE, 'FIFO')
        ON CONFLICT (tenant_id) DO NOTHING
    "#)
    .bind(tenant.tenant_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    // 5. Seed some realistic demo tasks based on template
    if payload.template_id == "retail_distribution" {
        // Task 1: Order Processing (District 1)
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_order_processing', 'Xử lý đơn hàng linh kiện PC Asus', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"branch_id": "branch_q1", "customer_name": "Tran Van Binh", "order_value": 4500000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        // Task 2: Warehouse packaging
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_warehouse_pack', 'Đóng gói đơn hàng máy lọc nước Q12', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"branch_id": "branch_warehouse", "customer_name": "Lê Hoài Nam", "order_value": 8200000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        // Task 3: Courier delivery (District 3)
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_shipper_delivery', 'Giao đơn hàng sữa hạt organic Quận 3', 'LOW', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '120 minutes', '{"branch_id": "branch_q3", "customer_name": "Phạm Minh Hoàng", "order_value": 350000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "field_maintenance" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_service_request', 'Bảo dưỡng điều hòa văn phòng Q1', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"branch_id": "branch_q1", "customer_name": "Công ty GreenLand", "order_value": 1200000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "spa_wellness" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_booking_scheduler', 'Trị liệu da mặt thảo dược liệu trình VIP', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '15 minutes', '{"branch_id": "branch_q1", "customer_name": "Nguyễn Hoàng Lan", "order_value": 2500000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "fb_operations" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_order_taking', 'Ghi nhận bàn 5 - Lẩu Thái & nước ngọt', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '10 minutes', '{"table_no": 5, "customer_name": "Anh Hoàng", "order_value": 450000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_kitchen_prep', 'Chế biến món: 2 Phở bò chín, 1 Cơm chiên hải sản', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '20 minutes', '{"ticket_no": 104, "waiter_name": "Mai", "prep_time_minutes": 15}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "logistics_delivery" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_pickup_request', 'Thu gom hàng thương mại điện tử tại shop Hoa Hồng', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"pickup_address": "89 CMT8, Quận 3, TPHCM", "package_count": 12, "shipper_note": "Gom trước 17h"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_hub_sorting', 'Phân loại kiện hàng từ Hub TPHCM đi Hà Nội', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"batch_id": "HUB-HCM-HN-04", "item_count": 150, "supervisor": "Nguyễn Văn Kiên"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "professional_services" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_lead_qualification', 'Đánh giá yêu cầu thiết kế website Brand Identity', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"client_name": "Công ty TNHH Sunrise", "estimated_budget": 50000000, "lead_source": "Website Form"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_proposal_design', 'Soạn thảo Hợp đồng & Proposal thiết kế nội thất showroom', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '240 minutes', '{"designer_id": "staff_designer_02", "client_name": "Sơn Kim Group", "due_date": "2026-07-10"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "education_training" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_consultation', 'Tư vấn lộ trình học IELTS Cam 6.5 cho học viên mới', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"student_name": "Lê Thu Thảo", "phone": "0982xxxxxx", "schedule_time": "18:30 Hôm nay"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_class_allocation', 'Xếp lớp và phân công giáo viên lớp Tiếng Anh giao tiếp GE-102', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"class_code": "GE-102", "start_date": "2026-07-15", "teacher_recommendation": "Mr. John"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "construction_interior" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_site_survey', 'Khảo sát hiện trạng mặt bằng căn hộ 2 phòng ngủ Vinhomes', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '120 minutes', '{"apartment_no": "P15-08", "client_name": "Chị Vân", "survey_time": "09:00 Ngày mai"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_3d_modeling', 'Dựng bản vẽ phối cảnh 3D phòng khách phong cách Indochine', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '480 minutes', '{"designer": "Nguyễn Thanh Sơn", "client_name": "Chị Vân", "revision_limit": 3}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "healthcare_clinic" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_patient_reception', 'Tiếp nhận khám sức khỏe định kỳ doanh nghiệp VNG', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '10 minutes', '{"company": "VNG Corporation", "patient_count": 45, "coordinator": "Bác sĩ Minh"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_clinical_exam', 'Khám lâm sàng răng hàm mặt - Điều trị tủy răng', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"patient_name": "Đặng Quốc Khánh", "doctor_in_charge": "Nha sĩ Hoàng", "treatment_room": "Room 03"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "real_estate" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_listing_verification', 'Xác thực sổ đỏ và tình trạng pháp lý nhà phố Quận 2', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"address": "45 Đường số 8, Thảo Điền, Q2", "owner_name": "Ông Lê Văn Hùng", "asking_price_vnd": 12500000000}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_viewing_schedule', 'Dẫn khách xem căn hộ Penthouse Landmark 81', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '120 minutes', '{"client_name": "Anh Robert Chen", "agent_id": "agent_lan_huong", "schedule_time": "15:00 Chủ Nhật"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "manufacturing_sme" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_work_order_intake', 'Gia công sản xuất 500 bộ bàn ghế học sinh xuất khẩu', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '60 minutes', '{"order_no": "PO-2026-889", "client": "EduWood Japan", "material_spec": "Gỗ cao su tự nhiên"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_assembly_production', 'Cắt và may ráp đợt 1: 1000 áo thun đồng phục FPT', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '120 minutes', '{"line_no": "Line 02", "production_manager": "Tổ trưởng Thủy", "target_date": "2026-07-08"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    } else if payload.template_id == "auto_repair" {
        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_vehicle_reception', 'Tiếp nhận chẩn đoán lỗi động cơ xe Mercedes C200', 'HIGH', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '30 minutes', '{"plate_no": "30F-998.27", "owner": "Anh Tấn", "error_code_scanned": "P0300 (Misfire)"}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

        sqlx::query(r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, priority, status, category, due_at, metadata)
            VALUES ($1, 'q_repair_execution', 'Thay má phanh và bảo dưỡng định kỳ Toyota Vios', 'MEDIUM', 'UNASSIGNED', 'OPERATIONS', CURRENT_TIMESTAMP + INTERVAL '240 minutes', '{"plate_no": "51G-123.45", "mechanic_assigned": "KTV Quốc", "parts_needed": ["Má phanh trước", "Lọc nhớt", "Dầu Castrol"]}')
        "#)
        .bind(tenant.tenant_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;
    }

    tx.commit().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    Ok(Json(json!({
        "status": "SUCCESS",
        "message": format!("Khởi tạo gói mẫu {} thành công và gieo mầm dữ liệu.", template.get::<String, _>("name"))
    })))
}

// --------------------------------------------------------------------------
// 2. GET /api/v1/tenants/policies - Lấy chính sách của Tenant
// --------------------------------------------------------------------------
pub async fn get_tenant_policies(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let row = sqlx::query(r#"
        SELECT sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode
        FROM nf_core.tenant_policies
        WHERE tenant_id = $1
    "#)
    .bind(tenant.tenant_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let policies = match row {
        Some(r) => json!({
            "sla_minutes_default": r.get::<i32, _>("sla_minutes_default"),
            "sla_minutes_high": r.get::<i32, _>("sla_minutes_high"),
            "auto_assignment_enabled": r.get::<bool, _>("auto_assignment_enabled"),
            "routing_mode": r.get::<String, _>("routing_mode"),
        }),
        None => {
            // Seed mặc định và trả về
            sqlx::query(r#"
                INSERT INTO nf_core.tenant_policies (tenant_id, sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode)
                VALUES ($1, 60, 30, FALSE, 'FIFO')
            "#)
            .bind(tenant.tenant_id)
            .execute(&state.pool)
            .await
            .map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
            })?;

            json!({
                "sla_minutes_default": 60,
                "sla_minutes_high": 30,
                "auto_assignment_enabled": false,
                "routing_mode": "FIFO",
            })
        }
    };

    Ok(Json(policies))
}

// --------------------------------------------------------------------------
// 3. POST /api/v1/tenants/policies - Cập nhật chính sách của Tenant
// --------------------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct UpdatePoliciesRequest {
    pub sla_minutes_default: i32,
    pub sla_minutes_high: i32,
    pub auto_assignment_enabled: bool,
    pub routing_mode: String,
}

pub async fn update_tenant_policies(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<UpdatePoliciesRequest>,
) -> Result<impl IntoResponse, Response> {
    sqlx::query(r#"
        INSERT INTO nf_core.tenant_policies (tenant_id, sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (tenant_id) DO UPDATE 
        SET 
            sla_minutes_default = EXCLUDED.sla_minutes_default,
            sla_minutes_high = EXCLUDED.sla_minutes_high,
            auto_assignment_enabled = EXCLUDED.auto_assignment_enabled,
            routing_mode = EXCLUDED.routing_mode,
            updated_at = CURRENT_TIMESTAMP
    "#)
    .bind(tenant.tenant_id)
    .bind(payload.sla_minutes_default)
    .bind(payload.sla_minutes_high)
    .bind(payload.auto_assignment_enabled)
    .bind(&payload.routing_mode)
    .execute(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    Ok(Json(json!({
        "status": "SUCCESS",
        "message": "Cập nhật chính sách vận hành của doanh nghiệp thành công."
    })))
}

// 2. Lấy danh sách Gói Mẫu (Template Packs)
pub async fn list_template_packs(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(r#"
        SELECT id, name, description, industry, config_metadata
        FROM nf_core.template_packs
        ORDER BY created_at ASC, id ASC
    "#)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let templates: Vec<Value> = rows.into_iter().map(|row| {
        json!({
            "id": row.get::<String, _>("id"),
            "name": row.get::<String, _>("name"),
            "description": row.get::<String, _>("description"),
            "industry": row.get::<String, _>("industry"),
            "config_metadata": row.get::<Value, _>("config_metadata")
        })
    }).collect();

    Ok((StatusCode::OK, Json(templates)))
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: Option<String>,
    pub is_active: Option<bool>,
}

pub async fn list_tenant_users(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Result<impl IntoResponse, Response> {
    let rows = sqlx::query(r#"
        SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
        FROM nf_core.users
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#)
    .bind(tenant.tenant_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let users: Vec<Value> = rows.into_iter().map(|row| {
        json!({
            "id": row.get::<Uuid, _>("id"),
            "email": row.get::<String, _>("email"),
            "first_name": row.get::<String, _>("first_name"),
            "last_name": row.get::<String, _>("last_name"),
            "role": row.get::<String, _>("role"),
            "is_active": row.get::<bool, _>("is_active"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
            "updated_at": row.get::<chrono::DateTime<Utc>, _>("updated_at")
        })
    }).collect();

    Ok((StatusCode::OK, Json(users)))
}

pub async fn create_tenant_user(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, Response> {
    if payload.email.trim().is_empty() || payload.first_name.trim().is_empty() || payload.last_name.trim().is_empty() {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "Các trường email, first_name, và last_name không được để trống."
                }
            })),
        )
            .into_response());
    }

    // Check if email already exists for this tenant
    let exists = sqlx::query("SELECT id FROM nf_core.users WHERE tenant_id = $1 AND email = $2")
        .bind(tenant.tenant_id)
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    if exists.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({
                "error": {
                    "code": "ALREADY_EXISTS",
                    "message": "Email nhân sự đã tồn tại trong doanh nghiệp này."
                }
            })),
        )
            .into_response());
    }

    let default_password_hash = hash("Sme_Nextflow_2026!", 4).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": { "code": "SYSTEM_FAULT", "message": "Lỗi máy chủ khi mã hóa mật khẩu." } })),
        )
            .into_response()
    })?;

    let row = sqlx::query(r#"
        INSERT INTO nf_core.users (tenant_id, email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id, email, first_name, last_name, role, is_active, created_at
    "#)
    .bind(tenant.tenant_id)
    .bind(&payload.email)
    .bind(default_password_hash)
    .bind(&payload.first_name)
    .bind(&payload.last_name)
    .bind(&payload.role)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let res = json!({
        "id": row.get::<Uuid, _>("id"),
        "email": row.get::<String, _>("email"),
        "first_name": row.get::<String, _>("first_name"),
        "last_name": row.get::<String, _>("last_name"),
        "role": row.get::<String, _>("role"),
        "is_active": row.get::<bool, _>("is_active"),
        "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at")
    });

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn update_tenant_user(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<impl IntoResponse, Response> {
    // Verify user exists in tenant
    let check = sqlx::query("SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2")
        .bind(user_id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    if check.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Không tìm thấy người dùng trong doanh nghiệp này."
                }
            })),
        )
            .into_response());
    }

    let row = sqlx::query(r#"
        UPDATE nf_core.users
        SET first_name = COALESCE($3, first_name),
            last_name = COALESCE($4, last_name),
            role = COALESCE($5, role),
            is_active = COALESCE($6, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND tenant_id = $2
        RETURNING id, email, first_name, last_name, role, is_active, updated_at
    "#)
    .bind(user_id)
    .bind(tenant.tenant_id)
    .bind(payload.first_name)
    .bind(payload.last_name)
    .bind(payload.role)
    .bind(payload.is_active)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
    })?;

    let res = json!({
        "id": row.get::<Uuid, _>("id"),
        "email": row.get::<String, _>("email"),
        "first_name": row.get::<String, _>("first_name"),
        "last_name": row.get::<String, _>("last_name"),
        "role": row.get::<String, _>("role"),
        "is_active": row.get::<bool, _>("is_active"),
        "updated_at": row.get::<chrono::DateTime<Utc>, _>("updated_at")
    });

    Ok((StatusCode::OK, Json(res)))
}

pub async fn delete_tenant_user(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, Response> {
    // Verify user exists in tenant
    let check = sqlx::query("SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2")
        .bind(user_id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    if check.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Không tìm thấy người dùng trong doanh nghiệp này."
                }
            })),
        )
            .into_response());
    }

    // 1. Remove from queue memberships first to satisfy foreign key constraint
    sqlx::query("DELETE FROM nf_core.queue_members WHERE user_id = $1")
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    // 2. Nullify assignee_id in work_items
    sqlx::query("UPDATE nf_core.work_items SET assignee_id = NULL WHERE assignee_id = $1")
        .bind(user_id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    // 3. Delete the user
    sqlx::query("DELETE FROM nf_core.users WHERE id = $1 AND tenant_id = $2")
        .bind(user_id)
        .bind(tenant.tenant_id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response()
        })?;

    Ok(Json(json!({
        "status": "DELETED",
        "message": "Xoá nhân sự khỏi hệ thống thành công."
    })))
}

