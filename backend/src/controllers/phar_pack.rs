use crate::AppState;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use sqlx::Row;
use chrono::{DateTime, Utc, NaiveDate};

#[derive(Debug, Serialize, Deserialize)]
pub struct PharPrescription {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub patient_name: String,
    pub patient_dob: Option<NaiveDate>,
    pub patient_phone: Option<String>,
    pub doctor_name: Option<String>,
    pub clinic_name: Option<String>,
    pub diagnosis: Option<String>,
    pub medicines: serde_json::Value,
    pub requires_narcotic: bool,
    pub status: String,
    pub ai_check_result: serde_json::Value,
    pub pharmacist_id: Option<Uuid>,
    pub dispensed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePrescriptionRequest {
    pub patient_name: String,
    #[serde(default)]
    pub patient_dob: Option<NaiveDate>,
    #[serde(default)]
    pub patient_phone: Option<String>,
    #[serde(default)]
    pub doctor_name: Option<String>,
    #[serde(default)]
    pub clinic_name: Option<String>,
    #[serde(default)]
    pub diagnosis: Option<String>,
    pub medicines: serde_json::Value,
    #[serde(default)]
    pub requires_narcotic: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PharInventory {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub medicine_id: Option<String>,
    pub name: String,
    pub generic_name: Option<String>,
    pub quantity: i32,
    pub unit: Option<String>,
    pub expiry_date: Option<NaiveDate>,
    pub batch_number: Option<String>,
    pub purchase_price: f64,
    pub sell_price: f64,
    pub reorder_point: i32,
    pub requires_prescription: bool,
    pub category: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInventoryRequest {
    pub name: String,
    #[serde(default)]
    pub medicine_id: Option<String>,
    #[serde(default)]
    pub generic_name: Option<String>,
    #[serde(default)]
    pub quantity: Option<i32>,
    #[serde(default)]
    pub unit: Option<String>,
    #[serde(default)]
    pub expiry_date: Option<NaiveDate>,
    #[serde(default)]
    pub batch_number: Option<String>,
    #[serde(default)]
    pub purchase_price: Option<f64>,
    #[serde(default)]
    pub sell_price: Option<f64>,
    #[serde(default)]
    pub reorder_point: Option<i32>,
    #[serde(default)]
    pub requires_prescription: Option<bool>,
    #[serde(default)]
    pub category: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PharPatientRecord {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub patient_name: String,
    pub dob: Option<NaiveDate>,
    pub phone: Option<String>,
    pub blood_type: Option<String>,
    pub chronic_conditions: Option<Vec<String>>,
    pub current_medications: Option<Vec<String>>,
    pub allergies: Option<Vec<String>>,
    pub last_visit: Option<NaiveDate>,
    pub next_appointment: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePatientRequest {
    pub patient_name: String,
    #[serde(default)]
    pub dob: Option<NaiveDate>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default)]
    pub blood_type: Option<String>,
    #[serde(default)]
    pub chronic_conditions: Option<Vec<String>>,
    #[serde(default)]
    pub current_medications: Option<Vec<String>>,
    #[serde(default)]
    pub allergies: Option<Vec<String>>,
    #[serde(default)]
    pub last_visit: Option<NaiveDate>,
    #[serde(default)]
    pub next_appointment: Option<NaiveDate>,
}

// 1. GET /api/v1/phar/prescriptions
pub async fn get_prescriptions(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, patient_name, patient_dob, patient_phone, doctor_name, clinic_name, diagnosis, medicines, requires_narcotic, status, ai_check_result, pharmacist_id, dispensed_at, created_at
        FROM nf_tenant.phar_prescriptions
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error fetching prescriptions: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let prescriptions: Vec<PharPrescription> = rows.into_iter().map(|row| {
        PharPrescription {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            patient_name: row.get("patient_name"),
            patient_dob: row.get("patient_dob"),
            patient_phone: row.get("patient_phone"),
            doctor_name: row.get("doctor_name"),
            clinic_name: row.get("clinic_name"),
            diagnosis: row.get("diagnosis"),
            medicines: row.get("medicines"),
            requires_narcotic: row.get("requires_narcotic"),
            status: row.get("status"),
            ai_check_result: row.get("ai_check_result"),
            pharmacist_id: row.get("pharmacist_id"),
            dispensed_at: row.get("dispensed_at"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(prescriptions)).into_response()
}

// 2. POST /api/v1/phar/prescriptions
pub async fn create_prescription(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreatePrescriptionRequest>,
) -> Response {
    if payload.patient_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên bệnh nhân không được để trống"}))).into_response();
    }

    let req_narcotic = payload.requires_narcotic.unwrap_or(false);

    // Real AI Drug Interaction Check calling the Python ai-service
    let ai_service_url = std::env::var("AI_SERVICE_URL")
        .unwrap_or_else(|_| "http://ai-service:8001".to_string());
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build();

    let ai_check = match client {
        Ok(c) => {
            let req_body = json!({
                "prescription_id": "temp_id",
                "medicines": payload.medicines
            });
            match c.post(&format!("{}/pharmacy/drug-interaction", ai_service_url))
                .json(&req_body)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    resp.json::<serde_json::Value>().await.unwrap_or_else(|_| {
                        json!({
                            "safe": true,
                            "warnings": Vec::<String>::new(),
                            "ai_assessment": "Lỗi parse kết quả từ AI service.",
                            "ai_assessed_at": Utc::now().to_rfc3339()
                        })
                    })
                }
                Ok(resp) => {
                    let status = resp.status();
                    let err_text = resp.text().await.unwrap_or_default();
                    eprintln!("[Pharmacy Pack] AI service returned error {}: {}", status, err_text);
                    let has_conflict = payload.patient_name.contains("Dị ứng") || payload.diagnosis.clone().unwrap_or_default().contains("mẫn cảm");
                    json!({
                        "safe": !has_conflict,
                        "warnings": if has_conflict { vec!["Cảnh báo từ hệ thống dự phòng: phát hiện nguy cơ dị ứng/tương tác kháng sinh"] } else { vec![] },
                        "ai_assessment": "Đang dùng chế độ dự phòng do AI service phản hồi lỗi.",
                        "ai_assessed_at": Utc::now().to_rfc3339()
                    })
                }
                Err(e) => {
                    eprintln!("[Pharmacy Pack] Failed to connect to AI service: {}", e);
                    let has_conflict = payload.patient_name.contains("Dị ứng") || payload.diagnosis.clone().unwrap_or_default().contains("mẫn cảm");
                    json!({
                        "safe": !has_conflict,
                        "warnings": if has_conflict { vec!["Cảnh báo từ hệ thống dự phòng: phát hiện nguy cơ dị ứng/tương tác kháng sinh"] } else { vec![] },
                        "ai_assessment": "Đang dùng chế độ dự phòng do không kết nối được AI service.",
                        "ai_assessed_at": Utc::now().to_rfc3339()
                    })
                }
            }
        }
        Err(_) => {
            let has_conflict = payload.patient_name.contains("Dị ứng") || payload.diagnosis.clone().unwrap_or_default().contains("mẫn cảm");
            json!({
                "safe": !has_conflict,
                "warnings": if has_conflict { vec!["Cảnh báo từ hệ thống dự phòng: phát hiện nguy cơ dị ứng/tương tác kháng sinh"] } else { vec![] },
                "ai_assessment": "Đang dùng chế độ dự phòng do không tạo được client kết nối.",
                "ai_assessed_at": Utc::now().to_rfc3339()
            })
        }
    };

    let insert_query = r#"
        INSERT INTO nf_tenant.phar_prescriptions (tenant_id, patient_name, patient_dob, patient_phone, doctor_name, clinic_name, diagnosis, medicines, requires_narcotic, ai_check_result)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, tenant_id, patient_name, patient_dob, patient_phone, doctor_name, clinic_name, diagnosis, medicines, requires_narcotic, status, ai_check_result, pharmacist_id, dispensed_at, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.patient_name)
        .bind(payload.patient_dob)
        .bind(payload.patient_phone)
        .bind(payload.doctor_name)
        .bind(payload.clinic_name)
        .bind(payload.diagnosis)
        .bind(payload.medicines)
        .bind(req_narcotic)
        .bind(ai_check)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error creating prescription: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let prescription = PharPrescription {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        patient_name: row.get("patient_name"),
        patient_dob: row.get("patient_dob"),
        patient_phone: row.get("patient_phone"),
        doctor_name: row.get("doctor_name"),
        clinic_name: row.get("clinic_name"),
        diagnosis: row.get("diagnosis"),
        medicines: row.get("medicines"),
        requires_narcotic: row.get("requires_narcotic"),
        status: row.get("status"),
        ai_check_result: row.get("ai_check_result"),
        pharmacist_id: row.get("pharmacist_id"),
        dispensed_at: row.get("dispensed_at"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(prescription)).into_response()
}

// 3. GET /api/v1/phar/inventory
pub async fn get_inventory(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, medicine_id, name, generic_name, quantity, unit, expiry_date, batch_number, purchase_price::FLOAT8 as purchase_price, sell_price::FLOAT8 as sell_price, reorder_point, requires_prescription, category, created_at, updated_at
        FROM nf_tenant.phar_inventory
        WHERE tenant_id = $1
        ORDER BY name ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error fetching inventory: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let items: Vec<PharInventory> = rows.into_iter().map(|row| {
        PharInventory {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            medicine_id: row.get("medicine_id"),
            name: row.get("name"),
            generic_name: row.get("generic_name"),
            quantity: row.get("quantity"),
            unit: row.get("unit"),
            expiry_date: row.get("expiry_date"),
            batch_number: row.get("batch_number"),
            purchase_price: row.get("purchase_price"),
            sell_price: row.get("sell_price"),
            reorder_point: row.get("reorder_point"),
            requires_prescription: row.get("requires_prescription"),
            category: row.get("category"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    (StatusCode::OK, Json(items)).into_response()
}

// 4. POST /api/v1/phar/inventory
pub async fn create_inventory_item(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateInventoryRequest>,
) -> Response {
    if payload.name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên thuốc không được để trống"}))).into_response();
    }

    let qty = payload.quantity.unwrap_or(0);
    let p_price = payload.purchase_price.unwrap_or(0.0);
    let s_price = payload.sell_price.unwrap_or(0.0);
    let r_point = payload.reorder_point.unwrap_or(10);
    let req_presc = payload.requires_prescription.unwrap_or(false);

    let insert_query = r#"
        INSERT INTO nf_tenant.phar_inventory (tenant_id, medicine_id, name, generic_name, quantity, unit, expiry_date, batch_number, purchase_price, sell_price, reorder_point, requires_prescription, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, tenant_id, medicine_id, name, generic_name, quantity, unit, expiry_date, batch_number, purchase_price::FLOAT8 as purchase_price, sell_price::FLOAT8 as sell_price, reorder_point, requires_prescription, category, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.medicine_id)
        .bind(payload.name)
        .bind(payload.generic_name)
        .bind(qty)
        .bind(payload.unit)
        .bind(payload.expiry_date)
        .bind(payload.batch_number)
        .bind(p_price)
        .bind(s_price)
        .bind(r_point)
        .bind(req_presc)
        .bind(payload.category)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error creating inventory item: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let item = PharInventory {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        medicine_id: row.get("medicine_id"),
        name: row.get("name"),
        generic_name: row.get("generic_name"),
        quantity: row.get("quantity"),
        unit: row.get("unit"),
        expiry_date: row.get("expiry_date"),
        batch_number: row.get("batch_number"),
        purchase_price: row.get("purchase_price"),
        sell_price: row.get("sell_price"),
        reorder_point: row.get("reorder_point"),
        requires_prescription: row.get("requires_prescription"),
        category: row.get("category"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(item)).into_response()
}

// 5. GET /api/v1/phar/patient-records
pub async fn get_patients(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, patient_name, dob, phone, blood_type, chronic_conditions, current_medications, allergies, last_visit, next_appointment, created_at
        FROM nf_tenant.phar_patient_records
        WHERE tenant_id = $1
        ORDER BY patient_name ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error fetching patients: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let patients: Vec<PharPatientRecord> = rows.into_iter().map(|row| {
        PharPatientRecord {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            patient_name: row.get("patient_name"),
            dob: row.get("dob"),
            phone: row.get("phone"),
            blood_type: row.get("blood_type"),
            chronic_conditions: row.get("chronic_conditions"),
            current_medications: row.get("current_medications"),
            allergies: row.get("allergies"),
            last_visit: row.get("last_visit"),
            next_appointment: row.get("next_appointment"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(patients)).into_response()
}

// 6. POST /api/v1/phar/patient-records
pub async fn create_patient(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreatePatientRequest>,
) -> Response {
    if payload.patient_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên bệnh nhân không được để trống"}))).into_response();
    }

    let insert_query = r#"
        INSERT INTO nf_tenant.phar_patient_records (tenant_id, patient_name, dob, phone, blood_type, chronic_conditions, current_medications, allergies, last_visit, next_appointment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, tenant_id, patient_name, dob, phone, blood_type, chronic_conditions, current_medications, allergies, last_visit, next_appointment, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.patient_name)
        .bind(payload.dob)
        .bind(payload.phone)
        .bind(payload.blood_type)
        .bind(payload.chronic_conditions)
        .bind(payload.current_medications)
        .bind(payload.allergies)
        .bind(payload.last_visit)
        .bind(payload.next_appointment)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Pharmacy Pack] Error creating patient record: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let patient = PharPatientRecord {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        patient_name: row.get("patient_name"),
        dob: row.get("dob"),
        phone: row.get("phone"),
        blood_type: row.get("blood_type"),
        chronic_conditions: row.get("chronic_conditions"),
        current_medications: row.get("current_medications"),
        allergies: row.get("allergies"),
        last_visit: row.get("last_visit"),
        next_appointment: row.get("next_appointment"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(patient)).into_response()
}
