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
    let _ = sqlx::query("TRUNCATE nf_tenant.spa_bookings, nf_tenant.spa_skin_profiles, nf_tenant.spa_courses, nf_tenant.auto_repair_orders, nf_tenant.auto_vehicles, nf_tenant.fnb_orders, nf_tenant.fnb_shifts, nf_tenant.fnb_ingredient_checks, nf_tenant.fnb_menu_items, nf_tenant.edu_students, nf_tenant.edu_classes, nf_tenant.edu_grade_records, nf_tenant.edu_payments CASCADE")
        .execute(pool)
        .await;

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
         VALUES ($1, 'SME Spa & Garage Corp', 'spa-garage.com', 'ACTIVE', 'STANDARD')
         ON CONFLICT (id) DO NOTHING"
    )
    .bind(Uuid::parse_str(TEST_TENANT_ID).unwrap())
    .execute(pool)
    .await
    .unwrap();

    let password_hash = hash("test_password_123", 4).unwrap();
    sqlx::query(
        "INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active) 
         VALUES ($1, $2, 'sme.leader@spa-garage.com', $3, 'Le', 'Minh Leader', 'SME_LEADER', true)
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
async fn test_phase3_vertical_packs_integration() {
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
    // SPA & CLINIC PACK TESTS
    // -------------------------------------------------------------------------
    
    let customer_id = Uuid::new_v4();

    // Create Booking
    let res = client.post(&format!("{}/api/v1/spa/bookings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "customer_id": customer_id,
            "service": "Chăm sóc da toàn diện",
            "scheduled_at": "2026-07-20T10:00:00Z",
            "notes": "Khách thích phòng yên tĩnh"
        }))
        .send().await.unwrap();
    let status = res.status();
    let text = res.text().await.unwrap();
    println!("Create Booking Status: {}, Body: {}", status, text);
    assert_eq!(status, 201);
    
    let booking_data: Value = serde_json::from_str(&text).unwrap();
    let booking_id = booking_data["id"].as_str().unwrap();

    // Update Booking Status
    let res = client.put(&format!("{}/api/v1/spa/bookings/{}", base_url, booking_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "status": "Confirmed"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let updated_booking: Value = res.json().await.unwrap();
    assert_eq!(updated_booking["status"], "Confirmed");

    // List Bookings
    let res = client.get(&format!("{}/api/v1/spa/bookings", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let bookings: Vec<Value> = res.json().await.unwrap();
    assert!(!bookings.is_empty());

    // Upsert Skin Profile
    let res = client.post(&format!("{}/api/v1/spa/skin-profiles", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "customer_id": customer_id,
            "skin_type": "Dầu",
            "issues": ["Mụn cám", "Lỗ chân lông to"],
            "current_treatment": "Nặn mụn + peel da AHA",
            "history": [{"date": "2026-07-15", "note": "Buổi đầu tiên"}],
            "photos": ["https://photo.url/before.jpg"]
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);

    // Get Skin Profile
    let res = client.get(&format!("{}/api/v1/spa/skin-profiles/{}", base_url, customer_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let skin_profile: Value = res.json().await.unwrap();
    assert_eq!(skin_profile["skin_type"], "Dầu");

    // Create Course
    let res = client.post(&format!("{}/api/v1/spa/courses", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "customer_id": customer_id,
            "course_name": "Combo 10 buổi trị mụn",
            "total_sessions": 10
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let course_data: Value = res.json().await.unwrap();
    let course_id = course_data["id"].as_str().unwrap();

    // Use Course Session
    let res = client.post(&format!("{}/api/v1/spa/courses/use/{}", base_url, course_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let used_course: Value = res.json().await.unwrap();
    assert_eq!(used_course["used_sessions"], 1);

    // List Courses
    let res = client.get(&format!("{}/api/v1/spa/courses", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let courses: Vec<Value> = res.json().await.unwrap();
    assert!(!courses.is_empty());

    // -------------------------------------------------------------------------
    // AUTO REPAIR & GARAGE PACK TESTS
    // -------------------------------------------------------------------------

    // Register Vehicle
    let res = client.post(&format!("{}/api/v1/garage/vehicles", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "license_plate": "30A-999.99",
            "brand": "Mercedes-Benz",
            "model": "C200",
            "year": 2022,
            "owner_customer_id": customer_id,
            "current_mileage": 12000
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let vehicle_data: Value = res.json().await.unwrap();
    let vehicle_id = vehicle_data["id"].as_str().unwrap();

    // Search Vehicle by license plate
    let res = client.get(&format!("{}/api/v1/garage/vehicles?license_plate=30A", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let vehicles: Vec<Value> = res.json().await.unwrap();
    assert!(!vehicles.is_empty());
    assert_eq!(vehicles[0]["license_plate"], "30A-999.99");

    // Create Repair Order
    let res = client.post(&format!("{}/api/v1/garage/repair-orders", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "vehicle_id": vehicle_id,
            "symptoms": "Điều hòa không mát, có tiếng kêu ở khoang động cơ",
            "diagnosis_items": [
                {"item": "Thay lọc gió điều hòa", "cost": 350000.0},
                {"item": "Nạp ga điều hòa", "cost": 800000.0}
            ],
            "total_estimate": 1150000.0
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let order_data: Value = res.json().await.unwrap();
    let order_id = order_data["id"].as_str().unwrap();
    assert_eq!(order_data["total_estimate"].as_f64().unwrap(), 1150000.0);

    // List Repair Orders
    let res = client.get(&format!("{}/api/v1/garage/repair-orders", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let orders: Vec<Value> = res.json().await.unwrap();
    assert!(!orders.is_empty());

    // Approve Repair Order (Customer Approved)
    let res = client.put(&format!("{}/api/v1/garage/repair-orders/{}/approve", base_url, order_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let approved_order: Value = res.json().await.unwrap();
    assert!(approved_order["customer_approved"].as_bool().unwrap());
    assert_eq!(approved_order["status"], "Approved");

    // Complete Repair Order
    let res = client.put(&format!("{}/api/v1/garage/repair-orders/{}/complete", base_url, order_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let completed_order: Value = res.json().await.unwrap();
    assert_eq!(completed_order["status"], "Completed");

    // =========================================================================
    // F&B Solution Pack Integration Tests
    // =========================================================================

    // List F&B menu items (and verify seeding)
    let res = client.get(&format!("{}/api/v1/fb/menu-items", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let menu_items: Vec<Value> = res.json().await.unwrap();
    assert!(!menu_items.is_empty());
    assert_eq!(menu_items[0]["name"], "Phở Bò Kobe");

    // Create F&B Order
    let res = client.post(&format!("{}/api/v1/fb/orders", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "table_number": "Bàn 12",
            "source": "Table",
            "items": [
                {"name": "Phở Bò Kobe", "price": 189000.0, "quantity": 2},
                {"name": "Cà Phê Muối Trứng", "price": 49000.0, "quantity": 2}
            ],
            "total_amount": 476000.0,
            "notes": "Nhiều hành, ít bánh"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let order_fb: Value = res.json().await.unwrap();
    let fb_order_id = order_fb["id"].as_str().unwrap();
    assert_eq!(order_fb["total_amount"].as_f64().unwrap(), 476000.0);

    // List F&B Orders
    let res = client.get(&format!("{}/api/v1/fb/orders", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let fb_orders: Vec<Value> = res.json().await.unwrap();
    assert!(!fb_orders.is_empty());
    assert_eq!(fb_orders[0]["table_number"], "Bàn 12");

    // Update F&B Order Status
    let res = client.put(&format!("{}/api/v1/fb/orders/{}/status", base_url, fb_order_id))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "status": "Completed"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let updated_fb_order: Value = res.json().await.unwrap();
    assert_eq!(updated_fb_order["status"], "Completed");
    assert!(updated_fb_order["completed_at"].is_string());

    // Create F&B Shift
    let res = client.post(&format!("{}/api/v1/fb/shifts", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "shift_date": "2026-07-15",
            "shift_type": "Morning",
            "planned_staff": ["SME_OPS", "FIELD_WORKER"],
            "notes": "Mở ca đầu sáng"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);

    // List F&B Shifts
    let res = client.get(&format!("{}/api/v1/fb/shifts", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let shifts: Vec<Value> = res.json().await.unwrap();
    assert!(!shifts.is_empty());

    // =========================================================================
    // Edu & Training Pack Integration Tests
    // =========================================================================

    // List classes (and verify seeding)
    let res = client.get(&format!("{}/api/v1/edu/classes", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let classes: Vec<Value> = res.json().await.unwrap();
    assert!(!classes.is_empty());
    let class_id = classes[0]["id"].as_str().unwrap();

    // List students (and verify seeding)
    let res = client.get(&format!("{}/api/v1/edu/students", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let students: Vec<Value> = res.json().await.unwrap();
    assert!(!students.is_empty());
    let student_id = students[0]["id"].as_str().unwrap();

    // Create Grade Record (with AI study report simulation)
    let res = client.post(&format!("{}/api/v1/edu/grade-records", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "student_id": student_id,
            "class_id": class_id,
            "test_type": "GiuaKy",
            "subject": "Writing",
            "score": 85.0,
            "max_score": 100.0,
            "feedback": "Học sinh viết tốt, cần chú ý thì hoàn thành."
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);
    let grade: Value = res.json().await.unwrap();
    assert_eq!(grade["score"].as_f64().unwrap(), 85.0);
    assert!(grade["ai_report"].as_str().unwrap().contains("AI"));

    // List Grade Records
    let res = client.get(&format!("{}/api/v1/edu/grade-records", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let grades: Vec<Value> = res.json().await.unwrap();
    assert!(!grades.is_empty());

    // Create Payment
    let res = client.post(&format!("{}/api/v1/edu/payments", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .json(&json!({
            "student_id": student_id,
            "amount": 2500000.0,
            "due_date": "2026-08-01",
            "note": "Học phí khóa IELTS Kids tháng 8"
        }))
        .send().await.unwrap();
    assert_eq!(res.status(), 201);

    // List Payments
    let res = client.get(&format!("{}/api/v1/edu/payments", base_url))
        .bearer_auth(&access_token)
        .header("x-nextflow-tenant-id", TEST_TENANT_ID)
        .send().await.unwrap();
    assert_eq!(res.status(), 200);
    let payments: Vec<Value> = res.json().await.unwrap();
    assert!(!payments.is_empty());
}
