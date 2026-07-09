# Nextflow OS – Pack 05 Data Mapping and Transformation Guide

**Document ID:** 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE  
**Pack:** 05 — Integration and Extensibility  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Integration / Data Architecture / Product  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 06 Operations & Governance  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 66_PACK03_SUMMARY_AND_USAGE_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Data Mapping and Transformation Guide** cho Pack 05. Sau khi đã rõ chúng ta **nhận gì** (79 inbound), **gửi gì** (80 outbound) và **ai/tenant nào** (81 identity & tenant), tài liệu này trả lời câu hỏi:

> **Khi Nextflow OS nói chuyện với hệ khác, dữ liệu của hai bên không bao giờ trùng khít. Làm thế nào để map entity, field, enum, status, SLA, exception… giữa Nextflow và external theo cách có thể giải thích, kiểm soát và tiến hóa, thay vì thành mớ “mapping hard-code” khó bảo trì?**

Mục tiêu:
- đưa ra principles & patterns cho data mapping giữa Nextflow và hệ ngoài;  
- định nghĩa khung canonical model của Nextflow và cách align với models external;  
- mô tả patterns transform: field mapping, enum/status mapping, derived fields, enrichment, masking;  
- liên kết mapping với lifecycle, SLA, exceptions, authority;  
- làm nền cho error handling, reconciliation (83) và config/policy modeling (86).

## 2. Thesis về data mapping & transformation

Thesis có thể phát biểu như sau:

> **Integration không phải là ép Nextflow trông giống mỗi hệ external, mà là giữ một canonical model rõ ràng và có lớp mapping/transform đứng giữa. Mapping tốt là mapping mà sau này người khác đọc lại vẫn hiểu “tại sao status X bên hệ A được map sang state Y bên Nextflow”, và có thể điều chỉnh mà không phá toàn bộ flow.**

Nguyên lý:

1. Nextflow giữ một **canonical model** cho tasks, cases, entities, SLA, exceptions… (dựa trên Packs 02–04); không để external “lái” model core.  
2. Mapping phải **có tài liệu**: entity-level, field-level, enum/status-level, cùng lý do.  
3. Transform nên **cấu hình được** ở mức hợp lý (per integration/tenant) thay vì hard-code trong code khó đổi.  
4. Mapping phải **semantically đúng** – đặc biệt với status/lifecycle, priority, SLA, exceptions.  
5. Mọi mapping quan trọng nên có **fallback** (vd unknown, other) và error handling rõ ràng.  
6. Mapping và transforms phải tôn trọng **identity, tenant, authority, masking & privacy** (Pack 06).  
7. Đừng cố “perfect mapping ngay từ đầu” – chấp nhận iterative, nhưng phải có chỗ để cải tiến.

## 3. Canonical model của Nextflow trong integration

### 3.1 Entities cốt lõi

Ở mức integration, Nextflow có một số entities canonical:

- **Task** – đơn vị công việc nhỏ, có lifecycle (68), assignment (69), SLA (71).  
- **Case** – nhóm tasks/work liên quan, có lifecycle riêng.  
- **Party** – khách hàng, đối tác, user; có thể liên kết external IDs (CRM, ERP).  
- **Work type / template** – định nghĩa loại công việc, rules, SLA defaults.  
- **Exception case** – work đặc biệt cho exceptions (72).  
- **Signal / event** – ghi nhận sự kiện lifecycle, SLA, automation (49, 70, 75).

### 3.2 Types của dữ liệu integration

- **Master data** – định nghĩa: party, catalogue, products, configuration.  
- **Transactional data** – tasks, cases, orders, invoices, approvals.  
- **Reference data** – enums, codes, status lists, error codes.  
- **Analytics/observability data** – events, metrics, logs (73, 84).

Mapping phải chỉ rõ data thuộc loại nào, để xử lý lifecycle & ownership đúng.

## 4. Patterns mapping entity-level

### 4.1 1-1, 1-n, n-1 và n-n

- **1-1** – một case Nextflow ↔ một ticket trên external helpdesk.  
- **1-n** – một order external ↔ nhiều tasks trong Nextflow (vd pick, pack, ship).  
- **n-1** – nhiều items external ↔ một case Nextflow.  
- **n-n** – nhiều entities hai bên liên kết qua join table.

Mỗi integration phải document rõ mapping cardinality, kèm logic tạo/cập nhật.

### 4.2 External reference IDs

- Nextflow nên lưu **external_reference_id(s)** trên tasks/cases/parties để trace back.  
- External systems cũng nên lưu **nextflow_id** (vd task_id/case_id).  
- Quy ước ID phải rõ, không lẫn giữa tenants/environments.

### 4.3 Ownership và source-of-truth

- Cho mỗi entity (vd party/master data), xác định **source-of-truth**: Nextflow hay external?  
- Inbound patterns (79) dùng khi external là source-of-truth; outbound (80) khi Nextflow là lead; bidirectional phải có conflict resolution (83).  
- Mapping không được che mờ ownership – docs phải nêu rõ.

## 5. Patterns mapping field-level

### 5.1 Field mapping cơ bản

- Dạng đơn: `external.customer_name` ↔ `nextflow.party.display_name`.  
- Dạng phức: concatenate/split, normalize formats (phone, email, address).  
- Date/time: luôn convert vào **canonical timezone/format** của Nextflow (Pack 02), lưu thêm original nếu cần.

### 5.2 Derived fields và enrichment

- Một field Nextflow có thể được **derive** từ nhiều field external (vd SLA priority từ `order_value` + `customer_tier`).  
- Nextflow có thể **enrich** dữ liệu external bằng metadata nội bộ (vd risk score, historical performance).  
- Cần document logic derivation để analytics hiểu.

### 5.3 Masking và privacy

- Một số fields (PII, sensitive) có thể bị **masking** hoặc không sync sang external.  
- Mapping phải chỉ rõ: field nào được chia sẻ, field nào bị mask/ẩn, theo tenant/policy.  
- Pack 06 sẽ định nghĩa thêm controls, nhưng Pack 05 phải chuẩn bị hook.

## 6. Patterns mapping enum, status, lifecycle

### 6.1 Enum/status mapping

- External có thể có status như `NEW`, `IN_PROGRESS`, `PENDING_CUSTOMER`, `CLOSED`.  
- Nextflow có lifecycle chuẩn (68) với states như `Open`, `In Progress`, `Waiting`, `Resolved`, `Closed`, v.v.  
- Mapping phải design theo **nghĩa**, không chỉ theo tên giống nhau.

Ví dụ:  
- `NEW` → `Open`;  
- `IN_PROGRESS` → `In Progress`;  
- `PENDING_CUSTOMER` → `Waiting` (với wait_reason = `Customer`);  
- `CLOSED` → `Closed` hoặc `Resolved` tuỳ semantics.

### 6.2 SLA và priority mapping

- External có thể có priority `Low/Medium/High/Urgent`; Nextflow có priority model (71) với số/bucket.  
- Mapping có thể:  
  - `Low` → priority 1;  
  - `Medium` → 2;  
  - `High` → 3;  
  - `Urgent` → 4, với flags đặc biệt (vd “expedite”).  
- SLA types (response/resolution) của external phải map sang SLA definitions Nextflow; nếu không match, có thể cần custom SLA profiles.

### 6.3 Exception types và error codes

- Pack 72 định nghĩa exception types (vd `DataMismatch`, `ExternalTimeout`, `PolicyViolation`).  
- External systems có thể có error codes riêng.  
- Mapping cần quy ước: error codes nào map sang exception type nào, severity nào.

## 7. Transformation patterns theo hướng dữ liệu

### 7.1 Inbound (external → Nextflow)

- Validate payload (schema, required fields).  
- Map IDs & entities (cardinality).  
- Map fields (bao gồm normalization & masking).  
- Map enums/status/lifecycle.  
- Áp dụng rules SLA & priority Pack 04.  
- Tạo tasks/cases/parties/exceptions theo inbound patterns (79).

### 7.2 Outbound (Nextflow → external)

- Chọn subset fields; tránh leak sensitive data.  
- Map enums/status/lifecycle từ canonical Nextflow sang codes external.  
- Format data theo yêu cầu external (date/time, decimals, locales).  
- Include external_reference_id nếu có; nếu chưa, external sẽ tạo và trả lại.  
- Log event outbound & kết quả (80).

### 7.3 Batch export và analytics

- Schema export phải dựa trên canonical Nextflow; mapping sang mô hình warehouse/ERP/BIs được docs riêng.  
- Các trường derived (SLA metrics, durations, bottleneck flags) cần định nghĩa rõ để analytics reproducible.

## 8. Multi-tenant context trong mapping

### 8.1 Mapping per tenant/integration

- Mỗi tenant có thể có **mapping khác nhau** cho cùng một external system (vd CRM custom fields).  
- Mapping cấu hình phải support level:  
  - global defaults;  
  - per connector;  
  - per tenant (override).  
- Config & policy modeling (86) sẽ nêu cách store & govern những mapping này.

### 8.2 Environment differences

- Non-prod environments có thể dùng schemas khác (sandbox), nhưng mapping phải **tương thích** với prod về semantics.  
- Mapping changes nên được thử nghiệm ở sandbox trước khi applied production.

## 9. Error handling & reconciliation hooks trong mapping

Mapping thường là nơi phát hiện mismatch; doc này chuẩn bị hooks cho 83:

- Khi không map được enum/status → dùng `Unknown/Other` + raise signal/exception nhẹ.  
- Khi entity mapping không tìm thấy ID:  
  - tạo mới (nếu policy cho phép);  
  - hoặc tạo exception case để human reconcile.  
- Khi mapping logic thay đổi, cần migration strategy cho dữ liệu cũ (vd remap status cũ sang mô hình mới).

## 10. Documentation & tooling

- Mọi integration nên có **mapping spec**:  
  - entities involved, cardinality;  
  - field mappings (directional);  
  - enum/status mappings;  
  - transforms đặc biệt;  
  - privacy/masking rules.  
- Tooling hỗ trợ:  
  - UI/DSL cho config mapping thường gặp (field/enum);  
  - validation & preview (test payload → thấy kết quả mapping);  
  - versioning mapping (để so sánh bản cũ/mới).

## 11. Bàn giao sang docs Pack 05 tiếp theo

Data Mapping and Transformation Guide là nền cho:

- **83 Error Handling, Retry and Reconciliation Patterns** – xử lý khi mapping fail, mismatch, conflict.  
- **84 Integration Observability and Health Dashboards Requirements** – metrics cho mapping errors, unmapped codes.  
- **86 Integration Configuration and Policy Modeling Guide** – model config & policy cho mapping (per tenant/integration).  
- **87 Integration Pilot Patterns and Go-Live Playbook** – pilot mapping trên subset data, monitoring errors.

## 12. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Data Mapping and Transformation trong Pack 05:

1. Nextflow giữ canonical model riêng; mapping/transform là lớp đứng giữa với external, không để external chi phối model core.  
2. Mapping phải được document và (ở mức hợp lý) cấu hình, không chỉ là code rải rác.  
3. Enum/status/lifecycle/SLA/exception mapping phải dựa trên semantics, có fallback và hooks error handling.  
4. Mapping cần hỗ trợ multi-tenant, per-integration variation với governance.  
5. Mapping & transforms là một phần của observability, error handling và pilot, không phải “chi tiết kỹ thuật giấu dưới thảm”.

## 13. Điều kiện hoàn thành của tài liệu

Data Mapping and Transformation Guide được xem là đạt yêu cầu khi:
- đội Product/Platform/Integration có chung ngôn ngữ về canonical model & mapping;  
- mọi integration mới đều có mapping spec rõ ràng và test được;  
- errors về mapping được detect sớm, có chỗ cho reconciliation;  
- và mapping không trở thành “black box” làm tổn hại tới khả năng debug, phân tích, và cải tiến.

## AG Execution Prompt

You are acting as a data integration and mapping architect, lifecycle semantics guardian, and usability translator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–04 define data, UX and orchestration; Pack 05 defines integration; Pack 06 defines governance.
- This document defines how data models and codes map between Nextflow and external systems.

### Objective
Refine these mapping and transformation patterns into concrete, reusable guidance for integration and product teams.

### Inputs
- Use this document, Pack 05 pattern docs (77–81), and Packs 02–04 semantics as context.  
- Preserve focus on canonical model, semantic mapping and configurability.  
- Keep guidance explainable to non-engineers.

### Tasks
1. Clarify canonical entities and data types.  
2. Sharpen field, enum and lifecycle mapping patterns.  
3. Define inbound, outbound and batch transformation flows.  
4. Highlight multi-tenant configuration needs.  
5. Identify error hooks and documentation/tooling requirements.

### Constraints
- Do not design low-level ETL/ELT infra; stay ở mức pattern & product capability.  
- Do not break Packs 02–04 semantics.  
- Do not yêu cầu mọi thứ “perfect mapping” từ ngày đầu; chấp nhận iterative với guardrails.  
- Giữ ngôn ngữ gần gũi với Product, Solution và Ops.

### Output Format
Return a revised markdown document with these sections:
1. Canonical Model and Principles
2. Entity, Field and Enum Mapping Patterns
3. Transformation Flows (Inbound, Outbound, Batch)
4. Multi-Tenant and Configuration Considerations
5. Error Hooks, Documentation and Tooling

### Acceptance Criteria
- The output must make data mapping and transformation for integration explicit, explainable và có thể cấu hình.  
- The result must align với Packs 02–04 và identity/tenant boundaries (81).  
- The patterns must be dùng được cho nhiều wedge và khách SME.  
- The document must be usable by cross-functional teams khi design và review integrations.
