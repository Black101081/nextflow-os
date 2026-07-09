# Nextflow OS – Pack 08 Intelligence Data and Feature Layer Spec

**Document ID:** 122_PACK08_INTELLIGENCE_DATA_AND_FEATURE_LAYER_SPEC  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence / Platform Data  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights (100–107), 08 Overview (120), 08 Use Cases (121)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Intelligence Data and Feature Layer Spec** cho Pack 08 – cách dữ liệu từ Pack 07 và các packs trước được tổ chức thành **feature layer** phục vụ các use case intelligence & assistants (Pack 08).

Mục tiêu:
- định nghĩa các **feature domains** chính (work/SLA, exceptions, integrations, incidents/changes, adoption/health);  
- mô tả cách dùng schema analytics (101) để build feature tables và feature views cho models & rules; [code_file:479]  
- xác định **feature contracts** giữa BI layer (Pack 07) và intelligence layer (Pack 08);  
- đảm bảo feature layer **align với governance & data policies** (Pack 06 & 104). [code_file:451][code_file:482]

## 2. Nguyên tắc thiết kế feature layer

1. **Reuse analytics schema** – không duplicative modeling: feature layer nên xây trên facts/dims Pack 07 (101), không tạo thêm nhiều pipelines song song. [code_file:479]  
2. **Clear entities & grains** – features được nhóm theo entities rõ (work item, queue, user, tenant, integration) với grain ổn định.  
3. **Time-awareness** – features phải định nghĩa rõ horizon (tính đến lúc nào) và tránh leakage (không dùng thông tin tương lai khi scoring hiện tại).  
4. **Governance-aware** – feature layer phải tôn trọng data classes & policies 104 (masking, retention, access). [code_file:482]  
5. **Model-agnostic** – design feature layer để dùng được cho cả rules, scoring models, pattern mining và analytics advanced.  
6. **Traceable** – mọi feature có thể trace ngược về facts/dims & metrics underlying.

## 3. Feature domains và entities chính

Chúng ta tập trung vào 5 feature domains chính, tương ứng với nhóm use case trong doc 121: [code_file:507]

1. **Work & SLA Features** – cho prioritization, SLA risk, routing & staffing.  
2. **Exception & Integration Features** – cho exception intelligence, integration health & mapping assistant.  
3. **Incident & Change Features** – cho stability & risk-related recommendations.  
4. **Adoption & Customer Health Features** – cho health scores & CS assistants.  
5. **Automation & Process Features** – cho automation opportunity finder.

Các entities chính:
- `work_item`  
- `queue`  
- `user`  
- `tenant`  
- `integration`  
- `exception`  
- `incident`  
- `change_deployment`

## 4. Work & SLA Feature Layer

### 4.1 Entity: Work Item

**Feature table:** `feat_work_item_snapshot`

- **Grain:** 1 dòng / 1 work item / 1 thời điểm snapshot (vd lúc scoring).  
- **Key:** `work_item_id`, `snapshot_time`.

**Base fields** (from `fact_work_item`): [code_file:479]
- `tenant_key`, `wedge_key`, `queue_key`, `work_type_key`  
- `created_at`, `sla_target_at`, `completed_at`, `current_state`  
- `priority`  
- `assigned_user_key`

**Derived features:**
- `age_minutes` – thời gian từ `created_at` tới `snapshot_time`.  
- `time_to_sla_minutes` – thời gian từ `snapshot_time` tới `sla_target_at`.  
- `is_overdue` – `snapshot_time` > `sla_target_at`.  
- `sla_profile` – từ Pack 04 (doc 71), join vào `dim_work_type` hoặc cấu hình SLA.  
- `historical_breach_rate_for_type` – SLA breach rate trung bình cho work_type này (từ `fact_sla_snapshot_daily`). [code_file:479]  
- `queue_current_load` – số items open trong queue tại `snapshot_time`.  
- `user_current_load` – số items assigned cho user đó (nếu applicable).  
- `recent_reopen_flag` – work đã từng reopen trong N ngày gần.  
- `risk_tier_key` – nếu work liên quan flows Tier 3–4. [code_file:451]

Use cases: A1 (SLA Risk & Work Prioritization), A2 (Queue Load & Staffing). [code_file:507]

### 4.2 Entity: Queue

**Feature table:** `feat_queue_daily`

- **Grain:** 1 dòng / 1 queue / 1 ngày.  
- **Key:** `queue_key`, `date_key`.

**Features:**
- `open_items_start_of_day`  
- `items_created` / `items_completed` trong ngày  
- `avg_cycle_time_minutes`  
- `sla_hit_rate`  
- `max_queue_length`  
- `peak_hour_load` (kèm giờ)  
- `num_assigned_users` trong ngày

Use cases: A2 Queue Load & Staffing Advisor, A1 context. [code_file:507]

### 4.3 Entity: User (Ops)

**Feature table:** `feat_user_workload_daily`

- **Grain:** 1 dòng / 1 user / 1 ngày.  
- **Key:** `user_key`, `date_key`.

**Features:**
- `items_completed`  
- `avg_cycle_time`  
- `sla_hit_rate_on_assigned_items`  
- `workload_index` – normalized load vs peers  
- `skills_profile` – based on work_types & queues xử lý thường xuyên.

Use cases: A2 staffing, routing intelligence trong tương lai.

## 5. Exception & Integration Feature Layer

### 5.1 Entity: Exception Type & Exception Instance

**Feature table:** `feat_exception_pattern_daily`

- **Grain:** 1 dòng / 1 exception_type / 1 tenant / 1 ngày.  
- **Key:** `exception_type_key`, `tenant_key`, `date_key`.

**Features:**
- `exceptions_opened`  
- `exceptions_resolved`  
- `avg_time_to_resolution_minutes`  
- `auto_resolution_rate` (auto/semi vs manual)  
- `integration_related_rate` – tỉ lệ exceptions liên quan integration.

Use cases: A3 Exception Pattern & Runbook Assistant (pattern mining). [code_file:507]

**Feature view:** `feat_exception_instance`
- Grain: 1 exception; features về loại, source, work/integration liên quan, history resolution.

### 5.2 Entity: Integration

**Feature table:** `feat_integration_daily`

- **Grain:** 1 dòng / 1 integration / 1 tenant / 1 ngày.  
- **Key:** `integration_key`, `tenant_key`, `date_key`.

**Base fields** (from `fact_integration_daily_health` & `dim_integration`): [code_file:479]
- `total_calls`, `success_count`, `error_count`, `timeout_count`  
- `avg_latency_ms`, `p95_latency_ms`  
- `risk_tier_key`, `category`.

**Derived features:**
- `error_rate` = error_count / total_calls  
- `timeout_rate`  
- `latency_anomaly_score` – deviation so với 7/30 days baseline  
- `error_rate_trend` – rising/flat/falling  
- `exceptions_linked` – number of exceptions linked to this integration in last N days.

Use cases: B1 Integration Health & Risk Assistant. [code_file:507]

### 5.3 Entity: Integration Mapping

**Feature view:** `feat_integration_mapping_field`

- **Grain:** 1 dòng / 1 field mapping / 1 integration.  
- **Fields:**
  - field names/paths (source & target)  
  - data types  
  - usage frequency  
  - error frequency & types  
  - co-occurrence với các fields khác.

Use cases: B2 Mapping & Field Suggestion Assistant. [code_file:507]

## 6. Incident & Change Feature Layer

### 6.1 Entity: Incident

**Feature table:** `feat_incident_profile`

- **Grain:** 1 dòng / 1 incident.  
- **Key:** `incident_id`.

**Base fields** (from `fact_incident`): [code_file:479]
- `incident_type`  
- `severity` (Sev1–4)  
- `risk_tier_key`  
- `start_timestamp`, `end_timestamp`, `duration_minutes`  
- `root_cause_category`  
- `tenant_scope`, `wedge_key`  
- `caused_by_change_id`.

**Derived features:**
- `impacted_integrations_count`  
- `impacted_queues_count`  
- `work_items_affected_estimate` (approx)  
- `incident_recurrence` – similar incidents count in last N days.

Use cases: A3 (root cause patterns), B1 risk, governance dashboards Pack 06. [code_file:452][code_file:507]

### 6.2 Entity: Change Deployment

**Feature table:** `feat_change_deployment_profile`

- **Grain:** 1 dòng / 1 change deployment.  
- **Features:**
- `change_level` (A–D)  
- `change_type` (code/config/integration/ops)  
- `risk_tier_key`  
- `tenant_scope_size` (bao nhiêu tenants/wedges)  
- `pilot_used_flag`  
- `rollback_flag`  
- `time_to_incident` – nếu có incident liên quan. [code_file:479]

Use cases: risk/stability analytics & future intelligence (nhận biết change patterns nguy hiểm).

## 7. Adoption & Customer Health Feature Layer

### 7.1 Entity: Tenant

**Feature table:** `feat_tenant_health_snapshot`

- **Grain:** 1 dòng / 1 tenant / 1 thời điểm snapshot (vd tuần).  

**Base fields** (from `fact_tenant_adoption_snapshot` & `dim_tenant`): [code_file:479]
- `active_users_count`  
- `features_used_count`  
- `automation_usage_index`  
- `integrations_enabled_count`  
- `incidents_count`  
- `sla_breach_rate`  
- `segment`, `industry`.

**Derived features:**
- `recent_incident_severity_index` (weighted by severity)  
- `adoption_growth_rate`  
- `automation_growth_rate`  
- `support_ticket_rate` (nếu có)  
- `health_score` (C1) – computed or stored here. [code_file:507]

Use cases: C1 Customer Health Score & Driver Insights, C2 QBR Assistant. [code_file:507]

### 7.2 Entity: Feature

**Feature table:** `feat_feature_usage_profile`

- **Grain:** 1 dòng / 1 feature / 1 tenant / 1 period (week/month).  

**Features:**
- `active_users_using_feature`  
- `usage_events_count`  
- `time_spent_estimate`  
- `ops_value_proxies` (vd work items created/resolved via feature).

Use cases: health drivers, product intelligence.

## 8. Automation & Process Feature Layer

### 8.1 Entity: Process Step / Automation Candidate

**Feature view:** `feat_automation_candidate`

- **Grain:** 1 dòng / 1 loại thao tác manual lặp lại (process step) / 1 tenant/wedge.

**Features:**
- `manual_occurrence_count` – số lần thao tác manual trong kỳ;  
- `avg_manual_time_spent`  
- `error_rate_or_rework_rate`  
- `existing_automation_flag` – đã có automation tương tự chưa;  
- `risk_tier_key` – nếu automation ảnh hưởng Tier 3–4 flows. [code_file:451]

Use cases: E1 Automation Opportunity Finder. [code_file:507]

## 9. Feature governance & data policies

Feature layer phải tuân thủ policies 104 & governance Pack 06:

- Không tạo features sử dụng PII thô khi không cần – dùng keys & aggregates; [code_file:482]  
- Feature liên quan flows Tier 3–4 phải được tag rõ và access hạn chế; [code_file:451]  
- Retention cho feature tables nên align với retention facts/dims; [code_file:482]  
- Logs sử dụng features trong models/assistants phải hỗ trợ explainability & audit (ai dùng feature nào trong kết luận nào).

## 10. Feature contracts giữa Pack 07 & Pack 08

Để tránh coupling chặt, chúng ta định nghĩa **feature contracts**:

- Pack 07 chịu trách nhiệm:  
  - cung cấp facts/dims & KPIs ổn định; [code_file:479][code_file:480]  
  - đảm bảo quality & versioning (105). [code_file:494]  

- Pack 08 chịu trách nhiệm:  
  - định nghĩa feature tables/views từ facts/dims;  
  - document features (meaning, formula, usage);  
  - ensure không phá policies & governance. [code_file:482]

Contract:
- Features không được thay đổi ý nghĩa nếu không update clearly;  
- Models & rules Pack 08 sử dụng features bằng tên ổn định;  
- Dashboards Pack 07 có thể hiển thị một số features như part of intelligence transparency.

## 11. Điều kiện hoàn thành của tài liệu

Intelligence Data and Feature Layer Spec được xem là đạt yêu cầu khi:
- mọi use case Pack 08 ưu tiên (121) có thể map rõ ràng tới 1–2 feature tables/views; [code_file:507]  
- Data & Intelligence team có thể implement feature pipelines trên schema 101 (Pack 07) mà không tạo "data silo" mới; [code_file:479]  
- Governance & Risk chấp nhận rằng feature layer tuân thủ data policies và risk tiers; [code_file:451][code_file:482]  
- và Product/Ops hiểu được, ở mức high-level, features nào đang được dùng để đưa ra gợi ý & assistants.
