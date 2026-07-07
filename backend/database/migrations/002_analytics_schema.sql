-- =============================================================================
-- Migration 002: nf_analytics Schema — Data Pipeline & Analytics Lakehouse
-- Phase 5: Data Pipeline, CDC & Analytics Lakehouse
-- =============================================================================

-- =========================================================================
-- SCHEMA KHỞI TẠO
-- =========================================================================
CREATE SCHEMA IF NOT EXISTS nf_analytics;

-- =========================================================================
-- BẢNG INBOX SỰ KIỆN CDC (Change Events Inbox)
-- Tất cả trigger từ Core DB sẽ ghi vào đây, ETL runner sẽ đọc và xử lý
-- =========================================================================
CREATE TABLE IF NOT EXISTS nf_analytics.change_events (
    event_id      BIGSERIAL PRIMARY KEY,
    table_name    VARCHAR(100) NOT NULL,
    operation     VARCHAR(10)  NOT NULL, -- INSERT, UPDATE, DELETE
    record_id     UUID         NOT NULL,
    tenant_id     UUID,
    payload       JSONB        NOT NULL,
    processed     BOOLEAN      DEFAULT FALSE,
    processed_at  TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_change_events_unprocessed ON nf_analytics.change_events(processed, created_at)
    WHERE processed = FALSE;
CREATE INDEX idx_change_events_tenant ON nf_analytics.change_events(tenant_id);

-- =========================================================================
-- BẢNG CHIỀU (DIMENSION TABLES)
-- =========================================================================

-- dim_tenant: Mirror của nf_core.tenants phục vụ analytics joins
CREATE TABLE IF NOT EXISTS nf_analytics.dim_tenant (
    tenant_id         UUID PRIMARY KEY,
    company_name      VARCHAR(255) NOT NULL,
    industry          VARCHAR(100),
    region            VARCHAR(50) DEFAULT 'VN',
    subscription_tier VARCHAR(50) NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT chk_tier CHECK (subscription_tier IN ('FREE', 'STANDARD', 'ENTERPRISE'))
);

-- dim_user: Mirror của nf_core.users
CREATE TABLE IF NOT EXISTS nf_analytics.dim_user (
    user_id    UUID PRIMARY KEY,
    tenant_id  UUID NOT NULL,
    full_name  VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    role       VARCHAR(50)  NOT NULL,
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES nf_analytics.dim_tenant(tenant_id) ON DELETE CASCADE
);

-- dim_queue: Mirror của nf_core.queues
CREATE TABLE IF NOT EXISTS nf_analytics.dim_queue (
    queue_id           VARCHAR(100) PRIMARY KEY,
    tenant_id          UUID NOT NULL,
    name               VARCHAR(255) NOT NULL,
    category           VARCHAR(100) NOT NULL,
    sla_target_seconds INTEGER NOT NULL DEFAULT 3600,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES nf_analytics.dim_tenant(tenant_id) ON DELETE CASCADE,
    CONSTRAINT chk_sla CHECK (sla_target_seconds > 0)
);

-- =========================================================================
-- BẢNG SỰ KIỆN (FACT TABLES) — Star Schema
-- =========================================================================

-- fact_work_item_lifecycle: Trung tâm của Star Schema, chứa toàn bộ vòng đời Work Item
CREATE TABLE IF NOT EXISTS nf_analytics.fact_work_item_lifecycle (
    fact_id                  BIGSERIAL PRIMARY KEY,
    work_item_id             UUID    NOT NULL,
    tenant_id                UUID    NOT NULL,
    title                    VARCHAR(500) NOT NULL,
    category                 VARCHAR(100) NOT NULL,
    priority                 VARCHAR(20)  NOT NULL,
    source                   VARCHAR(50)  NOT NULL,
    current_status           VARCHAR(50)  NOT NULL,

    creator_id               UUID,
    current_assignee_id      UUID,
    current_queue_id         VARCHAR(100),

    created_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    due_at                   TIMESTAMP WITH TIME ZONE,
    started_at               TIMESTAMP WITH TIME ZONE,
    completed_at             TIMESTAMP WITH TIME ZONE,

    handling_time_seconds    INTEGER DEFAULT 0,
    queue_wait_time_seconds  INTEGER DEFAULT 0,
    is_completed             BOOLEAN DEFAULT FALSE,
    is_sla_violated          BOOLEAN DEFAULT FALSE,

    version                  INTEGER NOT NULL DEFAULT 1,
    last_synced_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES nf_analytics.dim_tenant(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES nf_analytics.dim_user(user_id) ON DELETE SET NULL,
    FOREIGN KEY (current_assignee_id) REFERENCES nf_analytics.dim_user(user_id) ON DELETE SET NULL,
    FOREIGN KEY (current_queue_id) REFERENCES nf_analytics.dim_queue(queue_id) ON DELETE SET NULL,
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT uq_work_item_per_tenant UNIQUE (work_item_id, tenant_id)
);

-- fact_sla_violation_events: Log vi phạm SLA
CREATE TABLE IF NOT EXISTS nf_analytics.fact_sla_violation_events (
    violation_id           BIGSERIAL PRIMARY KEY,
    work_item_id           UUID    NOT NULL,
    tenant_id              UUID    NOT NULL,
    queue_id               VARCHAR(100) NOT NULL,
    sla_target_seconds     INTEGER NOT NULL,
    actual_duration_seconds INTEGER NOT NULL,
    overdue_seconds        INTEGER NOT NULL,
    violation_timestamp    TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at            TIMESTAMP WITH TIME ZONE,
    is_resolved            BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tenant_id) REFERENCES nf_analytics.dim_tenant(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (queue_id) REFERENCES nf_analytics.dim_queue(queue_id) ON DELETE CASCADE
);

-- fact_integration_runs: Log mỗi lần ETL pipeline chạy
CREATE TABLE IF NOT EXISTS nf_analytics.fact_integration_runs (
    run_id             BIGSERIAL PRIMARY KEY,
    tenant_id          UUID,
    connector_id       VARCHAR(100) NOT NULL DEFAULT 'ETL_PIPELINE',
    run_type           VARCHAR(50)  NOT NULL DEFAULT 'BATCH_EXPORT',
    status             VARCHAR(50)  NOT NULL,
    records_processed  INTEGER DEFAULT 0,
    records_failed     INTEGER DEFAULT 0,
    execution_time_ms  INTEGER NOT NULL,
    started_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    error_message      TEXT,
    CONSTRAINT chk_run_type CHECK (run_type IN ('INBOUND_PUSH', 'INBOUND_POLL', 'OUTBOUND_SYNC', 'BATCH_EXPORT')),
    CONSTRAINT chk_status CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL_SUCCESS'))
);

-- =========================================================================
-- INDEXES TỐI ƯU HÓA TRUY VẤN DASHBOARD
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_fact_work_item_tenant      ON nf_analytics.fact_work_item_lifecycle(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fact_work_item_status      ON nf_analytics.fact_work_item_lifecycle(current_status);
CREATE INDEX IF NOT EXISTS idx_fact_work_item_created     ON nf_analytics.fact_work_item_lifecycle(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fact_sla_tenant            ON nf_analytics.fact_sla_violation_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fact_sla_violation_time    ON nf_analytics.fact_sla_violation_events(violation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fact_integ_connector       ON nf_analytics.fact_integration_runs(connector_id, started_at DESC);

-- =========================================================================
-- ANALYTICS VIEWS — Phục vụ Dashboard endpoints
-- =========================================================================

-- View 1: Tỉ lệ tuân thủ SLA theo ngày của Tenant
CREATE OR REPLACE VIEW nf_analytics.vw_tenant_sla_compliance_daily AS
SELECT
    t.tenant_id,
    t.company_name,
    DATE(w.created_at) AS date_record,
    COUNT(w.work_item_id)                                                        AS total_work_items,
    COUNT(CASE WHEN w.is_sla_violated = TRUE THEN 1 END)                         AS total_sla_violations,
    ROUND(
        (1.0 - COUNT(CASE WHEN w.is_sla_violated = TRUE THEN 1 END)::NUMERIC
            / NULLIF(COUNT(w.work_item_id), 0)) * 100,
        2
    )                                                                             AS sla_compliance_percentage
FROM nf_analytics.dim_tenant t
JOIN nf_analytics.fact_work_item_lifecycle w ON t.tenant_id = w.tenant_id
GROUP BY t.tenant_id, t.company_name, DATE(w.created_at);

-- View 2: Năng suất xử lý hàng đợi theo giờ
CREATE OR REPLACE VIEW nf_analytics.vw_queue_throughput_hourly AS
SELECT
    q.tenant_id,
    q.queue_id,
    q.name                                                 AS queue_name,
    DATE_TRUNC('hour', w.completed_at)                     AS completed_hour,
    COUNT(w.work_item_id)                                  AS items_completed_count,
    ROUND(AVG(w.handling_time_seconds)::NUMERIC, 2)        AS avg_handling_time_seconds
FROM nf_analytics.dim_queue q
JOIN nf_analytics.fact_work_item_lifecycle w ON q.queue_id = w.current_queue_id
WHERE w.is_completed = TRUE
  AND w.completed_at IS NOT NULL
GROUP BY q.tenant_id, q.queue_id, q.name, DATE_TRUNC('hour', w.completed_at);

-- View 3: Năng suất operator (tổng hợp theo user)
CREATE OR REPLACE VIEW nf_analytics.vw_operator_performance_summary AS
SELECT
    u.tenant_id,
    u.user_id,
    u.full_name,
    u.role,
    COUNT(w.work_item_id)                                                         AS total_tasks_handled,
    COUNT(CASE WHEN w.is_completed = TRUE THEN 1 END)                             AS tasks_completed,
    COUNT(CASE WHEN w.is_sla_violated = TRUE THEN 1 END)                          AS tasks_violated_sla,
    ROUND(AVG(CASE WHEN w.is_completed THEN w.handling_time_seconds END)::NUMERIC, 2) AS avg_handling_time_seconds,
    ROUND(
        COUNT(CASE WHEN w.is_completed AND NOT w.is_sla_violated THEN 1 END)::NUMERIC
        / NULLIF(COUNT(CASE WHEN w.is_completed THEN 1 END), 0) * 100,
        2
    )                                                                              AS on_time_completion_rate
FROM nf_analytics.dim_user u
LEFT JOIN nf_analytics.fact_work_item_lifecycle w ON u.user_id = w.current_assignee_id
GROUP BY u.tenant_id, u.user_id, u.full_name, u.role;
