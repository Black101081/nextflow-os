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
pub struct EcosystemTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub queues: Vec<TemplateQueue>,
    pub policies: Vec<TemplatePolicy>,
    pub sops: Vec<TemplateSop>,
}

#[derive(Debug, Deserialize)]
pub struct InstallTemplateRequest {
    pub template_id: String,
}

pub async fn list_templates() -> Result<Json<Vec<Value>>, Response> {
    let mut templates = Vec::new();
    
    // Read fnb_pack.json
    if let Ok(content) = std::fs::read_to_string("src/templates/fnb_pack.json") {
        if let Ok(json) = serde_json::from_str::<Value>(&content) {
            templates.push(json);
        }
    }
    
    // Read retail_pack.json
    if let Ok(content) = std::fs::read_to_string("src/templates/retail_pack.json") {
        if let Ok(json) = serde_json::from_str::<Value>(&content) {
            templates.push(json);
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

    let filename = match payload.template_id.as_str() {
        "tpl_fnb_standard" => "fnb_pack.json",
        "tpl_retail_standard" => "retail_pack.json",
        _ => return Err((StatusCode::NOT_FOUND, Json(json!({"error": "Template not found"}))).into_response()),
    };

    let filepath = format!("src/templates/{}", filename);
    let content = std::fs::read_to_string(&filepath).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to read template file"}))).into_response()
    })?;

    let template: EcosystemTemplate = serde_json::from_str(&content).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid template format"}))).into_response()
    })?;

    // 1. Create Queues
    for q in template.queues {
        let q_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO nf_queues (id, tenant_id, name, description, priority, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            "#
        )
        .bind(q_id)
        .bind(tenant_id)
        .bind(q.name)
        .bind(q.description)
        .bind(q.priority)
        .execute(&state.pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to create queue"}))).into_response())?;
    }

    // 2. Create Policies
    for p in template.policies {
        let p_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO nf_sla_policies (id, tenant_id, name, description, target_type, target_value, warning_threshold, action_on_breach)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#
        )
        .bind(p_id)
        .bind(tenant_id)
        .bind(p.name)
        .bind(p.description)
        .bind(p.target_type)
        .bind(p.target_value)
        .bind(0.8)
        .bind(p.action)
        .execute(&state.pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to create SLA policy"}))).into_response())?;
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
            INSERT INTO nf_intelligence.knowledge_base (id, tenant_id, title, content_hash, doc_type, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            "#
        )
        .bind(sop_id)
        .bind(tenant_id)
        .bind(&sop.title)
        .bind(content_hash)
        .bind("TEMPLATE_SOP")
        .execute(&state.pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to create SOP"}))).into_response())?;

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

    Ok(Json(json!({
        "status": "success",
        "message": format!("Template '{}' installed successfully", template.name)
    })))
}
