-- MIGRATION 026: 4-LAYER UPGRADE SCHEMAS (FINANCE, HR, INVENTORY, CORE UPGRADES)

-- =========================================================================
-- 1. SCHEMAS INITIALIZATION
-- =========================================================================
CREATE SCHEMA IF NOT EXISTS nf_finance;
CREATE SCHEMA IF NOT EXISTS nf_hr;
CREATE SCHEMA IF NOT EXISTS nf_inventory;

-- =========================================================================
-- 2. FINANCE MODULE TABLES
-- =========================================================================

-- 2.1 Cash/Bank Accounts
CREATE TABLE IF NOT EXISTS nf_finance.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'VND',
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Income/Expense Transactions
CREATE TABLE IF NOT EXISTS nf_finance.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES nf_finance.accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    counterpart_name VARCHAR(200),
    payment_method VARCHAR(30),
    receipt_url TEXT,
    blockchain_hash VARCHAR(100),
    approved_by UUID,
    created_by UUID,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Sales/Purchase Invoices
CREATE TABLE IF NOT EXISTS nf_finance.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(30) NOT NULL,
    invoice_type VARCHAR(10) NOT NULL,
    customer_id UUID,
    supplier_id UUID,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 10.0,
    tax_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    items JSONB NOT NULL,
    notes TEXT,
    blockchain_hash VARCHAR(100),
    e_invoice_id VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Accounts Receivable (Công nợ phải thu)
CREATE TABLE IF NOT EXISTS nf_finance.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(200) NOT NULL,
    customer_id UUID,
    invoice_id UUID REFERENCES nf_finance.invoices(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',
    last_reminder_at TIMESTAMP WITH TIME ZONE,
    reminder_count INT DEFAULT 0,
    ai_collection_probability DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 Accounts Payable (Công nợ phải trả)
CREATE TABLE IF NOT EXISTS nf_finance.payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_id UUID,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(10) DEFAULT 'NORMAL',
    auto_approve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Expense Claims (Kê khai chi phí)
CREATE TABLE IF NOT EXISTS nf_finance.expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    claim_number VARCHAR(30) NOT NULL,
    employee_id UUID NOT NULL,
    employee_name VARCHAR(200),
    category VARCHAR(50),
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    receipt_url TEXT,
    receipt_ai_data JSONB,
    status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 Tax Filings (Kê khai thuế)
CREATE TABLE IF NOT EXISTS nf_finance.tax_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    tax_type VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    taxable_amount DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'DRAFT',
    due_date DATE,
    filed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    filing_reference VARCHAR(100),
    blockchain_hash VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 E-Invoices (Hoá đơn điện tử)
CREATE TABLE IF NOT EXISTS nf_finance.e_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES nf_finance.invoices(id) ON DELETE SET NULL,
    e_invoice_number VARCHAR(50),
    e_invoice_serial VARCHAR(20),
    provider VARCHAR(30),
    xml_data TEXT,
    pdf_url TEXT,
    status VARCHAR(20),
    issued_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 3. HR & PAYROLL MODULE TABLES
-- =========================================================================

-- 3.1 Employees Directory
CREATE TABLE IF NOT EXISTS nf_hr.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    user_id UUID,
    employee_code VARCHAR(20),
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(200),
    date_of_birth DATE,
    id_number VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    manager_id UUID REFERENCES nf_hr.employees(id) ON DELETE SET NULL,
    employment_type VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE,
    base_salary DECIMAL(15,2),
    allowances JSONB DEFAULT '{}'::JSONB,
    bank_account VARCHAR(30),
    bank_name VARCHAR(100),
    tax_code VARCHAR(20),
    social_insurance_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Attendance Records
CREATE TABLE IF NOT EXISTS nf_hr.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_location JSONB,
    check_out_location JSONB,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PRESENT',
    source VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uniq_tenant_emp_date UNIQUE(tenant_id, employee_id, date)
);

-- 3.3 Leave Requests
CREATE TABLE IF NOT EXISTS nf_hr.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 Payroll Runs
CREATE TABLE IF NOT EXISTS nf_hr.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    total_gross DECIMAL(15,2) DEFAULT 0.00,
    total_deductions DECIMAL(15,2) DEFAULT 0.00,
    total_net DECIMAL(15,2) DEFAULT 0.00,
    employee_count INT DEFAULT 0,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 Payroll Items (Detail line)
CREATE TABLE IF NOT EXISTS nf_hr.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES nf_hr.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES nf_hr.employees(id) ON DELETE CASCADE,
    work_days DECIMAL(4,1),
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    base_salary DECIMAL(15,2),
    allowances DECIMAL(15,2) DEFAULT 0.00,
    kpi_bonus DECIMAL(15,2) DEFAULT 0.00,
    overtime_pay DECIMAL(15,2) DEFAULT 0.00,
    gross_salary DECIMAL(15,2),
    social_insurance DECIMAL(15,2) DEFAULT 0.00,
    health_insurance DECIMAL(15,2) DEFAULT 0.00,
    personal_income_tax DECIMAL(15,2) DEFAULT 0.00,
    other_deductions DECIMAL(15,2) DEFAULT 0.00,
    net_salary DECIMAL(15,2),
    calculation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 4. INVENTORY & PROCUREMENT MODULE TABLES
-- =========================================================================

-- 4.1 Warehouses
CREATE TABLE IF NOT EXISTS nf_inventory.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    manager_id UUID,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 Products
CREATE TABLE IF NOT EXISTS nf_inventory.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'cái',
    cost_price DECIMAL(15,2),
    sell_price DECIMAL(15,2),
    min_stock INT DEFAULT 0,
    max_stock INT,
    barcode VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uniq_tenant_sku UNIQUE(tenant_id, sku)
);

-- 4.3 Stock Levels
CREATE TABLE IF NOT EXISTS nf_inventory.stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES nf_inventory.products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES nf_inventory.warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uniq_tenant_prod_wh UNIQUE(tenant_id, product_id, warehouse_id)
);

-- 4.4 Stock Movements
CREATE TABLE IF NOT EXISTS nf_inventory.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES nf_inventory.products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES nf_inventory.warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.5 Suppliers
CREATE TABLE IF NOT EXISTS nf_inventory.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(200),
    address TEXT,
    tax_code VARCHAR(20),
    payment_terms VARCHAR(50),
    ai_reliability_score DECIMAL(5,2),
    total_orders INT DEFAULT 0,
    avg_delivery_days DECIMAL(5,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.6 Purchase Orders
CREATE TABLE IF NOT EXISTS nf_inventory.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    po_number VARCHAR(30) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES nf_inventory.suppliers(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES nf_inventory.warehouses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'DRAFT',
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    expected_delivery DATE,
    actual_delivery DATE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 5. CORE & NEW BUSINESS MODEL TABLES (nf_core)
-- =========================================================================

-- 5.1 Customer Bookings
CREATE TABLE IF NOT EXISTS nf_core.customer_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_id UUID,
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_id UUID,
    staff_id UUID,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    notes TEXT,
    source VARCHAR(20) DEFAULT 'PORTAL',
    qr_code VARCHAR(100),
    reminder_sent BOOLEAN DEFAULT FALSE,
    rating INT,
    review_text TEXT,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 Loyalty Accounts
CREATE TABLE IF NOT EXISTS nf_core.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    points_balance INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_points_redeemed INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'BRONZE',
    tier_expiry DATE,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID,
    nft_token_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 Loyalty Transactions
CREATE TABLE IF NOT EXISTS nf_core.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    loyalty_account_id UUID NOT NULL REFERENCES nf_core.loyalty_accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL,
    points INT NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.4 Loyalty Rewards
CREATE TABLE IF NOT EXISTS nf_core.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    reward_type VARCHAR(20),
    value DECIMAL(15,2),
    quantity_available INT,
    min_tier VARCHAR(20) DEFAULT 'BRONZE',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.5 POS Sessions
CREATE TABLE IF NOT EXISTS nf_core.pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL,
    register_name VARCHAR(50),
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_sales DECIMAL(15,2) DEFAULT 0.00,
    total_transactions INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 5.6 POS Orders
CREATE TABLE IF NOT EXISTS nf_core.pos_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES nf_core.pos_sessions(id) ON DELETE SET NULL,
    order_number VARCHAR(30) NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(200),
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    discount_total DECIMAL(15,2) DEFAULT 0.00,
    tax_total DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2),
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'PAID',
    loyalty_points_earned INT DEFAULT 0,
    loyalty_points_used INT DEFAULT 0,
    staff_id UUID,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.7 Security Events
CREATE TABLE IF NOT EXISTS nf_core.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    source_ip INET,
    user_agent TEXT,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.8 IP Whitelisting
CREATE TABLE IF NOT EXISTS nf_core.ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    ip_range CIDR NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.9 Tenant Health Scores
CREATE TABLE IF NOT EXISTS nf_core.tenant_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    churn_risk VARCHAR(10),
    usage_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    growth_velocity DECIMAL(5,2),
    ai_recommendation TEXT,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_version VARCHAR(20)
);

-- 5.10 Tenant Migrations
CREATE TABLE IF NOT EXISTS nf_core.tenant_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    source_system VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    total_records INT DEFAULT 0,
    imported_records INT DEFAULT 0,
    error_log JSONB DEFAULT '[]'::JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.11 Contracts
CREATE TABLE IF NOT EXISTS nf_core.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    contract_number VARCHAR(30) NOT NULL,
    contract_type VARCHAR(30) NOT NULL,
    title VARCHAR(300) NOT NULL,
    counterpart_name VARCHAR(200),
    counterpart_id UUID,
    value DECIMAL(15,2),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_notice_days INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'DRAFT',
    terms TEXT,
    attachments JSONB DEFAULT '[]'::JSONB,
    signed_by_us UUID,
    signed_by_counterpart VARCHAR(200),
    digital_signature_hash VARCHAR(100),
    blockchain_hash VARCHAR(100),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.12 Assets
CREATE TABLE IF NOT EXISTS nf_core.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    asset_code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    location VARCHAR(200),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    depreciation_method VARCHAR(20),
    useful_life_years INT,
    monthly_depreciation DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'IN_USE',
    assigned_to UUID,
    serial_number VARCHAR(100),
    warranty_expiry DATE,
    qr_code VARCHAR(100),
    image_url TEXT,
    maintenance_log JSONB DEFAULT '[]'::JSONB,
    last_maintenance_at TIMESTAMP WITH TIME ZONE,
    next_maintenance_at TIMESTAMP WITH TIME ZONE,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.13 Projects
CREATE TABLE IF NOT EXISTS nf_core.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    project_code VARCHAR(30) NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    customer_id UUID,
    customer_name VARCHAR(200),
    project_type VARCHAR(30),
    status VARCHAR(20) DEFAULT 'PLANNING',
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    manager_id UUID,
    team_members JSONB DEFAULT '[]'::JSONB,
    milestones JSONB DEFAULT '[]'::JSONB,
    contract_id UUID REFERENCES nf_core.contracts(id) ON DELETE SET NULL,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.14 Project Timesheets
CREATE TABLE IF NOT EXISTS nf_core.project_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES nf_core.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(4,1) NOT NULL,
    task_description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    amount DECIMAL(15,2),
    approved_by UUID,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.15 Sales Channels
CREATE TABLE IF NOT EXISTS nf_core.sales_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    channel_type VARCHAR(30) NOT NULL,
    channel_name VARCHAR(100),
    api_key_encrypted TEXT,
    shop_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sync_inventory BOOLEAN DEFAULT TRUE,
    sync_orders BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.16 Sales Orders
CREATE TABLE IF NOT EXISTS nf_core.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    channel_id UUID REFERENCES nf_core.sales_channels(id) ON DELETE SET NULL,
    channel_type VARCHAR(30),
    channel_order_id VARCHAR(100),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(15,2),
    shipping_fee DECIMAL(15,2) DEFAULT 0.00,
    discount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2),
    payment_method VARCHAR(30),
    payment_status VARCHAR(20),
    fulfillment_status VARCHAR(20),
    tracking_number VARCHAR(100),
    shipping_provider VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.17 Customer Subscriptions
CREATE TABLE IF NOT EXISTS nf_core.customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200),
    package_name VARCHAR(200) NOT NULL,
    package_type VARCHAR(30),
    total_sessions INT,
    used_sessions INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    frozen_at TIMESTAMP WITH TIME ZONE,
    frozen_until DATE,
    price DECIMAL(15,2),
    auto_renew BOOLEAN DEFAULT FALSE,
    blockchain_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
