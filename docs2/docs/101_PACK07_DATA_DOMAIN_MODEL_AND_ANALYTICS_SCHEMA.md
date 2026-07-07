# Nextflow OS – Pack 07 Data Domain Model and Analytics Schema

**Document ID:** 101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Platform Data  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Overview (100)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Data Domain Model and Analytics Schema** cho Pack 07 – tức là "hình dạng" dữ liệu analytics của Nextflow OS: các bảng fact/dimension chính, grain, keys và cách map từ semantics Packs 02–06 sang warehouse/lakehouse.

Mục tiêu:
- đảm bảo rằng mọi khái niệm quan trọng (task/case, SLA, exception, queue, integration, incident, change, risk tier…) đều có representation rõ ràng trong analytics;  
- giúp Data & Analytics team có khung để thiết kế schema và pipelines;  
- tạo nền cho Pack 07 docs tiếp theo (KPIs & dashboards, self-service, governance) sử dụng cùng một ngôn ngữ dữ liệu.

## 2. Nguyên tắc thiết kế schema analytics

1. **Event- & fact-oriented** – thay vì snapshot rời rạc, ưu tiên model hoá các events/facts: task created/assigned/completed, SLA breached, exception opened/closed, integration call success/fail, incident opened/resolved, change deployed…  
2. **Clear grain** – mỗi bảng fact phải trả lời được: mỗi dòng là "một cái gì"? (một task, một event, một ngày-tenant, một lần gọi API, …).  
3. **Semantics alignment** – schema analytics phải sử dụng lại tên & ý nghĩa từ Packs 02–06, tránh phát sinh thuật ngữ mới gây loạn.  
4. **Multi-tenant & wedge-aware** – mọi fact/dimension cần chứa thông tin tenant, wedge, region khi phù hợp.  
5. **Risk- & governance-aware** – các trường về data sensitivity, risk tier, incident severity… phải hiện diện để hỗ trợ governance & reporting.  
6. **BI-friendly** – schema phải dễ dùng cho BI & self-service: dimensions rõ, surrogate keys ổn định, tránh join quá phức tạp cho case phổ biến.

## 3. Tổng quan domain model analytics

Ở mức cao, schema analytics của Nextflow có các nhóm chính:

- **Fact tables**:  
  - Work & SLA facts;  
  - Exception facts;  
  - Integration facts;  
  - Incident & change facts;  
  - Usage & adoption facts;  
  - BAU & governance facts.

- **Dimension tables**:  
  - Time;  
  - Tenant;  
  - Wedge & Product area;  
  - User & Role;  
  - Queue & Work type;  
  - Integration & External system;  
  - Automation rule;  
  - Risk tier & severity;  
  - Region & timezone;  
  - Customer (khách SME) metadata.

Các phần sau mô tả khung cho từng nhóm.

## 4. Fact – Work & SLA

### 4.1 `fact_work_item`

- **Grain:** 1 dòng / 1 work item (task hoặc case) / hệ thống.  
- **Nguồn:** Pack 04 – lifecycle model (68), assignment & routing (69), SLA & priority (71).

**Trường chính** (gợi ý):
- `work_item_id` (PK)  
- `work_type` (task/case subtype, mapping với dimension_work_type)  
- `tenant_key`  
- `wedge_key`  
- `queue_key_initial`, `queue_key_final`  
- `created_at`, `completed_at`, `cancelled_at`  
- `current_state`, `final_state`  
- `sla_target_at`, `sla_met` (bool), `sla_breach_minutes`  
- `priority_initial`, `priority_final`  
- `assigned_user_key_first`, `assigned_user_key_last`  
- `source_system` (Nextflow vs integration)  
- `risk_tier_key` (nếu applicable)

**Use cases:**
- đếm số work items theo wedge/queue/tenant;  
- tính SLA hit/breach;  
- phân tích throughput & cycle time.

### 4.2 `fact_work_item_event`

- **Grain:** 1 dòng / 1 event trong lifecycle của 1 work item.  
- **Nguồn:** events lifecycle (created, assigned, state_changed, closed, reopened, escalated…).

**Trường chính:**
- `work_item_event_id` (PK)  
- `work_item_id` (FK)  
- `event_type` (created, state_changed, assigned, …)  
- `event_timestamp`  
- `from_state`, `to_state`  
- `queue_key`  
- `user_key` (nếu applicable)  
- `automation_rule_key` (nếu event do automation trigger)  
- `source` (manual vs automation vs integration)

**Use cases:**
- phân tích chi tiết dwell time giữa từng state;  
- audit path của work items;  
- phân tích hiệu quả automation vs manual.

### 4.3 `fact_sla_snapshot_daily`

- **Grain:** 1 dòng / 1 ngày / 1 tenant / 1 wedge (hoặc queue)  
- **Nguồn:** tổng hợp từ fact_work_item.

**Trường chính:**
- `date_key`  
- `tenant_key`  
- `wedge_key` hoặc `queue_key`  
- `work_items_opened`  
- `work_items_closed`  
- `sla_met_count`, `sla_breach_count`  
- `avg_cycle_time_minutes`

**Use cases:**
- dashboard SLA theo ngày/tuần/tháng;  
- trend SLA performance theo wedge/tenant.

## 5. Fact – Exceptions

### 5.1 `fact_exception`

- **Grain:** 1 dòng / 1 exception case (Pack 04–05).  
- **Nguồn:** exception handling & resolution playbook (72), integration error patterns (83).

**Trường chính:**
- `exception_id` (PK)  
- `exception_type` (mapping với dimension_exception_type)  
- `work_item_id` (nếu liên kết một work item)  
- `integration_key` (nếu liên quan integration)  
- `tenant_key`, `wedge_key`  
- `created_at`, `resolved_at`  
- `status` (open/resolved/ignored)  
- `resolution_type` (auto/semi/manual)  
- `severity_tag` (business impact)  
- `risk_tier_key` (nếu liên quan flows Tier 3–4)

**Use cases:**
- theo dõi patterns exceptions;  
- xác định rules/integrations gây nhiều exceptions;  
- đánh giá hiệu quả auto/semi/manual resolution.

## 6. Fact – Integration

### 6.1 `fact_integration_call`

- **Grain:** 1 dòng / 1 lần call integration (API/webhook/batch job run).  
- **Nguồn:** Pack 05 – inbound/outbound patterns (79–80), error/retry (83), observability (84).

**Trường chính:**
- `integration_call_id` (PK)  
- `integration_key` (FK tới dimension_integration)  
- `tenant_key`  
- `direction` (inbound/outbound)  
- `endpoint` hoặc `operation_name`  
- `request_timestamp`, `response_timestamp`  
- `latency_ms`  
- `status` (success/fail/timeout)  
- `error_code`, `error_category` (auth, mapping, business, network…)  
- `retry_attempt`  
- `correlation_id` (để join với work_item/event nếu cần)

**Use cases:**
- đo tần suất, latency, error rate per integration/endpoint;  
- phân tích retry behavior và impacts;  
- tìm integration bottlenecks.

### 6.2 `fact_integration_daily_health`

- **Grain:** 1 dòng / 1 integration / 1 ngày / 1 tenant (hoặc wedge).  
- **Nguồn:** tổng hợp từ fact_integration_call.

**Trường chính:**
- `date_key`  
- `integration_key`  
- `tenant_key` (optional)  
- `total_calls`  
- `success_count`, `error_count`, `timeout_count`  
- `avg_latency_ms`  
- `p95_latency_ms`

**Use cases:**
- dashboards health integration;  
- pilot & post-go-live reviews (Pack 05, doc 87).

## 7. Fact – Incidents & Changes

### 7.1 `fact_incident`

- **Grain:** 1 dòng / 1 incident (Pack 06 – doc 92).  

**Trường chính:**
- `incident_id` (PK)  
- `incident_type` (availability, integration, automation, security, data, change)  
- `severity` (Sev1–4)  
- `risk_tier_key` (nếu liên quan integration/automation Tier 3–4)  
- `tenant_key` hoặc nhóm tenants bị ảnh hưởng  
- `wedge_key`  
- `start_timestamp`, `end_timestamp`  
- `duration_minutes`  
- `root_cause_category`  
- `caused_by_change_id` (link sang fact_change_deployment nếu applicable)

**Use cases:**
- incident KPIs: count, MTTR, frequency theo type/severity;  
- correlation với changes high-risk;  
- input cho governance reviews.

### 7.2 `fact_change_deployment`

- **Grain:** 1 dòng / 1 change deployment (Pack 06 – doc 93).  

**Trường chính:**
- `change_id` (PK)  
- `change_level` (A/B/C/D)  
- `change_type` (code/config/integration/ops)  
- `risk_tier_key` (nếu liên quan Tier 3–4)  
- `wedge_key`, `tenant_scope`  
- `deployed_at`, `rollback_at` (nếu có)  
- `pilot_used` (bool), `rollout_pattern` (big-bang/phased/flag)  
- `owner_team`  
- `status` (success/rolled_back/partial)

**Use cases:**
- change failure rate;  
- correlation between change patterns & incidents;  
- effectiveness of pilots & rollout strategies.

## 8. Fact – Usage & Adoption

### 8.1 `fact_feature_usage`

- **Grain:** 1 dòng / 1 feature usage event (e.g. view, click, action) / user / session.  
- **Nguồn:** Pack 03 – experience strategy & signal framework (42).

**Trường chính:**
- `usage_event_id` (PK)  
- `user_key`  
- `tenant_key`  
- `feature_key` (mapping tới dimension_feature)  
- `timestamp`  
- `context` (web/mobile/module)  
- `additional_metadata` (nhỏ, schema-on-read nếu cần)

**Use cases:**
- adoption, engagement theo feature/wedge;  
- hiệu quả của dashboards & views;  
- input cho product decisions & experiments.

### 8.2 `fact_tenant_adoption_snapshot`

- **Grain:** 1 dòng / 1 tenant / 1 tuần (hoặc tháng).  

**Trường chính:**
- `tenant_key`  
- `week_key` (hoặc month_key)  
- `active_users_count`  
- `features_used_count`  
- `automation_usage_index` (tỉ lệ work đi qua automation vs manual)  
- `integrations_enabled_count`  
- `incidents_count`  
- `sla_breach_rate`

**Use cases:**
- health/adoption của tenants;  
- segmentation khách theo mức trưởng thành;  
- early warning cho churn.

## 9. Dimension tables chính

### 9.1 `dim_time`

- standard time dimension: date, week, month, quarter, year, day_of_week, is_workday, etc.

### 9.2 `dim_tenant`

- `tenant_key` (PK)  
- `tenant_id` (from core system)  
- `region`, `timezone`  
- `segment` (small/medium/lớn)  
- `industry`  
- `onboarding_date`  
- `status` (active/trial/churned)

### 9.3 `dim_wedge`

- `wedge_key` (PK)  
- `wedge_code`, `wedge_name`  
- `description`

### 9.4 `dim_user`

- `user_key` (PK)  
- `user_id`  
- `tenant_key`  
- `primary_role` (map với Pack 03, doc 50)  
- `is_admin`, `is_ops`, `is_cs` (flags)

### 9.5 `dim_queue`

- `queue_key` (PK)  
- `queue_code`, `queue_name`  
- `wedge_key`  
- `tenant_key` (nếu queue per tenant)  
- `queue_type` (ops/support/backoffice…)

### 9.6 `dim_work_type`

- `work_type_key` (PK)  
- `work_type_code`, `work_type_name`  
- `is_case`, `is_task`  
- `default_sla_profile`

### 9.7 `dim_integration`

- `integration_key` (PK)  
- `integration_id` (from config, doc 86)  
- `name`, `category` (CRM, ERP, payments, comms…)  
- `direction_supported` (inbound/outbound/both)  
- `risk_tier_key`  
- `owner_team`

### 9.8 `dim_exception_type`

- `exception_type_key` (PK)  
- `code`, `name`  
- `category` (data, integration, policy, automation…)  
- `severity_default`

### 9.9 `dim_risk_tier`

- `risk_tier_key` (PK)  
- `tier` (1–4)  
- `description`  
- `example_use_cases`

### 9.10 `dim_incident_type` và `dim_severity`

- `incident_type_key`, `severity_key` – map với taxonomy doc 92.

### 9.11 `dim_change_level`

- map levels A–D từ doc 93.

### 9.12 `dim_feature`

- `feature_key` (PK)  
- `feature_code`  
- `module`  
- `description`

## 10. Mapping từ runtime sang analytics

Ở mức implementation, dữ liệu đi từ:
- events & entities runtime (Packs 02–06) → event streams/logs → staging → warehouse/lakehouse (schema ở trên).  

Nguyên tắc mapping:
- mỗi event runtime phải map được tới ít nhất một bảng fact;  
- mọi entity core (task, case, tenant, user, queue, integration) phải map tới dimension tương ứng;  
- data lineage phải cho phép trace ngược một metric trên dashboard về events gốc.

## 11. Hỗ trợ BI & self-service

Schema này được thiết kế để:
- BI & self-service tools có thể dùng trực tiếp fact/dim;  
- các dashboards Pack 07 doc 102 (KPIs & standard dashboards) build trên các fact/dim này;  
- governed self-service (doc 103) có thể cấp quyền theo schema: dataset read-only dựa trên view từ các fact/dim.

## 12. Điều kiện hoàn thành của tài liệu

Data Domain Model and Analytics Schema được xem là đạt yêu cầu khi:
- các fact/dim ở đây cover >80% use cases dashboards & KPIs Pack 07 dự kiến;  
- Data & Analytics team có thể mapping rõ từ Packs 02–06 sang schema này;  
- Product/Ops/CS/Governance có thể nói về metrics sử dụng cùng ngôn ngữ (work, SLA, exception, integration, incident, change, risk tier…).
