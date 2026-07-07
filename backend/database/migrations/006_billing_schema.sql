-- Bảng lưu trữ thông tin hóa đơn (Invoices)
CREATE TABLE IF NOT EXISTS nf_core.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    work_item_id UUID NOT NULL REFERENCES nf_core.work_items(id) ON DELETE CASCADE,
    
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- DRAFT, UNPAID, PAID, CANCELLED
    due_date TIMESTAMP WITH TIME ZONE,
    
    payment_link_url TEXT,
    stripe_invoice_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu trữ giao dịch/webhook từ cổng thanh toán (Transactions)
CREATE TABLE IF NOT EXISTS nf_core.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES nf_core.invoices(id) ON DELETE CASCADE,
    
    gateway VARCHAR(50) NOT NULL DEFAULT 'stripe', -- stripe, vnpay
    gateway_transaction_id VARCHAR(255) NOT NULL,
    
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- succeeded, failed, pending
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_payload JSONB -- Lưu trữ toàn bộ payload webhook để đối soát
);

-- Index cho việc query nhanh
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON nf_core.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_work_item_id ON nf_core.invoices(work_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON nf_core.transactions(invoice_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_gateway_tx_id ON nf_core.transactions(gateway_transaction_id);

-- Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION nf_core.update_invoices_mod_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_mod_time
BEFORE UPDATE ON nf_core.invoices
FOR EACH ROW EXECUTE FUNCTION nf_core.update_invoices_mod_time();
