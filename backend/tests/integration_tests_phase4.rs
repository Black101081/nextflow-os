use bcrypt::hash;
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use tokio::net::TcpListener;
use uuid::Uuid;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "d290f1ee-6c54-4b01-90e6-d701748f0851";
const TEST_USER_ID: &str = "8f3b2a1a-4c54-4b01-90e6-d701748f0851";

// Setup database sạch sẽ trước khi chạy test
async fn setup_test_db(pool: &PgPool) {
    sqlx::query("TRUNCATE nf_core.task_exceptions, nf_core.work_items, nf_core.users, nf_core.tenants, nf_core.queues CASCADE")
        .execute(pool)
        .await
        .unwrap();

    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier) 
         VALUES ($1, 'SME Test Corporation', 'test-corp.com', 'ACTIVE', 'STANDARD')"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();

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
}

async fn spawn_app(pool: PgPool) -> String {
    let app = create_app(pool);
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });
    format!("http://{}", addr)
}

#[tokio::test]
async fn test_phase4_integration() {
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_test_db(&pool).await;

    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // ----------------------------------------------------
    // 1. TEST POST /api/v1/oauth/token (OAuth Authenticator)
    // ----------------------------------------------------
    
    // Thử credentials không hợp lệ (secret sai)
    let res = client.post(&format!("{}/api/v1/oauth/token", base_url))
        .json(&json!({
            "grant_type": "client_credentials",
            "client_id": TEST_TENANT_ID,
            "client_secret": "nf_secret_wrong_secret"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 401);
    let err_body: Value = res.json().await.unwrap();
    assert_eq!(err_body["error"], "invalid_client");

    // credentials hợp lệ
    let expected_secret = format!("nf_secret_{}", TEST_TENANT_ID);
    let res = client.post(&format!("{}/api/v1/oauth/token", base_url))
        .json(&json!({
            "grant_type": "client_credentials",
            "client_id": TEST_TENANT_ID,
            "client_secret": expected_secret
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    
    let token_resp: Value = res.json().await.unwrap();
    let access_token = token_resp["access_token"].as_str().unwrap().to_string();
    assert_eq!(token_resp["token_type"].as_str().unwrap(), "Bearer");
    assert!(token_resp["expires_in"].as_i64().unwrap() > 0);

    // ----------------------------------------------------
    // 2. TEST Webhook HubSpot Authentications (Unauthorized)
    // ----------------------------------------------------
    
    // Gửi webhook không có token auth
    let res = client.post(&format!("{}/api/v1/connectors/hubspot/webhook", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "object_id": 12345,
            "property_name": "dealstage",
            "property_value": "closedwon"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 401);

    // ----------------------------------------------------
    // 3. TEST Webhook HubSpot Import (Success case)
    // ----------------------------------------------------
    let res = client.post(&format!("{}/api/v1/connectors/hubspot/webhook", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("Authorization", format!("Bearer {}", access_token))
        .json(&json!({
            "object_id": 88127,
            "property_name": "dealstage",
            "property_value": "closedwon"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    
    let import_resp: Value = res.json().await.unwrap();
    assert_eq!(import_resp["status"], "success");
    let work_item_id_str = import_resp["work_item_id"].as_str().unwrap();

    // Verify trong Database xem Work Item đã được tạo đúng thông tin mapped hay chưa
    let task_id = Uuid::parse_str(work_item_id_str).unwrap();
    let row = sqlx::query("SELECT title, description, priority, category, source, external_id, metadata, status FROM nf_core.work_items WHERE id = $1")
        .bind(task_id)
        .fetch_one(&pool)
        .await
        .unwrap();

    assert_eq!(row.get::<String, _>("title"), "Ho so trien khai dich vu: Hop dong cung cap thiet bi SME - Deal #88127");
    assert_eq!(row.get::<String, _>("priority"), "MEDIUM"); // 45000.0 is MEDIUM
    assert_eq!(row.get::<String, _>("category"), "OPERATIONS");
    assert_eq!(row.get::<String, _>("source"), "HUBSPOT_CONNECTOR");
    assert_eq!(row.get::<String, _>("external_id"), "hubspot_deal_88127");
    assert_eq!(row.get::<String, _>("status"), "UNASSIGNED");

    let meta: Value = row.get("metadata");
    assert_eq!(meta["deal_amount"].as_f64().unwrap(), 45000.0);
    assert_eq!(meta["hubspot_object_id"].as_i64().unwrap(), 88127);

    // ----------------------------------------------------
    // 4. TEST Idempotency Check
    // ----------------------------------------------------
    // Gửi lại cùng webhook -> Phải trả về idempotent status, không sinh task mới
    let res = client.post(&format!("{}/api/v1/connectors/hubspot/webhook", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("Authorization", format!("Bearer {}", access_token))
        .json(&json!({
            "object_id": 88127,
            "property_name": "dealstage",
            "property_value": "closedwon"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let idempotent_resp: Value = res.json().await.unwrap();
    assert_eq!(idempotent_resp["status"], "idempotent");

    // ----------------------------------------------------
    // 5. TEST Webhook Fail & Exception Queue Logging
    // ----------------------------------------------------
    // Gửi webhook với object_id = 99999 (kích hoạt lỗi và retry sập)
    let res = client.post(&format!("{}/api/v1/connectors/hubspot/webhook", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("Authorization", format!("Bearer {}", access_token))
        .json(&json!({
            "object_id": 99999,
            "property_name": "dealstage",
            "property_value": "closedwon"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 202); // 202 Accepted with error exception created
    
    let fail_resp: Value = res.json().await.unwrap();
    assert_eq!(fail_resp["status"], "failed");

    // Kiểm tra xem exception có được log đúng vào bảng task_exceptions hay không
    let exception_row = sqlx::query("SELECT exception_type, reason, status FROM nf_core.task_exceptions WHERE tenant_id = $1")
        .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
        .fetch_one(&pool)
        .await
        .unwrap();

    assert_eq!(exception_row.get::<String, _>("exception_type"), "INTEGRATION_FAULT");
    assert!(exception_row.get::<String, _>("reason").contains("Timeout"));
    assert_eq!(exception_row.get::<String, _>("status"), "PENDING");
}
