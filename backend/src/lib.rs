pub mod config;
pub mod controllers;
pub mod middleware;
pub mod services;

use axum::routing::{delete, get, patch, post};
use tower_http::cors::{Any, CorsLayer};
use tokio::sync::broadcast;

use crate::controllers::{
    queue::{add_queue_member, claim_next_task, create_queue, get_queue_members, get_queues, route_work_item, remove_queue_member},
    tenant::{sync_tenant_users, initialize_tenant_template, get_tenant_policies, update_tenant_policies, list_template_packs, list_tenant_users, create_tenant_user, update_tenant_user, delete_tenant_user, seed_demo_data},
    work_item::{
        create_work_item, escalate_work_item, get_overdue_work_items, get_work_item,
        get_work_items, trigger_sla_scan, update_work_item_status, upload_work_item_evidence,
        get_exceptions, resolve_exception,
    },
    websocket::ws_handler,
    analytics::get_tenant_kpis,
    oauth::oauth_token,
    kiotviet::kiotviet_webhook,
    analytics_v2::{get_sla_compliance, get_queue_throughput, get_operator_performance, generate_daily_report, get_daily_reports},
    connector::{create_connector, delete_connector, list_connectors, update_connector},
    ai_proxy::{
        ai_sla_risk, ai_sla_risk_batch, ai_routing_recommend, ai_rag_query, ai_health_check, generate_workflow, ai_extract_invoice,
    },
    metrics::{get_metrics, track_metrics},
    platform::{create_tenant, list_tenants, update_tenant, list_templates, get_platform_observability},
    billing::{create_invoice, get_invoices, vietqr_webhook, verify_crypto_payment, verify_invoice_integrity},
    marketplace,
    intelligence,
    entity_records,
    zalo::{zalo_webhook, send_zns},
    integrations::{get_available_integrations, get_tenant_integrations, install_tenant_integration},
    tracking::{get_order_tracking},
    chat::{start_chat, get_messages, send_message, list_open_conversations},
    workflow,
    checkin,
    gamification,
    ecosystem::{list_templates as get_ecosystem_packs, install_template as install_ecosystem_pack},
};


#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub tx: broadcast::Sender<String>,
}

pub fn create_app(pool: sqlx::PgPool) -> axum::Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let (tx, _rx) = broadcast::channel::<String>(100);
    let state = AppState { pool, tx };

    axum::Router::new()
        // Health & WebSocket
        .route("/health", get(|| async {
            axum::Json(serde_json::json!({
                "status": "UP",
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }))
        .route("/ws", get(ws_handler))

        // Auth
        .route("/api/v1/oauth/token", post(oauth_token))

        // Work Items
        .route("/api/v1/work-items", post(create_work_item).get(get_work_items))
        .route("/api/v1/work-items/overdue", get(get_overdue_work_items))
        .route("/api/v1/work-items/trigger-sla", post(trigger_sla_scan))
        .route("/api/v1/work-items/exceptions", get(get_exceptions))
        .route("/api/v1/work-items/exceptions/:id/resolve", post(resolve_exception))
        .route("/api/v1/work-items/:id", get(get_work_item))
        .route("/api/v1/work-items/:id/status", patch(update_work_item_status))
        .route("/api/v1/work-items/:id/route", post(route_work_item))
        .route("/api/v1/work-items/:id/evidence", post(upload_work_item_evidence))
        .route("/api/v1/work-items/:id/escalate", post(escalate_work_item))

        // Queues — thêm GET /queues và claim-next
        .route("/api/v1/queues", post(create_queue).get(get_queues))
        .route("/api/v1/queues/:id/members", post(add_queue_member).get(get_queue_members))
        .route("/api/v1/queues/:id/members/:user_id", delete(remove_queue_member))
        .route("/api/v1/queues/:id/claim-next", post(claim_next_task))

        // Tenant & User Sync / CRUD
        .route("/api/v1/tenants/:tenant_id/users/sync", post(sync_tenant_users))
        .route("/api/v1/tenants/users", get(list_tenant_users).post(create_tenant_user))
        .route("/api/v1/tenants/users/:id", patch(update_tenant_user).delete(delete_tenant_user))
        .route("/api/v1/tenants/initialize-template", post(initialize_tenant_template))
        .route("/api/v1/tenants/templates", get(list_template_packs))
        .route("/api/v1/tenants/policies", get(get_tenant_policies).post(update_tenant_policies))
        .route("/api/v1/tenants/seed-demo", post(seed_demo_data))

        // Platform Admin Tenant Management
        .route("/api/v1/platform/tenants", post(create_tenant).get(list_tenants))
        .route("/api/v1/platform/tenants/:id", patch(update_tenant))
        .route("/api/v1/platform/templates", get(list_templates))
        .route("/api/v1/platform/observability", get(get_platform_observability))

        // Analytics
        .route("/api/v1/analytics/kpis", get(get_tenant_kpis))
        .route("/api/v1/analytics/sla-compliance", get(get_sla_compliance))
        .route("/api/v1/analytics/queue-throughput", get(get_queue_throughput))
        .route("/api/v1/analytics/operator-performance", get(get_operator_performance))
        .route("/api/v1/analytics/generate-daily-report", post(generate_daily_report))
        .route("/api/v1/analytics/daily-reports", get(get_daily_reports))
        .route("/api/v1/marketplace/extensions/submit", post(marketplace::submit_extension))
        .route("/api/v1/marketplace/extensions/recommendations", get(marketplace::get_recommendations))
        .route("/api/v1/marketplace/extensions", get(marketplace::get_all_extensions))

        // Connectors
        .route("/api/v1/connectors/kiotviet/webhook", post(kiotviet_webhook))
        .route("/api/v1/connectors/zalo/webhook", post(zalo_webhook))
        .route("/api/v1/connectors/zalo/zns/send", post(send_zns))
        .route("/api/v1/connectors/configs", post(create_connector).get(list_connectors))
        .route("/api/v1/connectors/configs/:id", patch(update_connector).delete(delete_connector))

        // Integrations (App Store)
        .route("/api/v1/integrations/available", get(get_available_integrations))
        .route("/api/v1/tenants/integrations", get(get_tenant_integrations))
        .route("/api/v1/tenants/integrations/:connector_name", post(install_tenant_integration))

        // Public Tracking (End Customer Portal)
        .route("/api/v1/tracking/:id", get(get_order_tracking))

        // AI Intelligence Layer (Phase 6)
        .route("/api/v1/ai/health", get(ai_health_check))
        .route("/api/v1/ai/sla-risk", post(ai_sla_risk))
        .route("/api/v1/ai/sla-risk/batch", post(ai_sla_risk_batch))
        .route("/api/v1/ai/routing-recommend", post(ai_routing_recommend))
        .route("/api/v1/ai/rag-query", post(ai_rag_query))
        .route("/api/v1/ai/generate-workflow", post(generate_workflow))
        .route("/api/v1/ai/extract-invoice", post(ai_extract_invoice))

        // Billing & Payments
        .route("/api/v1/billing/invoices", post(create_invoice).get(get_invoices))
        .route("/api/v1/billing/webhooks/vietqr", post(vietqr_webhook))
        .route("/api/v1/billing/crypto/verify", post(verify_crypto_payment))
        .route("/api/v1/billing/invoices/:id/verify-integrity", get(verify_invoice_integrity))

        // Ecosystem Templates
        .route("/api/v1/ecosystem/templates", get(get_ecosystem_packs))
        .route("/api/v1/ecosystem/install-template", post(install_ecosystem_pack))

        // AI & Intelligence
        .route("/api/v1/intelligence/ask-assistant", post(intelligence::ask_assistant))
        .route("/api/v1/intelligence/auto-triage", post(intelligence::auto_triage))
        .route("/api/v1/intelligence/knowledge-base", get(intelligence::list_knowledge_base).post(intelligence::create_knowledge_base))
        .route("/api/v1/intelligence/knowledge-base/:id", delete(intelligence::delete_knowledge_base))

        // No-code / Dynamic Entities
        .route("/api/v1/meta/entities", get(entity_records::get_entities).post(entity_records::create_entity))
        .route("/api/v1/meta/entities/:system_name/schema", get(entity_records::get_entity_schema))
        .route("/api/v1/meta/records", post(entity_records::create_entity_record))
        
        // Automation / Workflows
        .route("/api/v1/meta/workflows", get(workflow::get_workflows).post(workflow::create_workflow))

        // Omni-Channel Chat
        .route("/api/v1/chat/start", post(start_chat))
        .route("/api/v1/chat/conversations", get(list_open_conversations))
        .route("/api/v1/chat/:conversation_id/messages", get(get_messages).post(send_message))
        
        // Field Worker Checkin
        .route("/api/v1/field/checkin", post(checkin::create_checkin).get(checkin::get_checkins))
        
        // Gamification
        .route("/api/v1/gamification/leaderboard", get(gamification::get_leaderboard))
        .route("/api/v1/gamification/my-points", get(gamification::get_my_points))
        .route("/api/v1/gamification/award", post(gamification::award_points))

        // Metrics endpoint
        .route("/metrics", get(get_metrics))

        // Middleware layer for tracking Prometheus HTTP metrics
        .layer(axum::middleware::from_fn(track_metrics))
        .with_state(state)
        .layer(cors)
}

