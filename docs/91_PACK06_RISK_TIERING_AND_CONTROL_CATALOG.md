# Nextflow OS – Pack 06 Risk Tiering and Control Catalog

**Document ID:** 91_PACK06_RISK_TIERING_AND_CONTROL_CATALOG  
**Pack:** 06 — Governance and Operations  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Governance & Risk / Security / Platform & Product Leadership  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 78_PACK05_INTEGRATION_CAPABILITY_TAXONOMY_AND_USE_CASES, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS, 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS, 86_PACK05_INTEGRATION_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 87_PACK05_INTEGRATION_PILOT_PATTERNS_AND_GO_LIVE_PLAYBOOK, 88_PACK05_SUMMARY_AND_USAGE_GUIDE, 90_PACK06_GOVERNANCE_AND_OPERATIONS_OVERVIEW_AND_STRATEGY

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Risk Tiering and Control Catalog** cho Pack 06. Sau khi 90 đã đặt khung governance & operations tổng thể, tài liệu này trả lời câu hỏi:

> **Làm sao để chúng ta biết một integration, một automation rule, một thay đổi config hay một pattern data sharing nào đó “nguy hiểm đến mức nào”, và tương ứng cần những controls tối thiểu gì? Nếu không có một khung risk tier rõ, mọi thứ sẽ hoặc là over-controlled (chậm, cứng), hoặc under-controlled (rủi ro).**

Mục tiêu:
- định nghĩa **risk tiers** áp dụng cho integrations, automations, data access/config;  
- mô tả **tiêu chí** để gán tier cho một đối tượng cụ thể;  
- xây một **control catalog**: mỗi tier cần những controls tối thiểu nào về auth, approver, observability, incident SLO, pilot, change management;  
- giúp Product, Platform, Ops, Security nói cùng một ngôn ngữ khi bàn về rủi ro.

## 2. Thesis về risk tiering trong Nextflow OS

Thesis có thể phát biểu như sau:

> **Không phải mọi integration hay automation đều cần CAB, pilot dài, hay incident SLO khắt khe. Nhưng một số thì chắc chắn cần. Risk tiering cho phép chúng ta áp dụng đúng mức độ governance cho đúng thứ, thay vì một tập quy tắc chung làm chậm mọi người hoặc bỏ lọt rủi ro lớn.**

Nguyên lý:

1. Tiering phải **đơn giản vừa đủ** (3–4 tiers), dễ hiểu với đội không chuyên risk.  
2. Tiering phải dựa trên **impact** (đối với data, tiền, SLA, khách) hơn là chỉ dựa complexity kỹ thuật.  
3. Mỗi tier phải gắn với **control set rõ ràng** – không chỉ label.  
4. Tiering phải **bắt nguồn từ Packs 02–05**: data sensitivity, lifecycle impact, automation level, integration criticality.  
5. Tiering không cố “đúng tuyệt đối” ngay từ đầu – nó sẽ được refine qua pilots, incidents và retrospectives.  
6. Tiering phải được bề mặt hóa trong tool (config UI, integration definition) để ai cũng thấy.

## 3. Đối tượng áp dụng risk tier

Pack 06 áp dụng risk tier cho các **“đối tượng”** sau (objects):

1. **Integrations** (Pack 05)  
   - API / webhook / batch / connector / embedded integrations.  

2. **Automation rules & flows** (Pack 04)  
   - rules auto-assign, auto-approve, auto-cancel, auto-route;  
   - composite workflows (multi-step automation).  

3. **Configuration bundles** (Pack 04 & 05)  
   - nhóm thay đổi SLA, routing, mappings, retry policies, work types.  

4. **Data access & sharing patterns** (Pack 02 & 05)  
   - APIs đọc/ghi dữ liệu nhạy cảm;  
   - exports, reports, logs chứa data khách.  

5. **Operational changes**  
   - thay đổi schedules, batch windows;  
   - thay đổi alert thresholds & incident SLO.

Mỗi loại sẽ dùng cùng khung tier (ví dụ Tier 1–4), nhưng có **control cụ thể** hơi khác nhau.

## 4. Đề xuất khung Tier: T1–T4

Chúng ta sử dụng khung 4 tier:

- **Tier 1 – Low Risk**  
  - không chạm dữ liệu nhạy cảm;  
  - không ảnh hưởng trực tiếp lifecycle hoặc SLA;  
  - volume & impact thấp;  
  - dễ rollback, dễ disable.  

- **Tier 2 – Medium Risk**  
  - chạm data quan trọng nhưng không nhạy cảm cao;  
  - impact vừa phải lên workflows;  
  - có thể gây phiền hà nhưng không gây mất tiền hay vi phạm nghiêm trọng.  

- **Tier 3 – High Risk**  
  - chạm dữ liệu nhạy cảm hoặc thông tin kinh doanh quan trọng;  
  - có thể tạo/cancel orders, payments, approvals;  
  - ảnh hưởng trực tiếp SLA nhiều khách;  
  - phụ thuộc vào external systems critical.  

- **Tier 4 – Critical Risk**  
  - bất kỳ thứ gì có thể gây **mất tiền trực tiếp**, mất dữ liệu nghiêm trọng, vi phạm pháp lý, hay outage rộng;  
  - hoặc operations core của một wedge lớn phụ thuộc gần như hoàn toàn vào nó.

## 5. Tiêu chí gán Tier cho Integrations

### 5.1 Ma trận tiêu chí

Khi đánh giá một integration (dựa vào 78–82), hỏi các câu sau:

1. **Data sensitivity**  
   - Integration xử lý dữ liệu gì?  
   - PII, financial, pháp lý hay chỉ metadata không nhạy cảm?  
2. **Lifecycle & Work impact**  
   - Integration có thể tạo/update/đóng tasks/cases không?  
   - Có thể thay đổi SLA/priority/assignment không?  
3. **Financial & Transactional impact**  
   - Nó có thể tạo/cancel payments, invoices, orders không?  
   - Sai sót dẫn tới mất tiền trực tiếp không?  
4. **Dependency criticality**  
   - Khi integration này down, business có dừng không, hay chỉ bị chậm / mất tiện lợi?  
5. **Volume & Blast radius**  
   - Bao nhiêu tenants, users, cases bị ảnh hưởng?  
6. **Recovery & rollback complexity**  
   - Nếu lỗi, có dễ rollback, reconcile không? (dựa vào patterns 83)

### 5.2 Mapping criteria → Tier (ví dụ)

- **Tier 1** – ví dụ:  
  - integration chỉ đọc dữ liệu public hoặc metadata;  
  - mirror status sang CRM view;  
  - không tạo/đổi lifecycle;  
  - dễ disable, thấp volume.  

- **Tier 2** – ví dụ:  
  - integration sync thông tin khách hàng (không có data siêu nhạy cảm);  
  - update status/fields non-critical;  
  - ảnh hưởng nhỏ tới SLA;  
  - có reconciliation hỗ trợ.  

- **Tier 3** – ví dụ:  
  - integration tạo/điều chỉnh orders, bookings quan trọng;  
  - update lifecycle & SLA cho nhiều cases;  
  - call tới systems critical (ERP, payment gateway) với volume lớn.  

- **Tier 4** – ví dụ:  
  - integration xử lý thanh toán/billing at scale;  
  - transaction luật-pháp-điều-chỉnh;  
  - integration bắt buộc cho hoạt động daily của wedge lớn.

## 6. Tiêu chí gán Tier cho Automation & Config

### 6.1 Automation rules & flows (Pack 04)

Tiêu chí tương tự, nhưng tập trung vào:

- action type: view-only vs auto-assign vs auto-approve vs auto-cancel;  
- scope: áp dụng cho queue nhỏ hay toàn tenant/wedge;  
- reversibility: có thể undo/override dễ không (70, 72);  
- SLA impact: rule này có thể gây breach hàng loạt không.  

### 6.2 Configuration bundles

- thay đổi SLA baseline;  
- thay đổi routing rules;  
- thay đổi mapping integration;  
- thay đổi retry policies;  
- thay đổi queue/assignment model.

Các bundle thay đổi lifecycle, SLA, routing, mapping critical thường là Tier 3–4.

## 7. Control Catalog – mỗi Tier cần gì?

Dưới đây là **bảng khung** controls tối thiểu per Tier (đơn giản hóa để teams dễ nhớ). Chi tiết sẽ link sang docs 92–96.

### 7.1 Bảng tóm tắt controls theo Tier

- **Tier 1 – Low Risk**  
  - Auth: chuẩn platform, không yêu cầu special review.  
  - Config: self-service trong guardrails, no CAB; versioning cơ bản.  
  - Observability: metrics cơ bản, logs, no special SLO.  
  - Pilot: có thể pilot nhẹ hoặc đi thẳng nếu scope nhỏ.  
  - Incident: best-effort, no strict response SLO.

- **Tier 2 – Medium Risk**  
  - Auth: review basic bởi Platform/Security khi tạo mới.  
  - Config: cần peer review, có pilot ngắn; versioning & rollback.  
  - Observability: dashboards tối thiểu, error alerts; simple SLO.  
  - Incident: response trong giờ làm việc, post-incident note nếu sev cao.

- **Tier 3 – High Risk**  
  - Auth: thiết kế theo 81; không share creds, strict tenant isolation.  
  - Config: cần approvals từ Product/Platform/Governance; bắt buộc pilot (87); change windows.  
  - Observability: dashboards chi tiết (84), alerts paging; SLO formal.  
  - Incident: on-call, incident playbook, post-mortem formal (65).  
  - Change: phased rollout, feature flags, rollback tested.

- **Tier 4 – Critical Risk**  
  - Auth & Data: hardened patterns (MFA, least privilege), detailed audit (81–82).  
  - Config: CAB/council approve; pilot với shadow/limited scope; go-live plan chi tiết.  
  - Observability: dedicated dashboards; tight SLOs; external reporting.  
  - Incident: 24/7 on-call; strict response/resolution targets; customer comms templates.  
  - Change: rigorous change management, no big-bang trừ khi được approve rõ.

## 8. Áp dụng Tier trong lifecycle thực tế

### 8.1 Giai đoạn thiết kế

Khi thiết kế integration/automation mới:
- Product & Solution dùng tiêu chí ở mục 5–6 để đề xuất Tier;  
- Security/Governance confirm Tier;  
- Tier trở thành một field trong integration definition/config (86);  
- dựa vào Tier, chọn controls tối thiểu:  
  - cần pilot không;  
  - cần SLO & dashboards mức nào;  
  - cần approval ai.

### 8.2 Giai đoạn pilot (liên kết 87)

- Tier 1–2: pilot có thể nhẹ nhàng, chủ yếu để refine UX & mapping.  
- Tier 3–4: pilot phải có scope rõ, metrics formal (84), runbooks, rollback; signal reviews (55).  
- Lessons learned có thể khiến **điều chỉnh Tier** (vd từ 2 → 3 nếu risk cao hơn dự kiến).

### 8.3 Giai đoạn go-live & BAU

- Tier là input cho docs 92–94:  
  - incidents tier 3–4 thường map sang sev1–2;  
  - Tier ảnh hưởng lịch review định kỳ (BAU reviews: hàng tháng/quý);  
  - Tier ảnh hưởng số lượng metrics phải báo cáo cho khách (95).

## 9. Bề mặt hóa Tier & Controls trong UX & Tooling

Để Tiering không chỉ là lý thuyết, Pack 06 đề xuất:

- **Integration & automation catalog** hiển thị Tier cho từng entry;  
- UI config (86) hiển thị "this change affects a Tier 3 integration" và các yêu cầu controls tương ứng (pilot, approvals, SLO, runbooks);  
- Warnings khi cố gắng chỉnh config high-risk mà không đủ approvals;  
- Dashboards (84, 94) cho phép filter theo Tier.

## 10. Anti-patterns cần tránh

1. Gán tất cả về Tier thấp để tránh approval, khiến controls không đủ cho rủi ro thật.  
2. Gán tất cả về Tier cao nhất, khiến mọi thay đổi chậm & nặng nề, làm teams bypass process.  
3. Không cập nhật Tier khi integration/automation thay đổi phạm vi hoặc criticality.  
4. Tier không gắn với controls cụ thể – chỉ là label trang trí.  
5. Không bề mặt Tier cho các đội vận hành – chỉ tồn tại trong tài liệu nội bộ khó tìm.

## 11. Điều kiện hoàn thành của tài liệu

Risk Tiering and Control Catalog được xem là đạt yêu cầu khi:
- các integration & automation mới có thể được gán Tier một cách nhất quán;  
- teams hiểu Tier tương ứng với yêu cầu controls nào;  
- config tools & admin UI có thể hiển thị và enforce một số rules theo Tier;  
- incidents & pilots dùng Tier để ưu tiên phản ứng và cải tiến.

## AG Execution Prompt

You are acting as a risk and control architect, governance simplifier and ops ally.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–05 define data, UX, work orchestration and integration; Pack 06 defines governance & operations.
- This document defines risk tiering and control catalog.

### Objective
Refine this document into a practical tiering system and control set that teams can actually use when designing and operating integrations, automations and configuration changes.

### Inputs
- Use this document, Pack 05 docs (81–88), and Pack 04 automation/observability docs as context.  
- Preserve focus on simplicity, impact orientation and clear control expectations.  
- Keep it understandable to non-risk specialists.

### Tasks
1. Clarify tier definitions and criteria.  
2. Sharpen examples for integrations and automations.  
3. Expand control catalog with actionable expectations per tier.  
4. Highlight how tiers show up in tools and processes.  
5. Identify anti-patterns and update/refinement mechanisms.

### Constraints
- Do not create more than 4 tiers; avoid complexity.  
- Do not design controls so heavy that SMEs cannot operate them.  
- Do not let tiering drift from Packs 02–05 semantics.  
- Keep language concrete and close to real deployment scenarios.

### Output Format
Return a revised markdown document with these sections:
1. Tiering Thesis and Scope  
2. Tier Definitions and Criteria  
3. Controls per Tier (Integrations, Automations, Config)  
4. Tooling, Processes and Evolution  
5. Anti-Patterns and Usage Guidelines

### Acceptance Criteria
- The output must make risk tiering actionable, not academic.  
- The result must align with integration, automation, observability and config docs.  
- The system must be usable by Product, Platform, Ops, Security and CS without heavy training.
