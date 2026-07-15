-- 019_template_installations.sql

CREATE TABLE IF NOT EXISTS nf_core.tenant_installed_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    template_id VARCHAR(50) NOT NULL REFERENCES nf_core.template_packs(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_installed_templates_tenant_id ON nf_core.tenant_installed_templates(tenant_id);
