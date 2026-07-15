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
pub struct ReListing {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub address: String,
    pub district: Option<String>,
    pub city: Option<String>,
    #[serde(rename = "type")]
    pub type_field: Option<String>,
    pub price: f64,
    pub area: f64,
    pub bedrooms: Option<i32>,
    pub bathrooms: Option<i32>,
    pub legal_status: Option<String>,
    pub status: String,
    pub agent_id: Option<Uuid>,
    pub virtual_tour_url: Option<String>,
    pub photos: Option<Vec<String>>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateListingRequest {
    pub address: String,
    #[serde(default)]
    pub district: Option<String>,
    #[serde(default)]
    pub city: Option<String>,
    #[serde(default, rename = "type")]
    pub type_field: Option<String>,
    #[serde(default)]
    pub price: Option<f64>,
    #[serde(default)]
    pub area: Option<f64>,
    #[serde(default)]
    pub bedrooms: Option<i32>,
    #[serde(default)]
    pub bathrooms: Option<i32>,
    #[serde(default)]
    pub legal_status: Option<String>,
    #[serde(default)]
    pub agent_id: Option<Uuid>,
    #[serde(default)]
    pub virtual_tour_url: Option<String>,
    #[serde(default)]
    pub photos: Option<Vec<String>>,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReLead {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub budget: f64,
    pub preferred_area: Option<String>,
    pub property_type: Option<String>,
    pub urgency: String,
    pub source: Option<String>,
    pub ai_score: i32,
    pub agent_id: Option<Uuid>,
    pub status: String,
    pub last_contacted: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeadRequest {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub budget: Option<f64>,
    #[serde(default)]
    pub preferred_area: Option<String>,
    #[serde(default)]
    pub property_type: Option<String>,
    #[serde(default)]
    pub urgency: Option<String>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub ai_score: Option<i32>,
    #[serde(default)]
    pub agent_id: Option<Uuid>,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReDeal {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub lead_id: Option<Uuid>,
    pub listing_id: Option<Uuid>,
    pub stage: String,
    pub agent_id: Option<Uuid>,
    pub commission: f64,
    pub legal_milestones: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDealRequest {
    pub lead_id: Option<Uuid>,
    pub listing_id: Option<Uuid>,
    #[serde(default)]
    pub stage: Option<String>,
    #[serde(default)]
    pub agent_id: Option<Uuid>,
    #[serde(default)]
    pub commission: Option<f64>,
    #[serde(default)]
    pub legal_milestones: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDealStageRequest {
    pub stage: String,
}

// 1. GET /api/v1/re/listings
pub async fn get_listings(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, address, district, city, type, price::FLOAT8 as price, area::FLOAT8 as area, bedrooms, bathrooms, legal_status, status, agent_id, virtual_tour_url, photos, description, created_at, updated_at
        FROM nf_tenant.re_listings
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
            eprintln!("[RE Pack] Error fetching listings: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let listings: Vec<ReListing> = rows.into_iter().map(|row| {
        ReListing {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            address: row.get("address"),
            district: row.get("district"),
            city: row.get("city"),
            type_field: row.get("type"),
            price: row.get("price"),
            area: row.get("area"),
            bedrooms: row.get("bedrooms"),
            bathrooms: row.get("bathrooms"),
            legal_status: row.get("legal_status"),
            status: row.get("status"),
            agent_id: row.get("agent_id"),
            virtual_tour_url: row.get("virtual_tour_url"),
            photos: row.get("photos"),
            description: row.get("description"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    (StatusCode::OK, Json(listings)).into_response()
}

// 2. POST /api/v1/re/listings
pub async fn create_listing(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateListingRequest>,
) -> Response {
    if payload.address.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Địa chỉ không được để trống"}))).into_response();
    }

    let price = payload.price.unwrap_or(0.0);
    let area = payload.area.unwrap_or(0.0);

    let insert_query = r#"
        INSERT INTO nf_tenant.re_listings (tenant_id, address, district, city, type, price, area, bedrooms, bathrooms, legal_status, agent_id, virtual_tour_url, photos, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, tenant_id, address, district, city, type, price::FLOAT8 as price, area::FLOAT8 as area, bedrooms, bathrooms, legal_status, status, agent_id, virtual_tour_url, photos, description, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.address)
        .bind(payload.district)
        .bind(payload.city)
        .bind(payload.type_field)
        .bind(price)
        .bind(area)
        .bind(payload.bedrooms)
        .bind(payload.bathrooms)
        .bind(payload.legal_status)
        .bind(payload.agent_id)
        .bind(payload.virtual_tour_url)
        .bind(payload.photos)
        .bind(payload.description)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error creating listing: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let listing = ReListing {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        address: row.get("address"),
        district: row.get("district"),
        city: row.get("city"),
        type_field: row.get("type"),
        price: row.get("price"),
        area: row.get("area"),
        bedrooms: row.get("bedrooms"),
        bathrooms: row.get("bathrooms"),
        legal_status: row.get("legal_status"),
        status: row.get("status"),
        agent_id: row.get("agent_id"),
        virtual_tour_url: row.get("virtual_tour_url"),
        photos: row.get("photos"),
        description: row.get("description"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(listing)).into_response()
}

// 3. GET /api/v1/re/leads
pub async fn get_leads(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, name, phone, email, budget::FLOAT8 as budget, preferred_area, property_type, urgency, source, ai_score, agent_id, status, last_contacted, notes, created_at
        FROM nf_tenant.re_leads
        WHERE tenant_id = $1
        ORDER BY ai_score DESC, created_at DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error fetching leads: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let leads: Vec<ReLead> = rows.into_iter().map(|row| {
        ReLead {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            name: row.get("name"),
            phone: row.get("phone"),
            email: row.get("email"),
            budget: row.get("budget"),
            preferred_area: row.get("preferred_area"),
            property_type: row.get("property_type"),
            urgency: row.get("urgency"),
            source: row.get("source"),
            ai_score: row.get("ai_score"),
            agent_id: row.get("agent_id"),
            status: row.get("status"),
            last_contacted: row.get("last_contacted"),
            notes: row.get("notes"),
            created_at: row.get("created_at"),
        }
    }).collect();

    (StatusCode::OK, Json(leads)).into_response()
}

// 4. POST /api/v1/re/leads
pub async fn create_lead(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateLeadRequest>,
) -> Response {
    let budget = payload.budget.unwrap_or(0.0);
    let urgency = payload.urgency.unwrap_or_else(|| "Warm".to_string());
    
    let ai_score = payload.ai_score.unwrap_or_else(|| {
        let mut score = 50;
        if urgency == "Hot" { score += 30; }
        else if urgency == "Cold" { score -= 20; }
        if budget > 2_000_000_000.0 { score += 20; }
        score.clamp(0, 100)
    });

    let insert_query = r#"
        INSERT INTO nf_tenant.re_leads (tenant_id, name, phone, email, budget, preferred_area, property_type, urgency, source, ai_score, agent_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, tenant_id, name, phone, email, budget::FLOAT8 as budget, preferred_area, property_type, urgency, source, ai_score, agent_id, status, last_contacted, notes, created_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.name)
        .bind(payload.phone)
        .bind(payload.email)
        .bind(budget)
        .bind(payload.preferred_area)
        .bind(payload.property_type)
        .bind(urgency)
        .bind(payload.source)
        .bind(ai_score)
        .bind(payload.agent_id)
        .bind(payload.notes)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error creating lead: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let lead = ReLead {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        name: row.get("name"),
        phone: row.get("phone"),
        email: row.get("email"),
        budget: row.get("budget"),
        preferred_area: row.get("preferred_area"),
        property_type: row.get("property_type"),
        urgency: row.get("urgency"),
        source: row.get("source"),
        ai_score: row.get("ai_score"),
        agent_id: row.get("agent_id"),
        status: row.get("status"),
        last_contacted: row.get("last_contacted"),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    };

    (StatusCode::CREATED, Json(lead)).into_response()
}

// 5. GET /api/v1/re/deals
pub async fn get_deals(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, tenant_id, lead_id, listing_id, stage, agent_id, commission::FLOAT8 as commission, legal_milestones, created_at, updated_at
        FROM nf_tenant.re_deals
        WHERE tenant_id = $1
        ORDER BY updated_at DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error fetching deals: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let deals: Vec<ReDeal> = rows.into_iter().map(|row| {
        ReDeal {
            id: row.get("id"),
            tenant_id: row.get("tenant_id"),
            lead_id: row.get("lead_id"),
            listing_id: row.get("listing_id"),
            stage: row.get("stage"),
            agent_id: row.get("agent_id"),
            commission: row.get("commission"),
            legal_milestones: row.get("legal_milestones"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    (StatusCode::OK, Json(deals)).into_response()
}

// 6. POST /api/v1/re/deals
pub async fn create_deal(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Json(payload): Json<CreateDealRequest>,
) -> Response {
    let commission = payload.commission.unwrap_or(0.0);
    let default_milestones = json!([
        {"step": "Ký biên bản xem nhà", "done": false},
        {"step": "Đặt cọc", "done": false},
        {"step": "Công chứng hợp đồng", "done": false},
        {"step": "Bàn giao sổ & thanh toán", "done": false}
    ]);
    let legal_milestones = payload.legal_milestones.unwrap_or(default_milestones);

    let insert_query = r#"
        INSERT INTO nf_tenant.re_deals (tenant_id, lead_id, listing_id, stage, agent_id, commission, legal_milestones)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, lead_id, listing_id, stage, agent_id, commission::FLOAT8 as commission, legal_milestones, created_at, updated_at
    "#;

    let row = match sqlx::query(insert_query)
        .bind(tenant.tenant_id)
        .bind(payload.lead_id)
        .bind(payload.listing_id)
        .bind(payload.stage.unwrap_or_else(|| "Viewed".to_string()))
        .bind(payload.agent_id)
        .bind(commission)
        .bind(legal_milestones)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error creating deal: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    // Update lead status to 'Contacted' when deal is created
    if let Some(l_id) = payload.lead_id {
        let _ = sqlx::query("UPDATE nf_tenant.re_leads SET status = 'Contacted', last_contacted = NOW() WHERE id = $1 AND tenant_id = $2")
            .bind(l_id)
            .bind(tenant.tenant_id)
            .execute(&state.pool)
            .await;
    }

    let deal = ReDeal {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        lead_id: row.get("lead_id"),
        listing_id: row.get("listing_id"),
        stage: row.get("stage"),
        agent_id: row.get("agent_id"),
        commission: row.get("commission"),
        legal_milestones: row.get("legal_milestones"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::CREATED, Json(deal)).into_response()
}

// 7. PUT /api/v1/re/deals/:id/stage
pub async fn update_deal_stage(
    State(state): State<AppState>,
    tenant: TenantIsolation,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateDealStageRequest>,
) -> Response {
    let update_query = r#"
        UPDATE nf_tenant.re_deals
        SET stage = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, tenant_id, lead_id, listing_id, stage, agent_id, commission::FLOAT8 as commission, legal_milestones, created_at, updated_at
    "#;

    let row = match sqlx::query(update_query)
        .bind(&payload.stage)
        .bind(id)
        .bind(tenant.tenant_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[RE Pack] Error updating deal stage: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let listing_id: Option<Uuid> = row.get("listing_id");
    let lead_id: Option<Uuid> = row.get("lead_id");

    // Dynamic status updates depending on the Deal stage
    if payload.stage == "Won" {
        if let Some(lst_id) = listing_id {
            let _ = sqlx::query("UPDATE nf_tenant.re_listings SET status = 'Sold' WHERE id = $1 AND tenant_id = $2")
                .bind(lst_id)
                .bind(tenant.tenant_id)
                .execute(&state.pool)
                .await;
        }
        if let Some(ld_id) = lead_id {
            let _ = sqlx::query("UPDATE nf_tenant.re_leads SET status = 'Converted' WHERE id = $1 AND tenant_id = $2")
                .bind(ld_id)
                .bind(tenant.tenant_id)
                .execute(&state.pool)
                .await;
        }
    } else if payload.stage == "Lost" {
        if let Some(ld_id) = lead_id {
            let _ = sqlx::query("UPDATE nf_tenant.re_leads SET status = 'Closed' WHERE id = $1 AND tenant_id = $2")
                .bind(ld_id)
                .bind(tenant.tenant_id)
                .execute(&state.pool)
                .await;
        }
    }

    let deal = ReDeal {
        id: row.get("id"),
        tenant_id: row.get("tenant_id"),
        lead_id,
        listing_id,
        stage: row.get("stage"),
        agent_id: row.get("agent_id"),
        commission: row.get("commission"),
        legal_milestones: row.get("legal_milestones"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    (StatusCode::OK, Json(deal)).into_response()
}
