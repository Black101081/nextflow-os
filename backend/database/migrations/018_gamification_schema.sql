CREATE TABLE IF NOT EXISTS nf_core.user_points (
    user_id UUID PRIMARY KEY REFERENCES nf_core.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_tier VARCHAR(50) DEFAULT 'Bronze',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nf_core.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES nf_core.users(id) ON DELETE CASCADE,
    work_item_id UUID REFERENCES nf_core.work_items(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_points_tenant ON nf_core.user_points(tenant_id, total_points DESC);
CREATE INDEX idx_point_transactions_user ON nf_core.point_transactions(user_id, created_at DESC);
