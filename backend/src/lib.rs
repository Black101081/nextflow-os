pub mod config;
pub mod controllers;
pub mod middleware;

use axum::routing::{get, patch, post};
use tower_http::cors::{Any, CorsLayer};

use crate::controllers::{
    queue::{add_queue_member, create_queue, get_queue_members, route_work_item},
    tenant::sync_tenant_users,
    work_item::{create_work_item, get_work_item, update_work_item_status},
};

pub fn create_app(pool: sqlx::PgPool) -> axum::Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    axum::Router::new()
        .route("/health", get(|| async {
            axum::Json(serde_json::json!({
                "status": "UP",
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }))
        .route("/api/v1/work-items", post(create_work_item))
        .route("/api/v1/work-items/:id", get(get_work_item))
        .route("/api/v1/work-items/:id/status", patch(update_work_item_status))
        .route("/api/v1/work-items/:id/route", post(route_work_item))
        .route("/api/v1/queues", post(create_queue))
        .route("/api/v1/queues/:id/members", post(add_queue_member).get(get_queue_members))
        .route("/api/v1/tenants/:tenant_id/users/sync", post(sync_tenant_users))
        .with_state(pool)
        .layer(cors)
}
