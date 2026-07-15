use serde_json::json;
use sqlx::{PgPool, Row};
use tokio::net::TcpListener;
use uuid::Uuid;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "d290f1ee-6c54-4b01-90e6-d701748f0851";

async fn setup_phase6_test_db(pool: &PgPool) {
    // Clean tables
    sqlx::query("TRUNCATE nf_meta.workflow_definitions, nf_core.blockchain_ledger, nf_core.tenants CASCADE")
        .execute(pool).await.unwrap();

    // Insert tenant
    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier)
         VALUES ($1, 'Phase 6 Test Corp', 'phase6.com', 'ACTIVE', 'ENTERPRISE')"
    )
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

#[tokio::test]
async fn test_phase6_ai_and_automation_endpoints() {
    // Load .env variables
    dotenvy::dotenv().ok();

    // Khởi tạo DB pool bằng hàm có sẵn trong codebase (trả về PgPool trực tiếp)
    let pool = init_pool().await;
    
    setup_phase6_test_db(&pool).await;

    // Spawn server Axum
    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // Thiết lập headers xác thực chính xác
    let headers = reqwest::header::HeaderMap::from_iter([
        ("x-nextflow-tenant-id".parse().unwrap(), TEST_TENANT_ID.parse().unwrap()),
        ("x-nextflow-api-key".parse().unwrap(), format!("nf_live_test_{}", TEST_TENANT_ID).parse().unwrap()),
    ]);

    // 1. Kiểm thử endpoint AI Cashflow Forecast (Proxy fallback)
    let cashflow_history = json!([
        { "name": "D1-10", "type": "INCOME", "amount": 45000000.0 },
        { "name": "D11-20", "type": "EXPENSE", "amount": 32000000.0 }
    ]);
    let response = client
        .post(&format!("{}/api/v1/ai/finance/cashflow-forecast", base_url))
        .headers(headers.clone())
        .json(&cashflow_history)
        .send()
        .await
        .unwrap();

    let status = response.status();
    println!("[Test] AI Cashflow Response Status: {}", status);
    assert!(status.is_success() || status == reqwest::StatusCode::SERVICE_UNAVAILABLE || status == reqwest::StatusCode::BAD_GATEWAY);

    // 2. Kiểm thử endpoint AI Sentiment Analyze
    let sentiment_req = json!({
        "text": "Sản phẩm tuyệt vời, giao hàng rất nhanh!"
    });
    let response_sentiment = client
        .post(&format!("{}/api/v1/ai/feedback/sentiment-analyze", base_url))
        .headers(headers.clone())
        .json(&sentiment_req)
        .send()
        .await
        .unwrap();
    
    let status_sentiment = response_sentiment.status();
    println!("[Test] AI Sentiment Response Status: {}", status_sentiment);
    assert!(status_sentiment.is_success() || status_sentiment == reqwest::StatusCode::SERVICE_UNAVAILABLE || status_sentiment == reqwest::StatusCode::BAD_GATEWAY);

    // 3. Kiểm thử Blockchain anchoring thông qua API trực tiếp
    let anchor_req = json!({
        "data": "Audit Log: User Nguyễn Văn A updated payroll info.",
        "context": "HR Audit Logs"
    });
    let response_anchor = client
        .post(&format!("{}/api/v1/blockchain/anchor", base_url))
        .headers(headers.clone())
        .json(&anchor_req)
        .send()
        .await
        .unwrap();
    
    assert!(response_anchor.status().is_success());
    let anchor_result: serde_json::Value = response_anchor.json().await.unwrap();
    assert!(anchor_result.get("tx_hash").is_some());
    let tx_hash = anchor_result["tx_hash"].as_str().unwrap();
    println!("[Test] Blockchain Anchored Tx Hash: {}", tx_hash);

    // Kiểm tra DB xem transaction đã được ghi vào blockchain_ledger hay chưa
    let ledger_row: sqlx::postgres::PgRow = sqlx::query("SELECT tx_hash, network FROM nf_core.blockchain_ledger WHERE tx_hash = $1")
        .bind(tx_hash)
        .fetch_one(&pool)
        .await
        .unwrap();
    
    let db_tx_hash: String = ledger_row.get("tx_hash");
    let network: String = ledger_row.get("network");
    assert_eq!(db_tx_hash, tx_hash);
    assert_eq!(network, "U2U_TESTNET_SIMULATED");
    println!("[Test] Ledger DB Verification Success!");
}
