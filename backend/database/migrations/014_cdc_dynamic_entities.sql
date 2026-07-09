-- =============================================================================
-- Migration 014: CDC Triggers cho Dynamic Entities
-- Phase 7A: Data Pipeline cho Entity Records
-- =============================================================================

-- =========================================================================
-- TRIGGER FUNCTION: Ghi sự kiện thay đổi vào change_events (CDC inbox)
-- Dành riêng cho nf_meta.entity_records
-- =========================================================================
CREATE OR REPLACE FUNCTION nf_analytics.capture_entity_record_change()
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

-- Xóa trigger nếu đã tồn tại để an toàn
DROP TRIGGER IF EXISTS trg_entity_record_cdc ON nf_meta.entity_records;

-- Tạo CDC Trigger trên nf_meta.entity_records
CREATE TRIGGER trg_entity_record_cdc
    AFTER INSERT OR UPDATE ON nf_meta.entity_records
    FOR EACH ROW EXECUTE FUNCTION nf_analytics.capture_entity_record_change();
