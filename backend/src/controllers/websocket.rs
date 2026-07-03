use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State},
    response::IntoResponse,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use crate::AppState;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    
    // Đăng ký nhận thông điệp phát sóng từ hệ thống
    let mut rx = state.tx.subscribe();

    // Spawn task gửi thông điệp từ broadcast channel xuống WebSocket client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break; // Ngắt kết nối nếu gửi lỗi (client tắt tab)
            }
        }
    });

    // Spawn task đọc thông điệp từ WebSocket client (nếu có gửi lên)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            println!("[WebSocket Server] Received message from client: {}", text);
            // Client có thể gửi ping hoặc message test, ta chỉ in ra console log
        }
    });

    // Chờ một trong hai task kết thúc thì hủy task còn lại (dọn dẹp tài nguyên)
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
