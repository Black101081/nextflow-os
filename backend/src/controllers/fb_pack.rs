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

// Struct for the auto_order endpoint (keep original function)
#[derive(Debug, Deserialize)]
pub struct AutoOrderRequest {
    pub customer_phone: String,
    pub items: Vec<String>,
    pub total_amount: f64,
}

pub async fn auto_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<AutoOrderRequest>,
) -> Response {
    let order_id = Uuid::new_v4();
    
    let payload_to_anchor = json!({
        "event": "FB_AUTO_ORDER",
        "tenant_id": tenant.tenant_id.to_string(),
        "order_id": order_id.to_string(),
        "customer_phone": payload.customer_phone,
        "items": payload.items,
        "total_amount": payload.total_amount,
    });
    
    let hash = crate::services::blockchain::compute_data_hash(&payload_to_anchor);
    let tx_hash = crate::services::blockchain::anchor_data_on_chain(&state.pool, tenant.tenant_id, &hash, &payload_to_anchor).await;

    let response = json!({
        "status": "success",
        "message": "Đơn hàng F&B đã được tự động xử lý và gửi tin nhắn Zalo OA thành công!",
        "data": {
            "order_id": order_id,
            "items": payload.items,
            "total_amount": payload.total_amount,
            "zalo_delivery_status": "SENT",
            "zalo_tracking_id": Uuid::new_v4().to_string(),
            "blockchain_audit_tx": tx_hash
        }
    });

    (StatusCode::OK, Json(response)).into_response()
}

// =========================================================================
// NEW F&B MODELS & APIS
// =========================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct FnbOrder {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub branch_id: Option<Uuid>,
    pub table_number: Option<String>,
    pub source: String,
    pub items: serde_json::Value,
    pub status: String,
    pub served_by: Option<Uuid>,
    pub total_amount: f64,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateFnbOrderRequest {
    #[serde(default)]
    pub branch_id: Option<Uuid>,
    #[serde(default)]
    pub table_number: Option<String>,
    #[serde(default)]
    pub source: Option<String>,
    pub items: serde_json::Value,
    #[serde(default)]
    pub served_by: Option<Uuid>,
    pub total_amount: f64,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FnbShift {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub branch_id: Option<Uuid>,
    pub shift_date: NaiveDate,
    pub shift_type: String,
    pub planned_staff: serde_json::Value,
    pub actual_staff: serde_json::Value,
    pub notes: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateFnbShiftRequest {
    #[serde(default)]
    pub branch_id: Option<Uuid>,
    pub shift_date: NaiveDate,
    pub shift_type: String, // Morning, Afternoon, Evening
    pub planned_staff: serde_json::Value,
    #[serde(default)]
    pub actual_staff: Option<serde_json::Value>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FnbIngredientCheck {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub branch_id: Option<Uuid>,
    pub check_date: NaiveDate,
    pub items: serde_json::Value,
    pub checked_by: Option<Uuid>,
    pub issues: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateFnbIngredientCheckRequest {
    #[serde(default)]
    pub branch_id: Option<Uuid>,
    pub check_date: NaiveDate,
    pub items: serde_json::Value,
    #[serde(default)]
    pub checked_by: Option<Uuid>,
    #[serde(default)]
    pub issues: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FnbMenuItem {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub category: Option<String>,
    pub price: f64,
    pub cost: Option<f64>,
    pub is_available: bool,
    pub recipe: serde_json::Value,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateFnbMenuItemRequest {
    pub name: String,
    #[serde(default)]
    pub category: Option<String>,
    pub price: f64,
    #[serde(default)]
    pub cost: Option<f64>,
    #[serde(default)]
    pub recipe: Option<serde_json::Value>,
    #[serde(default)]
    pub image_url: Option<String>,
}

// 1. GET /api/v1/fb/orders - List orders
pub async fn get_orders(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, branch_id, table_number, source, items, status, served_by, total_amount::FLOAT8 as total_amount, notes, created_at, updated_at, completed_at
        FROM nf_tenant.fnb_orders
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

    let mut orders = Vec::new();
    for row in rows {
        orders.push(FnbOrder {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            branch_id: row.get("branch_id"),
            table_number: row.get("table_number"),
            source: row.get("source"),
            items: row.get("items"),
            status: row.get("status"),
            served_by: row.get("served_by"),
            total_amount: row.get("total_amount"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            completed_at: row.get("completed_at"),
        });
    }

    (StatusCode::OK, Json(orders)).into_response()
}

// 2. POST /api/v1/fb/orders - Create new order
pub async fn create_order(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateFnbOrderRequest>,
) -> Response {
    let source = payload.source.unwrap_or_else(|| "Table".to_string());
    
    let insert_query = r#"
        INSERT INTO nf_tenant.fnb_orders (tenant_id, branch_id, table_number, source, items, served_by, total_amount, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tenant_id, branch_id, table_number, source, items, status, served_by, total_amount::FLOAT8 as total_amount, notes, created_at, updated_at, completed_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.branch_id)
        .bind(payload.table_number)
        .bind(source)
        .bind(payload.items)
        .bind(payload.served_by)
        .bind(payload.total_amount)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let order = FnbOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        branch_id: row.get("branch_id"),
        table_number: row.get("table_number"),
        source: row.get("source"),
        items: row.get("items"),
        status: row.get("status"),
        served_by: row.get("served_by"),
        total_amount: row.get("total_amount"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        completed_at: row.get("completed_at"),
    };

    (StatusCode::CREATED, Json(order)).into_response()
}

// 3. PUT /api/v1/fb/orders/:id/status - Update order status
pub async fn update_order_status(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<UpdateOrderStatusRequest>,
) -> Response {
    let completed_at = if payload.status == "Completed" {
        Some(Utc::now())
    } else {
        None
    };

    let update_query = r#"
        UPDATE nf_tenant.fnb_orders
        SET status = $1, completed_at = COALESCE($2, completed_at), updated_at = NOW()
        WHERE id = $3 AND tenant_id = $4
        RETURNING id, tenant_id, branch_id, table_number, source, items, status, served_by, total_amount::FLOAT8 as total_amount, notes, created_at, updated_at, completed_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(payload.status)
        .bind(completed_at)
        .bind(order_id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(sqlx::Error::RowNotFound) => return (StatusCode::NOT_FOUND, Json(json!({"error": "Không tìm thấy đơn hàng"}))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let order = FnbOrder {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        branch_id: row.get("branch_id"),
        table_number: row.get("table_number"),
        source: row.get("source"),
        items: row.get("items"),
        status: row.get("status"),
        served_by: row.get("served_by"),
        total_amount: row.get("total_amount"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        completed_at: row.get("completed_at"),
    };

    (StatusCode::OK, Json(order)).into_response()
}

// 4. GET /api/v1/fb/shifts - List shifts
pub async fn get_shifts(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, branch_id, shift_date, shift_type, planned_staff, actual_staff, notes, status, created_at, updated_at
        FROM nf_tenant.fnb_shifts
        WHERE tenant_id = $1
        ORDER BY shift_date DESC
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut shifts = Vec::new();
    for row in rows {
        shifts.push(FnbShift {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            branch_id: row.get("branch_id"),
            shift_date: row.get("shift_date"),
            shift_type: row.get("shift_type"),
            planned_staff: row.get("planned_staff"),
            actual_staff: row.get("actual_staff"),
            notes: row.get("notes"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(shifts)).into_response()
}

// 5. POST /api/v1/fb/shifts - Create shift
pub async fn create_shift(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateFnbShiftRequest>,
) -> Response {
    let actual_staff = payload.actual_staff.unwrap_or_else(|| json!([]));
    let status = payload.status.unwrap_or_else(|| "Scheduled".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.fnb_shifts (tenant_id, branch_id, shift_date, shift_type, planned_staff, actual_staff, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tenant_id, branch_id, shift_date, shift_type, planned_staff, actual_staff, notes, status, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.branch_id)
        .bind(payload.shift_date)
        .bind(payload.shift_type)
        .bind(payload.planned_staff)
        .bind(actual_staff)
        .bind(payload.notes)
        .bind(status)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let shift = FnbShift {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        branch_id: row.get("branch_id"),
        shift_date: row.get("shift_date"),
        shift_type: row.get("shift_type"),
        planned_staff: row.get("planned_staff"),
        actual_staff: row.get("actual_staff"),
        notes: row.get("notes"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(shift)).into_response()
}

// 6. GET /api/v1/fb/ingredient-checks - List QA/QC checks
pub async fn get_ingredient_checks(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, branch_id, check_date, items, checked_by, issues, status, created_at, updated_at
        FROM nf_tenant.fnb_ingredient_checks
        WHERE tenant_id = $1
        ORDER BY check_date DESC
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut checks = Vec::new();
    for row in rows {
        checks.push(FnbIngredientCheck {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            branch_id: row.get("branch_id"),
            check_date: row.get("check_date"),
            items: row.get("items"),
            checked_by: row.get("checked_by"),
            issues: row.get("issues"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    (StatusCode::OK, Json(checks)).into_response()
}

// 7. POST /api/v1/fb/ingredient-checks - Create QA/QC check
pub async fn create_ingredient_check(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateFnbIngredientCheckRequest>,
) -> Response {
    let status = payload.status.unwrap_or_else(|| "Pending".to_string());

    let insert_query = r#"
        INSERT INTO nf_tenant.fnb_ingredient_checks (tenant_id, branch_id, check_date, items, checked_by, issues, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, branch_id, check_date, items, checked_by, issues, status, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.branch_id)
        .bind(payload.check_date)
        .bind(payload.items)
        .bind(payload.checked_by)
        .bind(payload.issues)
        .bind(status)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let check = FnbIngredientCheck {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        branch_id: row.get("branch_id"),
        check_date: row.get("check_date"),
        items: row.get("items"),
        checked_by: row.get("checked_by"),
        issues: row.get("issues"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(check)).into_response()
}

// 8. GET /api/v1/fb/menu-items - List menu items
pub async fn get_menu_items(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, name, category, price::FLOAT8 as price, cost::FLOAT8 as cost, is_available, recipe, image_url, created_at, updated_at
        FROM nf_tenant.fnb_menu_items
        WHERE tenant_id = $1
        ORDER BY category, name
    "#;

    let rows_res = sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await;

    let rows = match rows_res {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let mut items = Vec::new();
    for row in rows {
        items.push(FnbMenuItem {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            name: row.get("name"),
            category: row.get("category"),
            price: row.get("price"),
            cost: row.get("cost"),
            is_available: row.get("is_available"),
            recipe: row.get("recipe"),
            image_url: row.get("image_url"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    // If there are no menu items, seed some default items so it is fully functional and not blank!
    if items.is_empty() {
        let seed_query = r#"
            INSERT INTO nf_tenant.fnb_menu_items (tenant_id, name, category, price, cost, recipe, image_url)
            VALUES 
            ($1, 'Phở Bò Kobe', 'Món nước', 189000, 75000, '{"ingredients": ["Bánh phở", "Thịt bò Kobe", "Nước dùng phở"]}'::JSONB, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80'),
            ($1, 'Bún Chả Hà Nội', 'Món khô', 85000, 32000, '{"ingredients": ["Bún", "Thịt heo nướng", "Nước mắm pha"]}'::JSONB, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),
            ($1, 'Cà Phê Muối Trứng', 'Đồ uống', 49000, 15000, '{"ingredients": ["Hạt cà phê Robusta", "Kem trứng", "Muối hồng"]}'::JSONB, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80'),
            ($1, 'Trà Đào Hồng Đài', 'Đồ uống', 55000, 18000, '{"ingredients": ["Trà lài", "Đào ngâm", "Siro đào"]}'::JSONB, 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=400&q=80')
            RETURNING id, tenant_id, name, category, price::FLOAT8 as price, cost::FLOAT8 as cost, is_available, recipe, image_url, created_at, updated_at
        "#;
        
        if let Ok(seed_rows) = sqlx::query(seed_query).bind(tenant.tenant_id).fetch_all(&state.pool).await {
            for row in seed_rows {
                items.push(FnbMenuItem {
                    id: row.get("id"),
                    tenant_id: row.get("tenant_id"),
                    name: row.get("name"),
                    category: row.get("category"),
                    price: row.get("price"),
                    cost: row.get("cost"),
                    is_available: row.get("is_available"),
                    recipe: row.get("recipe"),
                    image_url: row.get("image_url"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                });
            }
        }
    }

    (StatusCode::OK, Json(items)).into_response()
}

// 9. POST /api/v1/fb/menu-items - Create menu item
pub async fn create_menu_item(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateFnbMenuItemRequest>,
) -> Response {
    let recipe = payload.recipe.unwrap_or_else(|| json!({}));

    let insert_query = r#"
        INSERT INTO nf_tenant.fnb_menu_items (tenant_id, name, category, price, cost, recipe, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, name, category, price::FLOAT8 as price, cost::FLOAT8 as cost, is_available, recipe, image_url, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.name)
        .bind(payload.category)
        .bind(payload.price)
        .bind(payload.cost)
        .bind(recipe)
        .bind(payload.image_url)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response(),
    };

    let item = FnbMenuItem {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        name: row.get("name"),
        category: row.get("category"),
        price: row.get("price"),
        cost: row.get("cost"),
        is_available: row.get("is_available"),
        recipe: row.get("recipe"),
        image_url: row.get("image_url"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(item)).into_response()
}
