-- =========================================================================
-- MODULE 1: ROLE-BASED ACCESS CONTROL (RBAC) SCHEMA
-- =========================================================================

-- Bảng định nghĩa danh sách các quyền hạn (Permissions) trong hệ thống
CREATE TABLE nf_core.permissions (
    id VARCHAR(100) PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng định nghĩa các Vai trò (Roles). 
-- Hỗ trợ System Role (mặc định) và Custom Role (do Tenant tự định nghĩa trong tương lai)
CREATE TABLE nf_core.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT TRUE,
    tenant_id UUID REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian ánh xạ Role và Permissions
CREATE TABLE nf_core.role_permissions (
    role_id VARCHAR(50) NOT NULL,
    permission_id VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES nf_core.roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES nf_core.permissions(id) ON DELETE CASCADE
);

-- =========================================================================
-- SEED DATA: QUYỀN HẠN CƠ BẢN
-- =========================================================================
INSERT INTO nf_core.permissions (id, description) VALUES
('view_financials', 'Xem dữ liệu tài chính, doanh thu, hóa đơn'),
('manage_users', 'Thêm, sửa, xóa người dùng và phân quyền'),
('manage_queues', 'Tạo và cấu hình hàng đợi công việc'),
('view_all_work_items', 'Xem tất cả work items của công ty'),
('assign_work_items', 'Giao việc cho người khác'),
('process_work_items', 'Xử lý các công việc được giao'),
('manage_integrations', 'Cấu hình Webhooks và API Connectors');

-- =========================================================================
-- SEED DATA: VAI TRÒ MẶC ĐỊNH
-- =========================================================================
-- Trùng khớp với các role đã định nghĩa trong bảng nf_core.users (chk_user_role)
INSERT INTO nf_core.roles (id, name, description, is_system_role) VALUES
('SME_LEADER', 'Leader / Owner', 'Chủ doanh nghiệp, có toàn quyền trên hệ thống', TRUE),
('SME_SUPERVISOR', 'Supervisor / Manager', 'Quản lý, có quyền phân việc và xem báo cáo vận hành', TRUE),
('SME_OPS', 'Operator / Staff', 'Nhân viên văn phòng, xử lý công việc', TRUE),
('FIELD_WORKER', 'Field Worker', 'Nhân viên hiện trường', TRUE);

-- =========================================================================
-- MAPPING: PHÂN QUYỀN MẶC ĐỊNH CHO TỪNG ROLE
-- =========================================================================

-- SME_LEADER (Full Permissions)
INSERT INTO nf_core.role_permissions (role_id, permission_id) VALUES
('SME_LEADER', 'view_financials'),
('SME_LEADER', 'manage_users'),
('SME_LEADER', 'manage_queues'),
('SME_LEADER', 'view_all_work_items'),
('SME_LEADER', 'assign_work_items'),
('SME_LEADER', 'process_work_items'),
('SME_LEADER', 'manage_integrations');

-- SME_SUPERVISOR (Quản lý vận hành)
INSERT INTO nf_core.role_permissions (role_id, permission_id) VALUES
('SME_SUPERVISOR', 'view_all_work_items'),
('SME_SUPERVISOR', 'assign_work_items'),
('SME_SUPERVISOR', 'process_work_items');

-- SME_OPS & FIELD_WORKER (Chỉ xử lý task)
INSERT INTO nf_core.role_permissions (role_id, permission_id) VALUES
('SME_OPS', 'process_work_items'),
('FIELD_WORKER', 'process_work_items');

-- Ràng buộc bảng Users hiện tại với bảng Roles (nếu cần thiết)
ALTER TABLE nf_core.users ADD CONSTRAINT fk_users_role FOREIGN KEY (role) REFERENCES nf_core.roles(id);
