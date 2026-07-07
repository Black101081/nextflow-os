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

/// Mô phỏng quá trình neo dữ liệu lên mạng lưới Blockchain (U2U Network).
/// Trả về một mã giao dịch (TxHash) giả lập.
pub async fn anchor_data_on_chain(data_hash: &str) -> String {
    // Giả lập thời gian chờ (network delay & finality)
    sleep(Duration::from_millis(500)).await;
    
    // Sinh tx_hash ngẫu nhiên giống với format của Ethereum/U2U
    let random_tx = format!("0x{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple());
    println!("[Blockchain Trust Layer] Anchored data_hash: {} | TxHash: {}", data_hash, random_tx);
    
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
