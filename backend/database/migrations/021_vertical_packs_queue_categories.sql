-- MIGRATION 021: Vertical Pack Queue Categories Seed
-- Seeds queue categories matching the 12 Vertical Packs for the default demo tenant
-- This ensures PackOperationsHub can filter queues by pack category

-- Categories used by PACK_METADATA in PackOperationsHub.tsx:
-- retail, fnb, spa, education, real_estate, services, construction, automotive, logistics, manufacturing, healthcare, hospitality

-- Add category column display names to existing queues if category not set
-- (Real data is seeded via seed.ps1, this just ensures the column mapping is correct)

-- Index for fast category filtering
CREATE INDEX IF NOT EXISTS idx_queues_tenant_category 
ON nf_core.queues(tenant_id, category);

-- Index for work_item category filtering
CREATE INDEX IF NOT EXISTS idx_work_items_tenant_category 
ON nf_core.work_items(tenant_id, category);

-- Index for work_item queue_id + status (for SLA breach count query performance)
CREATE INDEX IF NOT EXISTS idx_work_items_queue_status_created
ON nf_core.work_items(queue_id, tenant_id, status, created_at);
