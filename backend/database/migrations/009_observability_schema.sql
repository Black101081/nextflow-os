-- =============================================================================
-- Migration 009: Observability Schema & AI Performance Reports
-- =============================================================================

CREATE TABLE IF NOT EXISTS nf_analytics.daily_performance_reports (
    report_id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_date DATE NOT NULL,
    
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    sla_violations INTEGER NOT NULL DEFAULT 0,
    avg_handling_time_seconds INTEGER NOT NULL DEFAULT 0,
    
    metrics_snapshot JSONB NOT NULL,
    ai_insights TEXT,
    
    data_hash VARCHAR(255),
    tx_hash VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_report_date_tenant UNIQUE (tenant_id, report_date)
);

CREATE INDEX idx_daily_performance_reports_tenant ON nf_analytics.daily_performance_reports(tenant_id);
CREATE INDEX idx_daily_performance_reports_date ON nf_analytics.daily_performance_reports(report_date DESC);
