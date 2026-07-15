use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::Row;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::middleware::tenant_isolation::TenantIsolation;
use crate::AppState;

#[derive(Debug, Serialize)]
pub struct Customer {
    pub id: Uuid,
    pub full_name: String,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub total_spent: f64,
    pub order_count: i32,
    pub last_order_date: Option<DateTime<Utc>>,
    pub segment: String,
    pub ai_health_score: i32,
    pub web3_wallet_balance: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AiSegmentResponse {
    pub segments: Vec<CustomerSegmentUpdate>,
}

#[derive(Debug, Deserialize)]
pub struct CustomerSegmentUpdate {
    pub customer_id: Uuid,
    pub segment: String, // VIP, CHURNING, REGULAR, NEW
    pub ai_health_score: i32,
}

pub async fn list_customers(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    let query = r#"
        SELECT id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance, created_at
        FROM nf_core.customers
        WHERE tenant_id = $1
        ORDER BY total_spent DESC
    "#;

    let rows = match sqlx::query(query)
        .bind(tenant.tenant_id)
        .fetch_all(&state.pool)
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[CRM] Error fetching customers: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))).into_response();
        }
    };

    let mut customers = Vec::new();
    for row in rows {
        customers.push(Customer {
            id: row.get("id"),
            full_name: row.get("full_name"),
            phone_number: row.get("phone_number"),
            email: row.get("email"),
            total_spent: row.get("total_spent"),
            order_count: row.get("order_count"),
            last_order_date: row.get("last_order_date"),
            segment: row.get("segment"),
            ai_health_score: row.get("ai_health_score"),
            web3_wallet_balance: row.get("web3_wallet_balance"),
            created_at: row.get("created_at"),
        });
    }

    (StatusCode::OK, Json(customers)).into_response()
}

pub async fn run_ai_segmentation(
    State(state): State<AppState>,
    tenant: TenantIsolation,
) -> Response {
    // 1. Fetch all customers of tenant
    let customers_query = "SELECT id, total_spent, order_count, last_order_date FROM nf_core.customers WHERE tenant_id = $1";
    let rows = match sqlx::query(customers_query).bind(tenant.tenant_id).fetch_all(&state.pool).await {
        Ok(r) => r,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "DB error"}))).into_response(),
    };

    let mut payload = Vec::new();
    for row in rows {
        let id: Uuid = row.get("id");
        let total_spent: f64 = row.get("total_spent");
        let order_count: i32 = row.get("order_count");
        let last_order_date: Option<DateTime<Utc>> = row.get("last_order_date");
        let days_since_last_order = match last_order_date {
            Some(dt) => (Utc::now() - dt).num_days(),
            None => -1,
        };
        
        payload.push(json!({
            "customer_id": id,
            "monetary": total_spent,
            "frequency": order_count,
            "recency": days_since_last_order
        }));
    }

    if payload.is_empty() {
        return (StatusCode::OK, Json(json!({"message": "No customers to segment"}))).into_response();
    }

    // 2. Send to AI Service
    let ai_service_url = std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-service:8001".to_string());
    let client = reqwest::Client::new();
    let ai_req = json!({
        "tenant_id": tenant.tenant_id,
        "customers": payload
    });

    let res = client.post(&format!("{}/api/v1/ai/segment-customers", ai_service_url))
        .json(&ai_req)
        .send()
        .await;

    if let Ok(response) = res {
        if let Ok(data) = response.json::<AiSegmentResponse>().await {
            // 3. Update DB
            let mut tx = state.pool.begin().await.unwrap();
            for update in data.segments {
                let _ = sqlx::query("UPDATE nf_core.customers SET segment = $1, ai_health_score = $2 WHERE id = $3")
                    .bind(update.segment)
                    .bind(update.ai_health_score)
                    .bind(update.customer_id)
                    .execute(&mut *tx)
                    .await;
            }
            tx.commit().await.unwrap();
            return (StatusCode::OK, Json(json!({"message": "Phân khúc AI thành công"}))).into_response();
        }
    }

    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Lỗi kết nối AI Service"}))).into_response()
}
