use bcrypt::hash;
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use tokio::net::TcpListener;
use uuid::Uuid;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "d290f1ee-6c54-4b01-90e6-d701748f0851";
const TEST_USER_ID: &str   = "8f3b2a1a-4c54-4b01-90e6-d701748f0851";
const TEST_QUEUE_ID: &str  = "q_test_analytics";

async fn setup_analytics_test_db(pool: &PgPool) {
    // Dọn sạch tất cả bảng liên quan
    sqlx::query("TRUNCATE nf_analytics.fact_work_item_lifecycle, nf_analytics.fact_sla_violation_events, nf_analytics.fact_integration_runs, nf_analytics.change_events, nf_analytics.dim_user, nf_analytics.dim_queue, nf_analytics.dim_tenant CASCADE")
        .execute(pool).await.unwrap();

    sqlx::query("TRUNCATE nf_core.task_exceptions, nf_core.work_items, nf_core.users, nf_core.queues, nf_core.tenants CASCADE")
        .execute(pool).await.unwrap();

    sqlx::query(
        "INSERT INTO nf_core.roles (id, name, description, is_system_role) VALUES
         ('SME_LEADER', 'Leader / Owner', 'Chủ doanh nghiệp, có toàn quyền trên hệ thống', TRUE),
         ('SME_SUPERVISOR', 'Supervisor / Manager', 'Quản lý, có quyền phân việc và xem báo cáo vận hành', TRUE),
         ('SME_OPS', 'Operator / Staff', 'Nhân viên văn phòng, xử lý công việc', TRUE),
         ('FIELD_WORKER', 'Field Worker', 'Nhân viên hiện trường', TRUE)
         ON CONFLICT (id) DO NOTHING"
    )
    .execute(pool).await.unwrap();

    // Seed tenant — CDC trigger sẽ tự sync vào dim_tenant
    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier)
         VALUES ($1, 'Analytics Test Corp', 'analytics-test.com', 'ACTIVE', 'STANDARD')"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool).await.unwrap();

    // Seed user — CDC trigger sẽ tự sync vào dim_user
    let pw = hash("test_password_123", 4).unwrap();
    sqlx::query(
        "INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, 'analyst@analytics-test.com', $3, 'Test', 'Analyst', 'SME_OPS', true)"
    )
    .bind(Uuid::parse_str(TEST_USER_ID).unwrap())
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .bind(pw)
    .execute(pool).await.unwrap();

    // Seed queue — CDC trigger sẽ tự sync vào dim_queue
    sqlx::query(
        "INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
         VALUES ($1, $2, 'Analytics Test Queue', 'GENERAL', 'FIFO', 3600)"
    )
    .bind(TEST_QUEUE_ID)
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool).await.unwrap();
}

async fn spawn_app(pool: PgPool) -> String {
    let app = create_app(pool);
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move { axum::serve(listener, app).await.unwrap(); });
    format!("http://{}", addr)
}

/// Hàm giả lập ETL: đọc change_events và upsert vào fact table
/// (Thay thế ETL Python runner trong integration test)
async fn simulate_etl_run(pool: &PgPool) -> i64 {
    // Đọc các events chưa xử lý
    let events = sqlx::query(
        "SELECT event_id, payload FROM nf_analytics.change_events WHERE processed = FALSE ORDER BY created_at"
    )
    .fetch_all(pool).await.unwrap();

    let count = events.len() as i64;

    for row in &events {
        let event_id: i64 = row.get("event_id");
        let payload: serde_json::Value = row.get("payload");

        let work_item_id: Uuid = Uuid::parse_str(payload["id"].as_str().unwrap_or("")).unwrap_or_default();
        let tenant_id: Uuid = Uuid::parse_str(payload["tenant_id"].as_str().unwrap_or("")).unwrap_or_default();
        let title = payload["title"].as_str().unwrap_or("");
        let category = payload["category"].as_str().unwrap_or("GENERAL");
        let priority = match payload["priority"].as_str().unwrap_or("MEDIUM") {
            "LOW" => "LOW",
            "HIGH" => "HIGH",
            "CRITICAL" => "CRITICAL",
            _ => "MEDIUM",
        };
        let status = payload["status"].as_str().unwrap_or("UNASSIGNED");
        let source = payload["source"].as_str().unwrap_or("MANUAL");
        let version: i32 = payload["version"].as_i64().unwrap_or(1) as i32;
        let is_completed = matches!(status, "COMPLETED");

        sqlx::query(r#"
            INSERT INTO nf_analytics.fact_work_item_lifecycle
                (work_item_id, tenant_id, title, category, priority, source,
                 current_status, version, is_completed, is_sla_violated,
                 created_at, last_synced_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (work_item_id, tenant_id) DO UPDATE SET
                current_status = EXCLUDED.current_status,
                is_completed   = EXCLUDED.is_completed,
                version        = EXCLUDED.version,
                last_synced_at = CURRENT_TIMESTAMP
        "#)
        .bind(work_item_id)
        .bind(tenant_id)
        .bind(title)
        .bind(category)
        .bind(priority)
        .bind(source)
        .bind(status)
        .bind(version)
        .bind(is_completed)
        .execute(pool).await.unwrap();

        // Đánh dấu processed
        sqlx::query("UPDATE nf_analytics.change_events SET processed = TRUE, processed_at = NOW() WHERE event_id = $1")
            .bind(event_id)
            .execute(pool).await.unwrap();
    }

    count
}

#[tokio::test]
async fn test_phase5_analytics_pipeline() {
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_analytics_test_db(&pool).await;
    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // -------------------------------------------------------
    // 1. Verify CDC Triggers: dim_tenant sync
    // -------------------------------------------------------
    let dim_tenant_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.dim_tenant WHERE tenant_id = $1"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .fetch_one(&pool).await.unwrap();
    assert_eq!(dim_tenant_count, 1, "CDC trigger phải sync tenant vào dim_tenant");

    // -------------------------------------------------------
    // 2. Verify CDC Triggers: dim_user sync
    // -------------------------------------------------------
    let dim_user_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.dim_user WHERE user_id = $1"
    )
    .bind(Uuid::parse_str(TEST_USER_ID).unwrap())
    .fetch_one(&pool).await.unwrap();
    assert_eq!(dim_user_count, 1, "CDC trigger phải sync user vào dim_user");

    // -------------------------------------------------------
    // 3. Verify CDC Triggers: dim_queue sync
    // -------------------------------------------------------
    let dim_queue_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.dim_queue WHERE queue_id = $1"
    )
    .bind(TEST_QUEUE_ID)
    .fetch_one(&pool).await.unwrap();
    assert_eq!(dim_queue_count, 1, "CDC trigger phải sync queue vào dim_queue");

    // -------------------------------------------------------
    // 4. Tạo 5 Work Items — CDC trigger phải ghi vào change_events
    // -------------------------------------------------------
    let headers = reqwest::header::HeaderMap::from_iter([
        ("x-nextflow-tenant-id".parse().unwrap(), TEST_TENANT_ID.parse().unwrap()),
        ("x-nextflow-api-key".parse().unwrap(),
         format!("nf_live_test_{}", TEST_TENANT_ID).parse().unwrap()),
    ]);

    for i in 1..=5 {
        let res = client.post(&format!("{}/api/v1/work-items", base_url))
            .headers(headers.clone())
            .json(&json!({
                "title":    format!("Analytics Test Task #{}", i),
                "category": "OPERATIONS",
                "priority": if i <= 2 { "HIGH" } else { "MEDIUM" }
            }))
            .send().await.unwrap();
        assert_eq!(res.status(), 201);
    }

    // Verify change_events có đủ 5 bản ghi
    let event_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.change_events WHERE tenant_id = $1 AND processed = FALSE"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .fetch_one(&pool).await.unwrap();
    assert_eq!(event_count, 5, "Phải có 5 change events cho 5 work items");

    // -------------------------------------------------------
    // 5. Giả lập ETL Runner xử lý change_events
    // -------------------------------------------------------
    let processed = simulate_etl_run(&pool).await;
    assert_eq!(processed, 5, "ETL phải xử lý 5 events");

    // Verify tất cả events đã được marked processed
    let unprocessed: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.change_events WHERE processed = FALSE AND tenant_id = $1"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .fetch_one(&pool).await.unwrap();
    assert_eq!(unprocessed, 0, "Sau ETL không còn unprocessed events");

    // Verify fact_work_item_lifecycle có 5 records
    let fact_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nf_analytics.fact_work_item_lifecycle WHERE tenant_id = $1"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .fetch_one(&pool).await.unwrap();
    assert_eq!(fact_count, 5, "fact_work_item_lifecycle phải có 5 records sau ETL");

    // -------------------------------------------------------
    // 6. Test Analytics API — SLA Compliance Endpoint
    // -------------------------------------------------------
    let res = client.get(&format!("{}/api/v1/analytics/sla-compliance", base_url))
        .headers(headers.clone())
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let sla_body: Value = res.json().await.unwrap();
    assert_eq!(sla_body["tenant_id"].as_str().unwrap(), TEST_TENANT_ID);
    // Có data (5 tasks tạo hôm nay)
    assert!(sla_body["count"].as_i64().unwrap() >= 1);
    // SLA compliance = 100% (không có vi phạm)
    let compliance_pct = sla_body["data"][0]["sla_compliance_percent"].as_f64().unwrap_or(100.0);
    assert_eq!(compliance_pct, 100.0, "Tất cả tasks mới, chưa vi phạm SLA → 100%");

    // -------------------------------------------------------
    // 7. Test Analytics API — Operator Performance Endpoint
    // -------------------------------------------------------
    let res = client.get(&format!("{}/api/v1/analytics/operator-performance", base_url))
        .headers(headers.clone())
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let ops_body: Value = res.json().await.unwrap();
    // Có thể có 0 records (chưa assign) hoặc có records từ dim_user
    assert!(ops_body["count"].as_i64().unwrap() >= 0);

    // -------------------------------------------------------
    // 8. Test Analytics API — Queue Throughput Endpoint
    // -------------------------------------------------------
    let res = client.get(&format!("{}/api/v1/analytics/queue-throughput", base_url))
        .headers(headers.clone())
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let qt_body: Value = res.json().await.unwrap();
    // Throughput = 0 (chưa task nào completed)
    assert_eq!(qt_body["count"].as_i64().unwrap(), 0);
}
