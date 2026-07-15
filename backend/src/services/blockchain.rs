use sha2::{Sha256, Digest};
use hex;
use uuid::Uuid;
use tokio::time::{sleep, Duration};

/// Tạo mã băm nguyên bản (Data Hash) từ các trường dữ liệu quan trọng của Hóa đơn.
/// Bất kỳ sửa đổi nào cũng làm thay đổi mã hash này.
pub fn compute_invoice_data_hash(
    invoice_id: Uuid,
    amount: f64,
    currency: &str,
    status: &str,
) -> String {
    let payload = format!(
        "{}:{}:{}:{}",
        invoice_id,
        amount,
        currency,
        status
    );
    let mut hasher = Sha256::new();
    hasher.update(payload.as_bytes());
    let result = hasher.finalize();
    format!("0x{}", hex::encode(result))
}

/// Tạo mã băm nguyên bản (Data Hash) từ đối tượng JSON
pub fn compute_data_hash(payload: &serde_json::Value) -> String {
    let payload_str = payload.to_string();
    let mut hasher = Sha256::new();
    hasher.update(payload_str.as_bytes());
    let result = hasher.finalize();
    format!("0x{}", hex::encode(result))
}

/// Mô phỏng quá trình neo dữ liệu lên mạng lưới Blockchain (U2U Network).
/// Trả về một mã giao dịch (TxHash) thật (được ghi vào CSDL).
pub async fn anchor_data_on_chain(pool: &sqlx::PgPool, tenant_id: Uuid, data_hash: &str, payload: &serde_json::Value) -> String {
    // Giả lập thời gian chờ (network delay & finality)
    sleep(Duration::from_millis(500)).await;
    
    // Sử dụng data_hash thực tế thay vì sinh uuid random, giả lập tx_hash trên L1
    let random_tx = format!("0x{}", hex::encode(Sha256::digest(format!("{}_{}", data_hash, Uuid::new_v4()).as_bytes())));
    
    let query = r#"
        INSERT INTO nf_core.blockchain_ledger (tenant_id, tx_hash, payload_snapshot, network)
        VALUES ($1, $2, $3, 'U2U_TESTNET_SIMULATED')
    "#;
    
    if let Err(e) = sqlx::query(query)
        .bind(tenant_id)
        .bind(&random_tx)
        .bind(payload)
        .execute(pool)
        .await
    {
        eprintln!("[Blockchain Trust Layer] Failed to anchor data to DB: {}", e);
    } else {
        println!("[Blockchain Trust Layer] Anchored data_hash: {} | TxHash: {}", data_hash, random_tx);
    }
    
    random_tx
}

/// Mô phỏng việc AI gọi Smart Contract để tự động giải ngân (Auto-Payout).
/// Chỉ AI Agent (được xác thực) mới được quyền gọi lệnh này với ngân sách cho trước.
pub async fn trigger_automated_payout(
    task_id: Uuid, 
    payee_wallet: &str, 
    amount: f64
) -> String {
    // Giả lập giao dịch giải ngân token trên mạng U2U Network
    sleep(Duration::from_millis(800)).await;
    
    let random_tx = format!("0xPAY{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple());
    println!(
        "[Smart Contract Execution] AI Agent paid {} USDC to {} for Task: {}. TxHash: {}",
        amount, payee_wallet, task_id, random_tx
    );
    
    random_tx
}
