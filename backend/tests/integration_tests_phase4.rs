use bcrypt::hash;
use serde_json::{json, Value};
use sqlx::PgPool;
use tokio::net::TcpListener;
use uuid::Uuid;

use nextflow_core_backend::{config::db::init_pool, create_app};

const TEST_TENANT_ID: &str = "b0432f86-d242-491c-99c1-46dfca0b7410";
const TEST_USER_ID: &str = "0e86b033-d922-43bb-a5a4-79fa69c0d12e";

async fn setup_test_db(pool: &PgPool) {
    // Clean old records
    let _ = sqlx::query("TRUNCATE nf_tenant.hosp_rooms, nf_tenant.hosp_bookings, nf_tenant.hosp_service_requests, nf_tenant.re_listings, nf_tenant.re_leads, nf_tenant.re_deals CASCADE")
        .execute(pool)
        .await;

    let _ = sqlx::query("TRUNCATE nf_core.users, nf_core.tenants CASCADE")
        .execute(pool)
        .await;

    sqlx::query(
        "INSERT INTO nf_core.roles (id, name, description, is_system_role) VALUES
         ('SME_LEADER', 'Leader / Owner', 'Chủ doanh nghiệp, có toàn quyền trên hệ thống', TRUE)
         ON CONFLICT (id) DO NOTHING"
    )
    .execute(pool)
    .await
    .unwrap();

    sqlx::query(
        "INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier) 
         VALUES ($1, 'SME Hospitality & Real Estate Corp', 'hosp-re.com', 'ACTIVE', 'STANDARD')
         ON CONFLICT (id) DO NOTHING"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();

    let password_hash = hash("test_password_123", 4).unwrap();
    sqlx::query(
        "INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active) 
         VALUES ($1, $2, 'sme.leader@hosp-re.com', $3, 'Le', 'Minh Leader', 'SME_LEADER', true)
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
async fn test_phase4_vertical_packs_integration() {
    dotenvy::dotenv().ok();
    let pool = init_pool().await;
    setup_test_db(&pool).await;

    let base_url = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // 1. Get access token
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

    // -------------------------------------------------------------------------
    // HOSPITALITY PACK TESTS
    // -------------------------------------------------------------------------
    
    // Create Room
    let res = client.post(&format!("{}/api/v1/hosp/rooms", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "room_number": "101",
            "room_type": "Deluxe",
            "floor": 1,
            "smart_lock_code": "LOCK101",
            "amenities": ["Wifi", "TV", "MiniBar"],
            "base_price": 500000.0
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let room: Value = res.json().await.unwrap();
    let room_id = room["id"].as_str().unwrap();

    // Get Rooms
    let res = client.get(&format!("{}/api/v1/hosp/rooms", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let rooms: Value = res.json().await.unwrap();
    assert!(rooms.as_array().unwrap().len() > 0);

    // Create Booking
    let res = client.post(&format!("{}/api/v1/hosp/bookings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "room_id": room_id,
            "guest_name": "Trần Văn Khách",
            "guest_phone": "0988776655",
            "check_in": "2026-07-20T14:00:00Z",
            "check_out": "2026-07-22T12:00:00Z",
            "total_amount": 1000000.0,
            "paid_amount": 500000.0
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let booking: Value = res.json().await.unwrap();
    let booking_id = booking["id"].as_str().unwrap();

    // Get Bookings
    let res = client.get(&format!("{}/api/v1/hosp/bookings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let bookings: Value = res.json().await.unwrap();
    assert!(bookings.as_array().unwrap().len() > 0);

    // Update Booking Status
    let res = client.put(&format!("{}/api/v1/hosp/bookings/{}/status", base_url, booking_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "status": "CheckedIn"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);

    // Create Service Request
    let res = client.post(&format!("{}/api/v1/hosp/service-requests", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "booking_id": booking_id,
            "request_type": "Laundry",
            "charge": 50000.0,
            "notes": "Giặt ủi quần áo"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let request: Value = res.json().await.unwrap();
    let request_id = request["id"].as_str().unwrap();

    // Get Service Requests
    let res = client.get(&format!("{}/api/v1/hosp/service-requests", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let requests: Value = res.json().await.unwrap();
    assert!(requests.as_array().unwrap().len() > 0);

    // Update Service Request Status
    let res = client.put(&format!("{}/api/v1/hosp/service-requests/{}/status", base_url, request_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "status": "Fulfilled"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);


    // -------------------------------------------------------------------------
    // REAL ESTATE PACK TESTS
    // -------------------------------------------------------------------------

    // Create Listing
    let res = client.post(&format!("{}/api/v1/re/listings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "address": "123 Đường Láng, Đống Đa",
            "district": "Đống Đa",
            "city": "Hà Nội",
            "type": "CanHo",
            "price": 3500000000.0,
            "area": 75.5,
            "bedrooms": 2,
            "bathrooms": 2,
            "legal_status": "Sổ hồng riêng",
            "description": "Căn hộ chung cư cao cấp"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let listing: Value = res.json().await.unwrap();
    let listing_id = listing["id"].as_str().unwrap();

    // Get Listings
    let res = client.get(&format!("{}/api/v1/re/listings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let listings: Value = res.json().await.unwrap();
    assert!(listings.as_array().unwrap().len() > 0);

    // Create Lead
    let res = client.post(&format!("{}/api/v1/re/leads", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "name": "Nguyễn Minh Mua",
            "phone": "0911223344",
            "email": "mua.nm@gmail.com",
            "budget": 4000000000.0,
            "preferred_area": "Đống Đa",
            "property_type": "CanHo",
            "urgency": "Hot",
            "notes": "Cần mua gấp trước tháng 8"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let lead: Value = res.json().await.unwrap();
    let lead_id = lead["id"].as_str().unwrap();

    // Get Leads
    let res = client.get(&format!("{}/api/v1/re/leads", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let leads: Value = res.json().await.unwrap();
    assert!(leads.as_array().unwrap().len() > 0);

    // Create Deal
    let res = client.post(&format!("{}/api/v1/re/deals", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "lead_id": lead_id,
            "listing_id": listing_id,
            "stage": "DepositPaid",
            "commission": 35000000.0
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let deal: Value = res.json().await.unwrap();
    let deal_id = deal["id"].as_str().unwrap();

    // Get Deals
    let res = client.get(&format!("{}/api/v1/re/deals", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let deals: Value = res.json().await.unwrap();
    assert!(deals.as_array().unwrap().len() > 0);

    // Update Deal Stage
    let res = client.put(&format!("{}/api/v1/re/deals/{}/stage", base_url, deal_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "stage": "Won"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
}
