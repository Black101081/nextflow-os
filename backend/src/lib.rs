pub mod config;
pub mod controllers;
pub mod middleware;
pub mod services;

use axum::routing::{delete, get, patch, post, put};
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
    hubspot::hubspot_webhook,
    analytics_v2::{get_sla_compliance, get_queue_throughput, get_operator_performance, generate_daily_report, get_daily_reports},
    connector::{create_connector, delete_connector, list_connectors, update_connector},
    ai_proxy::{
        ai_sla_risk, ai_sla_risk_batch, ai_routing_recommend, ai_health_check, generate_workflow, ai_extract_invoice,
        ai_drug_interaction, ai_lead_scoring, ai_route_optimization, ai_demand_forecasting, ai_dynamic_pricing,
    },
    metrics::{get_metrics, track_metrics},
    platform::{create_tenant, list_tenants, update_tenant, list_templates, get_platform_observability, get_platform_users, get_platform_billing_overview, get_platform_audit_logs, get_platform_webhook_stats, get_platform_ai_usage},
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
    customer_crm::{list_customers, run_ai_segmentation},
    ecosystem::{list_templates as get_ecosystem_packs, install_template as install_ecosystem_pack},
    blockchain,
    observability,
    platform_maturity::{
        list_feature_flags, create_feature_flag, update_feature_flag, evaluate_feature_flags,
        provision_tenant, get_tenant_health, migrate_tenant_data,
        get_security_threats, get_security_access_logs, get_compliance_report,
        get_revenue_mrr, get_revenue_cohorts, get_revenue_forecasts
    },
    fb_pack,
    spa_pack,
    auto_pack,
    edu_pack,
    hosp_pack,
    re_pack,
    log_pack,
    phar_pack,
    mfg_pack,
    const_pack,
    ps_pack,
    finance,
    hr,
    inventory,
    operations,
    front_facing,
    security_health,
    crm_extra,
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
        .route("/api/v1/platform/observability/ai-insight", get(observability::get_ai_insight).with_state(std::sync::Arc::new(state.clone())))
        .route("/api/v1/platform/users", get(get_platform_users))
        .route("/api/v1/platform/billing/invoices", get(get_platform_billing_overview))
        .route("/api/v1/platform/audit-logs", get(get_platform_audit_logs))
        .route("/api/v1/platform/webhook-stats", get(get_platform_webhook_stats))
        .route("/api/v1/platform/ai-usage", get(get_platform_ai_usage))
        .route("/api/v1/platform/blockchain/ledger", get(controllers::blockchain_explorer::get_ledger))

        // Phase E: Platform Maturity (Security, Revenue, TLM, Feature Flags)
        .route("/api/v1/platform/tenants/provision", post(provision_tenant))
        .route("/api/v1/platform/tenants/:id/health-score", get(get_tenant_health))
        .route("/api/v1/platform/tenants/:id/migrate", post(migrate_tenant_data))
        .route("/api/v1/platform/security/threats", get(get_security_threats))
        .route("/api/v1/platform/security/access-logs", get(get_security_access_logs))
        .route("/api/v1/platform/security/compliance-report", get(get_compliance_report))
        .route("/api/v1/platform/revenue/mrr", get(get_revenue_mrr))
        .route("/api/v1/platform/revenue/cohorts", get(get_revenue_cohorts))
        .route("/api/v1/platform/revenue/forecasts", get(get_revenue_forecasts))
        .route("/api/v1/platform/feature-flags", get(list_feature_flags).post(create_feature_flag))
        .route("/api/v1/platform/feature-flags/:id", put(update_feature_flag))
        .route("/api/v1/platform/feature-flags/evaluate", get(evaluate_feature_flags))

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
        .route("/api/v1/marketplace/install-vertical", post(marketplace::install_vertical_pack))

        // Connectors
        .route("/api/v1/connectors/kiotviet/webhook", post(kiotviet_webhook))
        .route("/api/v1/connectors/hubspot/webhook", post(hubspot_webhook))
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
        .route("/api/v1/ai/generate-workflow", post(generate_workflow))
        .route("/api/v1/ai/extract-invoice", post(ai_extract_invoice))
        .route("/api/v1/ai/pharmacy/drug-interaction", post(ai_drug_interaction))
        .route("/api/v1/ai/real-estate/lead-score", post(ai_lead_scoring))
        .route("/api/v1/ai/logistics/route-optimize", post(ai_route_optimization))
        .route("/api/v1/ai/retail-fnb/demand-forecast", post(ai_demand_forecasting))
        .route("/api/v1/ai/hospitality/dynamic-price", post(ai_dynamic_pricing))

        // Billing & Payments
        .route("/api/v1/billing/invoices", post(create_invoice).get(get_invoices))
        .route("/api/v1/billing/webhooks/vietqr", post(vietqr_webhook))
        .route("/api/v1/billing/crypto/verify", post(verify_crypto_payment))
        .route("/api/v1/billing/invoices/:id/verify-integrity", get(verify_invoice_integrity))

        // Blockchain (Simulation/Integration)
        .route("/api/v1/blockchain/anchor", post(blockchain::anchor_data))

        // Ecosystem Templates
        .route("/api/v1/ecosystem/templates", get(get_ecosystem_packs))
        .route("/api/v1/ecosystem/install-template", post(install_ecosystem_pack))

        // Intelligence & AI
        .route("/api/v1/intelligence/auto-triage", post(intelligence::auto_triage))
        .route("/api/v1/intelligence/ask-assistant", post(intelligence::ask_assistant))
        .route("/api/v1/intelligence/knowledge-base", get(intelligence::list_knowledge_base))
        .route("/api/v1/intelligence/knowledge-base", post(intelligence::create_knowledge_base))
        .route("/api/v1/intelligence/knowledge-base/:id", delete(intelligence::delete_knowledge_base))
        .route("/api/v1/intelligence/analyze-sentiment", post(intelligence::analyze_sentiment))
        .route("/api/v1/intelligence/analyze-fraud", post(intelligence::analyze_fraud))
        .route("/api/v1/intelligence/analyze-burnout", post(intelligence::analyze_burnout))

        // No-code / Dynamic Entities
        .route("/api/v1/meta/entities", get(entity_records::get_entities).post(entity_records::create_entity))
        .route("/api/v1/meta/entities/:system_name/schema", get(entity_records::get_entity_schema))
        .route("/api/v1/meta/records", post(entity_records::create_entity_record))
        
        // Automation / Workflows
        .route("/api/v1/meta/workflows", get(workflow::get_workflows).post(workflow::create_workflow))
        .route("/api/v1/meta/workflows/:id/toggle", axum::routing::put(workflow::toggle_workflow))

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
        .route("/api/v1/gamification/redeem-voucher", post(gamification::redeem_voucher))

        // F&B Solution Pack
        .route("/api/v1/fb/auto-order", post(fb_pack::auto_order))
        .route("/api/v1/fb/orders", get(fb_pack::get_orders).post(fb_pack::create_order))
        .route("/api/v1/fb/orders/:id/status", axum::routing::put(fb_pack::update_order_status))
        .route("/api/v1/fb/shifts", get(fb_pack::get_shifts).post(fb_pack::create_shift))
        .route("/api/v1/fb/ingredient-checks", get(fb_pack::get_ingredient_checks).post(fb_pack::create_ingredient_check))
        .route("/api/v1/fb/menu-items", get(fb_pack::get_menu_items).post(fb_pack::create_menu_item))

        // Edu & Training Pack
        .route("/api/v1/edu/students", get(edu_pack::get_students).post(edu_pack::create_student))
        .route("/api/v1/edu/grade-records", get(edu_pack::get_grade_records).post(edu_pack::create_grade_record))
        .route("/api/v1/edu/payments", get(edu_pack::get_payments).post(edu_pack::create_payment))
        .route("/api/v1/edu/classes", get(edu_pack::get_classes).post(edu_pack::create_class))

        // Spa & Clinic Pack
        .route("/api/v1/spa/bookings", get(spa_pack::get_bookings).post(spa_pack::create_booking))
        .route("/api/v1/spa/bookings/:id", axum::routing::put(spa_pack::update_booking_status))
        .route("/api/v1/spa/skin-profiles", post(spa_pack::upsert_skin_profile))
        .route("/api/v1/spa/skin-profiles/:customer_id", get(spa_pack::get_skin_profile))
        .route("/api/v1/spa/courses", get(spa_pack::get_courses).post(spa_pack::create_course))
        .route("/api/v1/spa/courses/use/:id", post(spa_pack::use_course_session))

        // Auto Repair & Garage Pack
        .route("/api/v1/garage/vehicles", get(auto_pack::search_vehicles).post(auto_pack::register_vehicle))
        .route("/api/v1/garage/repair-orders", get(auto_pack::get_repair_orders).post(auto_pack::create_repair_order))
        .route("/api/v1/garage/repair-orders/:id/approve", axum::routing::put(auto_pack::approve_repair_order))
        .route("/api/v1/garage/repair-orders/:id/complete", axum::routing::put(auto_pack::complete_repair_order))

        // Hospitality Pack
        .route("/api/v1/hosp/rooms", get(hosp_pack::get_rooms).post(hosp_pack::create_room))
        .route("/api/v1/hosp/bookings", get(hosp_pack::get_bookings).post(hosp_pack::create_booking))
        .route("/api/v1/hosp/bookings/:id/status", axum::routing::put(hosp_pack::update_booking_status))
        .route("/api/v1/hosp/service-requests", get(hosp_pack::get_service_requests).post(hosp_pack::create_service_request))
        .route("/api/v1/hosp/service-requests/:id/status", axum::routing::put(hosp_pack::update_service_status))

        // Real Estate Pack
        .route("/api/v1/re/listings", get(re_pack::get_listings).post(re_pack::create_listing))
        .route("/api/v1/re/leads", get(re_pack::get_leads).post(re_pack::create_lead))
        .route("/api/v1/re/deals", get(re_pack::get_deals).post(re_pack::create_deal))
        .route("/api/v1/re/deals/:id/stage", axum::routing::put(re_pack::update_deal_stage))

        // Logistics & Delivery Pack
        .route("/api/v1/log/waybills", get(log_pack::get_waybills).post(log_pack::create_waybill))
        .route("/api/v1/log/cod-reconciliations", get(log_pack::get_reconciliations).post(log_pack::create_reconciliation))
        .route("/api/v1/log/cod-reconciliations/:id/status", axum::routing::put(log_pack::update_reconciliation_status))

        // Pharmacy & Healthcare Pack
        .route("/api/v1/phar/prescriptions", get(phar_pack::get_prescriptions).post(phar_pack::create_prescription))
        .route("/api/v1/phar/inventory", get(phar_pack::get_inventory).post(phar_pack::create_inventory_item))
        .route("/api/v1/phar/patient-records", get(phar_pack::get_patients).post(phar_pack::create_patient))

        // Micro-Manufacturing Pack
        .route("/api/v1/mfg/work-orders", get(mfg_pack::get_work_orders).post(mfg_pack::create_work_order))
        .route("/api/v1/mfg/boms", get(mfg_pack::get_boms).post(mfg_pack::create_bom))
        .route("/api/v1/mfg/qc-reports", get(mfg_pack::get_qc_reports).post(mfg_pack::create_qc_report))

        // Contractor & Interior Pack
        .route("/api/v1/const/projects", get(const_pack::get_projects).post(const_pack::create_project))
        .route("/api/v1/const/daily-logs", get(const_pack::get_daily_logs).post(const_pack::create_daily_log))
        .route("/api/v1/const/material-requests", get(const_pack::get_material_requests).post(const_pack::create_material_request))

        // Professional Services Pack
        .route("/api/v1/ps/clients", get(ps_pack::get_clients).post(ps_pack::create_client))
        .route("/api/v1/ps/contracts", get(ps_pack::get_contracts).post(ps_pack::create_contract))
        .route("/api/v1/ps/tax-filings", get(ps_pack::get_tax_filings).post(ps_pack::create_tax_filing))

        // CRM & Phân Khúc Khách Hàng
        .route("/api/v1/customers", get(list_customers))
        .route("/api/v1/customers/segment", post(run_ai_segmentation))

        // Finance Module
        .route("/api/v1/finance/accounts", get(finance::get_accounts).post(finance::create_account))
        .route("/api/v1/finance/transactions", get(finance::get_transactions).post(finance::create_transaction))
        .route("/api/v1/finance/invoices", get(finance::get_invoices).post(finance::create_invoice))

        // HR Module
        .route("/api/v1/hr/employees", get(hr::get_employees).post(hr::create_employee))
        .route("/api/v1/hr/attendance", get(hr::get_attendance).post(hr::create_attendance))

        // Inventory Module
        .route("/api/v1/inventory/warehouses", get(inventory::get_warehouses).post(inventory::create_warehouse))
        .route("/api/v1/inventory/products", get(inventory::get_products).post(inventory::create_product))

        // Operations Module
        .route("/api/v1/operations/contracts", get(operations::get_contracts).post(operations::create_contract))
        .route("/api/v1/operations/assets", get(operations::get_assets).post(operations::create_asset))
        .route("/api/v1/operations/projects", get(operations::get_projects).post(operations::create_project))
        .route("/api/v1/operations/channels", get(operations::get_channels).post(operations::create_channel))

        // Front-Facing Module (POS & Bookings)
        .route("/api/v1/front/bookings", get(front_facing::get_bookings).post(front_facing::create_booking))
        .route("/api/v1/front/pos-sessions", get(front_facing::get_pos_sessions).post(front_facing::open_pos_session))
        .route("/api/v1/front/pos-orders", post(front_facing::create_pos_order))

        // Health & Security Module
        .route("/api/v1/health-security/whitelist", get(security_health::get_whitelist).post(security_health::add_to_whitelist))
        .route("/api/v1/health-security/whitelist/:id", delete(security_health::remove_from_whitelist))
        .route("/api/v1/health-security/events", get(security_health::get_security_events))
        .route("/api/v1/health-security/score", get(security_health::get_health_score))

        // Metrics endpoint
        .route("/metrics", get(get_metrics))

        // Middleware layer for tracking Prometheus HTTP metrics
        .layer(axum::middleware::from_fn(track_metrics))
        .with_state(state)
        .layer(cors)
}

