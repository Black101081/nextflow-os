-- Migration: 024_hosp_and_re_packs
-- Author: AI Agent Antigravity
-- Description: Create Hospitality & Real Estate Pack tables with RLS and Indexes

BEGIN;

-- ===== HOSPITALITY & HOMESTAY PACK =====

-- Rooms
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

-- Bookings
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

-- Service Requests
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


-- ===== REAL ESTATE AGENCY PACK =====

-- Listings
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

-- Leads
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

-- Deals
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


-- ===== ROW LEVEL SECURITY & POLICIES =====

ALTER TABLE nf_tenant.hosp_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.hosp_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.hosp_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.re_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.re_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nf_tenant.re_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON nf_tenant.hosp_rooms
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON nf_tenant.hosp_bookings
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON nf_tenant.hosp_service_requests
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON nf_tenant.re_listings
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON nf_tenant.re_leads
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation ON nf_tenant.re_deals
    USING (tenant_id = current_setting('app.tenant_id')::UUID);


-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_hosp_bookings_checkin ON nf_tenant.hosp_bookings(tenant_id, check_in);
CREATE INDEX IF NOT EXISTS idx_hosp_bookings_status ON nf_tenant.hosp_bookings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hosp_rooms_status ON nf_tenant.hosp_rooms(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hosp_service_requests_status ON nf_tenant.hosp_service_requests(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_re_leads_urgency_status ON nf_tenant.re_leads(tenant_id, urgency, status);
CREATE INDEX IF NOT EXISTS idx_re_leads_agent ON nf_tenant.re_leads(tenant_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_re_listings_status ON nf_tenant.re_listings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_re_deals_stage ON nf_tenant.re_deals(tenant_id, stage);

COMMIT;
