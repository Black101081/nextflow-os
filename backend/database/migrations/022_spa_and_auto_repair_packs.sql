-- MIGRATION 022: SPA & CLINIC AND AUTO REPAIR VERTICAL PACKS
CREATE SCHEMA IF NOT EXISTS nf_tenant;

-- =========================================================================
-- 1. SPA & CLINIC PACK TABLES
-- =========================================================================

-- 1.1 Skin Profiles
CREATE TABLE IF NOT EXISTS nf_tenant.spa_skin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    skin_type VARCHAR(50),
    issues TEXT[],
    current_treatment VARCHAR(200),
    history JSONB DEFAULT '[]'::JSONB,
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uniq_customer_skin_profile UNIQUE(tenant_id, customer_id)
);

-- 1.2 Bookings
CREATE TABLE IF NOT EXISTS nf_tenant.spa_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    service VARCHAR(200) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    technician_id UUID,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Courses
CREATE TABLE IF NOT EXISTS nf_tenant.spa_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    total_sessions INT NOT NULL DEFAULT 10,
    used_sessions INT NOT NULL DEFAULT 0,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. AUTO REPAIR & GARAGE PACK TABLES
-- =========================================================================

-- 2.1 Vehicles
CREATE TABLE IF NOT EXISTS nf_tenant.auto_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    owner_customer_id UUID,
    current_mileage INT DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    next_service_mileage INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, license_plate)
);

-- 2.2 Repair Orders
CREATE TABLE IF NOT EXISTS nf_tenant.auto_repair_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES nf_tenant.auto_vehicles(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    symptoms TEXT,
    diagnosis_items JSONB DEFAULT '[]'::JSONB,
    total_estimate DECIMAL(15,2) DEFAULT 0.00,
    customer_approved BOOLEAN DEFAULT FALSE,
    technician_id UUID,
    status VARCHAR(50) DEFAULT 'Received',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triggers to update updated_at columns
CREATE TRIGGER update_spa_skin_profiles_modtime BEFORE UPDATE ON nf_tenant.spa_skin_profiles FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_spa_bookings_modtime BEFORE UPDATE ON nf_tenant.spa_bookings FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_spa_courses_modtime BEFORE UPDATE ON nf_tenant.spa_courses FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_auto_vehicles_modtime BEFORE UPDATE ON nf_tenant.auto_vehicles FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();
CREATE TRIGGER update_auto_repair_orders_modtime BEFORE UPDATE ON nf_tenant.auto_repair_orders FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_spa_bookings_tenant_scheduled ON nf_tenant.spa_bookings(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_spa_bookings_customer ON nf_tenant.spa_bookings(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_spa_courses_customer ON nf_tenant.spa_courses(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_auto_vehicles_plate ON nf_tenant.auto_vehicles(tenant_id, license_plate);
CREATE INDEX IF NOT EXISTS idx_auto_repair_orders_vehicle ON nf_tenant.auto_repair_orders(tenant_id, vehicle_id);
