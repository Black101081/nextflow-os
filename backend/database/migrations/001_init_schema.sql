-- Khởi tạo schema vận hành cốt lõi
CREATE SCHEMA IF NOT EXISTS nf_core;

-- Tự động cập nhật cột updated_at khi có cập nhật bản ghi
CREATE OR REPLACE FUNCTION nf_core.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 1. BẢNG DOANH NGHIỆP (TENANTS TABLE)
-- =========================================================================
CREATE TABLE nf_core.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tenant_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    CONSTRAINT chk_tenant_tier CHECK (subscription_tier IN ('FREE', 'STANDARD', 'ENTERPRISE'))
);

CREATE TRIGGER update_tenants_modtime 
    BEFORE UPDATE ON nf_core.tenants 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- =========================================================================
-- 2. BẢNG NGƯỜI DÙNG (USERS TABLE)
-- =========================================================================
CREATE TABLE nf_core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SME_OPS',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    CONSTRAINT uniq_email_per_tenant UNIQUE (tenant_id, email),
    CONSTRAINT chk_user_role CHECK (role IN ('SME_LEADER', 'SME_SUPERVISOR', 'SME_OPS', 'FIELD_WORKER'))
);

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON nf_core.users 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- =========================================================================
-- 3. BẢNG HÀNG ĐỢI CÔNG VIỆC (QUEUES TABLE)
-- =========================================================================
CREATE TABLE nf_core.queues (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    routing_algorithm VARCHAR(50) NOT NULL DEFAULT 'FIFO',
    sla_target_seconds INTEGER NOT NULL DEFAULT 3600,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_routing CHECK (routing_algorithm IN ('FIFO', 'ROUND_ROBIN', 'CAPACITY_BASED')),
    CONSTRAINT chk_sla_seconds CHECK (sla_target_seconds > 0)
);

CREATE TRIGGER update_queues_modtime 
    BEFORE UPDATE ON nf_core.queues 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- Bảng quan hệ Nhiều-Nhiều giữa Users và Queues (Thành viên hàng đợi)
CREATE TABLE nf_core.queue_members (
    queue_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (queue_id, user_id),
    FOREIGN KEY (queue_id) REFERENCES nf_core.queues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES nf_core.users(id) ON DELETE CASCADE
);

-- =========================================================================
-- 4. BẢNG NHIỆM VỤ (WORK ITEMS TABLE)
-- =========================================================================
CREATE TABLE nf_core.work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    queue_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'UNASSIGNED',
    category VARCHAR(100),
    
    creator_id UUID,
    assignee_id UUID,
    
    external_id VARCHAR(100),
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    due_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    version INTEGER NOT NULL DEFAULT 1,
    
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (queue_id) REFERENCES nf_core.queues(id) ON DELETE SET NULL,
    FOREIGN KEY (creator_id) REFERENCES nf_core.users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES nf_core.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_item_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_item_status CHECK (status IN ('UNASSIGNED', 'IN_PROGRESS', 'SUSPENDED', 'COMPLETED', 'CANCELLED'))
);

CREATE TRIGGER update_work_items_modtime 
    BEFORE UPDATE ON nf_core.work_items 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- =========================================================================
-- 5. BẢNG QUẢN LÝ NGOẠI LỆ (TASK EXCEPTIONS TABLE)
-- =========================================================================
CREATE TABLE nf_core.task_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    work_item_id UUID NOT NULL,
    exception_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    escalated_to_user_id UUID,
    resolved_by_user_id UUID,
    
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (work_item_id) REFERENCES nf_core.work_items(id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_to_user_id) REFERENCES nf_core.users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_user_id) REFERENCES nf_core.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_exception_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'))
);

CREATE TRIGGER update_exceptions_modtime 
    BEFORE UPDATE ON nf_core.task_exceptions 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- =========================================================================
-- 6. BẢNG CẤU HÌNH TÍCH HỢP (CONNECTOR CONFIGURATIONS TABLE)
-- =========================================================================
CREATE TABLE nf_core.connector_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    connector_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    encrypted_credentials TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    CONSTRAINT uniq_connector_per_tenant UNIQUE (tenant_id, connector_name),
    CONSTRAINT chk_connector_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR'))
);

CREATE TRIGGER update_connectors_modtime 
    BEFORE UPDATE ON nf_core.connector_configurations 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- =========================================================================
-- INDEXES CHIẾN LƯỢC TỐI ƯU TRUY VẤN
-- =========================================================================
CREATE INDEX idx_users_tenant ON nf_core.users(tenant_id);
CREATE INDEX idx_queues_tenant ON nf_core.queues(tenant_id);
CREATE INDEX idx_work_items_tenant ON nf_core.work_items(tenant_id);
CREATE INDEX idx_exceptions_tenant ON nf_core.task_exceptions(tenant_id);

CREATE INDEX idx_work_items_queue_routing 
ON nf_core.work_items(tenant_id, queue_id, status, priority, created_at) 
WHERE status = 'UNASSIGNED';

CREATE INDEX idx_work_items_active_assignee 
ON nf_core.work_items(tenant_id, assignee_id, status) 
WHERE status = 'IN_PROGRESS';

CREATE INDEX idx_work_items_external_ref 
ON nf_core.work_items(tenant_id, source, external_id) 
WHERE external_id IS NOT NULL;
