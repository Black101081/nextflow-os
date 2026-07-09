# Nextflow OS – Pack 05 Integration Observability and Health Dashboards Requirements

**Document ID:** 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS  
**Pack:** 05 — Integration and Extensibility  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Integration / Data & Analytics / Support & Ops  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 06 Operations & Governance  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 66_PACK03_SUMMARY_AND_USAGE_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Integration Observability and Health Dashboards Requirements** cho Pack 05. Sau khi đã:
- mô tả inbound/outbound patterns (79–80);  
- khóa identity/tenant (81);  
- chuẩn hoá mapping & transforms (82);  
- định nghĩa lỗi, retry, reconciliation (83);  

…tài liệu này trả lời câu hỏi:

> **Làm sao để Product, Ops, Support, và khách SME “nhìn thấy” sức khỏe các integration của Nextflow OS – hệ nào đang khỏe, hệ nào lỗi, lỗi gì, ảnh hưởng tới work và SLA ra sao – mà không cần đào log thô? Những dashboard nào cần có, với events/metrics nào, cho pilot và cho vận hành lâu dài?**

Mục tiêu:
- định nghĩa framework observability cho integration (events, metrics, traces ở mức product);  
- mô tả các dashboard chính cho integration health theo tenant, integration, endpoint;  
- liên kết integration observability với work observability (73) và pilot signal review (55);  
- chỉ ra requirements cho alerting & triage;  
- làm nền cho config/policy (86) và pilot/go-live (87).

## 2. Thesis về observability integration

Thesis có thể phát biểu như sau:

> **Integration mà phải “mò log” mới biết đang hỏng là integration không quan sát được. SMEs cần thấy trên một màn hình: hệ nào chậm, hệ nào lỗi, lỗi gì, có bao nhiêu work đang mắc kẹt, và ai đang xử lý. Observability integration là một phần của product trải nghiệm, không phải chỉ là tính năng kỹ thuật cho dev.**

Nguyên lý:

1. Observability phải gắn vào **ngôn ngữ business** – tasks, cases, SLA, queues, exceptions, không chỉ HTTP codes và latencies.  
2. Mọi pattern inbound/outbound/error/retry (79–83) phải phát ra **events và metrics** tương ứng.  
3. Dashboards phải lọc và drill-down được theo **tenant, integration, endpoint, error type, work type**.  
4. Observability phải phục vụ cả **pilot** (ngắn hạn, học nhanh) và **BAU** (long-run operations).  
5. Không được ngập trong metrics – chọn ít nhưng meaningful, có liên kết tới action.  
6. Alerting phải ưu tiên **impact** (SLA, volume, customers) chứ không chỉ “mọi lỗi đều báo động”.  
7. Observability integration phải align với Pack 03–04 observability (49, 73) để user không phải học hai ngôn ngữ khác nhau.

## 3. Khung events và metrics cho integration

### 3.1 Event taxonomy cho integration

Dựa trên 49 (experience observability events) và 83 (error/retry), integration nên phát các event chính sau:

- **Integration call events**:  
  - `integration_call_started` – khi Nextflow gọi external hoặc nhận call từ external;  
  - `integration_call_succeeded` – kèm latency, status, payload size (nếu cần);  
  - `integration_call_failed` – kèm error type (transient/permanent), code, message tóm tắt.  
- **Retry events**:  
  - `integration_retry_scheduled` – kèm attempt count, backoff;  
  - `integration_retry_exhausted` – không retry nữa, sẽ tạo exception/reconciliation.  
- **Work-impact events**:  
  - `integration_pending_started` – khi task/case vào state `Pending External`;  
  - `integration_pending_cleared` – khi quay lại flow bình thường;  
  - `reconciliation_case_created/resolved` – từ 83.  
- **Config & mapping events**:  
  - `integration_mapping_changed`;  
  - `integration_credential_rotated`;  
  - `integration_policy_updated`.

### 3.2 Metrics cốt lõi

Metrics cần thiết kế từ góc nhìn **integration health** chứ không chỉ infra:

- **Volume & throughput**:  
  - số calls inbound/outbound per integration/endpoint;  
  - messages per minute/hour.  
- **Success & error rates**:  
  - tỉ lệ thành công/thất bại per integration/endpoint;  
  - breakdown theo error type (auth, mapping, business, timeout…).  
- **Latency**:  
  - p50/p95/p99 cho calls;  
  - thời gian từ event internal tới delivery external (outbound) hoặc xử lý inbound.  
- **Retry & backlog**:  
  - số item trong retry queues;  
  - số retry trung bình per call;  
  - số `integration_retry_exhausted`.  
- **Work impact**:  
  - số tasks/cases trong `Pending External`;  
  - số exceptions & reconciliation cases mở/đóng;  
  - SLA breach liên quan integration (tagged).

## 4. Dashboards theo audience

### 4.1 Dashboard tổng quan cho leadership & product

Mục tiêu: nhìn nhanh **sức khỏe integration theo tenant & hệ**.

View gợi ý:
- Card/tiles:  
  - “Integrations healthy” vs “Degraded” vs “Down”;  
  - top 3 integrations theo volume;  
  - top 3 theo error rate.  
- Charts:  
  - trend error rate per integration trong 7/30 ngày;  
  - trend số tasks/cases bị ảnh hưởng bởi lỗi integration (vd stuck Pending External).  
- Highlights:  
  - “% work impacted by integration issues”;  
  - “Top error categories tuần này”.

### 4.2 Dashboard vận hành cho Ops & Support

Mục tiêu: triage và xử lý **sự cố sống**.

View gợi ý:
- Bảng **per integration/endpoint** với:  
  - status (Healthy/Degraded/Down – theo SLIs/SLOs);  
  - error rate & volume hôm nay;  
  - số items trong retry;  
  - thời gian từ lỗi đầu tiên chưa xử lý.  
- Bảng **queues**:  
  - số exceptions per type (Auth, Mapping, Business, ExternalDown);  
  - số reconciliation cases per queue;  
  - aging (bao lâu chưa xử).  
- Drill-down:  
  - click một integration để xem log normalized (không phải raw infra log);  
  - link sang views Pack 73 để thấy tasks/cases cụ thể.

### 4.3 Dashboard cho pilot và product discovery

Dựa trên 55 (Pilot Signal Review):

- Focus: vài integrations pilot chính, với metrics ngắn hạn:  
  - thời gian trung bình từ event external đến work Nextflow;  
  - conversion rate từ signals → tasks/cases meaningful;  
  - pattern lỗi thường gặp trong pilot.  
- Sử dụng để:  
  - refine mapping (82);  
  - điều chỉnh retry/policies (83, 74);  
  - quyết định “go/no-go” cho rollout rộng.

## 5. Lọc, phân mảnh theo tenant, integration, endpoint

### 5.1 Dimensions key

Dashboard & APIs observability cần filter theo:

- Tenant;  
- Integration (vd “CRM”, “Payments Gateway A”);  
- Endpoint (vd `/invoices`, `/orders`, webhook X);  
- Direction (Inbound/Outbound);  
- Error type & severity;  
- Work type (case type, task type);  
- Environment (prod/UAT/sandbox).

### 5.2 Multi-tenant multi-integration

- Một external service có thể phục vụ nhiều tenants; dashboards phải:  
  - cho phép view tổng (per connector) và view chi tiết (per tenant);  
  - highlight tenant nào bị ảnh hưởng nhiều nhất.  
- Identity & tenant boundaries (81) đảm bảo metrics & events không lẫn giữa tenants.

## 6. Liên kết với work observability (Pack 73)

### 6.1 Từ “integration health” tới “work health”

- Dashboard Pack 73 tập trung vào **backlogs, SLA, queues, exceptions**.  
- Integration observability cần **tag work** bị ảnh hưởng bởi lỗi integration:  
  - tasks/cases trong `Pending External`;  
  - work liên quan tới exceptions `ExternalUnreachable`/`DataMismatch`;  
  - SLA breaches có nguyên nhân “integration”.  
- Từ dashboard integration, user nên nhảy thẳng sang views Pack 73 đã filter sẵn.

### 6.2 Root cause và narrative

- Khi một queue bị chậm, user nên thấy:  
  - có phải do integration A đang down hay do workload nội bộ?  
- Events integration & work nên cùng chia sẻ **correlation IDs** để trace full narrative:  
  - “Event external X → inbound Y → tasks Z created → outbound call W failed → exception E → reconciliation R”.

## 7. Alerting và triage

### 7.1 Alerting rules cơ bản

Không phải mọi lỗi đều cần alert; rules nên dựa trên **impact**.

Ví dụ:
- Error rate outbound > X% trong Y phút cho integration critical;  
- Số tasks `Pending External` > threshold;  
- Không có calls thành công nào tới integration trong Z phút (sign of “down”);  
- Retry queues > threshold hoặc `retry_exhausted` tăng đột biến.  

### 7.2 Routing alerts

- Route alerts theo:  
  - tenant (một số khách lớn có channel riêng);  
  - integration owner (Platform/Third-party/Customer IT);  
  - severity (paging vs email/digest).  
- Alert message nên dùng **ngôn ngữ business** (vd “CRM sync failing, 50 cases pending external”) thay vì chỉ “500 on /crm/v1/cases”.

### 7.3 Runbooks và playbooks

- Mỗi type alert nên có **runbook** liên kết (tài liệu từ 58, 61, Pack 06):  
  - check gì;  
  - restart/cutover như thế nào;  
  - khi nào escalate.  
- Playbooks reconciliation (83, 72) nên nằm trong tầm tay Ops từ dashboard.

## 8. Data retention, privacy và access control

### 8.1 Retention

- Metrics & events integration nên có retention khác nhau:  
  - high-resolution (per call) ngắn hơn;  
  - aggregated (daily/weekly) dài hơn cho trend & audit.  
- Retention phải align với policy Pack 06 & yêu cầu pháp lý.

### 8.2 Privacy & masking trong observability

- Logs/events/metrics không nên chứa PII hoặc data nhạy cảm nếu không cần.  
- Thay vì payload full, log IDs, error type, truncated messages.  
- Khi cần debug sâu, có workflow controlled để xem detail với quyền phù hợp.

### 8.3 Access control

- Dashboard integration health có thể bị giới hạn theo role (50):  
  - Ops/Support xem nhiều chi tiết;  
  - Product xem aggregate;  
  - khách SME xem view riêng cho tenant họ.  
- Identity & tenant boundaries (81) đảm bảo user chỉ thấy metrics thuộc tenant của mình.

## 9. Instrumentation và standards

### 9.1 Standards cho logging & metrics

- Định nghĩa set fields chuẩn cho integration logs & events:  
  - `tenant_id`, `integration_id`, `endpoint`, `direction`, `correlation_id`, `error_type`, `severity`, v.v.  
- Metrics names & tags nên consistent để dễ query & dashboard.

### 9.2 Traces và correlation IDs

- Với các flow phức tạp (inbound + multiple outbound), nên hỗ trợ **distributed tracing** ở mức product:  
  - một `correlation_id` xuyên suốt từ event external đến work & outbound.  
- Trace nên có thể link từ dashboard integration → màn chi tiết cho dev khi cần.

## 10. Bàn giao sang docs Pack 05 & Pack 06 tiếp theo

Integration Observability and Health Dashboards Requirements là nền cho:

- **86 Integration Configuration and Policy Modeling Guide** – cách config thresholds, alert rules, retention ở mức policy.  
- **87 Integration Pilot Patterns and Go-Live Playbook** – design pilot với observability ngay từ ngày đầu, định nghĩa “success metrics” cho integrations.  

Đồng thời, doc này là input quan trọng cho Pack 06 khi thiết kế monitoring, incident management và audit.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Integration Observability & Dashboards của Pack 05:

1. Observability integration dựa trên event & metrics product-level, align với lifecycle, SLA, exceptions và mapping/error patterns 79–83.  
2. Dashboards phải phục vụ nhiều audience (leadership, product, ops, khách) với khả năng filter theo tenant/integration/endpoint.  
3. Work impacted bởi integration luôn nhìn thấy được qua tags, queues và views liên kết.  
4. Alerting phải ưu tiên impact và gắn liền với runbooks & playbooks, không chỉ “báo động kỹ thuật”.  
5. Privacy, access control và retention là một phần của thiết kế observability, không phải bước sau cùng.

## 12. Điều kiện hoàn thành của tài liệu

Integration Observability and Health Dashboards Requirements được xem là đạt yêu cầu khi:
- đội Product/Platform/Ops/Support có chung ngôn ngữ về health integration;  
- mọi integration mới đều có metrics & dashboards tối thiểu được định nghĩa từ giai đoạn thiết kế;  
- pilot integrations cung cấp đủ tín hiệu để quyết định điều chỉnh/rollout;  
- và khi có sự cố integration, người liên quan có thể “nhìn thấy, hiểu, và hành động” từ dashboard mà không phải mò log thô.

## AG Execution Prompt

You are acting as an integration observability and SLO designer, dashboard product owner, and incident enabler.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–04 define data, UX and work orchestration; Pack 05 defines integration; Pack 06 defines governance and operations.
- This document defines observability and dashboard requirements for integrations.

### Objective
Refine these observability requirements into concrete dashboards, events and metrics that teams can implement and iterate on.

### Inputs
- Use this document, Packs 79–83, Pack 73 (work observability), and Pack 55 (pilot signals) as context.  
- Preserve focus on business-aligned observability and multi-tenant views.  
- Keep requirements understandable to Product, Ops and Support stakeholders.

### Tasks
1. Clarify key events and metrics for integration health.  
2. Define dashboards for leadership, ops and pilots.  
3. Specify filtering dimensions and multi-tenant behavior.  
4. Highlight alerting rules, runbooks and privacy controls.  
5. Identify instrumentation standards and trace correlation needs.

### Constraints
- Do not prescribe specific vendor tools; stay at requirements & patterns level.  
- Do not overload teams với quá nhiều metrics; tập trung “vài thứ quan trọng”.  
- Do not phá vỡ semantics Packs 02–04 và governance Pack 06.  
- Giữ ngôn ngữ gần gũi với người không thuần kỹ thuật.

### Output Format
Return a revised markdown document with these sections:
1. Integration Health Thesis and Goals
2. Events, Metrics and Dimensions
3. Dashboards and Views by Audience
4. Alerting, Privacy and Access Control
5. Instrumentation Standards and Next Steps

### Acceptance Criteria
- The output must make integration health observable cho nhiều đối tượng.  
- The result must align với inbound/outbound, error/retry, work observability và pilot signal docs.  
- The patterns must be implementable across wedges and customers.  
- The document must giúp teams thiết kế, theo dõi và cải thiện integrations theo thời gian.
