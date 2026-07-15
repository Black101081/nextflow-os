-- MIGRATION 023: F&B STANDARD AND EDU & TRAINING VERTICAL PACKS
CREATE SCHEMA IF NOT EXISTS nf_tenant;

-- =========================================================================
-- 1. F&B STANDARD PACK TABLES
-- =========================================================================

-- 1.1 F&B Orders
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    branch_id       UUID,
    table_number    VARCHAR(20),
    source          VARCHAR(50) DEFAULT 'Table', -- Table, Baemin, GrabFood, Takeaway
    items           JSONB DEFAULT '[]'::JSONB,
    status          VARCHAR(50) DEFAULT 'Received',
    served_by       UUID,
    total_amount    DECIMAL(15,2) DEFAULT 0.00,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE
);

-- 1.2 F&B Shifts
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    branch_id       UUID,
    shift_date      DATE NOT NULL,
    shift_type      VARCHAR(20) NOT NULL, -- Morning, Afternoon, Evening
    planned_staff   JSONB DEFAULT '[]'::JSONB,
    actual_staff    JSONB DEFAULT '[]'::JSONB,
    notes           TEXT,
    status          VARCHAR(50) DEFAULT 'Scheduled',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Ingredient Checks
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_ingredient_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    branch_id       UUID,
    check_date      DATE NOT NULL,
    items           JSONB DEFAULT '[]'::JSONB,
    checked_by      UUID,
    issues          TEXT,
    status          VARCHAR(50) DEFAULT 'Pending',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 Menu Items
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(100),
    price           DECIMAL(15,2) NOT NULL,
    cost            DECIMAL(15,2),
    is_available    BOOLEAN DEFAULT TRUE,
    recipe          JSONB DEFAULT '{}'::JSONB,
    image_url       TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================================
-- 2. EDU & TRAINING PACK TABLES
-- =========================================================================

-- 2.1 Students
CREATE TABLE IF NOT EXISTS nf_tenant.edu_students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    dob             DATE,
    gender          VARCHAR(10),
    phone           VARCHAR(20),
    email           VARCHAR(200),
    parent_name     VARCHAR(200),
    parent_phone    VARCHAR(20),
    parent_email    VARCHAR(200),
    current_level   VARCHAR(50),
    current_course_id UUID,
    total_debt      DECIMAL(15,2) DEFAULT 0.00,
    attendance_rate DECIMAL(5,2) DEFAULT 100.00,
    status          VARCHAR(50) DEFAULT 'Active',
    enrolled_at     DATE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Classes
CREATE TABLE IF NOT EXISTS nf_tenant.edu_classes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    class_name      VARCHAR(200) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Grade Records
CREATE TABLE IF NOT EXISTS nf_tenant.edu_grade_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES nf_tenant.edu_students(id) ON DELETE CASCADE,
    class_id        UUID REFERENCES nf_tenant.edu_classes(id) ON DELETE CASCADE,
    test_type       VARCHAR(50), -- GiuaKy, CuoiKy, Practice, Mock
    subject         VARCHAR(100),
    score           DECIMAL(5,2),
    max_score       DECIMAL(5,2) DEFAULT 100.00,
    feedback        TEXT,
    ai_report       TEXT,
    graded_by       UUID,
    graded_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Payments
CREATE TABLE IF NOT EXISTS nf_tenant.edu_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES nf_tenant.edu_students(id) ON DELETE CASCADE,
    amount          DECIMAL(15,2) NOT NULL,
    due_date        DATE NOT NULL,
    paid_date       DATE,
    paid_amount     DECIMAL(15,2),
    method          VARCHAR(50),
    status          VARCHAR(50) DEFAULT 'Pending',
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================================
-- 3. TRIGGERS & INDEXES
-- =========================================================================

-- Triggers for updated_at
CREATE TRIGGER update_fnb_orders_modtime BEFORE UPDATE ON nf_tenant.fnb_orders FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_fnb_shifts_modtime BEFORE UPDATE ON nf_tenant.fnb_shifts FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_fnb_ingredient_checks_modtime BEFORE UPDATE ON nf_tenant.fnb_ingredient_checks FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_fnb_menu_items_modtime BEFORE UPDATE ON nf_tenant.fnb_menu_items FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

CREATE TRIGGER update_edu_students_modtime BEFORE UPDATE ON nf_tenant.edu_students FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_edu_classes_modtime BEFORE UPDATE ON nf_tenant.edu_classes FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_edu_grade_records_modtime BEFORE UPDATE ON nf_tenant.edu_grade_records FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_edu_payments_modtime BEFORE UPDATE ON nf_tenant.edu_payments FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fnb_orders_tenant_created ON nf_tenant.fnb_orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fnb_orders_status ON nf_tenant.fnb_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_fnb_shifts_date ON nf_tenant.fnb_shifts(tenant_id, shift_date);

CREATE INDEX IF NOT EXISTS idx_edu_students_tenant ON nf_tenant.edu_students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_edu_grade_records_student ON nf_tenant.edu_grade_records(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_edu_payments_student ON nf_tenant.edu_payments(tenant_id, student_id);
