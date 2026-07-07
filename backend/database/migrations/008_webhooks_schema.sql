-- Bảng lưu trữ cấu hình Webhook của từng doanh nghiệp SME
CREATE TABLE IF NOT EXISTS nf_core.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    secret_key VARCHAR(255), -- Khóa bảo mật để SME tự verify signature
    events JSONB NOT NULL DEFAULT '[]'::jsonb, -- Danh sách sự kiện đăng ký, vd: ["WORK_ITEM_COMPLETED", "INVOICE_PAID"]
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant_id ON nf_core.webhook_endpoints(tenant_id);

-- Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION nf_core.update_webhook_endpoints_mod_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhook_endpoints_mod_time
BEFORE UPDATE ON nf_core.webhook_endpoints
FOR EACH ROW EXECUTE FUNCTION nf_core.update_webhook_endpoints_mod_time();
