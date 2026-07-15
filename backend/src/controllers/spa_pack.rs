use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveDate};

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct SpaBooking {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub customer_id: Uuid,
    pub service: String,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub technician_id: Option<Uuid>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookingRequest {
    pub customer_id: Uuid,
    pub service: String,
    #[serde(default)]
    pub scheduled_at: Option<DateTime<Utc>>,
    #[serde(default)]
    pub technician_id: Option<Uuid>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookingStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SpaSkinProfile {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub customer_id: Uuid,
    pub skin_type: Option<String>,
    pub issues: Option<Vec<String>>,
    pub current_treatment: Option<String>,
    pub history: serde_json::Value,
    pub photos: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpsertSkinProfileRequest {
    pub customer_id: Uuid,
    #[serde(default)]
    pub skin_type: Option<String>,
    #[serde(default)]
    pub issues: Option<Vec<String>>,
    #[serde(default)]
    pub current_treatment: Option<String>,
    #[serde(default)]
    pub history: Option<serde_json::Value>,
    #[serde(default)]
    pub photos: Option<Vec<String>>,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct SpaCourse {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub customer_id: Uuid,
    pub course_name: String,
    pub total_sessions: i32,
    pub used_sessions: i32,
    pub expiry_date: Option<NaiveDate>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCourseRequest {
    pub customer_id: Uuid,
    pub course_name: String,
    pub total_sessions: Option<i32>,
    pub expiry_date: Option<NaiveDate>,
}

// 1. GET /api/v1/spa/bookings
pub async fn get_bookings(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, customer_id, service, scheduled_at, technician_id, status, notes, created_at, updated_at
        FROM nf_tenant.spa_bookings
        WHERE tenant_id = $1
        ORDER BY scheduled_at ASC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error fetching bookings: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut bookings = Vec::new();
    for row in rows {
        bookings.push(SpaBooking {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            customer_id: row.get("customer_id"),
            service: row.get("service"),
            scheduled_at: row.get("scheduled_at"),
            technician_id: row.get("technician_id"),
            status: row.get("status"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(bookings)).into_response()
}

// 2. POST /api/v1/spa/bookings
pub async fn create_booking(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateBookingRequest>,
) -> Response {
    if payload.service.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Dịch vụ không được để trống"}))).into_response();
    }

    let insert_query = r#"
        INSERT INTO nf_tenant.spa_bookings (tenant_id, customer_id, service, scheduled_at, technician_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tenant_id, customer_id, service, scheduled_at, technician_id, status, notes, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.customer_id)
        .bind(payload.service)
        .bind(payload.scheduled_at)
        .bind(payload.technician_id)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error creating booking: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let booking = SpaBooking {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        service: row.get("service"),
        scheduled_at: row.get("scheduled_at"),
        technician_id: row.get("technician_id"),
        status: row.get("status"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(booking)).into_response()
}

// 3. PUT /api/v1/spa/bookings/:id
pub async fn update_booking_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateBookingStatusRequest>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.spa_bookings
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, tenant_id, customer_id, service, scheduled_at, technician_id, status, notes, created_at, updated_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(payload.status)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(r)) => r,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy lịch hẹn"}))).into_response(),
        Err(e) => {
            eprintln!("[Spa Pack] Error updating booking status: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let booking = SpaBooking {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        service: row.get("service"),
        scheduled_at: row.get("scheduled_at"),
        technician_id: row.get("technician_id"),
        status: row.get("status"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(booking)).into_response()
}

// 4. GET /api/v1/spa/skin-profiles/:customerId
pub async fn get_skin_profile(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(customer_id): Path<Uuid>,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, customer_id, skin_type, issues, current_treatment, history, photos, created_at, updated_at
        FROM nf_tenant.spa_skin_profiles
        WHERE tenant_id = $1 AND customer_id = $2
    "#;

    let row = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .bind(customer_id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(r)) => r,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy hồ sơ da cho khách hàng này"}))).into_response(),
        Err(e) => {
            eprintln!("[Spa Pack] Error fetching skin profile: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let profile = SpaSkinProfile {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        skin_type: row.get("skin_type"),
        issues: row.get("issues"),
        current_treatment: row.get("current_treatment"),
        history: row.get("history"),
        photos: row.get("photos"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(profile)).into_response()
}

// 5. POST /api/v1/spa/skin-profiles
pub async fn upsert_skin_profile(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<UpsertSkinProfileRequest>,
) -> Response {
    let history = payload.history.unwrap_or_else(|| json!([]));
    let upsert_query = r#"
        INSERT INTO nf_tenant.spa_skin_profiles (tenant_id, customer_id, skin_type, issues, current_treatment, history, photos)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tenant_id, customer_id) DO UPDATE
        SET skin_type = EXCLUDED.skin_type,
            issues = EXCLUDED.issues,
            current_treatment = EXCLUDED.current_treatment,
            history = EXCLUDED.history,
            photos = EXCLUDED.photos,
            updated_at = NOW()
        RETURNING id, tenant_id, customer_id, skin_type, issues, current_treatment, history, photos, created_at, updated_at
    "#;

    let row = match sqlx::query(upsert_query)
        .bind(tenant.tenant_id)
        .bind(payload.customer_id)
        .bind(payload.skin_type)
        .bind(payload.issues)
        .bind(payload.current_treatment)
        .bind(history)
        .bind(payload.photos)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error upserting skin profile: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let profile = SpaSkinProfile {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        skin_type: row.get("skin_type"),
        issues: row.get("issues"),
        current_treatment: row.get("current_treatment"),
        history: row.get("history"),
        photos: row.get("photos"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(profile)).into_response()
}

// 6. GET /api/v1/spa/courses
pub async fn get_courses(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, customer_id, course_name, total_sessions, used_sessions, expiry_date, status, created_at, updated_at
        FROM nf_tenant.spa_courses
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
            eprintln!("[Spa Pack] Error fetching courses: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut courses = Vec::new();
    for row in rows {
        courses.push(SpaCourse {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            customer_id: row.get("customer_id"),
            course_name: row.get("course_name"),
            total_sessions: row.get("total_sessions"),
            used_sessions: row.get("used_sessions"),
            expiry_date: row.get("expiry_date"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(courses)).into_response()
}

// 7. POST /api/v1/spa/courses/use/:id
pub async fn use_course_session(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
) -> Response {
    // 1. Fetch course to verify session limit
    let fetch_query = "SELECT total_sessions, used_sessions FROM nf_tenant.spa_courses WHERE id = $1 AND tenant_id = $2";
    let course_opt = match sqlx::query(fetch_query)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error verifying course: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let course_row = match course_opt {
        Some(r) => r,
        None => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy liệu trình"}))).into_response(),
    };

    let total: i32 = course_row.get("total_sessions");
    let used: i32 = course_row.get("used_sessions");

    if used >= total {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Liệu trình đã hết số buổi sử dụng"}))).into_response();
    }

    let next_used = used + 1;
    let next_status = if next_used >= total { "Completed" } else { "Active" };

    let update_query = r#"
        UPDATE nf_tenant.spa_courses
        SET used_sessions = $1, status = $2, updated_at = NOW()
        WHERE id = $3 AND tenant_id = $4
        RETURNING id, tenant_id, customer_id, course_name, total_sessions, used_sessions, expiry_date, status, created_at, updated_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(next_used)
        .bind(next_status)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error updating course sessions: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let updated_course = SpaCourse {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        course_name: row.get("course_name"),
        total_sessions: row.get("total_sessions"),
        used_sessions: row.get("used_sessions"),
        expiry_date: row.get("expiry_date"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(updated_course)).into_response()
}

#[derive(Debug, Deserialize)]
pub struct CreateCourseWebRequest {
    pub customer_id: Uuid,
    pub course_name: String,
    pub total_sessions: i32,
    pub expiry_date: Option<NaiveDate>,
}

// 8. POST /api/v1/spa/courses
pub async fn create_course(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateCourseWebRequest>,
) -> Response {
    if payload.course_name.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Tên liệu trình không được để trống"}))).into_response();
    }

    let insert_query = r#"
        INSERT INTO nf_tenant.spa_courses (tenant_id, customer_id, course_name, total_sessions, expiry_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, tenant_id, customer_id, course_name, total_sessions, used_sessions, expiry_date, status, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.customer_id)
        .bind(payload.course_name)
        .bind(payload.total_sessions)
        .bind(payload.expiry_date)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Spa Pack] Error creating course: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let course = SpaCourse {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        customer_id: row.get("customer_id"),
        course_name: row.get("course_name"),
        total_sessions: row.get("total_sessions"),
        used_sessions: row.get("used_sessions"),
        expiry_date: row.get("expiry_date"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(course)).into_response()
}
