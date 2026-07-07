-- Fix CDC Trigger Functions với đúng schema fields của nf_core
-- Chạy file này để patch các trigger functions

-- Fix sync_tenant_to_dim: nf_core.tenants không có industry/region
CREATE OR REPLACE FUNCTION nf_analytics.sync_tenant_to_dim()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO nf_analytics.dim_tenant (
        tenant_id, company_name, industry, region, subscription_tier, created_at, updated_at
    )
    VALUES (
        NEW.id,
        NEW.company_name,
        'GENERAL',
        'VN',
        COALESCE(NEW.subscription_tier, 'STANDARD'),
        COALESCE(NEW.created_at, CURRENT_TIMESTAMP),
        COALESCE(NEW.updated_at, CURRENT_TIMESTAMP)
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        company_name      = EXCLUDED.company_name,
        subscription_tier = EXCLUDED.subscription_tier,
        updated_at        = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$;

-- Fix sync_user_to_dim: nf_core.users có first_name + last_name (không phải full_name), không có department
CREATE OR REPLACE FUNCTION nf_analytics.sync_user_to_dim()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM nf_analytics.dim_tenant WHERE tenant_id = NEW.tenant_id) THEN
        INSERT INTO nf_analytics.dim_user (
            user_id, tenant_id, full_name, email, department, role, is_active, created_at
        )
        VALUES (
            NEW.id,
            NEW.tenant_id,
            CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')),
            NEW.email,
            'GENERAL',
            NEW.role,
            COALESCE(NEW.is_active, TRUE),
            COALESCE(NEW.created_at, CURRENT_TIMESTAMP)
        )
        ON CONFLICT (user_id) DO UPDATE SET
            full_name  = EXCLUDED.full_name,
            email      = EXCLUDED.email,
            role       = EXCLUDED.role,
            is_active  = EXCLUDED.is_active;
    END IF;
    RETURN NEW;
END;
$$;
