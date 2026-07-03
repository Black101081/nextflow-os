# Nextflow OS – Pack 05 Integration Error Handling, Retry and Reconciliation Patterns

**Document ID:** 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS  
**Pack:** 05 — Integration and Extensibility  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Integration / Reliability / Support & Ops  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 06 Operations & Governance  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 66_PACK03_SUMMARY_AND_USAGE_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Integration Error Handling, Retry and Reconciliation Patterns** cho Pack 05. Sau khi đã:
- biết cách nhận/gửi dữ liệu (79 inbound, 80 outbound);  
- khóa lại identity & tenant boundaries (81);  
- thống nhất canonical model & mapping (82);  

…tài liệu này trả lời câu hỏi:

> **Khi integration gặp lỗi, chậm, mất kết nối hoặc dữ liệu không khớp, Nextflow OS nên phản ứng như thế nào – tự retry, tạo exception, dừng flow, hay mở work cho con người xử lý? Làm sao để retry an toàn (idempotent), tránh double effect, và có chỗ để reconcile dữ liệu khi hai hệ đã diverge?**

Mục tiêu:
- phân loại lỗi integration và chiến lược xử lý;  
- định nghĩa patterns retry và idempotency cho inbound/outbound;  
- mô tả patterns reconciliation (tự động, bán tự động, thủ công);  
- liên kết error handling với lifecycle, SLA, exceptions, work queues;  
- làm nền cho observability (84), config/policy (86) và pilot (87).

## 2. Thesis về lỗi, retry và reconciliation

Thesis có thể phát biểu như sau:

> **Integration tốt không phải là integration “không bao giờ lỗi”, mà là integration biết cách lỗi một cách an toàn, nhìn thấy được, và có đường ra. Khi hệ ngoài down, khi payload sai, khi status không map được, Nextflow phải bảo vệ work, bảo vệ khách hàng, và tạo chỗ cho con người can thiệp, thay vì âm thầm bỏ qua hoặc lặp vô hạn.**

Nguyên lý:

1. Chấp nhận rằng lỗi integration là bình thường – thiết kế **trước** cách xử lý.  
2. Phân biệt rõ lỗi **tạm thời** (transient) và lỗi **bền** (permanent).  
3. Retry phải đi kèm **idempotency** – gọi lại không gây double bookings/orders/payments.  
4. Không “nuốt lỗi”; mọi lỗi quan trọng phải có **signal**, **observability** và (khi cần) **work item** rõ để xử.  
5. Khi dữ liệu hai hệ diverge, cần **reconciliation patterns** rõ: auto, semi-auto, manual.  
6. Error handling của Pack 05 phải align với **exception handling Pack 72** và **mobile eventual consistency Pack 53**.  
7. SME users & ops phải hiểu được trạng thái “đang lỗi gì, đang retry gì, cần làm gì”.

## 3. Phân loại lỗi integration ở mức cao

### 3.1 Theo hướng dữ liệu

- **Inbound errors (external → Nextflow)**: payload invalid, auth fail, mapping fail, conflict state.  
- **Outbound errors (Nextflow → external)**: timeouts, 5xx, rate limiting, validation fail, business rule reject.

### 3.2 Theo tính chất

- **Transient errors** – có khả năng tự hết:  
  - network issues, timeouts;  
  - temporary 5xx;  
  - rate limiting (429).  
- **Permanent errors** – không thể tự hết bằng retry:  
  - invalid payload/schema;  
  - auth/permission lỗi;  
  - mapping không có rule;  
  - business rule reject (vd credit check fail, order invalid).  
- **Divergence errors** – hai hệ đã có state khác nhau:  
  - record bị xoá/đổi state bên external;  
  - mapping thay đổi giữa chừng;  
  - concurrent updates.

## 4. Inbound error handling patterns (external → Nextflow)

### 4.1 Validation & schema errors

Use case: external gửi payload thiếu field bắt buộc, sai kiểu, hoặc không theo schema đã công bố.

Pattern:
- reject request với lỗi rõ ràng (4xx) nếu sync API;  
- nếu async/event, đưa message vào **dead-letter queue (DLQ)** hoặc tạo **exception case** theo Pack 72;  
- log lỗi với chi tiết field sai, tenant, integration id;  
- không tạo/đổi state tasks/cases nếu payload không hợp lệ.

### 4.2 Auth & tenant mapping errors

Use case: token hết hạn, signature webhook sai, tenant không resolve được.

Pattern:
- reject ngay (401/403) nếu API sync;  
- không retry tự động;  
- raise **integration exception** (type `AuthFailure` / `TenantMappingFailure`);  
- bề mặt trong views observability (73, 84) để admin sửa config/creds.  
- nếu lỗi tenant mapping, không đoán tenant – fail fast.

### 4.3 Mapping & semantic errors

Use case: enum/status external không tìm thấy mapping; ID external không match record nào trong Nextflow; combination fields không hợp lệ.

Pattern:
- dùng fallback mapping (vd enum → `Unknown/Other`) nếu cho phép;  
- hoặc tạo **exception case** `DataMismatch`/`MappingMissing` cho hàng lỗi;  
- gắn inbound message ID/external ID vào exception để trace;  
- optionally cho phép user sửa mapping (qua config 86) và **replay** messages sau khi update mapping.

### 4.4 Conflict & concurrency errors

Use case: external muốn update task/case đã đóng, hoặc state transition không hợp lệ theo lifecycle Pack 68.

Pattern:
- reject transition không hợp lệ (4xx) với message rõ;  
- optionally tạo **exception case** nếu đây là tình huống business cần xử tay (vd khách đổi yêu cầu sau khi case closed);  
- sử dụng versioning/ETag hoặc timestamps để detect concurrent updates;  
- nếu cần, cung cấp API để external fetch current state và quyết định lại.

## 5. Outbound error handling patterns (Nextflow → external)

### 5.1 Timeouts & transient connectivity

Use case: Nextflow gọi API external nhưng timeout hoặc network issue.

Pattern:
- mark call là **transient failure**, queue cho retry với **exponential backoff**;  
- không block UX – chuyển work sang trạng thái `Pending External` trong lifecycle (68);  
- nếu hết retry window mà vẫn lỗi, tạo **exception case** `ExternalUnreachable`;  
- log tất cả attempts với timestamps, status, correlation IDs.

### 5.2 5xx và rate limiting

Use case: external trả 5xx hoặc 429 (too many requests).

Pattern:
- treat 5xx như transient, retry với backoff;  
- với 429, tôn trọng headers `Retry-After` nếu có, điều chỉnh tốc độ gửi;  
- nếu rate limiting là chronic, xem xét **throttling** và batch;  
- expose metrics error & rate limiting trong dashboards (84) cho ops tối ưu.

### 5.3 4xx validation & business rule errors

Use case: payload Nextflow gửi bị external reject vì invalid hoặc vi phạm business rules.

Pattern:
- **không retry tự động** nếu 4xx thuộc loại permanent (vd 400, 422 business rule);  
- tạo **exception case** kèm message lỗi external, payload liên quan;  
- gắn lại với tasks/cases bị ảnh hưởng để user thấy;  
- cho phép user sửa dữ liệu và **re-trigger outbound** (manual replay) nếu phù hợp.

## 6. Retry patterns và idempotency

### 6.1 Retry queues và policies

Nextflow nên có **retry queues** per integration/endpoint.

- Configurable policy:  
  - max attempts;  
  - backoff strategy;  
  - retryable vs non-retryable errors (theo status code, type).  
- Retry không nên chặn UX; work có thể tiếp tục nhưng ở state thể hiện rõ “đang chờ external”.

### 6.2 Idempotency keys

Để tránh double effect khi retry: payments, orders, record creation.

Pattern:
- Sinh **idempotency key** per business operation (vd per case, per payment attempt).  
- Gửi cùng key trong mọi retry; external phải treat key này và **return cùng kết quả** nếu request đã được xử lý.  
- Lưu mapping key → outcome trong Nextflow để reconcile.

### 6.3 Outbox & exactly-once semantics (ở mức business)

- Nextflow có thể dùng **outbox pattern**: ghi outbound events/commands vào store nội bộ trước, sau đó worker gửi ra external với retry.  
- Mục tiêu không phải exactly-once ở mức kỹ thuật, mà là **exactly-once ở mức business** nhờ idempotency & reconciliation.  
- Khi worker crash hoặc network lỗi, record trong outbox vẫn còn để retry sau.

## 7. Reconciliation patterns

### 7.1 Auto reconciliation

Use case: chênh lệch nhỏ, rule rõ ràng, có thể giải quyết tự động.

Patterns:
- Scheduled **sync jobs** để so sánh snapshots (Nextflow vs external) theo IDs;  
- auto-fix discrepancies không critical (vd mirror status cho CRM view).  
- log hành động auto-fix để audit.

### 7.2 Semi-auto (assisted) reconciliation

Use case: chênh lệch cần con người quyết định nhưng hệ thống có thể đề xuất.

Patterns:
- Tạo **reconciliation tasks/cases** cho ops với:  
  - view “side-by-side” dữ liệu Nextflow & external;  
  - suggestions (vd “theo policy, nên dùng state X”).  
- Cho phép user chọn: keep Nextflow, keep external, hoặc merge;  
- Sau khi người dùng quyết, hệ thống sync lại cả hai phía nếu cần.

### 7.3 Manual & exception-driven reconciliation

Use case: divergence lớn, policy phức tạp, ít xảy ra.

Patterns:
- Tạo **exception cases** theo Pack 72 với type `IntegrationReconciliationRequired`;  
- Gán tới queue đội ops/supervisor;  
- Cung cấp playbook (Pack 72 + Pack 06) hướng dẫn xử lý;  
- Log kết quả quyết định và cập nhật mapping/policy nếu cần.

## 8. Liên kết với lifecycle, SLA, exceptions và queues

### 8.1 Lifecycle states cho integration

- Bổ sung/chuẩn hoá một số trạng thái lifecycle (68) liên quan integration:  
  - `Pending External` – chờ external system;  
  - `Integration Error` – lỗi cần attention;  
  - `Reconciliation Required` – divergence cần xử lý.  
- Transitions giữa states phải align với exceptions (72) và SLA (71).

### 8.2 SLA impact và pausing

- Khi chờ external (transient errors), có thể cần **pause hoặc adjust SLA** (vd “clock stop” khi lỗi do external).  
- Policy Pack 04/06 sẽ định nghĩa khi nào SLA được tạm dừng; Pack 05 cần emit events để BI hiểu.  
- Lỗi integration không nên âm thầm làm breach SLA mà không explain.

### 8.3 Work queues cho exceptions & reconciliation

- Exceptions & reconciliation tasks nên đi vào **queues riêng** (69):  
  - Integration Exceptions;  
  - Data Reconciliation;  
  - Mapping Review.  
- Routing rules (69–70) xác định ai xử loại lỗi nào (ops, admin, product, IT).

## 9. Observability hooks cho lỗi và retry

- Events (liên quan 49, 73, 84):  
  - `integration_call_started/completed/failed`;  
  - `retry_scheduled/exhausted`;  
  - `reconciliation_case_created/resolved`.  
- Metrics:  
  - error rate per integration/endpoint;  
  - retry counts;  
  - thời gian từ lỗi → resolution;  
  - số lượng divergence cases mở/đóng.  
- Dashboards (84):  
  - view health per integration;  
  - top error types;  
  - correlation giữa integration errors và SLA breaches, customer impact.

## 10. Configuration & policy cho error/retry/reconciliation

- Pack 74 & 86 sẽ định nghĩa model config/policy cho:  
  - max retries, backoff;  
  - retryable vs non-retryable errors;  
  - auto vs semi-auto vs manual reconciliation;  
  - SLA pause rules khi lỗi external.  
- Config nên:  
  - có defaults hợp lý cho SME;  
  - cho phép override per tenant/integration khi cần;  
  - có audit trail cho mọi thay đổi policy.

## 11. Anti-patterns cần tránh

1. Retry vô hạn một lỗi permanent (vd payload sai schema) – vừa tốn tài nguyên vừa spam external.  
2. Không dùng idempotency keys cho các operation critical – dẫn đến double charge/double order.  
3. Nuốt lỗi – log ở đâu đó nhưng không tạo signal/work; chỉ phát hiện khi khách phàn nàn.  
4. Dồn mọi lỗi integration vào cùng một queue “Support” không phân loại, khiến đội vận hành bị ngập.  
5. Không có reconciliation patterns; chấp nhận data diverge “mãi mãi” giữa Nextflow và external.  
6. Gắn lỗi integration trực tiếp vào UX người cuối mà không giải thích, gây cảm giác app “hỏng”.

## 12. Bàn giao sang docs Pack 05 & Pack 06 tiếp theo

Integration Error Handling, Retry and Reconciliation Patterns là nền cho:

- **84 Integration Observability and Health Dashboards Requirements** – metrics, events và views dựa trên patterns lỗi/retry/reconciliation này.  
- **86 Integration Configuration and Policy Modeling Guide** – model hoá config/policies cho lỗi & retry.  
- **87 Integration Pilot Patterns and Go-Live Playbook** – thiết kế pilot để intentionally test lỗi, retry và reconciliation.  

Đồng thời, doc này là input quan trọng cho Pack 06 khi thiết kế controls & playbooks vận hành.

## 13. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Error Handling, Retry and Reconciliation của Pack 05:

1. Lỗi integration được phân loại thành inbound/outbound, transient/permanent/divergence với chiến lược rõ.  
2. Retry luôn đi kèm idempotency và không block UX; work có states thể hiện rõ “đang chờ external” hoặc “cần reconcile”.  
3. Exceptions & reconciliation được model như work thật, với queues, SLA và playbook, không phải “việc tay” vô hình.  
4. Observability (events, metrics, dashboards) là một phần của error handling, không phải phụ kiện.  
5. Policy/config cho lỗi & retry phải có defaults, override được, và governed – không hard-code.

## 14. Điều kiện hoàn thành của tài liệu

Integration Error Handling, Retry and Reconciliation Patterns được xem là đạt yêu cầu khi:
- đội Product/Platform/Integration/Ops có chung ngôn ngữ về lỗi, retry, reconciliation;  
- mọi integration mới đều có strategy rõ cho lỗi & reconciliation, test được trong pilot;  
- khi hệ ngoài down hoặc mapping lỗi, Nextflow vẫn bảo vệ work và khách hàng, có đường ra cho con người;  
- và dashboard observability làm hiện rõ health của integrations thay vì để lỗi ẩn.

## AG Execution Prompt

You are acting as an integration reliability architect, exception handling designer and reconciliation playbook author.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–04 define data, UX and work orchestration; Pack 05 defines integration; Pack 06 defines governance and operations.
- This document defines how integrations should fail, retry and reconcile.

### Objective
Refine these error handling, retry and reconciliation patterns into practical guidance that can be applied across integrations and pilots.

### Inputs
- Use this document, inbound/outbound patterns (79–80), identity/tenant boundaries (81), mapping guide (82), and exception handling (72, 53) as context.  
- Preserve focus on safety, idempotency and human-in-the-loop reconciliation.  
- Keep patterns understandable to Product, Ops and Support teams.

### Tasks
1. Clarify error categories and handling strategies.  
2. Sharpen retry and idempotency patterns.  
3. Define reconciliation flows (auto, semi-auto, manual).  
4. Highlight lifecycle/SLA impacts and queue design.  
5. Identify observability hooks and configuration needs.

### Constraints
- Do not design low-level infra implementation; stay at pattern and product capability level.  
- Do not break Packs 02–04 semantics or Pack 06 governance.  
- Do not assume “no errors” – embrace real-world failures.  
- Keep language accessible to cross-functional stakeholders.

### Output Format
Return a revised markdown document with these sections:
1. Error Thesis and Categories
2. Retry and Idempotency Patterns
3. Reconciliation Flows and Work Modeling
4. Lifecycle, SLA and Queue Implications
5. Observability, Policy and Anti-Patterns

### Acceptance Criteria
- The output must make integration failure modes and responses explicit và có thể lặp lại.  
- The result must align with inbound/outbound, identity/tenant, mapping and exception handling docs.  
- The patterns must be usable in real integration projects and pilots.  
- The document must help teams thiết kế và debug integrations trong điều kiện lỗi thật.
