-- Migration: 025_remaining_five_packs
-- Author: AI Agent Antigravity
-- Description: Create remaining 5 vertical packs database tables with RLS and indices

BEGIN;

CREATE SCHEMA IF NOT EXISTS nf_tenant;

-- ==========================================
-- 8. LOGISTICS & DELIVERY PACK
-- ==========================================
CREATE TABLE IF NOT EXISTS nf_tenant.log_waybills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    tracking_code   VARCHAR(50) NOT NULL,
    sender_id       UUID,
    receiver_name   VARCHAR(200),
    receiver_phone  VARCHAR(20),
    receiver_address TEXT,
    cod_amount      DECIMAL(15,2) DEFAULT 0,
    weight          DECIMAL(10,3),
    dimensions      JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(50) DEFAULT 'Received',
    driver_id       UUID,
    hub_id          UUID,
    failed_attempts INT DEFAULT 0,
    delivered_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, tracking_code)
);

CREATE TABLE IF NOT EXISTS nf_tenant.log_cod_reconciliations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    driver_id       UUID NOT NULL,
    recon_date      DATE NOT NULL,
    total_orders    INT DEFAULT 0,
    success_orders  INT DEFAULT 0,
    expected_cash   DECIMAL(15,2) DEFAULT 0,
    actual_cash     DECIMAL(15,2) DEFAULT 0,
    discrepancy     DECIMAL(15,2) DEFAULT 0,
    status          VARCHAR(50) DEFAULT 'Pending',
    approved_by     UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_waybills_tracking ON nf_tenant.log_waybills(tenant_id, tracking_code);
CREATE INDEX IF NOT EXISTS idx_log_waybills_driver_status ON nf_tenant.log_waybills(tenant_id, driver_id, status);
CREATE INDEX IF NOT EXISTS idx_log_cod_driver_date ON nf_tenant.log_cod_reconciliations(tenant_id, driver_id, recon_date);

ALTER TABLE nf_tenant.log_waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.log_cod_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.log_waybills USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.log_cod_reconciliations USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ==========================================
-- 9. PHARMACY & HEALTHCARE PACK
-- ==========================================
CREATE TABLE IF NOT EXISTS nf_tenant.phar_prescriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    patient_name    VARCHAR(200) NOT NULL,
    patient_dob     DATE,
    patient_phone   VARCHAR(20),
    doctor_name     VARCHAR(200),
    clinic_name     VARCHAR(200),
    diagnosis       TEXT,
    medicines       JSONB DEFAULT '[]'::JSONB,
    requires_narcotic BOOLEAN DEFAULT FALSE,
    status          VARCHAR(50) DEFAULT 'Received',
    ai_check_result JSONB DEFAULT '{}'::JSONB,
    pharmacist_id   UUID,
    dispensed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.phar_inventory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    medicine_id     VARCHAR(50),
    name            VARCHAR(200) NOT NULL,
    generic_name    VARCHAR(200),
    quantity        INT DEFAULT 0,
    unit            VARCHAR(20),
    expiry_date     DATE,
    batch_number    VARCHAR(50),
    purchase_price  DECIMAL(15,2),
    sell_price      DECIMAL(15,2),
    reorder_point   INT DEFAULT 10,
    requires_prescription BOOLEAN DEFAULT FALSE,
    category        VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.phar_patient_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    patient_name    VARCHAR(200) NOT NULL,
    dob             DATE,
    phone           VARCHAR(20),
    blood_type      VARCHAR(5),
    chronic_conditions TEXT[],
    current_medications TEXT[],
    allergies       TEXT[],
    last_visit      DATE,
    next_appointment DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phar_inventory_expiry ON nf_tenant.phar_inventory(tenant_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_phar_inventory_reorder ON nf_tenant.phar_inventory(tenant_id, quantity, reorder_point);
CREATE INDEX IF NOT EXISTS idx_phar_prescriptions_status ON nf_tenant.phar_prescriptions(tenant_id, status);

ALTER TABLE nf_tenant.phar_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.phar_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.phar_patient_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.phar_prescriptions USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.phar_inventory USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.phar_patient_records USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ==========================================
-- 10. MICRO-MANUFACTURING PACK
-- ==========================================
CREATE TABLE IF NOT EXISTS nf_tenant.mfg_work_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    order_ref       VARCHAR(50),
    product_id      UUID,
    product_name    VARCHAR(200),
    target_quantity INT NOT NULL,
    produced_quantity INT DEFAULT 0,
    defect_quantity INT DEFAULT 0,
    line_id         UUID,
    supervisor_id   UUID,
    start_time      TIMESTAMPTZ,
    end_time        TIMESTAMPTZ,
    status          VARCHAR(50) DEFAULT 'Planned',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.mfg_boms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL,
    product_name    VARCHAR(200),
    version         VARCHAR(20) DEFAULT '1.0',
    materials       JSONB DEFAULT '[]'::JSONB,
    labor_hours     DECIMAL(10,2),
    approved        BOOLEAN DEFAULT FALSE,
    approved_by     UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.mfg_qc_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    work_order_id   UUID REFERENCES nf_tenant.mfg_work_orders(id),
    checked_quantity INT,
    pass_quantity   INT,
    defect_types    JSONB DEFAULT '[]'::JSONB,
    disposition     VARCHAR(50), -- Accept, Rework, Scrap
    inspector_id    UUID,
    inspected_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfg_work_orders_status ON nf_tenant.mfg_work_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_mfg_work_orders_product ON nf_tenant.mfg_work_orders(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_mfg_qc_work_order ON nf_tenant.mfg_qc_reports(tenant_id, work_order_id);

ALTER TABLE nf_tenant.mfg_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.mfg_boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.mfg_qc_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.mfg_work_orders USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.mfg_boms USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.mfg_qc_reports USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ==========================================
-- 11. CONTRACTOR & INTERIOR PACK
-- ==========================================
CREATE TABLE IF NOT EXISTS nf_tenant.const_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    project_name    VARCHAR(200) NOT NULL,
    client_id       UUID,
    client_name     VARCHAR(200),
    client_phone    VARCHAR(20),
    contract_value  DECIMAL(20,2),
    address         TEXT,
    start_date      DATE,
    end_date        DATE,
    progress        INT DEFAULT 0, -- 0-100%
    site_manager_id UUID,
    status          VARCHAR(50) DEFAULT 'Planning',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.const_daily_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES nf_tenant.const_projects(id),
    log_date        DATE NOT NULL,
    workers_count   INT DEFAULT 0,
    summary         TEXT,
    completed_items TEXT[],
    issues          TEXT,
    photos          TEXT[],
    weather         VARCHAR(50),
    supervisor_id   UUID,
    ai_report       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.const_material_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES nf_tenant.const_projects(id),
    items           JSONB DEFAULT '[]'::JSONB,
    requested_by    UUID,
    approved_by     UUID,
    urgency         VARCHAR(20) DEFAULT 'Normal',
    status          VARCHAR(50) DEFAULT 'Pending',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_const_projects_status ON nf_tenant.const_projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_const_daily_logs_project_date ON nf_tenant.const_daily_logs(tenant_id, project_id, log_date);

ALTER TABLE nf_tenant.const_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.const_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.const_material_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.const_projects USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.const_daily_logs USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.const_material_requests USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ==========================================
-- 12. PROFESSIONAL SERVICES PACK
-- ==========================================
CREATE TABLE IF NOT EXISTS nf_tenant.ps_clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    company_name    VARCHAR(200) NOT NULL,
    tax_code        VARCHAR(20),
    legal_rep       VARCHAR(200),
    accounting_email VARCHAR(200),
    phone           VARCHAR(20),
    status          VARCHAR(50) DEFAULT 'Active',
    contract_value  DECIMAL(15,2),
    assigned_cpa    UUID,
    nda_signed      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.ps_contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES nf_tenant.ps_clients(id),
    contract_type   VARCHAR(50), -- KeToan, KiemToan, TuVan, PhapLy
    start_date      DATE,
    end_date        DATE,
    monthly_fee     DECIMAL(15,2),
    auto_renewal    BOOLEAN DEFAULT FALSE,
    status          VARCHAR(50) DEFAULT 'Active',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_tenant.ps_tax_filings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES nf_tenant.ps_clients(id),
    filing_type     VARCHAR(100),
    period          VARCHAR(50),
    due_date        DATE NOT NULL,
    filed_date      DATE,
    status          VARCHAR(50) DEFAULT 'Pending',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_clients_status ON nf_tenant.ps_clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ps_tax_filings_due_date ON nf_tenant.ps_tax_filings(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_ps_contracts_end_date ON nf_tenant.ps_contracts(tenant_id, end_date);

ALTER TABLE nf_tenant.ps_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.ps_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.ps_tax_filings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.ps_clients USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.ps_contracts USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON nf_tenant.ps_tax_filings USING (tenant_id = current_setting('app.tenant_id')::UUID);

COMMIT;
