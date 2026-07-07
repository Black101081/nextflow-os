-- =============================================================================
-- Migration 003: CDC Triggers — Change Data Capture
-- Phase 5: Data Pipeline, CDC & Analytics Lakehouse
-- Tự động sync dữ liệu từ nf_core sang nf_analytics khi có thay đổi
-- =============================================================================

-- =========================================================================
-- TRIGGER FUNCTION: Ghi sự kiện thay đổi vào change_events (CDC inbox)
-- =========================================================================
CREATE OR REPLACE FUNCTION nf_analytics.capture_work_item_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO nf_analytics.change_events (table_name, operation, record_id, tenant_id, payload)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, OLD.tenant_id, to_jsonb(OLD));
        RETURN OLD;
    ELSE
        INSERT INTO nf_analytics.change_events (table_name, operation, record_id, tenant_id, payload)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, NEW.tenant_id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
END;
$$;

-- CDC Trigger trên nf_core.work_items
DROP TRIGGER IF EXISTS trg_work_item_cdc ON nf_core.work_items;
CREATE TRIGGER trg_work_item_cdc
    AFTER INSERT OR UPDATE ON nf_core.work_items
    FOR EACH ROW EXECUTE FUNCTION nf_analytics.capture_work_item_change();

-- =========================================================================
-- TRIGGER FUNCTION: Tự động UPSERT Tenant vào dim_tenant
-- =========================================================================
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

DROP TRIGGER IF EXISTS trg_tenant_sync ON nf_core.tenants;
CREATE TRIGGER trg_tenant_sync
    AFTER INSERT OR UPDATE ON nf_core.tenants
    FOR EACH ROW EXECUTE FUNCTION nf_analytics.sync_tenant_to_dim();

-- =========================================================================
-- TRIGGER FUNCTION: Tự động UPSERT User vào dim_user
-- (chỉ sync khi dim_tenant đã tồn tại — tránh FK violation)
-- =========================================================================
-- Fix sync_user_to_dim: nf_core.users có first_name + last_name, không có department
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

DROP TRIGGER IF EXISTS trg_user_sync ON nf_core.users;
CREATE TRIGGER trg_user_sync
    AFTER INSERT OR UPDATE ON nf_core.users
    FOR EACH ROW EXECUTE FUNCTION nf_analytics.sync_user_to_dim();

-- =========================================================================
-- TRIGGER FUNCTION: Tự động UPSERT Queue vào dim_queue
-- =========================================================================
CREATE OR REPLACE FUNCTION nf_analytics.sync_queue_to_dim()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM nf_analytics.dim_tenant WHERE tenant_id = NEW.tenant_id) THEN
        INSERT INTO nf_analytics.dim_queue (
            queue_id, tenant_id, name, category, sla_target_seconds, created_at
        )
        VALUES (
            NEW.id::TEXT,
            NEW.tenant_id,
            NEW.name,
            NEW.category,
            COALESCE(NEW.sla_target_seconds, 3600),
            COALESCE(NEW.created_at, CURRENT_TIMESTAMP)
        )
        ON CONFLICT (queue_id) DO UPDATE SET
            name               = EXCLUDED.name,
            category           = EXCLUDED.category,
            sla_target_seconds = EXCLUDED.sla_target_seconds;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_queue_sync ON nf_core.queues;
CREATE TRIGGER trg_queue_sync
    AFTER INSERT OR UPDATE ON nf_core.queues
    FOR EACH ROW EXECUTE FUNCTION nf_analytics.sync_queue_to_dim();
