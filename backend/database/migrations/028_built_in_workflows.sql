-- Migration: 028_built_in_workflows
-- Description: Clean up duplicate workflows, add unique constraint and seed the 10 built-in automation workflows for all existing tenants.

-- Clean up duplicates (keeping the latest one by updated_at / created_at or id)
DELETE FROM nf_meta.workflow_definitions a
USING nf_meta.workflow_definitions b
WHERE a.id < b.id
  AND a.tenant_id = b.tenant_id
  AND a.trigger_event = b.trigger_event;

-- Add unique constraint if not exists (using a custom constraint name)
ALTER TABLE nf_meta.workflow_definitions 
DROP CONSTRAINT IF EXISTS uq_tenant_trigger;

ALTER TABLE nf_meta.workflow_definitions 
ADD CONSTRAINT uq_tenant_trigger UNIQUE (tenant_id, trigger_event);

-- Seed 10 built-in workflows
INSERT INTO nf_meta.workflow_definitions (tenant_id, name, trigger_event, dag_json, is_active)
SELECT 
    t.id as tenant_id,
    w.name,
    w.trigger_event,
    w.dag_json::jsonb,
    true
FROM nf_core.tenants t
CROSS JOIN (
    VALUES 
    ('Invoice Overdue Reminder', 'cron.daily', '{"nodes": [{"id": "1", "name": "Daily Cron Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Check Overdue", "type": "n8n-nodes-base.httpRequest", "parameters": {"url": "/api/v1/ai/finance/debt-collection", "method": "POST"}}, {"id": "3", "name": "Send Zalo Reminders", "type": "nextflow.zaloZNS", "parameters": {"phone": "${{payload.phone}}", "templateId": "inv_reminder"}}], "connections": {"Daily Cron Trigger": {"main": [[{"node": "Check Overdue", "type": "main", "index": 0}]]}, "Check Overdue": {"main": [[{"node": "Send Zalo Reminders", "type": "main", "index": 0}]]}}}'),
    ('Low Stock Auto-Reorder', 'stock.low', '{"nodes": [{"id": "1", "name": "Stock Low Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Demand Planner AI", "type": "nextflow.aiPredict", "parameters": {"model": "demand-plan", "prompt": "Check stock level and suggest order qty"}}, {"id": "3", "name": "Auto PO Blockchain Anchor", "type": "nextflow.blockchainAnchor", "parameters": {"dataPayload": "${{node_2}}"}}], "connections": {"Stock Low Trigger": {"main": [[{"node": "Demand Planner AI", "type": "main", "index": 0}]]}, "Demand Planner AI": {"main": [[{"node": "Auto PO Blockchain Anchor", "type": "main", "index": 0}]]}}}'),
    ('Booking Reminder 24h', 'booking.reminder_24h', '{"nodes": [{"id": "1", "name": "Booking 24h Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Send Zalo SMS", "type": "nextflow.zaloZNS", "parameters": {"phone": "${{payload.phone}}", "templateId": "booking_rem_24h"}}], "connections": {"Booking 24h Trigger": {"main": [[{"node": "Send Zalo SMS", "type": "main", "index": 0}]]}}}'),
    ('No-Show Follow-up', 'booking.no_show', '{"nodes": [{"id": "1", "name": "No-Show Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Send Reschedule Offer", "type": "nextflow.zaloZNS", "parameters": {"phone": "${{payload.phone}}", "templateId": "no_show_followup"}}], "connections": {"No-Show Trigger": {"main": [[{"node": "Send Reschedule Offer", "type": "main", "index": 0}]]}}}'),
    ('Payroll Auto-Calculate', 'payroll.calculate', '{"nodes": [{"id": "1", "name": "Monthly Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Payroll AI Calculator", "type": "nextflow.aiPredict", "parameters": {"model": "payroll-calc", "prompt": "Calculate payroll for this month"}}, {"id": "3", "name": "Anchor Payroll Blockchain", "type": "nextflow.blockchainAnchor", "parameters": {"dataPayload": "${{node_2}}"}}], "connections": {"Monthly Trigger": {"main": [[{"node": "Payroll AI Calculator", "type": "main", "index": 0}]]}, "Payroll AI Calculator": {"main": [[{"node": "Anchor Payroll Blockchain", "type": "main", "index": 0}]]}}}'),
    ('New Customer Welcome', 'customer.first_purchase', '{"nodes": [{"id": "1", "name": "New Cust Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Award Loyalty Points", "type": "n8n-nodes-base.set", "parameters": {"field": "points", "value": "100"}}, {"id": "3", "name": "Anchor Blockchain", "type": "nextflow.blockchainAnchor", "parameters": {"dataPayload": "New Customer Welcome Points Awarded"}}], "connections": {"New Cust Trigger": {"main": [[{"node": "Award Loyalty Points", "type": "main", "index": 0}]]}, "Award Loyalty Points": {"main": [[{"node": "Anchor Blockchain", "type": "main", "index": 0}]]}}}'),
    ('Churn Risk Alert', 'ai.churn_risk', '{"nodes": [{"id": "1", "name": "AI Churn Risk Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Create Retention Task", "type": "n8n-nodes-base.set", "parameters": {"field": "status", "value": "PROCESSING"}}, {"id": "3", "name": "Notify Sme Leader", "type": "nextflow.zaloZNS", "parameters": {"phone": "0988888888", "templateId": "churn_alert"}}], "connections": {"AI Churn Risk Trigger": {"main": [[{"node": "Create Retention Task", "type": "main", "index": 0}]]}, "Create Retention Task": {"main": [[{"node": "Notify Sme Leader", "type": "main", "index": 0}]]}}}'),
    ('Daily Report Reminder', 'shift.end', '{"nodes": [{"id": "1", "name": "Shift End Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Send Daily Reminder", "type": "nextflow.zaloZNS", "parameters": {"phone": "${{payload.phone}}", "templateId": "daily_report_rem"}}], "connections": {"Shift End Trigger": {"main": [[{"node": "Send Daily Reminder", "type": "main", "index": 0}]]}}}'),
    ('SLA Breach Escalation', 'work_item.sla_breached', '{"nodes": [{"id": "1", "name": "SLA Breach Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Escalate Task", "type": "n8n-nodes-base.set", "parameters": {"field": "priority", "value": "CRITICAL"}}, {"id": "3", "name": "Notify SLA Violation", "type": "nextflow.zaloZNS", "parameters": {"phone": "0988888888", "templateId": "sla_breach"}}], "connections": {"SLA Breach Trigger": {"main": [[{"node": "Escalate Task", "type": "main", "index": 0}]]}, "Escalate Task": {"main": [[{"node": "Notify SLA Violation", "type": "main", "index": 0}]]}}}'),
    ('Financial Month-End Close', 'month.end', '{"nodes": [{"id": "1", "name": "Month End Trigger", "type": "n8n-nodes-base.trigger", "parameters": {}}, {"id": "2", "name": "Generate Financial Report", "type": "nextflow.aiPredict", "parameters": {"model": "finance-report", "prompt": "Compile month end P&L report"}}, {"id": "3", "name": "Anchor Close State Blockchain", "type": "nextflow.blockchainAnchor", "parameters": {"dataPayload": "${{node_2}}"}}], "connections": {"Month End Trigger": {"main": [[{"node": "Generate Financial Report", "type": "main", "index": 0}]]}, "Generate Financial Report": {"main": [[{"node": "Anchor Close State Blockchain", "type": "main", "index": 0}]]}}}')
) w (name, trigger_event, dag_json)
ON CONFLICT (tenant_id, trigger_event) DO NOTHING;
