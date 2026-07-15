-- MIGRATION 013: WORKFLOW DEFINITIONS
-- Bảng lưu trữ cấu hình luồng chạy (DAG - Directed Acyclic Graph) cho Workflow Engine

CREATE TABLE IF NOT EXISTS nf_meta.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL, -- Sự kiện kích hoạt (VD: "order.created")
    dag_json JSONB NOT NULL,             -- Chứa toàn bộ mảng nodes và edges
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_tenant_trigger ON nf_meta.workflow_definitions (tenant_id, trigger_event);
