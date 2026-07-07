use sqlx::PgPool;
use uuid::Uuid;
use sqlx::Row;
use serde_json::Value;
use reqwest::Client;
use std::time::Duration;

lazy_static::lazy_static! {
    static ref HTTP_CLIENT: Client = Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .expect("Failed to build HTTP Client for Webhooks");
}

/// Gửi một sự kiện (Webhooks) ra bên ngoài (Zalo, Telegram, Make, Zapier...)
/// Chạy bất đồng bộ (Fire & Forget) bằng tokio::spawn
pub async fn dispatch_event(
    pool: &PgPool,
    tenant_id: Uuid,
    event_name: &str,
    payload: Value,
) {
    let pool_clone = pool.clone();
    let event_name_clone = event_name.to_string();

    // Spawn a background task to handle webhook firing, avoiding blocking the API request
    tokio::spawn(async move {
        // Query active webhooks for this tenant
        let endpoints = match sqlx::query(
            "SELECT url, secret_key, events FROM nf_core.webhook_endpoints WHERE tenant_id = $1 AND is_active = true"
        )
        .bind(tenant_id)
        .fetch_all(&pool_clone)
        .await
        {
            Ok(rows) => rows,
            Err(e) => {
                eprintln!("[Webhook Dispatcher] Failed to fetch endpoints: {}", e);
                return;
            }
        };

        let mut fired_count = 0;

        for ep in endpoints {
            let events: serde_json::Value = ep.get("events");
            let events_array = events.as_array();
            let should_fire = match events_array {
                Some(arr) => arr.iter().any(|v: &serde_json::Value| {
                    if let Some(s) = v.as_str() {
                        s == event_name_clone || s == "*"
                    } else {
                        false
                    }
                }),
                None => false,
            };

            if should_fire {
                let url: String = ep.get("url");
                let body = serde_json::json!({
                    "event": event_name_clone,
                    "timestamp": chrono::Utc::now(),
                    "tenant_id": tenant_id,
                    "data": payload
                });

                // Fire & Forget Request
                let client = HTTP_CLIENT.clone();
                let mut req = client.post(&url).json(&body);
                
                // If there's a secret key, add it to Headers
                let secret: Option<String> = ep.get("secret_key");
                if let Some(key) = secret {
                    req = req.header("X-NextFlow-Signature", key);
                }

                let event_for_task = event_name_clone.clone();
                tokio::spawn(async move {
                    match req.send().await {
                        Ok(res) => {
                            if res.status().is_success() {
                                println!("[Webhook Dispatcher] Successfully sent {} to {}", event_for_task, url);
                            } else {
                                eprintln!("[Webhook Dispatcher] Webhook failed for {}: HTTP {}", url, res.status());
                            }
                        }
                        Err(e) => {
                            eprintln!("[Webhook Dispatcher] Webhook request error for {}: {}", url, e);
                        }
                    }
                });

                fired_count += 1;
            }
        }

        if fired_count > 0 {
            println!("[Webhook Dispatcher] Dispatched '{}' to {} endpoints.", event_name_clone, fired_count);
        }
    });
}
