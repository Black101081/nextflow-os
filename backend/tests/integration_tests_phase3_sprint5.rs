use serde_json::json;
use sqlx::PgPool;
use tokio::net::TcpListener;
use uuid::Uuid;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "00000000-0000-0000-0000-000000000001";
const HACKER_TENANT_ID: &str = "99999999-9999-9999-9999-999999999999";

async fn setup_test_tenant(pool: &PgPool) {
    // Clean up test records
    let _ = sqlx::query("DELETE FROM nf_core.tenants WHERE id IN ($1, $2)")
        .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
        .bind(Uuid::parse_str(HACKER_TENANT_ID).unwrap())
        .execute(pool)
        .await;

    // Seed test tenants
    let _ = sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier)
         VALUES ($1, 'Sprint 5 Test Corp', 'sprint5.com', 'ACTIVE', 'STANDARD')"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await;

    let _ = sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier)
         VALUES ($1, 'Hacker Tenant Corp', 'hacker.com', 'ACTIVE', 'STANDARD')"
    )
    .bind(Uuid::parse_str(HACKER_TENANT_ID).unwrap())
    .execute(pool)
    .await;
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
async fn test_phase3_sprint5_remaining_packs() {
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_test_tenant(&pool).await;
    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    let test_api_key = format!("nf_live_test_{}", TEST_TENANT_ID);
    let hacker_api_key = format!("nf_live_test_{}", HACKER_TENANT_ID);

    // ==========================================
    // 1. Test Logistics Pack
    // ==========================================
    // POST /api/v1/log/waybills
    let res = client.post(format!("{}/api/v1/log/waybills", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "tracking_code": "TRACK123456",
            "receiver_name": "Nguyen Van A",
            "receiver_phone": "0987654321",
            "receiver_address": "123 Le Loi, District 1, HCMC",
            "cod_amount": 150000.0,
            "weight": 1.25,
            "notes": "Giao gio hanh chinh"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let waybill: serde_json::Value = res.json().await.unwrap();
    assert_eq!(waybill["tracking_code"], "TRACK123456");

    // GET /api/v1/log/waybills (Should return 1 waybill)
    let res = client.get(format!("{}/api/v1/log/waybills", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 200);
    let waybills: Vec<serde_json::Value> = res.json().await.unwrap();
    assert!(!waybills.is_empty());

    // Multi-tenant isolation: GET from hacker tenant should return 0 waybills
    let res = client.get(format!("{}/api/v1/log/waybills", base_url))
        .header("x-nextflow-tenant-id", HACKER_TENANT_ID)
        .header("x-nextflow-api-key", &hacker_api_key)
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 200);
    let hacker_waybills: Vec<serde_json::Value> = res.json().await.unwrap();
    assert!(hacker_waybills.is_empty(), "Hacker tenant should not see other tenant's waybills");

    // POST /api/v1/log/cod-reconciliations
    let driver_id = Uuid::new_v4();
    let res = client.post(format!("{}/api/v1/log/cod-reconciliations", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "driver_id": driver_id,
            "recon_date": "2026-07-15",
            "total_orders": 10,
            "success_orders": 9,
            "expected_cash": 1200000.0,
            "actual_cash": 1200000.0
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let recon: serde_json::Value = res.json().await.unwrap();
    let recon_id = recon["id"].as_str().unwrap();

    // PUT /api/v1/log/cod-reconciliations/:id/status
    let res = client.put(format!("{}/api/v1/log/cod-reconciliations/{}/status", base_url, recon_id))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({ "status": "Approved" }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 200);

    // ==========================================
    // 2. Test Pharmacy Pack
    // ==========================================
    // POST /api/v1/phar/prescriptions
    let res = client.post(format!("{}/api/v1/phar/prescriptions", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "patient_name": "Tran Thi B (Dị ứng)", // trigger warning conflict
            "patient_dob": "1990-05-20",
            "patient_phone": "0912345678",
            "doctor_name": "Dr. Minh",
            "clinic_name": "Phòng khám Đa khoa",
            "diagnosis": "Viêm họng cấp",
            "medicines": [
                {"name": "Amoxicillin", "dosage": "500mg", "frequency": "2 lần/ngày"}
            ]
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let prescription: serde_json::Value = res.json().await.unwrap();
    assert_eq!(prescription["ai_check_result"]["safe"], false, "AI conflict detection simulation should be triggered");

    // POST /api/v1/phar/inventory
    let res = client.post(format!("{}/api/v1/phar/inventory", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "name": "Paracetamol",
            "medicine_id": "PARA500",
            "quantity": 100,
            "unit": "Viên",
            "purchase_price": 500.0,
            "sell_price": 1000.0,
            "reorder_point": 20
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);

    // ==========================================
    // 3. Test Micro-Manufacturing Pack
    // ==========================================
    // POST /api/v1/mfg/work-orders
    let res = client.post(format!("{}/api/v1/mfg/work-orders", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "product_name": "Bàn gỗ sồi",
            "target_quantity": 50
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let work_order: serde_json::Value = res.json().await.unwrap();
    let wo_id = work_order["id"].as_str().unwrap();

    // POST /api/v1/mfg/boms
    let res = client.post(format!("{}/api/v1/mfg/boms", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "product_id": Uuid::new_v4(),
            "product_name": "Bàn gỗ sồi",
            "version": "1.1",
            "materials": [
                {"item": "Gỗ tấm", "qty": 4, "unit": "tấm"},
                {"item": "Ốc vít", "qty": 16, "unit": "cái"}
            ],
            "labor_hours": 2.5
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);

    // POST /api/v1/mfg/qc-reports
    let res = client.post(format!("{}/api/v1/mfg/qc-reports", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "work_order_id": wo_id,
            "checked_quantity": 10,
            "pass_quantity": 9,
            "defect_types": {"Móp góc": 1},
            "disposition": "Accept"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);

    // ==========================================
    // 4. Test Contractor Pack
    // ==========================================
    // POST /api/v1/const/projects
    let res = client.post(format!("{}/api/v1/const/projects", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "project_name": "Biệt thự Vinhomes Riverside",
            "client_name": "Nguyen Minh Triet",
            "contract_value": 2500000000.0,
            "address": "Bằng Lăng 2, Long Biên, Hà Nội"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let project: serde_json::Value = res.json().await.unwrap();
    let project_id = project["id"].as_str().unwrap();

    // POST /api/v1/const/daily-logs
    let res = client.post(format!("{}/api/v1/const/daily-logs", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "project_id": project_id,
            "log_date": "2026-07-15",
            "workers_count": 15,
            "summary": "Đổ bê tông sàn tầng 1",
            "completed_items": ["Sát sàn", "Đổ bê tông"],
            "weather": "Nắng"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);

    // ==========================================
    // 5. Test Professional Services Pack
    // ==========================================
    // POST /api/v1/ps/clients
    let res = client.post(format!("{}/api/v1/ps/clients", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "company_name": "Công ty TNHH Giải pháp Phần mềm Việt",
            "tax_code": "0102030405",
            "legal_rep": "Bùi Xuân Huấn",
            "contract_value": 300000000.0,
            "nda_signed": true
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
    let ps_client: serde_json::Value = res.json().await.unwrap();
    let ps_client_id = ps_client["id"].as_str().unwrap();

    // POST /api/v1/ps/contracts
    let res = client.post(format!("{}/api/v1/ps/contracts", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "client_id": ps_client_id,
            "contract_type": "KeToan",
            "monthly_fee": 15000000.0,
            "auto_renewal": true,
            "notes": "Dịch vụ kế toán trọn gói năm 2026"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);

    // POST /api/v1/ps/tax-filings
    let res = client.post(format!("{}/api/v1/ps/tax-filings", base_url))
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .header("x-nextflow-api-key", &test_api_key)
        .json(&json!({
            "client_id": ps_client_id,
            "filing_type": "Báo cáo Thuế GTGT Q2/2026",
            "period": "Q2/2026",
            "due_date": "2026-07-30"
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), 201);
}
