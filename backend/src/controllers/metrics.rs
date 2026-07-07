use axum::{
    body::Body,
    extract::State,
    http::Request,
    middleware::Next,
    response::{IntoResponse, Response},
};
use prometheus::{Encoder, HistogramVec, IntCounterVec, IntGaugeVec, Registry, TextEncoder};
use std::sync::OnceLock;
use std::time::Instant;
use crate::AppState;

// ─── Metrics Registry & Collectibles ────────────────────────────────────────

static REGISTRY: OnceLock<Registry> = OnceLock::new();
static HTTP_REQUESTS: OnceLock<IntCounterVec> = OnceLock::new();
static HTTP_DURATION: OnceLock<HistogramVec> = OnceLock::new();
static DB_CONNECTIONS: OnceLock<IntGaugeVec> = OnceLock::new();
pub static TASK_ESCALATIONS: OnceLock<IntCounterVec> = OnceLock::new();

fn get_registry() -> &'static Registry {
    REGISTRY.get_or_init(Registry::new)
}

fn get_http_requests() -> &'static IntCounterVec {
    HTTP_REQUESTS.get_or_init(|| {
        let counter = IntCounterVec::new(
            prometheus::opts!("http_requests_total", "Total HTTP requests processed by Nextflow Core"),
            &["method", "path", "status"],
        )
        .expect("Failed to create http_requests_total metric");
        get_registry()
            .register(Box::new(counter.clone()))
            .expect("Failed to register http_requests_total");
        counter
    })
}

fn get_http_duration() -> &'static HistogramVec {
    HTTP_DURATION.get_or_init(|| {
        let histogram = HistogramVec::new(
            prometheus::HistogramOpts::new("http_request_duration_seconds", "HTTP request processing duration in seconds"),
            &["method", "path"],
        )
        .expect("Failed to create http_request_duration_seconds metric");
        get_registry()
            .register(Box::new(histogram.clone()))
            .expect("Failed to register http_request_duration_seconds");
        histogram
    })
}

fn get_db_connections() -> &'static IntGaugeVec {
    DB_CONNECTIONS.get_or_init(|| {
        let gauge = IntGaugeVec::new(
            prometheus::opts!("db_pool_connections", "Database connections state in PgPool"),
            &["state"],
        )
        .expect("Failed to create db_pool_connections metric");
        get_registry()
            .register(Box::new(gauge.clone()))
            .expect("Failed to register db_pool_connections");
        gauge
    })
}

pub fn get_task_escalations() -> &'static IntCounterVec {
    TASK_ESCALATIONS.get_or_init(|| {
        let counter = IntCounterVec::new(
            prometheus::opts!("task_escalations_total", "Total number of SLA task escalations triggered"),
            &["tenant_id", "priority"],
        )
        .expect("Failed to create task_escalations_total metric");
        get_registry()
            .register(Box::new(counter.clone()))
            .expect("Failed to register task_escalations_total");
        counter
    })
}

// ─── Axum Middleware ────────────────────────────────────────────────────────

pub async fn track_metrics(req: Request<Body>, next: Next) -> Response {
    let start = Instant::now();
    let method = req.method().as_str().to_string();
    let path = req.uri().path().to_string();

    let response = next.run(req).await;

    let status = response.status().as_u16().to_string();
    let duration = start.elapsed().as_secs_f64();

    // Increment request count & duration
    get_http_requests().with_label_values(&[&method, &path, &status]).inc();
    get_http_duration().with_label_values(&[&method, &path]).observe(duration);

    response
}

// ─── Metrics Handler ────────────────────────────────────────────────────────

pub async fn get_metrics(State(state): State<AppState>) -> impl IntoResponse {
    // Collect Database pool stats dynamically
    let size = state.pool.size() as i64;
    let idle = state.pool.num_idle() as i64;
    let active = size - idle;

    let db_metrics = get_db_connections();
    db_metrics.with_label_values(&["active"]).set(active);
    db_metrics.with_label_values(&["idle"]).set(idle);
    db_metrics.with_label_values(&["total"]).set(size);

    // Initialize metrics triggers to register them in default registry
    let _ = get_http_requests();
    let _ = get_http_duration();
    let _ = get_task_escalations();

    // Encode registry into Prometheus exposition format
    let encoder = TextEncoder::new();
    let metric_families = get_registry().gather();
    let mut buffer = Vec::new();
    
    if let Err(e) = encoder.encode(&metric_families, &mut buffer) {
        return (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to encode metrics: {}", e),
        )
            .into_response();
    }

    (
        [(
            axum::http::header::CONTENT_TYPE,
            "text/plain; version=0.0.4; charset=utf-8",
        )],
        buffer,
    )
        .into_response()
}
