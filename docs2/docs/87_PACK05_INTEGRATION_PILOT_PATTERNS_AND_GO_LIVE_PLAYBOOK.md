# Nextflow OS – Pack 05 Integration Pilot Patterns and Go-Live Playbook

**Document ID:** 87_PACK05_INTEGRATION_PILOT_PATTERNS_AND_GO_LIVE_PLAYBOOK  
**Pack:** 05 — Integration and Extensibility  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Integration / Product / Customer Success / Ops  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 06 Operations & Governance  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 66_PACK03_SUMMARY_AND_USAGE_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS, 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS, 86_PACK05_INTEGRATION_CONFIGURATION_AND_POLICY_MODELING_GUIDE

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Integration Pilot Patterns and Go-Live Playbook** cho Pack 05. Sau khi Pack 05 đã thiết kế:
- capability & patterns (78–80);  
- identity/tenant & mapping (81–82);  
- error/retry/reconciliation (83);  
- observability & dashboards (84);  
- configuration & policy model (86);  

…tài liệu này trả lời câu hỏi:

> **Làm sao để triển khai một integration từ ý tưởng → pilot → go-live production một cách an toàn, học được bài học thật, không phá hỏng work hiện tại của khách, và để mọi đội (Product, Platform, Ops, CS, khách SME) biết họ phải làm gì ở từng bước?**

Mục tiêu:
- định nghĩa patterns cho integration pilot (scope nhỏ, signal-rich, có guardrails);  
- mô tả các bước chuẩn từ thiết kế → sandbox → pilot controlled → rollout;  
- gắn chặt pilot với observability & signal review (55, 84);  
- định nghĩa chuẩn go-live: readiness, cutover, support, rollback;  
- kết nối với governance Pack 06 cho approvals & risk.

## 2. Thesis về pilot và go-live integration

Thesis có thể phát biểu như sau:

> **Integration không nên nhảy thẳng từ “vẽ trên giấy” sang “bật full cho tất cả khách”. SME cần một cách triển khai theo lớp: thử trên sandbox, thả pilot hẹp với khách/flows chọn lọc, đo lường kỹ, rồi mới rollout rộng. Mỗi bước phải có success criteria, guardrails và đường thoát (rollback) rõ ràng.**

Nguyên lý:

1. “Pilot-first by design” – mọi integration quan trọng nên đi qua ít nhất một pilot có design bài bản.  
2. Pilot không chỉ check “có chạy không” mà kiểm tra **behaviour, signals, exceptions, support load, SLA impact**.  
3. Go-live không phải một thời điểm, mà là **chuỗi decisions**: mở dần scope, tăng dần traffic, giảm dần guardrails tạm.  
4. Mọi rollout phải có **runbook** và **rollback plan**.  
5. Khách SME và đội CS/Ops phải được chuẩn bị, không chỉ dev.  
6. Integration pilots là nơi thử nghiệm mapping, retry, observability và config model, không phải làm “đẹp số”.  
7. Mọi pilot nên được tổng kết với decision log (60, 65).

## 3. Khung giai đoạn triển khai integration

Ở mức cao, playbook chia thành 5 giai đoạn:

1. **Discover & Design** – hiểu use case, systems, data, authority, constraints.  
2. **Build & Sandbox** – implement integration trên sandbox, validate flows kỹ thuật.  
3. **Pilot Controlled** – chạy integration trên subset khách/flows/traffic với guardrails.  
4. **Prepare Go-Live** – harden config, training, SLOs, support readiness.  
5. **Rollout & Post-Go-Live** – rollout production theo waves, theo dõi, điều chỉnh.

### 3.1 Giai đoạn 1 – Discover & Design

Deliverables chính:
- Integration brief:  
  - systems tham gia;  
  - mục tiêu business;  
  - user journeys liên quan (Pack 03);  
  - constraints (regulatory, data residency).  
- Draft integration definition (86):  
  - loại integration, patterns inbound/outbound;  
  - entities & mappings high-level (82);  
  - auth/tenant assumptions (81);  
  - error/retry high-level (83).  
- Success criteria sơ bộ:  
  - metrics chính (84, 55);  
  - risk list & mitigation.

### 3.2 Giai đoạn 2 – Build & Sandbox

Mục tiêu: chứng minh integration hoạt động kỹ thuật trong môi trường không ảnh hưởng production.

Hoạt động:
- Thiết kế chi tiết mapping (82), error/retry (83), observability (84).  
- Implement integration using Pack 05 capabilities (APIs, webhooks, connectors).  
- Cấu hình integration definition (86) cho sandbox: endpoints sandbox, test credentials, mapping sandbox.  
- Test functional & failure scenarios:  
  - happy path;  
  - timeouts, 5xx, auth fail, mapping missing;  
  - reconciliation flows;  
  - dashboard views và logs.  
- Chuẩn bị runbook pilot và training note cho đội liên quan.

### 3.3 Giai đoạn 3 – Pilot Controlled

Mục tiêu: thử integration trên **dữ liệu thực** nhưng phạm vi hẹp, học về behaviour & impact.

Scope pilot nên giới hạn theo một hoặc nhiều dimension:
- một vài customers/segments;  
- một vài work types/case types;  
- một vài queues hoặc sites;  
- phần trăm traffic;  
- thời gian giới hạn (vd 4–8 tuần).

Trong pilot:
- bật integration ở production environment nhưng chỉ cho scope này;  
- chạy với guardrails **bảo thủ**: retries nhỏ hơn, alerts nhạy hơn, nhiều exceptions tạo work hơn;  
- dùng dashboards 84 + pilot signal review 55 để quan sát hàng ngày/tuần.  

### 3.4 Giai đoạn 4 – Prepare Go-Live

Mục tiêu: quyết định go/no-go, harden config và chuẩn bị toàn tổ chức.

Hoạt động:
- Review kết quả pilot:  
  - metrics;  
  - lỗi & exceptions;  
  - feedback người dùng;  
  - support load.  
- Chốt các điều chỉnh cần thiết vào integration definition & policies.  
- Xác định rollout plan (waves, cohorts, dates).  
- Đào tạo các đội liên quan; review runbook & rollback.  
- Thiết lập SLOs cho integration, liên kết với SLA cho work.

### 3.5 Giai đoạn 5 – Rollout & Post-Go-Live

Mục tiêu: tăng dần scope tới toàn target, tiếp tục monitor và cải tiến.

Activities:
- Rollout theo waves (theo tenant, queue, vùng, % traffic).  
- Giữ alerting ở mode “nhạy” thời gian đầu go-live.  
- Post-go-live reviews sau 1–2–4 tuần; adjust nếu cần.  
- Xếp integration này vào **BAU operations** với cadences review định kỳ Pack 06.

## 4. Patterns cho thiết kế pilot integration

### 4.1 Chọn scope pilot

Nguyên tắc:
- scope đủ nhỏ để an toàn, đủ lớn để meaningful;  
- chọn flows có volume đủ để thu thập signal nhanh;  
- ưu tiên wedges/khách hợp tác cao, chấp nhận thử nghiệm.

Ví dụ patterns scope:
- Pilot theo **work type**: chỉ áp dụng integration cho 1–2 loại case high-impact nhưng manageable.  
- Pilot theo **queue/team**: chỉ bật cho một nhóm users dễ training.  
- Pilot theo **percentage traffic**: bắt đầu với 5–10% requests, tăng dần.  
- Pilot theo **tenant**: bắt đầu với 1–2 tenant chiến lược.

### 4.2 Guardrails trong pilot

- Retry policies:  
  - tránh retry vô hạn;  
  - thresholds thấp hơn so với BAU để dễ thấy pattern lỗi.  
- Exception modeling:  
  - tạo exception cases rõ;  
  - route về queues pilot team;  
  - SLA pilot cho exceptions riêng.  
- Observability:  
  - dashboard pilot riêng cho integration;  
  - alerts pilot gửi tới war-room channel.  
- Data safety:  
  - giới hạn operations high-risk (payments, cancellations) ở mức thấp;  
  - khi cần, bật **read-only mode** hoặc “shadow mode” (monitor mà chưa act).

### 4.3 Shadow mode và phased activation

Nếu rủi ro cao, nên dùng **shadow mode**:
- Integration nhận events/calls, mapping và compute nhưng **không commit** hành động (vd không tạo orders/payments thật).  
- So sánh output integration với quy trình hiện tại manual;  
- Dùng để tune mapping/rules trước khi bật **active mode**.

Phased activation:
- Phase 1: shadow mode;  
- Phase 2: active chỉ với subset flows;  
- Phase 3: mở dần traffic/scope.

## 5. Pilot metrics, signals và reviews

### 5.1 Metrics pilot

Bổ sung trên nền metrics 84, cho mỗi pilot cần:
- Activation & adoption:  
  - % work trong scope thực sự đi qua integration;  
  - % users trong team sử dụng flow mới.  
- Reliability:  
  - error rate;  
  - retry counts;  
  - số exceptions & reconciliation cases;  
  - thời gian xử lý lỗi.  
- Business impact:  
  - thời gian từ signal → work;  
  - SLA improvement or harm;  
  - giảm manual work/duplicate entry.

### 5.2 Pilot signal review (liên kết doc 55)

- Thiết lập **cadence review** (hàng tuần hoặc 2 tuần) với Product, Platform, Ops, CS, khách key.  
- Dùng dashboards pilot để:  
  - xem pattern lỗi;  
  - review feedback qualitative;  
  - quyết định thử thay đổi mapping/retry/config.  
- Document mọi quyết định trong decision log (60) & retrospective (65).

### 5.3 Criteria go/no-go sau pilot

Ví dụ criteria:
- Reliability:  
  - error rate dưới ngưỡng X%;  
  - không có lỗi critical chưa giải quyết hoặc workaround.  
- Work impact:  
  - không có backlog lớn do integration;  
  - SLA không bị hại overall;  
  - exceptions manageable.  
- Business value:  
  - đạt một số threshold về tiết kiệm thời gian, giảm double entry;  
  - người dùng đánh giá chấp nhận được.  
- Operations readiness:  
  - runbooks được test;  
  - support team hiểu và xử được lỗi thường gặp.

## 6. Go-live planning và cutover patterns

### 6.1 Go-live readiness checklist

Trước go-live, cần check:
- Config & policy (86) đã được review/approve;  
- SLOs & alerts set;  
- runbooks & playbooks up-to-date;  
- training cho Ops/Support hoàn thành;  
- rollback plan sẵn sàng;  
- external partners biết thời điểm go-live và contact points.

### 6.2 Cutover strategies

Patterns go-live:
- **Big-bang** (ít được khuyến nghị): bật 100% traffic vào thời điểm rõ; chỉ dùng khi scope nhỏ hoặc rủi ro thấp.  
- **Phased rollout**: tăng dần % traffic, regions, queues, tenants.  
- **Dual-run**: chạy song song integration mới và flow cũ, so sánh outcomes; khi ổn mới tắt flow cũ.  
- **Feature flag-based**: dùng flags per tenant/queue/work type để bật/tắt nhanh.

### 6.3 Rollback patterns

Nếu gặp sự cố nghiêm trọng:
- tắt integration qua config (86) – disable endpoints, subscriptions;  
- revert mapping/policies về version trước;  
- chuyển work mới về flow cũ;  
- xử lý reconciliation cho work đã đi vào integration mới;  
- log toàn bộ trong incident record (Pack 06) và cập nhật playbook.

## 7. Handover to BAU và continuous improvement

### 7.1 Handover từ project sang operations

Sau go-live ổn định:
- xác định **owner BAU** cho integration (platform vs customer team vs shared);  
- thiết lập cadence review (hàng tháng/quý) cho metrics và incidents;  
- cập nhật runbooks & FAQs theo lessons learned;  
- đảm bảo integration nằm trong scope của monitoring & governance BAU Pack 06.

### 7.2 Continuous improvement

- Sử dụng metrics & feedback để:  
  - refine mapping, retry, alerts;  
  - mở rộng scope integration sang work types/tenants khác;  
  - đề xuất cải tiến product core nếu integration thấy pattern vấn đề lặp lại.  
- Mỗi thay đổi đáng kể nên đi qua mini-pilot trong subset nhỏ trước khi áp dụng rộng.

## 8. Vai trò và trách nhiệm trong pilot & go-live

### 8.1 Product & Solution

- Xác định use case, scope, success criteria.  
- Thiết kế trải nghiệm người dùng liên quan tới integrations (Pack 03).  
- Tham gia pilot signal reviews và quyết định go/no-go.

### 8.2 Platform & Integration

- Thiết kế kiến trúc và patterns reuse Pack 05.  
- Implement và cấu hình integration definitions (86).  
- Đảm bảo observability & error handling theo 83–84.  
- Hỗ trợ runbooks technical và tooling.

### 8.3 Ops & Support

- Vận hành pilot: monitor dashboards, xử lý exceptions & tickets.  
- Cập nhật runbooks, đóng góp feedback usability.  
- Owner BAU sau go-live.

### 8.4 Customer Success & khách SME

- Tuyển chọn pilot users/customers;  
- Thu thập feedback từ người dùng;  
- Chuẩn bị communication/expectations cho rollout;  
- Làm cầu nối khi cần thay đổi quy trình bên khách.

### 8.5 Governance & Security (Pack 06)

- Đánh giá risk của integration;  
- Đảm bảo auth/data policies được tuân thủ;  
- Review & approve thay đổi high-risk;  
- Tham gia post-incident reviews khi sự cố liên quan integration.

## 9. Anti-patterns trong pilot & go-live

1. Bỏ qua sandbox và đi thẳng từ thiết kế sang production.  
2. Pilot chỉ là “bật cho một khách” nhưng không có metrics, dashboards, hay success criteria.  
3. Big-bang rollout cho integration high-risk mà không có phased rollout hoặc rollback plan.  
4. Không chuẩn bị Ops/Support; khi lỗi xảy ra, không ai biết nhìn dashboard nào hay dùng runbook nào.  
5. Không làm retrospective hoặc decision log sau pilot; mọi bài học thất lạc.  
6. Để integration critical mà không có owner BAU rõ ràng.

## 10. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Integration Pilot Patterns and Go-Live của Pack 05:

1. Mọi integration quan trọng nên đi qua ít nhất một pilot có scope rõ, metrics, guardrails và decision log.  
2. Quá trình triển khai integration gồm 5 giai đoạn: Discover & Design, Build & Sandbox, Pilot Controlled, Prepare Go-Live, Rollout & Post-Go-Live.  
3. Pilot và go-live phải sử dụng đầy đủ configuration model (86), error/retry patterns (83) và observability (84).  
4. Go-live không bao giờ là “bật một switch”, mà là một chuỗi quyết định với runbooks và rollback.  
5. Trách nhiệm giữa Product, Platform, Ops, CS, Governance và khách phải được phân định rõ trong pilot & go-live.

## 11. Điều kiện hoàn thành của tài liệu

Integration Pilot Patterns and Go-Live Playbook được xem là đạt yêu cầu khi:
- đội Product/Platform/Ops/CS/Governance có chung ngôn ngữ về cách triển khai integration mới;  
- mọi integration quan trọng có kế hoạch pilot & go-live rõ ràng, được test và review;  
- khi xảy ra sự cố trong rollout, đội ngũ có runbook, rollback và dashboard rõ;  
- và khách SME cảm nhận được sự kiểm soát, không bị “làm chuột bạch” không thông báo.

## AG Execution Prompt

You are acting as an integration rollout architect, pilot designer and go-live facilitator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–04 define data, UX and work orchestration; Pack 05 defines integration; Pack 06 defines governance and operations.
- This document defines how to take integrations from design to pilot to go-live.

### Objective
Refine these pilot and go-live patterns into actionable guidance that can be used repeatedly across customers and wedges.

### Inputs
- Use this document, Pack 05 docs (77–84, 86), pilot signal docs (55, 60, 65) and governance context (Pack 06).  
- Preserve focus on safety, learning and shared responsibility.  
- Keep it understandable to non-technical stakeholders.

### Tasks
1. Clarify rollout phases and deliverables.  
2. Sharpen pilot scope, guardrails and metrics.  
3. Define go-live readiness, cutover and rollback patterns.  
4. Highlight BAU handover and continuous improvement.  
5. Identify roles, responsibilities and anti-patterns.

### Constraints
- Do not assume big-bang rollouts as default; prefer phased/pilot-driven approaches.  
- Do not overload pilots with scope; keep them focused and learnable.  
- Do not centralize everything; empower teams but with guardrails.  
- Keep language accessible to cross-functional project teams.

### Output Format
Return a revised markdown document with these sections:
1. Pilot and Go-Live Thesis
2. Rollout Phases and Pilot Design
3. Metrics, Readiness and Cutover
4. BAU Handover, Roles and Responsibilities
5. Anti-Patterns and Continuous Improvement

### Acceptance Criteria
- The output must make integration rollout a repeatable, safe process.  
- The result must align với configuration, observability, error handling and governance docs.  
- The patterns must be usable across wedges and customer contexts.  
- The document must help teams tránh những sai lầm rollout phổ biến trong SMEs.
