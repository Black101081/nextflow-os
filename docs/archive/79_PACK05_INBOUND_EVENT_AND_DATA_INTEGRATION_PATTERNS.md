# Nextflow OS – Pack 05 Inbound Event and Data Integration Patterns

**Document ID:** 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS  
**Pack:** 05 — Integration and Extensibility  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Integration / Product Management / Architecture  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 06 Operations & Governance  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 66_PACK03_SUMMARY_AND_USAGE_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Inbound Event and Data Integration Patterns** cho Pack 05. Sau khi 78 đã định nghĩa taxonomy capability (file/batch, APIs, events, webhooks, embedded, connectors, extension hooks), tài liệu này trả lời câu hỏi cụ thể hơn ở chiều **inbound**:

> **Khi dữ liệu hoặc events đi từ hệ thống bên ngoài vào Nextflow OS – qua file, APIs, events/streams, connectors – thì có những pattern chuẩn nào để biến chúng thành data trong core, thành tasks/cases, thành cập nhật lifecycle, SLA, priority, exception? Và làm sao để làm việc này có cấu trúc, quan sát được và không phá UX/orchestration của Pack 03–04?**

Mục tiêu:
- định nghĩa các pattern inbound chính (master data sync, transactional/event-driven, hybrid) và biến thể theo capability;  
- chỉ rõ mapping từ inbound payload → entities core (Pack 02) → work (Pack 04) → UX semantics (Pack 03);  
- mô tả hooks cho SLA, priority, exception trong các pattern inbound;  
- đề xuất các guardrails và anti-pattern khi thiết kế inbound integration;
- chuẩn bị nền cho docs mapping, error handling, observability, config/policy inbound.

## 2. Thesis về inbound integration

Thesis có thể phát biểu như sau:

> **Inbound integration không chỉ là “đổ dữ liệu vào Nextflow”, mà là quyết định chuyện gì trở thành data nền (master), chuyện gì trở thành work (tasks/cases), chuyện gì chỉ là context thêm và chuyện gì là tín hiệu để thay đổi SLA/priority/exception. Nếu inbound integration chỉ copy fields mà không kích hoạt hoặc cập nhật luồng công việc, Nextflow OS vẫn bị coi là một kho dữ liệu chứ không phải một hệ điều phối.**

Nguyên lý:

1. Mọi inbound phải được map rõ: vào **data** (entities) hay vào **work** (tasks/cases) hay cả hai.  
2. Inbound events nên sử dụng **semantics đã có** của Pack 02–03–04 (entities, states, outcomes), không tạo khái niệm mới vô tội vạ.  
3. Patterns inbound nên ưu tiên **event-driven cho work**, batch cho master data, API cho tra cứu/ghi tức thời.  
4. Inbound phải tôn trọng **authority, continuity** – không cho phép hệ ngoài “bẻ” state/decision vượt quyền hoặc gây inconsistency.  
5. Inbound cần có **observability và error handling**: thấy được cái gì vào, cái gì fail, cái gì tạo work, cái gì bị bỏ qua.  
6. Inbound patterns phải **pilot được** trên subset, không ép toàn hệ từ ngày đầu.

## 3. Phân loại pattern inbound ở mức cao

Pack 05 định nghĩa 3 nhóm pattern inbound chính:

1. **Master data sync inbound** – đồng bộ dữ liệu nền (customer, location, product, price, user, role mappings).  
2. **Work-generating inbound** – inbound tạo tasks/cases hoặc work items (orders, tickets, alerts, appointments, complaints).  
3. **State-updating inbound** – inbound cập nhật trạng thái/field của work/cases hiện có (payment status, delivery status, external review results).

Mỗi nhóm lại có thể dùng các capability khác nhau: file/batch, APIs, inbound events, connectors.

## 4. Master data sync inbound patterns

### 4.1 Mục tiêu

Đảm bảo Nextflow OS có dữ liệu nền cần thiết (customers, locations, inventory, users) để UX và orchestration hoạt động đúng, mà không trở thành source-of-truth duy nhất một cách giả tạo.

### 4.2 Patterns điển hình

1. **Initial bulk import** (file/batch)  
   - Dùng file/batch (capability 1) để load ban đầu từ ERP/CRM vào Nextflow.  
   - Quy trình:  
     - mapping fields với data model Pack 02;  
     - validation & error feedback (Pack 03);  
     - metrics về hàng nhập thành công/lỗi;  
     - không tạo tasks/cases, chỉ populate master.

2. **Scheduled delta import** (file/batch hoặc APIs)  
   - Định kỳ (vd hàng đêm) pull dữ liệu mới/đổi (delta) từ hệ ngoài.  
   - Có thể dùng APIs hoặc file incremental.  
   - Chú ý idempotency & xử lý delete/merge.  
   - Thường vẫn không tạo work trực tiếp.

3. **Event-driven master sync** (inbound events)  
   - Hệ ngoài phát events khi có master changes (customer_created/updated, location_moved).  
   - Nextflow cập nhật local master data theo event.  
   - Phù hợp khi volume không quá lớn và cần near-real-time.

### 4.3 Liên kết với Packs 03–04

- UX Pack 03:  
  - forms/search/filters dựa vào master data;  
  - cần copy/empty/error states khi master data thiếu hoặc outdated.  
- Orchestration Pack 04:  
  - trong đa số trường hợp, master sync **không** tạo tasks/cases;  
  - ngoại lệ: certain master changes có thể trigger review tasks (vd new high-value customer → create onboarding case).

## 5. Work-generating inbound patterns

### 5.1 Mục tiêu

Biến các events/transactions từ hệ ngoài thành **work trong Nextflow** – tasks/cases – để Pack 04 orchestrate.

### 5.2 Patterns chính

1. **Event → Case/Task Creation**  
   - Inbound event (order_created, complaint_logged, sensor_alert) tới Nextflow.  
   - Mapping:  
     - identify entity references (customer, location);  
     - tạo case hoặc task theo lifecycle model (68);  
     - set initial SLA & priority (71);  
     - route tới queue/team/owner (69).  
   - Use case:  
     - order từ hệ e-commerce tạo fulfilment tasks;  
     - complaint từ CRM tạo resolution case;  
     - sensor alert tạo field inspection task.

2. **Batch → Task List**  
   - File/batch inbound (vd plan visits, scheduled audits) → tạo danh sách tasks.  
   - Mỗi dòng file là một task (hoặc case) với metadata cần thiết.  
   - Task được lifecycle 68 quản lý; SLA & priority set theo rules 71.

3. **API Call → Immediate Case Creation**  
   - Hệ ngoài gọi Nextflow API để ngay lập tức tạo case/task khi user action xảy ra.  
   - Phù hợp flows cần feedback nhanh (vd customer service portal mở ticket).  

### 5.3 Hooks lifecycle, SLA, exception

- Lifecycle: tasks/cases mới thường bắt đầu ở `Created/Ready/In Queue` (68).  
- SLA: set SLA start based on event time (cần reconcile với offline/clock issues).  
- Exception: nếu payload thiếu thông tin critical, có thể:  
  - từ chối tạo case và log error;  
  - hoặc tạo **exception case** yêu cầu bổ sung (72).

## 6. State-updating inbound patterns

### 6.1 Mục tiêu

Cho phép hệ ngoài **cập nhật trạng thái** hoặc fields của tasks/cases/lifecycle trong Nextflow, mà vẫn tôn trọng authority, continuity và semantics.

### 6.2 Patterns chính

1. **Status Update Events**  
   - Event từ hệ ngoài (payment_settled, shipment_delivered, external_approval_granted) map vào lifecycle transitions hoặc field updates.  
   - Nextflow nhận event, kiểm tra mapping & authority, rồi:  
     - update fields; hoặc  
     - trigger lifecycle transition (vd Pending External → Resolved).  

2. **API-driven State Change**  
   - Hệ ngoài gọi API Nextflow để yêu cầu change state (vd close case khi external system done).  
   - Cần kiểm tra authority như user action (Pack 03/04).

3. **Hybrid**  
   - Event tới Nextflow → được ghi nhận;  
   - rule (Pack 04) quyết định có nên chuyển state auto hay chỉ flag “external status: X”.

### 6.3 Guardrails

- Không cho external systems **bypass authority**, vd external approval không thể auto-approve case mà role nội bộ không có quyền.  
- State changes phải align với lifecycle (68); không “nhảy” từ Created → Closed mà bỏ qua phases quan trọng nếu workflow không cho phép.  
- Offline & eventual consistency (53): nếu field user đã làm việc nhưng event external đến muộn, cần patterns reconciliation.

## 7. Mapping inbound payload → data & work

Tài liệu nhấn mạnh cấu trúc mapping:

1. **Identify canonical entities** (Pack 02) – khách, địa điểm, sản phẩm, đơn, case, task.  
2. **Decide target**:  
   - chỉ update entities?  
   - tạo/updated tasks/cases?  
   - cả hai?  
3. **Map fields**:  
   - required/optional;  
   - defaults;  
   - transformation (đơn vị, format, codes).  
4. **Attach work semantics**:  
   - lifecycle phase start;  
   - SLA & priority;  
   - queue/team/owner;  
   - exception flags nếu thiếu hoặc nghi ngờ.

Các doc 82 (mapping) và 83 (error/reconciliation) sẽ đi sâu hơn, nhưng doc 79 đặt khung chung.

## 8. Observability cho inbound

Inbound integration phải observable:

- Metrics:  
  - số inbound events/records per source;  
  - tỉ lệ success/fail;  
  - tỉ lệ inbound events tạo work vs bỏ qua;  
  - time từ event đến task creation;  
  - số exception cases do inbound.  
- Events:  
  - `inbound_payload_received`, `inbound_payload_validated`, `inbound_payload_rejected`;  
  - `inbound_work_created`, `inbound_work_updated`;  
  - `inbound_exception_created`.  
- Dashboards:  
  - view health inbound per integration (84);  
  - work views (73) hiển thị nguồn của tasks/cases (internal vs inbound X).

## 9. Anti-pattern inbound integration cần tránh

1. Treat inbound như chỉ là “import data” mà không nghĩ về work/lifecycle/SLA.  
2. Cho phép external system trực tiếp set state/owner mà không check authority.  
3. Không có mapping rõ: fields từ hệ ngoài gán bừa vào fields tạm trong Nextflow.  
4. Không log inbound hoặc chỉ log raw files không structure.  
5. Thiết kế inbound gắn chặt với lô-gic cụ thể của một khách, không qua patterns/policy, khó reuse.  
6. Nhận mọi event mà không filter, làm system ngập noise.

## 10. Bàn giao sang doc Pack 05 tiếp theo

Inbound Event and Data Integration Patterns là nền cho:

- **82 Data Mapping and Transformation Guide** – chi tiết hoá mapping giữa external models và Nextflow.  
- **83 Error Handling, Retry and Reconciliation Patterns** – mô tả cách xử lý khi inbound fail hoặc out-of-sync.  
- **84 Integration Observability and Health Dashboards Requirements** – metrics và dashboards cho inbound gồm cả work-level.  
- **86 Integration Configuration and Policy Modeling Guide** – policy để bật/tắt, scope, mapping inbound per customer.  
- **87 Integration Pilot Patterns and Go-Live Playbook** – cách pilot & rollout inbound integration.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Inbound Event and Data Integration Patterns của Pack 05:

1. Inbound integration được phân thành 3 nhóm: master data sync, work-generating, state-updating.  
2. Mọi inbound phải được map rõ vào data/core (Pack 02) và work/lifecycle (Pack 04) theo semantics Pack 03.  
3. Inbound phải tôn trọng authority, continuity, SLA và exception semantics, không được bypass.  
4. Inbound phải observable và pilotable; mọi integration inbound phải có cách đo và cải tiến.  
5. Các doc Pack 05 tiếp theo (mapping, error, observability, config, pilot) sẽ dựa trên patterns này để chi tiết hoá.

## 12. Điều kiện hoàn thành của tài liệu

Inbound Event and Data Integration Patterns được xem là đạt yêu cầu khi:
- đội Product/Platform/Integration có chung ngôn ngữ về inbound patterns;  
- yêu cầu tích hợp inbound mới có thể map vào một (hoặc combination) pattern đã định nghĩa;  
- docs mapping/error/observability/policy/pilot có khung để bám;  
- và inbound integration của Nextflow OS thúc đẩy work orchestration, không chỉ là đổ dữ liệu.

## AG Execution Prompt

You are acting as an inbound integration patterns architect, data-to-work mapper, and guardrail designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–04 define data, experience and orchestration; Pack 05 defines integration.
- This document defines how inbound events and data should become data and work in Nextflow.

### Objective
Refine these inbound patterns into a clear set of patterns and decisions that teams can apply when designing integrations that feed Nextflow OS.

### Inputs
- Use this document, Pack 05 overview & capability taxonomy (77–78), and Packs 02–04 semantics as context.
- Preserve the three inbound pattern families and their connection to lifecycle and work.  
- Keep patterns SME-focused and explainable.

### Tasks
1. Clarify pattern definitions with examples.  
2. Sharpen the mapping from inbound payloads to data and work.  
3. Specify key events and metrics for inbound observability.  
4. Highlight authority and continuity guardrails.  
5. Identify anti-patterns and when to pick each pattern.

### Constraints
- Do not over-specialize patterns to one domain; keep them generic but concrete.  
- Do not ignore Packs 03–04 semantics on states, roles, and continuity.  
- Do not design infrastructure-level details; stay at product/platform pattern level.  
- Keep guidance actionable for Product, Platform and Solution teams.

### Output Format
Return a revised markdown document with these sections:
1. Inbound Patterns Thesis
2. Pattern Families and Examples
3. Mapping Inbound Payloads to Data and Work
4. Observability, Guardrails and Anti-Patterns

### Acceptance Criteria
- The output must help teams design inbound integrations that drive work, not just copy data.  
- The result must align with Packs 02–04 and Pack 05 capability taxonomy.  
- The patterns must be reusable across wedges and customers.  
- The document must be understandable to non-developers collaborating on integration design.
