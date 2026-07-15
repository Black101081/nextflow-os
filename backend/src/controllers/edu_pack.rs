use crate::AppState;
use axum::{
    extract::{State, Path, Query},
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
pub struct EduStudent {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub dob: Option<NaiveDate>,
    pub gender: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub parent_name: Option<String>,
    pub parent_phone: Option<String>,
    pub parent_email: Option<String>,
    pub current_level: Option<String>,
    pub current_course_id: Option<Uuid>,
    pub total_debt: f64,
    pub attendance_rate: f64,
    pub status: String,
    pub enrolled_at: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudentRequest {
    pub name: String,
    #[serde(default)]
    pub dob: Option<NaiveDate>,
    #[serde(default)]
    pub gender: Option<String>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub parent_name: Option<String>,
    #[serde(default)]
    pub parent_phone: Option<String>,
    #[serde(default)]
    pub parent_email: Option<String>,
    #[serde(default)]
    pub current_level: Option<String>,
    #[serde(default)]
    pub current_course_id: Option<Uuid>,
    #[serde(default)]
    pub total_debt: Option<f64>,
    #[serde(default)]
    pub enrolled_at: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EduClass {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub class_name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateClassRequest {
    pub class_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EduGradeRecord {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub student_id: Uuid,
    pub class_id: Option<Uuid>,
    pub test_type: Option<String>,
    pub subject: Option<String>,
    pub score: f64,
    pub max_score: f64,
    pub feedback: Option<String>,
    pub ai_report: Option<String>,
    pub graded_by: Option<Uuid>,
    pub graded_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateGradeRecordRequest {
    pub student_id: Uuid,
    #[serde(default)]
    pub class_id: Option<Uuid>,
    #[serde(default)]
    pub test_type: Option<String>,
    #[serde(default)]
    pub subject: Option<String>,
    pub score: f64,
    #[serde(default)]
    pub max_score: Option<f64>,
    #[serde(default)]
    pub feedback: Option<String>,
    #[serde(default)]
    pub ai_report: Option<String>,
    #[serde(default)]
    pub graded_by: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EduPayment {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub student_id: Uuid,
    pub amount: f64,
    pub due_date: NaiveDate,
    pub paid_date: Option<NaiveDate>,
    pub paid_amount: Option<f64>,
    pub method: Option<String>,
    pub status: String,
    pub note: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePaymentRequest {
    pub student_id: Uuid,
    pub amount: f64,
    pub due_date: NaiveDate,
    #[serde(default)]
    pub paid_date: Option<NaiveDate>,
    #[serde(default)]
    pub paid_amount: Option<f64>,
    #[serde(default)]
    pub method: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub note: Option<String>,
}

// 1. GET /api/v1/edu/students - List students
pub async fn get_students(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, name, dob, gender, phone, email, parent_name, parent_phone, parent_email, current_level, current_course_id, total_debt::FLOAT8 as total_debt, attendance_rate::FLOAT8 as attendance_rate, status, enrolled_at, created_at, updated_at
        FROM nf_tenant.edu_students
        WHERE tenant_id = $1
        ORDER BY created_at DESC
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut students = Vec::new();
    for row in rows {
        students.push(EduStudent {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            name: row.get("name"),
            dob: row.get("dob"),
            gender: row.get("gender"),
            phone: row.get("phone"),
            email: row.get("email"),
            parent_name: row.get("parent_name"),
            parent_phone: row.get("parent_phone"),
            parent_email: row.get("parent_email"),
            current_level: row.get("current_level"),
            current_course_id: row.get("current_course_id"),
            total_debt: row.get("total_debt"),
            attendance_rate: row.get("attendance_rate"),
            status: row.get("status"),
            enrolled_at: row.get("enrolled_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    // Seed defaults if empty
    if students.is_empty() {
        let seed_query = r#"
            INSERT INTO nf_tenant.edu_students (tenant_id, name, dob, gender, phone, email, parent_name, parent_phone, parent_email, current_level, total_debt, attendance_rate, enrolled_at)
            VALUES 
            ($1, 'Nguyễn Minh Quân', '2018-05-15', 'Nam', '0912345678', 'quan.nm@gmail.com', 'Nguyễn Minh Hùng', '0912345679', 'hung.nm@gmail.com', 'IELTS Kids 1', 1200000, 95.0, '2026-01-10'),
            ($1, 'Trần Thu Trang', '2019-09-20', 'Nữ', '0987654321', 'trang.tt@gmail.com', 'Lê Thị Mai', '0987654322', 'mai.lt@gmail.com', 'Pre-IELTS 2', 0, 100.0, '2026-02-15'),
            ($1, 'Phạm Thành Nam', '2017-02-10', 'Nam', '0905123456', 'nam.pt@gmail.com', 'Phạm Thành Long', '0905123457', 'long.pt@gmail.com', 'IELTS General', 3500000, 88.0, '2026-03-01')
            RETURNING id, tenant_id, name, dob, gender, phone, email, parent_name, parent_phone, parent_email, current_level, current_course_id, total_debt::FLOAT8 as total_debt, attendance_rate::FLOAT8 as attendance_rate, status, enrolled_at, created_at, updated_at
        "#;

        if let Ok(seed_rows) = sqlx::query(seed_query).bind(tenant.tenant_id).fetch_all(&state.pool).await {
            for row in seed_rows {
                students.push(EduStudent {
                    id: row.get("id"),
                    tenant_id: row.get("tenant_id"),
                    name: row.get("name"),
                    dob: row.get("dob"),
                    gender: row.get("gender"),
                    phone: row.get("phone"),
                    email: row.get("email"),
                    parent_name: row.get("parent_name"),
                    parent_phone: row.get("parent_phone"),
                    parent_email: row.get("parent_email"),
                    current_level: row.get("current_level"),
                    current_course_id: row.get("current_course_id"),
                    total_debt: row.get("total_debt"),
                    attendance_rate: row.get("attendance_rate"),
                    status: row.get("status"),
                    enrolled_at: row.get("enrolled_at"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                });
            }
        }
    }

    (StatusCode::OK, Json(students)).into_response()
}

// 2. POST /api/v1/edu/students - Register student
pub async fn create_student(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateStudentRequest>,
) -> Response {
    let debt = payload.total_debt.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.edu_students (tenant_id, name, dob, gender, phone, email, parent_name, parent_phone, parent_email, current_level, current_course_id, total_debt, enrolled_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, tenant_id, name, dob, gender, phone, email, parent_name, parent_phone, parent_email, current_level, current_course_id, total_debt::FLOAT8 as total_debt, attendance_rate::FLOAT8 as attendance_rate, status, enrolled_at, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.name)
        .bind(payload.dob)
        .bind(payload.gender)
        .bind(payload.phone)
        .bind(payload.email)
        .bind(payload.parent_name)
        .bind(payload.parent_phone)
        .bind(payload.parent_email)
        .bind(payload.current_level)
        .bind(payload.current_course_id)
        .bind(debt)
        .bind(payload.enrolled_at)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let student = EduStudent {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        name: row.get("name"),
        dob: row.get("dob"),
        gender: row.get("gender"),
        phone: row.get("phone"),
        email: row.get("email"),
        parent_name: row.get("parent_name"),
        parent_phone: row.get("parent_phone"),
        parent_email: row.get("parent_email"),
        current_level: row.get("current_level"),
        current_course_id: row.get("current_course_id"),
        total_debt: row.get("total_debt"),
        attendance_rate: row.get("attendance_rate"),
        status: row.get("status"),
        enrolled_at: row.get("enrolled_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(student)).into_response()
}

// 3. GET /api/v1/edu/grade-records - List grade records
pub async fn get_grade_records(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, student_id, class_id, test_type, subject, score::FLOAT8 as score, max_score::FLOAT8 as max_score, feedback, ai_report, graded_by, graded_at, created_at, updated_at
        FROM nf_tenant.edu_grade_records
        WHERE tenant_id = $1
        ORDER BY graded_at DESC
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut records = Vec::new();
    for row in rows {
        records.push(EduGradeRecord {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            student_id: row.get("student_id"),
            class_id: row.get("class_id"),
            test_type: row.get("test_type"),
            subject: row.get("subject"),
            score: row.get("score"),
            max_score: row.get("max_score"),
            feedback: row.get("feedback"),
            ai_report: row.get("ai_report"),
            graded_by: row.get("graded_by"),
            graded_at: row.get("graded_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(records)).into_response()
}

// 4. POST /api/v1/edu/grade-records - Create grade record
pub async fn create_grade_record(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateGradeRecordRequest>,
) -> Response {
    let max_score = payload.max_score.unwrap_or(100.0);
    
    // Simulate AI study feedback report generator
    let ai_report = payload.ai_report.unwrap_or_else(|| {
        format!(
            "Học sinh có điểm số {}/{}. Đánh giá chung: {}. Lời khuyên AI: Cần tiếp tục phát huy các kỹ năng tương tác và củng cố bài tập ngữ pháp.",
            payload.score,
            max_score,
            if payload.score >= max_score * 0.8 { "Xuất sắc" } else if payload.score >= max_score * 0.5 { "Khá" } else { "Cần cố gắng nhiều" }
        )
    });

    let insert_query = r#"
        INSERT INTO nf_tenant.edu_grade_records (tenant_id, student_id, class_id, test_type, subject, score, max_score, feedback, ai_report, graded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, tenant_id, student_id, class_id, test_type, subject, score::FLOAT8 as score, max_score::FLOAT8 as max_score, feedback, ai_report, graded_by, graded_at, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.student_id)
        .bind(payload.class_id)
        .bind(payload.test_type)
        .bind(payload.subject)
        .bind(payload.score)
        .bind(max_score)
        .bind(payload.feedback)
        .bind(ai_report)
        .bind(payload.graded_by)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let record = EduGradeRecord {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        student_id: row.get("student_id"),
        class_id: row.get("class_id"),
        test_type: row.get("test_type"),
        subject: row.get("subject"),
        score: row.get("score"),
        max_score: row.get("max_score"),
        feedback: row.get("feedback"),
        ai_report: row.get("ai_report"),
        graded_by: row.get("graded_by"),
        graded_at: row.get("graded_at"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(record)).into_response()
}

// 5. GET /api/v1/edu/payments - List payments
pub async fn get_payments(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, student_id, amount::FLOAT8 as amount, due_date, paid_date, paid_amount::FLOAT8 as paid_amount, method, status, note, created_at, updated_at
        FROM nf_tenant.edu_payments
        WHERE tenant_id = $1
        ORDER BY due_date DESC
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut payments = Vec::new();
    for row in rows {
        payments.push(EduPayment {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            student_id: row.get("student_id"),
            amount: row.get("amount"),
            due_date: row.get("due_date"),
            paid_date: row.get("paid_date"),
            paid_amount: row.get("paid_amount"),
            method: row.get("method"),
            status: row.get("status"),
            note: row.get("note"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(payments)).into_response()
}

// 6. POST /api/v1/edu/payments - Create payment
pub async fn create_payment(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreatePaymentRequest>,
) -> Response {
    let status = payload.status.unwrap_or_else(|| "Pending".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.edu_payments (tenant_id, student_id, amount, due_date, paid_date, paid_amount, method, status, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, tenant_id, student_id, amount::FLOAT8 as amount, due_date, paid_date, paid_amount::FLOAT8 as paid_amount, method, status, note, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.student_id)
        .bind(payload.amount)
        .bind(payload.due_date)
        .bind(payload.paid_date)
        .bind(payload.paid_amount)
        .bind(payload.method)
        .bind(status)
        .bind(payload.note)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let payment = EduPayment {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        student_id: row.get("student_id"),
        amount: row.get("amount"),
        due_date: row.get("due_date"),
        paid_date: row.get("paid_date"),
        paid_amount: row.get("paid_amount"),
        method: row.get("method"),
        status: row.get("status"),
        note: row.get("note"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(payment)).into_response()
}

// 7. GET /api/v1/edu/classes - List classes
pub async fn get_classes(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, class_name, created_at, updated_at
        FROM nf_tenant.edu_classes
        WHERE tenant_id = $1
        ORDER BY class_name
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut classes = Vec::new();
    for row in rows {
        classes.push(EduClass {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            class_name: row.get("class_name"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    // Seed defaults if empty
    if classes.is_empty() {
        let seed_query = r#"
            INSERT INTO nf_tenant.edu_classes (tenant_id, class_name)
            VALUES 
            ($1, 'IELTS Kids 1'),
            ($1, 'Pre-IELTS 2'),
            ($1, 'IELTS General')
            RETURNING id, tenant_id, class_name, created_at, updated_at
        "#;

        if let Ok(seed_rows) = sqlx::query(seed_query).bind(tenant.tenant_id).fetch_all(&state.pool).await {
            for row in seed_rows {
                classes.push(EduClass {
                    id: row.get("id"),
                    tenant_id: row.get("tenant_id"),
                    class_name: row.get("class_name"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                });
            }
        }
    }

    (StatusCode::OK, Json(classes)).into_response()
}

// 8. POST /api/v1/edu/classes - Create class
pub async fn create_class(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateClassRequest>,
) -> Response {
    let insert_query = r#"
        INSERT INTO nf_tenant.edu_classes (tenant_id, class_name)
        VALUES ($1, $2)
        RETURNING id, tenant_id, class_name, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.class_name)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let class_obj = EduClass {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        class_name: row.get("class_name"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(class_obj)).into_response()
}
