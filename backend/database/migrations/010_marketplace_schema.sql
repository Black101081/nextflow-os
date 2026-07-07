CREATE SCHEMA IF NOT EXISTS nf_ecosystem;

-- 1. Bảng danh sách các Extension (Catalog)
CREATE TABLE IF NOT EXISTS nf_ecosystem.extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    vendor VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50) NOT NULL DEFAULT 'ui_extension', -- connector_pack, ai_skill, etc.
    manifest_url TEXT,
    code_hash VARCHAR(255), -- Hash SHA-256 mã nguồn để chống giả mạo
    tx_hash VARCHAR(255),   -- Mã giao dịch khi lưu audit log lên Blockchain
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, UNDER_REVIEW, APPROVED, REJECTED
    risk_level VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    ai_audit_notes TEXT,    -- AI ghi chú các rủi ro bảo mật
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng theo dõi việc Tenant cài đặt Extension
CREATE TABLE IF NOT EXISTS nf_ecosystem.tenant_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    extension_id UUID NOT NULL REFERENCES nf_ecosystem.extensions(id),
    granted_scopes TEXT[], -- Quyền truy cập API được admin cấp
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, extension_id)
);

-- 3. Bảng đánh giá/review (Lưu On-chain)
CREATE TABLE IF NOT EXISTS nf_ecosystem.extension_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    extension_id UUID NOT NULL REFERENCES nf_ecosystem.extensions(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tx_hash VARCHAR(255), -- Hash Blockchain lưu vết review để chống thao túng
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dummy Data cho quá trình phát triển
INSERT INTO nf_ecosystem.extensions (id, name, description, vendor, version, asset_type, code_hash, tx_hash, status, risk_level, ai_audit_notes)
VALUES 
  ('e1000000-0000-0000-0000-000000000001', 'HubSpot CRM Connector', 'Tự động đồng bộ khách hàng và trạng thái đơn hàng 2 chiều.', 'Nextflow Official', '1.2.0', 'connector_pack', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '0x2f8b...9c32', 'APPROVED', 'LOW', 'Không phát hiện mã độc. API an toàn.'),
  ('e2000000-0000-0000-0000-000000000002', 'AI Priority Router', 'Tự động định tuyến Task cho nhân sự dựa trên độ khẩn cấp (SLA).', 'Alpha Dev', '0.9.1', 'ai_skill', 'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79', '0xa19c...2f01', 'APPROVED', 'LOW', 'Đã kiểm tra an toàn phân quyền.'),
  ('e3000000-0000-0000-0000-000000000003', 'OCR Hóa Đơn VAT', 'Công cụ tự động trích xuất thông tin hóa đơn đỏ.', 'VietTech Solutions', '2.0.1', 'ui_extension', 'c81e728d9d4c2f636f067f89cc14862c', NULL, 'UNDER_REVIEW', 'MEDIUM', 'Đang quét phân quyền truy cập camera và storage.')
ON CONFLICT DO NOTHING;
