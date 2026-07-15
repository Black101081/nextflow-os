use serde_json::{json, Value};
use sqlx::PgPool;
use tokio::net::TcpListener;
use uuid::Uuid;
use bcrypt::hash;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "b0432f86-d242-491c-99c1-46dfca0b7410";
const TEST_USER_ID: &str = "0e86b033-d922-43bb-a5a4-79fa69c0d12e";

async fn setup_test_db(pool: &PgPool) {
    let _ = sqlx::query("TRUNCATE nf_core.users, nf_core.tenants CASCADE")
        .execute(pool)
        .await;

    sqlx::query(
        "INSERT INTO nf_core.roles (id, name, description, is_system_role) VALUES
         ('SME_LEADER', 'Leader / Owner', 'Chủ doanh nghiệp, có toàn quyền trên hệ thống', TRUE),
         ('SME_SUPERVISOR', 'Supervisor / Manager', 'Quản lý, có quyền phân việc và xem báo cáo vận hành', TRUE),
         ('SME_OPS', 'Operator / Staff', 'Nhân viên văn phòng, xử lý công việc', TRUE),
         ('FIELD_WORKER', 'Field Worker', 'Nhân viên hiện trường', TRUE)
         ON CONFLICT (id) DO NOTHING"
    )
    .execute(pool)
    .await
    .unwrap();

    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier) 
         VALUES ($1, 'SME AI Corp', 'sme-ai.com', 'ACTIVE', 'STANDARD')
         ON CONFLICT (id) DO NOTHING"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();

    let password_hash = hash("test_password_123", 4).unwrap();
    sqlx::query(
        "INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active) 
         VALUES ($1, $2, 'sme.leader@sme-ai.com', $3, 'AI', 'Leader', 'SME_LEADER', true)
         ON CONFLICT (tenant_id, email) DO NOTHING"
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
async fn test_phase4_ai_endpoints_integration() {
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_test_db(&pool).await;

    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // Get access token
    let expected_secret = format!("nf_secret_{}", TEST_TENANT_ID);
    let token_res = client.post(&format!("{}/api/v1/oauth/token", base_url))
        .json(&json!({
            "grant_type": "client_credentials",
            "client_id": TEST_TENANT_ID,
            "client_secret": expected_secret
        }))
        .send().await.unwrap();
    assert_eq!(token_res.status(), 200);
    
    let token_resp: Value = token_res.json().await.unwrap();
    let access_token = token_resp["access_token"].as_str().unwrap().to_string();

    // 1. Check Drug Interaction Endpoint
    // We send two interacting drugs (Aspirin & Warfarin)
    let res = client.post(&format!("{}/api/v1/ai/pharmacy/drug-interaction", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "prescription_id": "test-rx-001",
            "medicines": [
                {"name": "Aspirin", "dosage": "100mg"},
                {"name": "Warfarin", "dosage": "5mg"}
            ]
        }))
        .send().await.unwrap();
    
    let status = res.status();
    println!("Drug Interaction Check Status: {}", status);
    if status == 200 {
        let body: Value = res.json().await.unwrap();
        assert_eq!(body["safe"].as_bool().unwrap(), false);
        assert!(!body["warnings"].as_array().unwrap().is_empty());
        println!("Drug Interaction Check Response: {:?}", body);
    } else {
        assert_eq!(status, 503); // Service Unavailable (expected if python ai-service is not running)
        println!("AI Service is offline as expected");
    }

    // 2. Check Lead Scoring Endpoint
    let res = client.post(&format!("{}/api/v1/ai/real-estate/lead-score", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "budget_vnd": 6000000000.0,
            "interaction_count": 5,
            "source": "referral",
            "property_type": "Condo",
            "urgency": "high"
        }))
        .send().await.unwrap();
    
    let status = res.status();
    println!("Lead Scoring Status: {}", status);
    if status == 200 {
        let body: Value = res.json().await.unwrap();
        assert!(body["score"].as_f64().unwrap() >= 80.0);
        assert_eq!(body["classification"].as_str().unwrap(), "HOT");
        println!("Lead Scoring Response: {:?}", body);
    } else {
        assert_eq!(status, 503);
    }

    // 3. Check Route Optimization Endpoint
    let res = client.post(&format!("{}/api/v1/ai/logistics/route-optimize", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "stops": [
                {"id": "stop-1", "address": "Quận 3"},
                {"id": "stop-2", "address": "Gò Vấp"},
                {"id": "stop-3", "address": "Quận 7"}
            ]
        }))
        .send().await.unwrap();
    
    let status = res.status();
    println!("Route Optimization Status: {}", status);
    if status == 200 {
        let body: Value = res.json().await.unwrap();
        assert_eq!(body["optimized_stops"].as_array().unwrap().len(), 3);
        assert!(body["total_distance_km"].as_f64().unwrap() > 0.0);
        println!("Route Optimization Response: {:?}", body);
    } else {
        assert_eq!(status, 503);
    }

    // 4. Check Demand Forecasting Endpoint
    let res = client.post(&format!("{}/api/v1/ai/retail-fnb/demand-forecast", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "historical_sales": [12.5, 14.0, 11.0, 15.2, 13.0, 16.5, 12.0],
            "horizon": 5
        }))
        .send().await.unwrap();
    
    let status = res.status();
    println!("Demand Forecasting Status: {}", status);
    if status == 200 {
        let body: Value = res.json().await.unwrap();
        assert_eq!(body["forecast"].as_array().unwrap().len(), 5);
        assert_eq!(body["mean_historical"].as_f64().unwrap(), 13.46);
        println!("Demand Forecasting Response: {:?}", body);
    } else {
        assert_eq!(status, 503);
    }

    // 5. Check Dynamic Pricing Endpoint
    let res = client.post(&format!("{}/api/v1/ai/hospitality/dynamic-price", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "base_price": 1200000.0,
            "occupancy_rate": 85.0,
            "competitor_price": 1400000.0,
            "is_weekend": true
        }))
        .send().await.unwrap();
    
    let status = res.status();
    println!("Dynamic Pricing Status: {}", status);
    if status == 200 {
        let body: Value = res.json().await.unwrap();
        assert!(body["suggested_price"].as_f64().unwrap() > 0.0);
        assert!(!body["reasons"].as_array().unwrap().is_empty());
        println!("Dynamic Pricing Response: {:?}", body);
    } else {
        assert_eq!(status, 503);
    }
}
