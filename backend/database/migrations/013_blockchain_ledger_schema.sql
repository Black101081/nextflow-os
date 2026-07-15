-- MIGRATION 013: BLOCKCHAIN LEDGER SCHEMA
-- Tạo bảng lưu trữ vĩnh viễn các giao dịch được neo trên Blockchain (U2U Network)

CREATE TABLE IF NOT EXISTS nf_core.blockchain_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66) NOT NULL UNIQUE, -- Định dạng 0x...
    payload_snapshot JSONB NOT NULL,
    network VARCHAR(50) NOT NULL DEFAULT 'U2U_TESTNET_SIMULATED',
    status VARCHAR(20) NOT NULL DEFAULT 'ANCHORED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho phép truy vấn nhanh giao dịch của một tenant cụ thể, sắp xếp theo thời gian
CREATE INDEX IF NOT EXISTS idx_blockchain_ledger_tenant_time 
ON nf_core.blockchain_ledger (tenant_id, created_at DESC);

-- GIN Index để cho phép tìm kiếm dữ liệu gốc đã được mã hóa (VD: Tìm theo mã đơn hàng)
CREATE INDEX IF NOT EXISTS idx_blockchain_ledger_payload 
ON nf_core.blockchain_ledger USING GIN (payload_snapshot);
