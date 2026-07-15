use dotenvy::dotenv;
use std::env;
use std::net::SocketAddr;
use sqlx::postgres::PgListener;
use nextflow_core_backend::{config::db::init_pool, create_app};
use nextflow_core_backend::services::workflow_engine::reload_all_workflows;

#[tokio::main]
async fn main() {
    // 1. Nạp các biến môi trường
    dotenv().ok();

    // 2. Khởi tạo DB connection pool
    let pool = init_pool().await;

    // 3. Khởi tạo In-Memory Workflow Cache ban đầu
    if let Err(e) = reload_all_workflows(&pool).await {
        println!("[Workflow Engine] Initial load failed: {}", e);
    }

    // 4. Lắng nghe tín hiệu PubSub từ App Store (Cài mới Template)
    let listener_pool = pool.clone();
    tokio::spawn(async move {
        let mut listener = match PgListener::connect_with(&listener_pool).await {
            Ok(l) => l,
            Err(e) => {
                println!("[PubSub] Listener init failed: {}", e);
                return;
            }
        };

        if let Err(e) = listener.listen("workflow_reload").await {
            println!("[PubSub] Failed to listen to 'workflow_reload': {}", e);
            return;
        }

        println!("[PubSub] Listening for 'workflow_reload' events...");
        loop {
            match listener.recv().await {
                Ok(notification) => {
                    println!("[PubSub] Received reload signal: {:?}", notification.payload());
                    if let Err(e) = reload_all_workflows(&listener_pool).await {
                        println!("[PubSub] Reload failed: {}", e);
                    }
                }
                Err(e) => {
                    println!("[PubSub] Connection lost: {}. Reconnecting...", e);
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                }
            }
        }
    });

    // 5. Khởi tạo Axum App
    let app = create_app(pool);

    // 6. Khởi chạy Server Axum
    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port)
        .parse()
        .expect("Invalid address format");

    println!("[Nextflow Core Rust] Server is running on: http://{}", addr);

    let tcp_listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(tcp_listener, app).await.unwrap();
}
