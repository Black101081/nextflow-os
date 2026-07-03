use bcrypt::hash;
use chrono::Utc;
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use tokio::net::TcpListener;
use uuid::Uuid;
use futures_util::StreamExt;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "d290f1ee-6c54-4b01-90e6-d701748f0851";
const TEST_USER_ID: &str = "8f3b2a1a-4c54-4b01-90e6-d701748f0851";
const TEST_API_KEY: &str = "nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851";

// Helper dọn dẹp và seed dữ liệu thật cho test (Zero-Mock)
async fn setup_test_db(pool: &PgPool) {
    println!("[Test Setup] Truncating test database tables...");
    sqlx::query("TRUNCATE nf_core.work_items, nf_core.users, nf_core.tenants, nf_core.queues CASCADE")
        .execute(pool)
        .await
        .unwrap();

    println!("[Test Setup] Seeding test Tenant...");
    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier) 
         VALUES ($1, 'SME Test Corporation', 'test-corp.com', 'ACTIVE', 'STANDARD')"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();

    println!("[Test Setup] Seeding test User...");
    let password_hash = hash("test_password_123", 4).unwrap();
    sqlx::query(
        "INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active) 
         VALUES ($1, $2, 'test.operator@test-corp.com', $3, 'Nguyen', 'Van Test', 'SME_OPS', true)"
    )
    .bind(Uuid::parse_str(TEST_USER_ID).unwrap())
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .bind(password_hash)
    .execute(pool)
    .await
    .unwrap();

    println!("[Test Setup] Seeding test Queue...");
    sqlx::query(
        "INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds) 
         VALUES ('q_test_queue', $1, 'Test Queue', 'GENERAL', 'FIFO', 3600)"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();
}

// Khởi chạy server Axum trên port ngẫu nhiên
async fn spawn_app(pool: PgPool) -> String {
    let app = create_app(pool);
    
    // Bind cổng ngẫu nhiên 0 để tránh chiếm dụng cổng cố định
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    
    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    format!("http://{}", addr)
}

#[tokio::test]
async fn test_all_endpoints() {
    // 1. Setup DB
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_test_db(&pool).await;

    // 2. Khởi chạy app
    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // ----------------------------------------------------
    // TEST POST /api/v1/work-items (Validation & Creation)
    // ----------------------------------------------------
    
    // Test 1: Thiếu Tenant ID header (Bad Request 400)
    let res = client.post(&format!("{}/api/v1/work-items", base_url))
        .json(&json!({ "title": "Test Task" }))
        .send().await.unwrap();
    assert_eq!(res.status(), 400);
    let err_json: Value = res.json().await.unwrap();
    assert_eq!(err_json["error"]["code"], "MISSING_TENANT_ID");

    // Test 2: Thiếu auth credentials (Unauthorized 401)
    let res = client.post(&format!("{}/api/v1/work-items", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({ "title": "Test Task" }))
        .send().await.unwrap();
    assert_eq!(res.status(), 401);

    // Test 3: Thiếu title trong body (Validation Failed 422)
    let res = client.post(&format!("{}/api/v1/work-items", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({ "priority": "HIGH" }))
        .send().await.unwrap();
    assert_eq!(res.status(), 422);
    let err_json: Value = res.json().await.unwrap();
    assert_eq!(err_json["error"]["code"], "VALIDATION_FAILED");

    // Test 4: due_date ở quá khứ (Validation Failed 422)
    let past_date = Utc::now() - chrono::Duration::days(1);
    let res = client.post(&format!("{}/api/v1/work-items", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({ "title": "Past Due Task", "due_date": past_date }))
        .send().await.unwrap();
    assert_eq!(res.status(), 422);

    // Test 5: Tạo mới Work Item thành công (201 Created)
    let future_date = Utc::now() + chrono::Duration::days(5);
    let task_payload = json!({
        "title": "Xử lý hồ sơ kiểm toán VAT",
        "description": "Kiểm tra chứng từ hóa đơn VAT quý 1",
        "priority": "HIGH",
        "due_date": future_date,
        "category": "FINANCE",
        "source": "JEST_TEST",
        "external_id": "ext_test_9988"
    });
    
    let res = client.post(&format!("{}/api/v1/work-items", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&task_payload)
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let task_res: Value = res.json().await.unwrap();
    let created_task_id = task_res["id"].as_str().unwrap();
    assert_eq!(task_res["title"], "Xử lý hồ sơ kiểm toán VAT");

    // ----------------------------------------------------
    // TEST GET /api/v1/work-items/:id & PATCH status
    // ----------------------------------------------------

    // Test 6: Lấy chi tiết Work Item
    let res = client.get(&format!("{}/api/v1/work-items/{}", base_url, created_task_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);

    // Test 7: Cập nhật status task sang IN_PROGRESS và tự động gán assignee_id (200 OK)
    let res = client.patch(&format!("{}/api/v1/work-items/{}/status", base_url, created_task_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("authorization", format!("Bearer {}", TEST_USER_ID))
        .json(&json!({ "status": "IN_PROGRESS" }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let patch_res: Value = res.json().await.unwrap();
    assert_eq!(patch_res["status"], "IN_PROGRESS");
    assert_eq!(patch_res["version"], 2);

    // Verify DB
    let db_check = sqlx::query("SELECT assignee_id, started_at FROM nf_core.work_items WHERE id = $1")
        .bind(Uuid::parse_str(created_task_id).unwrap())
        .fetch_one(&pool)
        .await
        .unwrap();
    let assigned_id: Uuid = db_check.get("assignee_id");
    assert_eq!(assigned_id.to_string(), TEST_USER_ID);

    // ----------------------------------------------------
    // TEST Queues, Members & Routing APIs
    // ----------------------------------------------------

    // Test 8: Tạo Queue mới thành công (201)
    let queue_id = "q_finance_ops_test";
    let res = client.post(&format!("{}/api/v1/queues", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({
            "id": queue_id,
            "name": "Hàng đợi Tài chính - Kế toán Kỹ thuật",
            "category": "FINANCE",
            "routing_algorithm": "FIFO",
            "sla_target_seconds": 7200
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);

    // Test 9: Thêm thành viên vào Queue (200)
    let res = client.post(&format!("{}/api/v1/queues/{}/members", base_url, queue_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({ "user_id": TEST_USER_ID }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);

    // Test 10: Lấy danh sách thành viên trong Queue
    let res = client.get(&format!("{}/api/v1/queues/{}/members", base_url, queue_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let members_res: Value = res.json().await.unwrap();
    assert_eq!(members_res["members"][0]["user_id"], TEST_USER_ID);

    // Test 11: Định tuyến thủ công Work Item sang Queue khác
    let res = client.post(&format!("{}/api/v1/work-items/{}/route", base_url, created_task_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({
            "target_queue_id": "q_test_queue",
            "assignee_id": TEST_USER_ID
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let route_res: Value = res.json().await.unwrap();
    assert_eq!(route_res["routed_to_queue"], "q_test_queue");

    // ----------------------------------------------------
    // TEST Tenants Users Synchronization API
    // ----------------------------------------------------

    // Test 12: Sync users thành công (207 Multi-Status)
    let res = client.post(&format!("{}/api/v1/tenants/{}/users/sync", base_url, TEST_TENANT_ID))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({
            "users": [
                {
                    "email": "le.van.c@smecompany.com",
                    "first_name": "Le Van",
                    "last_name": "C",
                    "role": "FIELD_WORKER",
                    "status": "ACTIVE"
                }
            ]
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 207);
    let sync_res: Value = res.json().await.unwrap();
    assert_eq!(sync_res["success_count"], 1);
    assert_eq!(sync_res["results"][0]["status"], "SYNCED");

    // Verify DB
    let user_check = sqlx::query("SELECT role, is_active FROM nf_core.users WHERE email = $1")
        .bind("le.van.c@smecompany.com")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(user_check.get::<String, _>("role"), "FIELD_WORKER");
    assert_eq!(user_check.get::<bool, _>("is_active"), true);

    // ----------------------------------------------------
    // TEST SLA Management & Escalation Engine (Phase 4)
    // ----------------------------------------------------

    // Test 13: SLA Overdue Breach & Auto-Escalation
    // Tạo 1 task và ép buộc chỉnh due_at về quá khứ
    let overdue_task_title = "Bảo trì khẩn cấp máy chủ chi nhánh";
    let insert_overdue = sqlx::query(
        "INSERT INTO nf_core.work_items (tenant_id, title, status, priority, due_at, queue_id, source)
         VALUES ($1, $2, 'UNASSIGNED', 'MEDIUM', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'q_test_queue', 'TEST')
         RETURNING id"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .bind(overdue_task_title)
    .fetch_one(&pool)
    .await
    .unwrap();
    let overdue_id: Uuid = insert_overdue.get("id");

    // Kích hoạt quét SLA thủ công qua API
    let res = client.post(&format!("{}/api/v1/work-items/trigger-sla", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let scan_res: Value = res.json().await.unwrap();
    assert!(scan_res["breached_count"].as_u64().unwrap() >= 1);

    // Kiểm tra task đã được chuyển sang hàng đợi escalation_queue và nâng priority lên HIGH
    let task_check = sqlx::query("SELECT queue_id, priority FROM nf_core.work_items WHERE id = $1")
        .bind(overdue_id)
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(task_check.get::<String, _>("queue_id"), "q_escalation_queue");
    assert_eq!(task_check.get::<String, _>("priority"), "HIGH");

    // Lấy danh sách overdue qua API
    let res = client.get(&format!("{}/api/v1/work-items/overdue", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let overdue_list: Value = res.json().await.unwrap();
    let items = overdue_list["overdue_items"].as_array().unwrap();
    assert!(items.iter().any(|item| item["title"] == overdue_task_title));

    // Test 14: Operator Hold Timeout & Auto-Reassignment
    // Tạo 1 task đang IN_PROGRESS và ép started_at lùi lại quá Target SLA (3600 giây)
    let timeout_task_title = "Xử lý hồ sơ hoàn thuế quý 4";
    let insert_timeout = sqlx::query(
        "INSERT INTO nf_core.work_items (tenant_id, title, status, priority, started_at, assignee_id, queue_id, source)
         VALUES ($1, $2, 'IN_PROGRESS', 'MEDIUM', CURRENT_TIMESTAMP - INTERVAL '2 hours', $3, 'q_test_queue', 'TEST')
         RETURNING id"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .bind(timeout_task_title)
    .bind(Uuid::parse_str(TEST_USER_ID).unwrap())
    .fetch_one(&pool)
    .await
    .unwrap();
    let timeout_id: Uuid = insert_timeout.get("id");

    // Kích hoạt quét SLA thủ công qua API một lần nữa
    let res = client.post(&format!("{}/api/v1/work-items/trigger-sla", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let scan_res2: Value = res.json().await.unwrap();
    assert!(scan_res2["reassigned_count"].as_u64().unwrap() >= 1);

    // Kiểm tra task đã được thu hồi về UNASSIGNED, gán assignee_id = null
    let task_check2 = sqlx::query("SELECT status, assignee_id FROM nf_core.work_items WHERE id = $1")
        .bind(timeout_id)
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(task_check2.get::<String, _>("status"), "UNASSIGNED");
    assert!(task_check2.try_get::<Uuid, _>("assignee_id").is_err());

    // ----------------------------------------------------
    // TEST WebSocket Real-time Broadcast (Phase 5)
    // ----------------------------------------------------

    // Test 15: Kết nối WebSocket và nhận event broadcast khi tạo Task mới
    let ws_url = base_url.replace("http://", "ws://") + "/ws";
    let (ws_stream, _) = tokio_tungstenite::connect_async(&ws_url).await.unwrap();
    let (_, mut ws_read) = ws_stream.split();

    // Gọi API tạo mới task để kích hoạt broadcast
    let test_title = "Nhiệm vụ kiểm định real-time";
    let _res = client.post(&format!("{}/api/v1/work-items", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", TEST_API_KEY)
        .json(&json!({
            "title": test_title,
            "priority": "LOW",
            "category": "OPERATIONS"
        }))
        .send().await.unwrap();

    // WebSocket Client phải nhận được message JSON báo hiệu
    if let Some(Ok(tokio_tungstenite::tungstenite::Message::Text(msg_text))) = ws_read.next().await {
        let parsed_msg: Value = serde_json::from_str(&msg_text).unwrap();
        assert_eq!(parsed_msg["event"], "WORK_ITEM_CREATED");
        assert_eq!(parsed_msg["data"]["title"], test_title);
    } else {
        panic!("Không nhận được WebSocket broadcast message từ server!");
    }
}
