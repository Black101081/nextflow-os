-- Migration: 027_feature_flags
-- Description: Create nf_core.feature_flags table for Phase E Platform Maturity.

CREATE TABLE IF NOT EXISTS nf_core.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'DISABLED', -- 'ENABLED', 'DISABLED'
    rollout_type VARCHAR(20) DEFAULT 'GLOBAL', -- 'GLOBAL', 'TENANT', 'TIER', 'PERCENTAGE'
    rollout_rules JSONB DEFAULT '{}', -- e.g. {"tenants": ["id1", "id2"], "tiers": ["ENTERPRISE"], "percentage": 50}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial feature flags
INSERT INTO nf_core.feature_flags (flag_key, description, status, rollout_type, rollout_rules)
VALUES 
('enable-ai-pricing', 'Kích hoạt công cụ định giá linh hoạt bằng AI cho ngành dịch vụ & lưu trú.', 'ENABLED', 'TIER', '{"tiers": ["ENTERPRISE"]}'),
('u2u-blockchain-direct', 'Ghi nhận giao dịch tài chính & hợp đồng trực tiếp lên U2U Network Mainnet.', 'DISABLED', 'GLOBAL', '{}'),
('vietqr-dynamic-billing', 'Tạo mã thanh toán VietQR động theo thời gian thực cho F&B POS.', 'ENABLED', 'GLOBAL', '{}')
ON CONFLICT (flag_key) DO NOTHING;
