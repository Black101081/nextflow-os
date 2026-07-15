use axum::{
    extract::{State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplateQueue {
    pub name: String,
    pub description: String,
    pub priority: i32,
    pub color: String,
    pub icon: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplatePolicy {
    pub name: String,
    pub description: String,
    pub target_type: String,
    pub target_value: String,
    pub action: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplateSop {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplateEntity {
    pub name: String,
    pub system_name: String,
    pub description: String,
    pub schema: Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplateWorkflow {
    pub name: String,
    pub trigger_event: String,
    pub dag: Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TemplateConnector {
    pub name: String,
    pub settings: Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct EcosystemTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    #[serde(default)]
    pub queues: Vec<TemplateQueue>,
    #[serde(default)]
    pub policies: Vec<TemplatePolicy>,
    #[serde(default)]
    pub sops: Vec<TemplateSop>,
    #[serde(default)]
    pub entities: Vec<TemplateEntity>,
    #[serde(default)]
    pub workflows: Vec<TemplateWorkflow>,
    #[serde(default)]
    pub connectors: Vec<TemplateConnector>,
}

#[derive(Debug, Deserialize)]
pub struct InstallTemplateRequest {
    pub template_id: String,
}

pub async fn list_templates() -> Result<Json<Vec<Value>>, Response> {
    let mut templates = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir("src/templates") {
        for entry in entries.flatten() {
            if let Some(ext) = entry.path().extension() {
                if ext == "json" {
                    if let Ok(content) = std::fs::read_to_string(entry.path()) {
                        if let Ok(json) = serde_json::from_str::<Value>(&content) {
                            templates.push(json);
                        }
                    }
                }
            }
        }
    }

    Ok(Json(templates))
}

use crate::AppState;

pub async fn install_template(
    State(state): State<AppState>,
    tenant_guard: TenantIsolation,
    Json(payload): Json<InstallTemplateRequest>,
) -> Result<Json<Value>, Response> {
    let tenant_id = tenant_guard.tenant_id;
    let tenant_id_str = tenant_id.to_string();

    // 0. Check Idempotency First
    let existing: Option<(i32,)> = sqlx::query_as(
        r#"
        SELECT 1 FROM nf_core.tenant_installed_templates
        WHERE tenant_id = $1 AND template_id = $2
        "#
    )
    .bind(tenant_id)
    .bind(&payload.template_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Database error: {}", e)}))).into_response()
    })?;

    if existing.is_some() {
        return Ok(Json(json!({
            "status": "warning",
            "message": format!("Template '{}' is already installed", payload.template_id)
        })));
    }

    let mut target_content = None;
    if let Ok(entries) = std::fs::read_dir("src/templates") {
        for entry in entries.flatten() {
            if entry.path().extension().and_then(|e| e.to_str()) == Some("json") {
                if let Ok(content) = std::fs::read_to_string(entry.path()) {
                    if let Ok(template_json) = serde_json::from_str::<Value>(&content) {
                        if template_json.get("id").and_then(|i| i.as_str()) == Some(&payload.template_id) {
                            target_content = Some(content);
                            break;
                        }
                    }
                }
            }
        }
    }

    let content = target_content.ok_or_else(|| {
        (StatusCode::NOT_FOUND, Json(json!({"error": "Template not found"}))).into_response()
    })?;

    let template: EcosystemTemplate = serde_json::from_str(&content).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid template format"}))).into_response()
    })?;

    // --- START TRANSACTION ---
    let mut tx = state.pool.begin().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to start transaction: {}", e)}))).into_response()
    })?;

    // Mark as installed
    sqlx::query(
        r#"
        INSERT INTO nf_core.tenant_installed_templates (tenant_id, template_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        "#
    )
    .bind(tenant_id)
    .bind(&payload.template_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to record installation: {}", e)}))).into_response()
    })?;

    // 1. Create Queues
    let mut created_queue_ids = Vec::new();
    for q in template.queues {
        let q_id = format!("q_{}", Uuid::new_v4().simple());
        sqlx::query(
            r#"
            INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
            VALUES ($1, $2, $3, 'OPERATIONS', 'FIFO', 3600)
            "#
        )
        .bind(&q_id)
        .bind(tenant_id)
        .bind(&q.name)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("Queue Insert Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to create queue: {}", e)}))).into_response()
        })?;
        created_queue_ids.push((q_id, q.name.clone()));
    }

    // 2. Create Policies
    if let Some(p) = template.policies.first() {
        let target_val_num = p.target_value.parse::<i32>().unwrap_or(60);
        sqlx::query(
            r#"
            INSERT INTO nf_core.tenant_policies (tenant_id, sla_minutes_default, sla_minutes_high, auto_assignment_enabled, routing_mode)
            VALUES ($1, $2, $3, false, 'FIFO')
            ON CONFLICT (tenant_id) DO UPDATE
            SET sla_minutes_default = EXCLUDED.sla_minutes_default,
                sla_minutes_high = EXCLUDED.sla_minutes_high
            "#
        )
        .bind(tenant_id)
        .bind(target_val_num)
        .bind(if target_val_num > 10 { target_val_num / 2 } else { 5 })
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("Policy Update Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to update policy: {}", e)}))).into_response()
        })?;
    }

    // 3. Create SOPs
    let client = reqwest::Client::new();
    let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8000".to_string());
    
    for sop in template.sops {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(sop.content.as_bytes());
        let content_hash = format!("{:x}", hasher.finalize());
        let sop_id = Uuid::new_v4();

        sqlx::query(
            r#"
            INSERT INTO nf_intelligence.knowledge_base (id, tenant_id, title, content, content_hash, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            "#
        )
        .bind(sop_id)
        .bind(tenant_id)
        .bind(&sop.title)
        .bind(&sop.content)
        .bind(content_hash)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("SOP Insert Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to create SOP: {}", e)}))).into_response()
        })?;

        // Background indexing is not transaction safe, but acceptable
        let _ = client.post(&format!("{}/reindex", ai_service_url))
            .json(&json!({
                "tenant_id": tenant_id_str,
                "documents": [
                    {
                        "title": sop.title,
                        "content": sop.content
                    }
                ]
            }))
            .send()
            .await;
    }

    // 4. Create Entities
    for entity in template.entities {
        let entity_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO nf_meta.entities (id, tenant_id, name, system_name, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            "#
        )
        .bind(entity_id)
        .bind(tenant_id)
        .bind(&entity.name)
        .bind(&entity.system_name)
        .bind(&entity.description)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("Entity Insert Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to create entity: {}", e)}))).into_response()
        })?;

        let schema_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO nf_meta.entity_schemas (id, entity_id, tenant_id, schema_json)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            "#
        )
        .bind(schema_id)
        .bind(entity_id)
        .bind(tenant_id)
        .bind(&entity.schema)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("Entity Schema Insert Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to create entity schema: {}", e)}))).into_response()
        })?;
    }

    // 5. Create Workflows
    for workflow in template.workflows {
        let workflow_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO nf_meta.workflow_definitions (id, tenant_id, name, trigger_event, dag_json)
            VALUES ($1, $2, $3, $4, $5)
            "#
        )
        .bind(workflow_id)
        .bind(tenant_id)
        .bind(&workflow.name)
        .bind(&workflow.trigger_event)
        .bind(&workflow.dag)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("Workflow Insert Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to create workflow: {}", e)}))).into_response()
        })?;
    }

    // 6. Seed realistic tasks
    let first_queue_id = created_queue_ids.first().map(|q| q.0.clone());
    let second_queue_id = created_queue_ids.get(1).map(|q| q.0.clone()).or_else(|| first_queue_id.clone());

    let tasks_to_seed = match template.category.as_str() {
        "retail" => vec![
            ("Kiểm kê hàng tồn kho định kỳ", "Thực hiện đếm số lượng hàng thực tế tại quầy trưng bày A1.", "HIGH", first_queue_id.clone()),
            ("Trưng bày hàng hóa theo sơ đồ", "Sắp xếp lại các kệ nước ngọt theo tiêu chuẩn FIFO mới của tháng.", "MEDIUM", second_queue_id.clone())
        ],
        "fnb" => vec![
            ("Kiểm tra an toàn thực phẩm mở ca", "Kiểm tra nhiệt độ tủ đông, tình trạng dao thớt và vệ sinh bàn chế biến.", "HIGH", first_queue_id.clone()),
            ("Xử lý nguyên liệu tồn cuối ngày", "Rà soát hạn sử dụng sữa hạt và dán nhãn cảnh báo đỏ.", "MEDIUM", second_queue_id.clone())
        ],
        "spa" => vec![
            ("Gọi điện xác nhận lịch hẹn (Lan Nguyễn)", "Xác nhận lịch đặt gói trị liệu da mặt lúc 14h chiều nay.", "HIGH", first_queue_id.clone()),
            ("Gửi form khảo sát dịch vụ sau liệu trình", "Gửi tin nhắn Zalo chăm sóc da sau 24h và ghi nhận phản hồi.", "MEDIUM", second_queue_id.clone())
        ],
        "education" => vec![
            ("Tư vấn tuyển sinh học viên mới", "Gọi điện tư vấn lộ trình học IELTS 6.5 cho học viên đăng ký trên website.", "HIGH", first_queue_id.clone()),
            ("Cập nhật báo cáo học tập tuần", "Chấm điểm bài tập viết luận và gửi nhận xét cho phụ huynh.", "MEDIUM", second_queue_id.clone())
        ],
        "real_estate" => vec![
            ("Xác thực thông tin căn hộ Sunrise City", "Liên hệ chủ nhà kiểm tra sổ hồng và chụp ảnh thực địa căn hộ.", "HIGH", first_queue_id.clone()),
            ("Lên lịch xem nhà dự án Sala", "Dẫn khách hàng VIP xem căn biệt thự song lập khu Saroma.", "MEDIUM", second_queue_id.clone())
        ],
        "services" => vec![
            ("Rà soát hợp đồng pháp lý dự án Alpha", "Kiểm tra lại các điều khoản NDA và phụ lục dịch vụ tư vấn.", "HIGH", first_queue_id.clone()),
            ("Chuẩn bị báo cáo tài chính tháng", "Tổng hợp số liệu hóa đơn đầu vào để nộp báo cáo thuế.", "MEDIUM", second_queue_id.clone())
        ],
        "construction" => vec![
            ("Khảo sát hiện trường công trình Quận 2", "Kiểm tra mặt bằng, đo đạc kích thước thực tế trước khi lên bản vẽ 3D.", "HIGH", first_queue_id.clone()),
            ("Nghiệm thu lắp đặt tủ bếp", "Kiểm tra khớp mút màng sơn và phụ kiện tủ bếp tại căn hộ.", "MEDIUM", second_queue_id.clone())
        ],
        "automotive" => vec![
            ("Chẩn đoán lỗi động cơ Honda Civic", "Sử dụng máy đọc lỗi động cơ OBD2 và đề xuất báo giá linh kiện.", "HIGH", first_queue_id.clone()),
            ("Kiểm tra 20 điểm an toàn định kỳ", "Kiểm tra phanh, lốp, nước làm mát và dầu máy trước khi giao xe.", "MEDIUM", second_queue_id.clone())
        ],
        "logistics" => vec![
            ("Thu gom đơn hàng tại shop Hoa Hồng", "Địa chỉ: 89 CMT8, Quận 3. Gom trước 17h chiều nay.", "HIGH", first_queue_id.clone()),
            ("Xử lý đơn hàng lưu kho quá 48h", "Liên hệ với người nhận để xác minh lại địa chỉ giao hàng.", "MEDIUM", second_queue_id.clone())
        ],
        "manufacturing" => vec![
            ("Cấp phát nguyên vật liệu lô hàng mộc", "Xuất kho gỗ sồi và phụ kiện bản lề cho tổ sản xuất 1.", "HIGH", first_queue_id.clone()),
            ("Kiểm định chất lượng thành phẩm QA", "Đo đạc kích thước dung sai và kiểm tra bề mặt lớp sơn phủ.", "MEDIUM", second_queue_id.clone())
        ],
        "healthcare" => vec![
            ("Tiếp nhận bệnh nhân khám nha khoa", "Kiểm tra thông tin thẻ bảo hiểm và sắp xếp phòng khám răng lâm sàng.", "HIGH", first_queue_id.clone()),
            ("Phát thuốc và tư vấn liều dùng", "Chuẩn bị đơn thuốc số #DR104 và tư vấn chống chỉ định.", "MEDIUM", second_queue_id.clone())
        ],
        "hospitality" => vec![
            ("Gửi mã khóa cửa homestay phòng 302", "Gửi tin nhắn Zalo hướng dẫn check-in tự động cho khách.", "HIGH", first_queue_id.clone()),
            ("Dọn dẹp phòng 204 sau check-out", "Thay chăn ga gối đệm, vệ sinh phòng tắm và bổ sung minibar.", "MEDIUM", second_queue_id.clone())
        ],
        _ => vec![
            ("Nhiệm vụ thực địa mẫu", "Thực hiện khảo sát và chụp ảnh xác minh hiện trường.", "HIGH", first_queue_id.clone())
        ]
    };

    for (title, desc, priority, q_id) in tasks_to_seed {
        sqlx::query(
            r#"
            INSERT INTO nf_core.work_items (tenant_id, queue_id, title, description, priority, status, category)
            VALUES ($1, $2, $3, $4, $5, 'UNASSIGNED', 'OPERATIONS')
            "#
        )
        .bind(tenant_id)
        .bind(q_id)
        .bind(title)
        .bind(desc)
        .bind(priority)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("WorkItem Seed Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to seed work items: {}", e)}))).into_response()
        })?;
    }

    // 7. Fire PubSub event
    let payload_str = json!({ "tenant_id": tenant_id_str, "template_id": payload.template_id }).to_string();
    sqlx::query(&format!("NOTIFY workflow_reload, '{}'", payload_str))
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            println!("PubSub Emit Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to notify engine: {}", e)}))).into_response()
        })?;

    // --- COMMIT TRANSACTION ---
    tx.commit().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to commit transaction: {}", e)}))).into_response()
    })?;

    Ok(Json(json!({
        "status": "success",
        "message": format!("Template '{}' installed successfully", template.name)
    })))
}
