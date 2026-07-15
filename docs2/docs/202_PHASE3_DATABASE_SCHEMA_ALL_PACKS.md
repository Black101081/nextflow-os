# Nextflow OS – Phase 3: Database Schema tất cả 12 Vertical Packs

**Document ID:** 202_PHASE3_DATABASE_SCHEMA_ALL_PACKS  
**Pack:** 10 — Vertical Industry Packs  
**Version:** 1.0  
**Status:** ACTIVE  
**Date:** 2026-07-15  

---

## 1. Kiến trúc Database

```
nf_core.*     → Shared Core Tables (tenant, users, work_items, roles...)
nf_tenant.*   → Vertical Pack Tables (spa_*, auto_*, fnb_*, edu_*...)
```

> **RULE**: Tất cả bảng pack phải có cột `tenant_id UUID NOT NULL` và enable Row Level Security (RLS).

---

## 2. Schema: Spa & Clinic Pack

```sql
-- ===== SPA & CLINIC PACK =====
CREATE SCHEMA IF NOT EXISTS nf_tenant;

-- Hồ sơ Da liễu
CREATE TABLE IF NOT EXISTS nf_tenant.spa_skin_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL,
    skin_type       VARCHAR(50),
    issues          TEXT[],
    current_treatment VARCHAR(200),
    history         JSONB DEFAULT '[]'::JSONB,
    photos          TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lịch hẹn Spa
CREATE TABLE IF NOT EXISTS nf_tenant.spa_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL,
    service         VARCHAR(200) NOT NULL,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    technician_id   UUID,
    branch_id       UUID,
    status          VARCHAR(50) DEFAULT 'Pending',
    notes           TEXT,
    confirmed_at    TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Liệu trình đã mua
CREATE TABLE IF NOT EXISTS nf_tenant.spa_courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL,
    course_name     VARCHAR(200) NOT NULL,
    total_sessions  INT NOT NULL DEFAULT 10,
    used_sessions   INT NOT NULL DEFAULT 0,
    expiry_date     DATE,
    status          VARCHAR(50) DEFAULT 'Active',
    purchased_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spa_bookings_tenant_scheduled 
    ON nf_tenant.spa_bookings(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_spa_bookings_customer 
    ON nf_tenant.spa_bookings(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_spa_courses_expiry 
    ON nf_tenant.spa_courses(tenant_id, expiry_date);

-- RLS
ALTER TABLE nf_tenant.spa_skin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.spa_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.spa_courses ENABLE ROW LEVEL SECURITY;
```

---

## 3. Schema: Auto Repair & Garage Pack

```sql
-- ===== AUTO REPAIR & GARAGE PACK =====

-- Hồ sơ xe
CREATE TABLE IF NOT EXISTS nf_tenant.auto_vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    license_plate       VARCHAR(20) NOT NULL,
    brand               VARCHAR(100),
    model               VARCHAR(100),
    year                INT,
    owner_customer_id   UUID,
    current_mileage     INT DEFAULT 0,
    last_service_date   DATE,
    next_service_date   DATE,
    next_service_mileage INT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, license_plate)
);

-- Phiếu sửa chữa
CREATE TABLE IF NOT EXISTS nf_tenant.auto_repair_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    vehicle_id          UUID REFERENCES nf_tenant.auto_vehicles(id),
    check_in_time       TIMESTAMPTZ DEFAULT NOW(),
    symptoms            TEXT,
    diagnosis_items     JSONB DEFAULT '[]'::JSONB,
    total_estimate      DECIMAL(15,2) DEFAULT 0,
    customer_approved   BOOLEAN DEFAULT FALSE,
    approved_at         TIMESTAMPTZ,
    technician_id       UUID,
    status              VARCHAR(50) DEFAULT 'Received',
    completed_at        TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Lịch sử sửa chữa
CREATE TABLE IF NOT EXISTS nf_tenant.auto_service_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    vehicle_id          UUID REFERENCES nf_tenant.auto_vehicles(id),
    repair_order_id     UUID REFERENCES nf_tenant.auto_repair_orders(id),
    service_date        DATE,
    services_done       TEXT[],
    parts_replaced      JSONB DEFAULT '[]'::JSONB,
    mileage_at_service  INT,
    total_cost          DECIMAL(15,2),
    technician_id       UUID
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auto_vehicles_tenant_plate 
    ON nf_tenant.auto_vehicles(tenant_id, license_plate);
CREATE INDEX IF NOT EXISTS idx_auto_repair_tenant_status 
    ON nf_tenant.auto_repair_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_auto_vehicles_next_service 
    ON nf_tenant.auto_vehicles(tenant_id, next_service_date);

-- RLS
ALTER TABLE nf_tenant.auto_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.auto_repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.auto_service_history ENABLE ROW LEVEL SECURITY;
```

---

## 4. Schema: F&B Standard Pack

```sql
-- ===== F&B STANDARD PACK =====

-- Đơn gọi món
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    branch_id       UUID,
    table_number    VARCHAR(20),
    source          VARCHAR(50) DEFAULT 'Table', -- Table, Baemin, GrabFood, Takeaway
    items           JSONB DEFAULT '[]'::JSONB,
    status          VARCHAR(50) DEFAULT 'Received',
    served_by       UUID,
    total_amount    DECIMAL(15,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- Quản lý Ca làm việc
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
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Kiểm tra Nguyên liệu
CREATE TABLE IF NOT EXISTS nf_tenant.fnb_ingredient_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    branch_id       UUID,
    check_date      DATE NOT NULL,
    items           JSONB DEFAULT '[]'::JSONB,
    checked_by      UUID,
    issues          TEXT,
    status          VARCHAR(50) DEFAULT 'Pending',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
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
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fnb_orders_tenant_created 
    ON nf_tenant.fnb_orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fnb_orders_status 
    ON nf_tenant.fnb_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_fnb_shifts_date 
    ON nf_tenant.fnb_shifts(tenant_id, shift_date);

-- RLS
ALTER TABLE nf_tenant.fnb_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.fnb_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.fnb_ingredient_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.fnb_menu_items ENABLE ROW LEVEL SECURITY;
```

---

## 5. Schema: Edu & Training Pack

```sql
-- ===== EDU & TRAINING PACK =====

-- Học viên
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
    total_debt      DECIMAL(15,2) DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 100,
    status          VARCHAR(50) DEFAULT 'Active',
    enrolled_at     DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng điểm
CREATE TABLE IF NOT EXISTS nf_tenant.edu_grade_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES nf_tenant.edu_students(id),
    class_id        UUID,
    test_type       VARCHAR(50), -- GiuaKy, CuoiKy, Practice, Mock
    subject         VARCHAR(100),
    score           DECIMAL(5,2),
    max_score       DECIMAL(5,2) DEFAULT 100,
    feedback        TEXT,
    ai_report       TEXT,
    graded_by       UUID,
    graded_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Thanh toán Học phí
CREATE TABLE IF NOT EXISTS nf_tenant.edu_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES nf_tenant.edu_students(id),
    amount          DECIMAL(15,2) NOT NULL,
    due_date        DATE NOT NULL,
    paid_date       DATE,
    paid_amount     DECIMAL(15,2),
    method          VARCHAR(50),
    status          VARCHAR(50) DEFAULT 'Pending',
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lớp học
CREATE TABLE IF NOT EXISTS nf_tenant.edu_classes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    class_name      VARCHAR(200) NOT NULL,
    course_id       UUID,
    teacher_id      UUID,
    max_students    INT DEFAULT 20,
    schedule        JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(50) DEFAULT 'Active',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edu_students_tenant_status 
    ON nf_tenant.edu_students(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_edu_payments_due_date 
    ON nf_tenant.edu_payments(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_edu_payments_status 
    ON nf_tenant.edu_payments(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_edu_grade_records_student 
    ON nf_tenant.edu_grade_records(tenant_id, student_id);

-- RLS
ALTER TABLE nf_tenant.edu_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.edu_grade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.edu_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.edu_classes ENABLE ROW LEVEL SECURITY;
```

---

## 6. Schema: Real Estate Agency Pack

```sql
-- ===== REAL ESTATE AGENCY PACK =====

-- Bất động sản
CREATE TABLE IF NOT EXISTS nf_tenant.re_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    address         TEXT NOT NULL,
    district        VARCHAR(100),
    city            VARCHAR(100),
    type            VARCHAR(50), -- CanHo, NhaPho, DatNen, BietThu, Shophouse
    price           DECIMAL(20,2),
    area            DECIMAL(10,2),
    bedrooms        INT,
    bathrooms       INT,
    legal_status    TEXT,
    status          VARCHAR(50) DEFAULT 'Available',
    agent_id        UUID,
    virtual_tour_url TEXT,
    photos          TEXT[],
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Khách hàng
CREATE TABLE IF NOT EXISTS nf_tenant.re_leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200),
    phone           VARCHAR(20),
    email           VARCHAR(200),
    budget          DECIMAL(20,2),
    preferred_area  VARCHAR(200),
    property_type   VARCHAR(50),
    urgency         VARCHAR(20) DEFAULT 'Warm', -- Hot, Warm, Cold
    source          VARCHAR(50),
    ai_score        INT DEFAULT 0,
    agent_id        UUID,
    status          VARCHAR(50) DEFAULT 'New',
    last_contacted  TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Deal / Giao dịch
CREATE TABLE IF NOT EXISTS nf_tenant.re_deals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES nf_tenant.re_leads(id),
    listing_id      UUID REFERENCES nf_tenant.re_listings(id),
    stage           VARCHAR(50) DEFAULT 'Viewed',
    agent_id        UUID,
    commission      DECIMAL(15,2),
    legal_milestones JSONB DEFAULT '[]'::JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_re_leads_urgency_status 
    ON nf_tenant.re_leads(tenant_id, urgency, status);
CREATE INDEX IF NOT EXISTS idx_re_leads_agent 
    ON nf_tenant.re_leads(tenant_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_re_listings_status 
    ON nf_tenant.re_listings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_re_deals_stage 
    ON nf_tenant.re_deals(tenant_id, stage);

-- RLS
ALTER TABLE nf_tenant.re_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.re_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.re_deals ENABLE ROW LEVEL SECURITY;
```

---

## 7. Schema: Hospitality & Homestay Pack

```sql
-- ===== HOSPITALITY & HOMESTAY PACK =====

-- Phòng khách sạn
CREATE TABLE IF NOT EXISTS nf_tenant.hosp_rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    room_number     VARCHAR(20) NOT NULL,
    room_type       VARCHAR(50), -- Standard, Deluxe, Suite, Family
    floor           INT,
    status          VARCHAR(50) DEFAULT 'Available',
    last_cleaned    TIMESTAMPTZ,
    smart_lock_code VARCHAR(20),
    amenities       TEXT[],
    base_price      DECIMAL(15,2),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, room_number)
);

-- Đặt phòng
CREATE TABLE IF NOT EXISTS nf_tenant.hosp_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    room_id         UUID REFERENCES nf_tenant.hosp_rooms(id),
    guest_name      VARCHAR(200) NOT NULL,
    guest_email     VARCHAR(200),
    guest_phone     VARCHAR(20),
    check_in        TIMESTAMPTZ NOT NULL,
    check_out       TIMESTAMPTZ NOT NULL,
    source          VARCHAR(50) DEFAULT 'Direct',
    status          VARCHAR(50) DEFAULT 'Confirmed',
    special_requests TEXT,
    total_amount    DECIMAL(15,2),
    paid_amount     DECIMAL(15,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Yêu cầu dịch vụ
CREATE TABLE IF NOT EXISTS nf_tenant.hosp_service_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES nf_tenant.hosp_bookings(id),
    request_type    VARCHAR(100), -- ExtraTowel, Breakfast, Taxi, Tour, Laundry
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    fulfilled_at    TIMESTAMPTZ,
    assigned_to     UUID,
    status          VARCHAR(50) DEFAULT 'Requested',
    charge          DECIMAL(15,2) DEFAULT 0,
    notes           TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hosp_bookings_checkin 
    ON nf_tenant.hosp_bookings(tenant_id, check_in);
CREATE INDEX IF NOT EXISTS idx_hosp_bookings_status 
    ON nf_tenant.hosp_bookings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hosp_rooms_status 
    ON nf_tenant.hosp_rooms(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hosp_service_requests_status 
    ON nf_tenant.hosp_service_requests(tenant_id, status);

-- RLS
ALTER TABLE nf_tenant.hosp_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.hosp_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.hosp_service_requests ENABLE ROW LEVEL SECURITY;
```

---

## 8. Schema: Logistics & Delivery Pack

```sql
-- ===== LOGISTICS & DELIVERY PACK =====

-- Vận đơn
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
    dimensions      JSONB,
    status          VARCHAR(50) DEFAULT 'Received',
    driver_id       UUID,
    hub_id          UUID,
    failed_attempts INT DEFAULT 0,
    delivered_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, tracking_code)
);

-- Đối soát COD
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_log_waybills_tracking 
    ON nf_tenant.log_waybills(tenant_id, tracking_code);
CREATE INDEX IF NOT EXISTS idx_log_waybills_driver_status 
    ON nf_tenant.log_waybills(tenant_id, driver_id, status);
CREATE INDEX IF NOT EXISTS idx_log_cod_driver_date 
    ON nf_tenant.log_cod_reconciliations(tenant_id, driver_id, recon_date);

-- RLS
ALTER TABLE nf_tenant.log_waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.log_cod_reconciliations ENABLE ROW LEVEL SECURITY;
```

---

## 9. Schema: Pharmacy & Healthcare Pack

```sql
-- ===== PHARMACY & HEALTHCARE PACK =====

-- Đơn thuốc
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
    ai_check_result JSONB,
    pharmacist_id   UUID,
    dispensed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tồn kho thuốc
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

-- Hồ sơ bệnh nhân
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phar_inventory_expiry 
    ON nf_tenant.phar_inventory(tenant_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_phar_inventory_reorder 
    ON nf_tenant.phar_inventory(tenant_id, quantity, reorder_point);
CREATE INDEX IF NOT EXISTS idx_phar_prescriptions_status 
    ON nf_tenant.phar_prescriptions(tenant_id, status);

-- RLS
ALTER TABLE nf_tenant.phar_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.phar_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.phar_patient_records ENABLE ROW LEVEL SECURITY;
```

---

## 10. Schema: Micro-Manufacturing Pack

```sql
-- ===== MICRO-MANUFACTURING PACK =====

-- Lệnh sản xuất (Work Order)
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

-- BOM (Bill of Materials)
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

-- Báo cáo QC
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mfg_work_orders_status 
    ON nf_tenant.mfg_work_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_mfg_work_orders_product 
    ON nf_tenant.mfg_work_orders(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_mfg_qc_work_order 
    ON nf_tenant.mfg_qc_reports(tenant_id, work_order_id);

-- RLS
ALTER TABLE nf_tenant.mfg_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.mfg_boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.mfg_qc_reports ENABLE ROW LEVEL SECURITY;
```

---

## 11. Schema: Contractor & Interior Pack

```sql
-- ===== CONTRACTOR & INTERIOR PACK =====

-- Dự án thi công
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

-- Nhật ký thi công hàng ngày
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

-- Yêu cầu vật tư
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_const_projects_status 
    ON nf_tenant.const_projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_const_daily_logs_project_date 
    ON nf_tenant.const_daily_logs(tenant_id, project_id, log_date);

-- RLS
ALTER TABLE nf_tenant.const_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.const_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.const_material_requests ENABLE ROW LEVEL SECURITY;
```

---

## 12. Schema: Professional Services Pack

```sql
-- ===== PROFESSIONAL SERVICES PACK =====

-- Khách hàng B2B
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

-- Hợp đồng dịch vụ
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

-- Lịch nộp báo cáo thuế
CREATE TABLE IF NOT EXISTS nf_tenant.ps_tax_filings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES nf_tenant.ps_clients(id),
    filing_type     VARCHAR(100),
    period          VARCHAR(50),
    due_date        DATE NOT NULL,
    filed_date      DATE,
    status          VARCHAR(50) DEFAULT 'Pending',
    responsible_cpa UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ps_clients_status 
    ON nf_tenant.ps_clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ps_tax_filings_due_date 
    ON nf_tenant.ps_tax_filings(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_ps_contracts_end_date 
    ON nf_tenant.ps_contracts(tenant_id, end_date);

-- RLS
ALTER TABLE nf_tenant.ps_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.ps_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.ps_tax_filings ENABLE ROW LEVEL SECURITY;
```

---

## 13. Migration Master Script

```sql
-- ===== MASTER MIGRATION: All 12 Vertical Packs =====
-- File: backend/migrations/20260715_000001_all_vertical_packs.sql
-- Run with: psql -h localhost -U postgres -d nextflow -f this_file.sql

BEGIN;

-- [Execute all CREATE TABLE statements above in order]
-- 1. Spa & Clinic
-- 2. Auto Repair
-- 3. F&B Standard
-- 4. Edu & Training
-- 5. Real Estate
-- 6. Hospitality
-- 7. Logistics
-- 8. Pharmacy
-- 9. Manufacturing
-- 10. Contractor
-- 11. Professional Services

-- Track migration
INSERT INTO nf_core.schema_migrations(version, applied_at, description)
VALUES ('20260715_000001', NOW(), 'Create all 12 vertical pack tables with RLS');

COMMIT;
```
