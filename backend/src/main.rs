use dotenvy::dotenv;
use std::env;
use std::net::SocketAddr;
use nextflow_core_backend::{config::db::init_pool, create_app};

#[tokio::main]
async fn main() {
    // 1. Nạp các biến môi trường
    dotenv().ok();

    // 2. Khởi tạo DB connection pool
    let pool = init_pool().await;

    // 3. Khởi tạo Axum App
    let app = create_app(pool);

    // 4. Khởi chạy Server Axum
    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port)
        .parse()
        .expect("Invalid address format");

    println!("[Nextflow Core Rust] Server is running on: http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
