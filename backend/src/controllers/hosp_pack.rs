use crate::AppState;
use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use crate::middleware::tenant_isolation::TenantIsolation;
use sqlx::Row;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct HospRoom {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub room_number: String,
    pub room_type: Option<String>,
    pub floor: Option<i32>,
    pub status: String,
    pub last_cleaned: Option<DateTime<Utc>>,
    pub smart_lock_code: Option<String>,
    pub amenities: Option<Vec<String>>,
    pub base_price: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
    pub room_number: String,
    #[serde(default)]
    pub room_type: Option<String>,
    #[serde(default)]
    pub floor: Option<i32>,
    #[serde(default)]
    pub smart_lock_code: Option<String>,
    #[serde(default)]
    pub amenities: Option<Vec<String>>,
    #[serde(default)]
    pub base_price: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HospBooking {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub room_id: Option<Uuid>,
    pub guest_name: String,
    pub guest_email: Option<String>,
    pub guest_phone: Option<String>,
    pub check_in: DateTime<Utc>,
    pub check_out: DateTime<Utc>,
    pub source: String,
    pub status: String,
    pub special_requests: Option<String>,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookingRequest {
    pub room_id: Option<Uuid>,
    pub guest_name: String,
    #[serde(default)]
    pub guest_email: Option<String>,
    #[serde(default)]
    pub guest_phone: Option<String>,
    pub check_in: DateTime<Utc>,
    pub check_out: DateTime<Utc>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub special_requests: Option<String>,
    #[serde(default)]
    pub total_amount: Option<f64>,
    #[serde(default)]
    pub paid_amount: Option<f64>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookingStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HospServiceRequest {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub booking_id: Option<Uuid>,
    pub request_type: Option<String>,
    pub requested_at: DateTime<Utc>,
    pub fulfilled_at: Option<DateTime<Utc>>,
    pub assigned_to: Option<Uuid>,
    pub status: String,
    pub charge: f64,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateServiceRequest {
    pub booking_id: Option<Uuid>,
    pub request_type: String,
    #[serde(default)]
    pub charge: Option<f64>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServiceStatusRequest {
    pub status: String,
}

// 1. GET /api/v1/hosp/rooms
pub async fn get_rooms(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, room_number, room_type, floor, status, last_cleaned, smart_lock_code, amenities, base_price::FLOAT8 as base_price, created_at
        FROM nf_tenant.hosp_rooms
        WHERE tenant_id = $1
        ORDER BY room_number ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error fetching rooms: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let rooms: Vec<HospRoom> = rows.into_iter().map(|row| {
        HospRoom {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            room_number: row.get("room_number"),
            room_type: row.get("room_type"),
            floor: row.get("floor"),
            status: row.get("status"),
            last_cleaned: row.get("last_cleaned"),
            smart_lock_code: row.get("smart_lock_code"),
            amenities: row.get("amenities"),
            base_price: row.get("base_price"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(rooms)).into_response()
}

// 2. POST /api/v1/hosp/rooms
pub async fn create_room(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateRoomRequest>,
) -> Response {
    if payload.room_number.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Số phòng không được để trống"}))).into_response();
    }

    let base_price = payload.base_price.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.hosp_rooms (tenant_id, room_number, room_type, floor, smart_lock_code, amenities, base_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, room_number, room_type, floor, status, last_cleaned, smart_lock_code, amenities, base_price::FLOAT8 as base_price, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.room_number)
        .bind(payload.room_type)
        .bind(payload.floor)
        .bind(payload.smart_lock_code)
        .bind(payload.amenities)
        .bind(base_price)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error creating room: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let room = HospRoom {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        room_number: row.get("room_number"),
        room_type: row.get("room_type"),
        floor: row.get("floor"),
        status: row.get("status"),
        last_cleaned: row.get("last_cleaned"),
        smart_lock_code: row.get("smart_lock_code"),
        amenities: row.get("amenities"),
        base_price: row.get("base_price"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(room)).into_response()
}

// 3. GET /api/v1/hosp/bookings
pub async fn get_bookings(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, source, status, special_requests, total_amount::FLOAT8 as total_amount, paid_amount::FLOAT8 as paid_amount, notes, created_at
        FROM nf_tenant.hosp_bookings
        WHERE tenant_id = $1
        ORDER BY check_in DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error fetching bookings: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let bookings: Vec<HospBooking> = rows.into_iter().map(|row| {
        HospBooking {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            room_id: row.get("room_id"),
            guest_name: row.get("guest_name"),
            guest_email: row.get("guest_email"),
            guest_phone: row.get("guest_phone"),
            check_in: row.get("check_in"),
            check_out: row.get("check_out"),
            source: row.get("source"),
            status: row.get("status"),
            special_requests: row.get("special_requests"),
            total_amount: row.get("total_amount"),
            paid_amount: row.get("paid_amount"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(bookings)).into_response()
}

// 4. POST /api/v1/hosp/bookings
pub async fn create_booking(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateBookingRequest>,
) -> Response {
    if payload.guest_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên khách hàng không được để trống"}))).into_response();
    }

    let total_amount = payload.total_amount.unwrap_or(0.0);
    let paid_amount = payload.paid_amount.unwrap_or(0.0);
    let source = payload.source.unwrap_or_else(|| "Direct".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.hosp_bookings (tenant_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, source, special_requests, total_amount, paid_amount, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, tenant_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, source, status, special_requests, total_amount::FLOAT8 as total_amount, paid_amount::FLOAT8 as paid_amount, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.room_id)
        .bind(payload.guest_name)
        .bind(payload.guest_email)
        .bind(payload.guest_phone)
        .bind(payload.check_in)
        .bind(payload.check_out)
        .bind(source)
        .bind(payload.special_requests)
        .bind(total_amount)
        .bind(paid_amount)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error creating booking: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // Dynamic state update of Room status to 'Booked'
    let _ = sqlx::query("UPDATE nf_tenant.hosp_rooms SET status = 'Booked' WHERE id = $1 AND tenant_id = $2")
        .bind(payload.room_id)
        .bind(tenant.tenant_id)
        .execute(&state.pool)
        .await;

    let booking = HospBooking {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        room_id: row.get("room_id"),
        guest_name: row.get("guest_name"),
        guest_email: row.get("guest_email"),
        guest_phone: row.get("guest_phone"),
        check_in: row.get("check_in"),
        check_out: row.get("check_out"),
        source: row.get("source"),
        status: row.get("status"),
        special_requests: row.get("special_requests"),
        total_amount: row.get("total_amount"),
        paid_amount: row.get("paid_amount"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(booking)).into_response()
}

// 5. PUT /api/v1/hosp/bookings/:id/status
pub async fn update_booking_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateBookingStatusRequest>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.hosp_bookings
        SET status = $1
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, tenant_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, source, status, special_requests, total_amount::FLOAT8 as total_amount, paid_amount::FLOAT8 as paid_amount, notes, created_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(&payload.status)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error updating booking status: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // If booking status transitions to CheckedOut/Cancelled, release room to Available
    let room_id: Option<Uuid> = row.get("room_id");
    if let Some(r_id) = room_id {
        if payload.status == "CheckedOut" || payload.status == "Cancelled" {
            let _ = sqlx::query("UPDATE nf_tenant.hosp_rooms SET status = 'Available' WHERE id = $1 AND tenant_id = $2")
                .bind(r_id)
                .bind(tenant.tenant_id)
                .execute(&state.pool)
                .await;
        } else if payload.status == "CheckedIn" {
            let _ = sqlx::query("UPDATE nf_tenant.hosp_rooms SET status = 'Occupied' WHERE id = $1 AND tenant_id = $2")
                .bind(r_id)
                .bind(tenant.tenant_id)
                .execute(&state.pool)
                .await;
        }
    }

    let booking = HospBooking {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        room_id,
        guest_name: row.get("guest_name"),
        guest_email: row.get("guest_email"),
        guest_phone: row.get("guest_phone"),
        check_in: row.get("check_in"),
        check_out: row.get("check_out"),
        source: row.get("source"),
        status: row.get("status"),
        special_requests: row.get("special_requests"),
        total_amount: row.get("total_amount"),
        paid_amount: row.get("paid_amount"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::OK, Json(booking)).into_response()
}

// 6. GET /api/v1/hosp/service-requests
pub async fn get_service_requests(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, booking_id, request_type, requested_at, fulfilled_at, assigned_to, status, charge::FLOAT8 as charge, notes
        FROM nf_tenant.hosp_service_requests
        WHERE tenant_id = $1
        ORDER BY requested_at DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error fetching service requests: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let requests: Vec<HospServiceRequest> = rows.into_iter().map(|row| {
        HospServiceRequest {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            booking_id: row.get("booking_id"),
            request_type: row.get("request_type"),
            requested_at: row.get("requested_at"),
            fulfilled_at: row.get("fulfilled_at"),
            assigned_to: row.get("assigned_to"),
            status: row.get("status"),
            charge: row.get("charge"),
            notes: row.get("notes"),
        }
    }).collect();

    (StatusCode::OK, Json(requests)).into_response()
}

// 7. POST /api/v1/hosp/service-requests
pub async fn create_service_request(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateServiceRequest>,
) -> Response {
    if payload.request_type.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Loại dịch vụ không được để trống"}))).into_response();
    }

    let charge = payload.charge.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.hosp_service_requests (tenant_id, booking_id, request_type, charge, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, tenant_id, booking_id, request_type, requested_at, fulfilled_at, assigned_to, status, charge::FLOAT8 as charge, notes
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.booking_id)
        .bind(payload.request_type)
        .bind(charge)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error creating service request: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // If booking_id is provided, automatically add the service charge to the booking total amount
    if let Some(b_id) = payload.booking_id {
        let _ = sqlx::query("UPDATE nf_tenant.hosp_bookings SET total_amount = total_amount + $1 WHERE id = $2 AND tenant_id = $3")
            .bind(charge)
            .bind(b_id)
            .bind(tenant.tenant_id)
            .execute(&state.pool)
            .await;
    }

    let request = HospServiceRequest {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        booking_id: row.get("booking_id"),
        request_type: row.get("request_type"),
        requested_at: row.get("requested_at"),
        fulfilled_at: row.get("fulfilled_at"),
        assigned_to: row.get("assigned_to"),
        status: row.get("status"),
        charge: row.get("charge"),
        notes: row.get("notes"),
    };

    (StatusCode::CREATED, Json(request)).into_response()
}

// 8. PUT /api/v1/hosp/service-requests/:id/status
pub async fn update_service_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateServiceStatusRequest>,
) -> Response {
    let update_query = if payload.status == "Fulfilled" {
        r#"
            UPDATE nf_tenant.hosp_service_requests
            SET status = $1, fulfilled_at = NOW()
            WHERE id = $2 AND tenant_id = $3
            RETURNING id, tenant_id, booking_id, request_type, requested_at, fulfilled_at, assigned_to, status, charge::FLOAT8 as charge, notes
        "#
    } else {
        r#"
            UPDATE nf_tenant.hosp_service_requests
            SET status = $1
            WHERE id = $2 AND tenant_id = $3
            RETURNING id, tenant_id, booking_id, request_type, requested_at, fulfilled_at, assigned_to, status, charge::FLOAT8 as charge, notes
        "#
    };

    let row = match sqlx::query(update_query)
        .bind(&payload.status)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Hosp Pack] Error updating service status: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let request = HospServiceRequest {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        booking_id: row.get("booking_id"),
        request_type: row.get("request_type"),
        requested_at: row.get("requested_at"),
        fulfilled_at: row.get("fulfilled_at"),
        assigned_to: row.get("assigned_to"),
        status: row.get("status"),
        charge: row.get("charge"),
        notes: row.get("notes"),
    };

    (StatusCode::OK, Json(request)).into_response()
}
