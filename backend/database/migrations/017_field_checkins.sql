CREATE TABLE IF NOT EXISTS nf_core.field_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES nf_core.users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    image_base64 TEXT, -- Storing small image or reference url
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_field_checkins_tenant_worker ON nf_core.field_checkins(tenant_id, worker_id);
CREATE INDEX idx_field_checkins_created_at ON nf_core.field_checkins(created_at DESC);
