-- Tạo bảng customers phục vụ cho CRM
CREATE TABLE IF NOT EXISTS nf_core.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    total_spent FLOAT DEFAULT 0.0,
    order_count INT DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    segment VARCHAR(50) DEFAULT 'NEW', -- Ví dụ: NEW, REGULAR, VIP, CHURNING
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON nf_core.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON nf_core.customers(segment);
