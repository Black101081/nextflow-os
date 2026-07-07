# Nextflow OS – Pack 06 Incident Classification and Response Playbook

**Document ID:** 92_PACK06_INCIDENT_CLASSIFICATION_AND_RESPONSE_PLAYBOOK  
**Pack:** 06 — Governance and Operations  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Governance & Risk / Platform & Operations / Support  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS, 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS, 86_PACK05_INTEGRATION_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 87_PACK05_INTEGRATION_PILOT_PATTERNS_AND_GO_LIVE_PLAYBOOK, 88_PACK05_SUMMARY_AND_USAGE_GUIDE, 90_PACK06_GOVERNANCE_AND_OPERATIONS_OVERVIEW_AND_STRATEGY, 91_PACK06_RISK_TIERING_AND_CONTROL_CATALOG

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Incident Classification and Response Playbook** cho Pack 06. Sau khi 90 đã đặt khung governance & operations và 91 đã định nghĩa risk tiers & control catalog, tài liệu này trả lời câu hỏi:

> **Khi có sự cố trong Nextflow OS – outage, lỗi integration, automation chạy sai, data lệch, vi phạm quyền – chúng ta phân loại nó như thế nào, ai làm gì, trong bao lâu, dựa trên signals nào, và kết thúc incident ra sao để vừa bảo vệ khách vừa học được bài học?**

Mục tiêu:
- định nghĩa taxonomy **incident vs issue vs exception** trong ngữ cảnh Nextflow;  
- mô tả **các mức độ nghiêm trọng (sev)** và **loại incident chính**;  
- mô tả playbook response: detection → triage → containment → resolution → communication → learning;  
- liên kết chặt chẽ incident với lifecycle, SLA, exceptions, integration patterns và risk tiers (91).

## 2. Thesis về incident trong Nextflow OS

Thesis có thể phát biểu như sau:

> **Incidents là "khoảnh khắc sự thật" cho cả sản phẩm và tổ chức. Pack 06 không cố tránh mọi sự cố – điều đó không thực tế – mà tập trung làm cho chúng được phát hiện nhanh, phân loại đúng, phản ứng nhất quán và trở thành input cho cải tiến.**

Nguyên lý:

1. Không phải mọi lỗi đều là incident; incident là lỗi có **impact đáng kể lên khách, SLA hoặc risk**.  
2. Incident classification phải **đơn giản, tái lập**, không dựa hoàn toàn vào cảm giác.  
3. Response playbook phải dựa vào **signals & views** Pack 03–05, không dựa vào log thô và "heroics".  
4. Mỗi incident phải kết thúc với **learning rõ ràng**: root cause, contributing factors, actions.  
5. Roles & responsibilities phải rõ; không có "mọi người và không ai" chịu trách nhiệm.  
6. Incident processes không được quá nặng nề cho SMEs, nhưng đủ để xử lý rủi ro Tier 3–4.

## 3. Taxonomy: exception, issue, incident

Để tránh nhầm lẫn, chúng ta phân biệt:

- **Exception (Pack 04–05)**  
  - là sự kiện hoặc case bất thường ở **mức work**: một task/case cụ thể bị kẹt, bị lỗi, hoặc cần review (72).  
  - ví dụ: exception case `DataMismatch` cho một order; exception `ExternalUnreachable` cho một batch.  
  - exception **không nhất thiết** là incident; nó là hạt nhân để vận hành & reconcile.

- **Issue**  
  - là pattern lặp lại của exceptions hoặc khiếm khuyết product/ops được phát hiện nhưng **chưa** đủ impact để gọi là incident;  
  - ví dụ: mapping enum chưa tốt làm exceptions lặp lại nhưng volume & impact còn thấp.  

- **Incident**  
  - là event hoặc chuỗi events gây **gián đoạn dịch vụ, vi phạm SLA, rủi ro bảo mật, data leak, lỗi tài chính**, hoặc ảnh hưởng lớn đến trải nghiệm khách.  
  - incidents thường liên quan đến **nhiều work items**, nhiều tenants, hoặc high-risk tiers theo 91.  

Pack 06 tập trung vào **incidents**, nhưng exceptions & issues là nguồn signals quan trọng.

## 4. Phân loại incident: severity levels (Sev1–Sev4)

### 4.1 Định nghĩa chung

Chúng ta dùng 4 mức severity:

- **Sev1 – Critical**  
  - Outage toàn phần hoặc gần toàn phần cho một wedge hoặc nhiều tenants.  
  - Data leak, vi phạm quyền nghiêm trọng, hoặc lỗi tài chính lớn.  
  - Failure của integration/automation Tier 4 (91) gây impact tức thì.  

- **Sev2 – High**  
  - Degradation đáng kể: nhiều user/tenants bị ảnh hưởng, work backlog tăng nhanh, SLA sắp hoặc đã breach cho nhóm khách quan trọng.  
  - Failures của integrations/automations Tier 3.  

- **Sev3 – Medium**  
  - Ảnh hưởng hạn chế: một số tenants/flows/queues; có workaround tạm.  
  - SLA bị ảnh hưởng cho subset nhỏ, hoặc lỗi nội bộ có thể xử lý trong giờ làm việc.  

- **Sev4 – Low**  
  - Ảnh hưởng nhỏ, thường là cosmetic, hoặc liên quan một vài users;  
  - không impact tổng thể SLA;  
  - thường chuyển thành issue ticket hơn là full incident proces.

### 4.2 Liên kết Tier (91) với severity

- Incidents liên quan đến **Tier 4** gần như luôn là Sev1 hoặc Sev2.  
- Incidents liên quan **Tier 3** thường là Sev2–Sev3 tùy phạm vi.  
- Incidents chỉ liên quan **Tier 1–2** hiếm khi vượt quá Sev3.  

Điều này giúp triage nhanh: nhìn vào risk tier của đối tượng bị ảnh hưởng + scope để gán severity.

## 5. Các loại incident chính (incident types)

Một số **incident types** gợi ý:

1. **Availability/Performance Incident**  
   - Outage, downtime, severe latency;  
   - queue không xử lý được work;  
   - dashboards 73/84 cho thấy health xấu.  

2. **Integration Incident**  
   - lỗi liên quan flows 79–80;  
   - external down, mapping lỗi, retry thất bại hàng loạt;  
   - nhiều tasks `Pending External` hoặc exceptions integration (83).  

3. **Automation/Workflow Incident**  
   - rules hoặc flows 70 hoạt động sai: auto-approve/auto-cancel/auto-assign ngoài dự kiến;  
   - mass SLA misconfiguration hoặc routing sai (68, 71, 69).  

4. **Security/Access Incident**  
   - misconfigured permissions (50), leaked creds (81);  
   - tenant boundary violation, access trái phép.  

5. **Data Integrity/Privacy Incident**  
   - data corruption, data loss, wrong mapping gây records sai hàng loạt (82);  
   - data leak qua exports/logs/observability (84).  

6. **Change/Release Incident**  
   - instability sau deploy, feature flag misuse, config change gây regression (86, 87).  

Mỗi incident có thể gắn nhiều type, nhưng primary type giúp route đúng owner.

## 6. Playbook response: các giai đoạn

Một incident đi qua 6 giai đoạn chính:

1. Detection  
2. Triage  
3. Containment  
4. Resolution  
5. Communication  
6. Learning & follow-up

### 6.1 Detection

Nguồn detection:
- monitoring & alerts (84, 73): error spikes, SLA breaches, retries exhausted, queue backlog, SLO violations;  
- user reports (support tickets, CS feedback);  
- internal teams phát hiện trong dashboards hoặc logs.  

Yêu cầu:
- alerts phải map đến severity dự kiến;  
- team on-call có kênh nhận alert rõ (pager/chat/email);  
- mọi incident Sev1–2 cần một **incident record** được mở ngay.

### 6.2 Triage

Trong triage, team xác định:
- incident type(s);  
- scope (tenants, wedges, work types, integrations);  
- severity (Sev1–4) dựa trên impact + risk tier;  
- owner chính (Platform, Integration, Ops, Security, CS).  

Triaging sử dụng views Pack 73 & 84 để đo: backlog, SLA, lỗi integration, work items affected.

### 6.3 Containment

Mục tiêu: **ngăn incident tệ hơn**, ngay cả trước khi biết root cause đầy đủ.

Các action containment có thể gồm:
- disable integration high-risk (86);  
- tắt/giảm automation rules nghi ngờ (70);  
- bật feature flags rollback;  
- chuyển một phần work sang flow manual;  
- tạm dừng các batch jobs gây lỗi.  

Containment decisions nên dựa vào risk tier & severity.

### 6.4 Resolution

Khi containment ổn, focus chuyển sang resolution:
- fix config/mapping/auth;  
- deploy patch;  
- clear queues & reconcile dữ liệu (83, 82);  
- verify health qua dashboards (84, 73).  

Definition of Done cho resolution phải rõ: metrics trở lại bình thường, không còn backlog mới, exceptions giảm.

### 6.5 Communication

Song song hoặc sau containment/resolution, cần:
- Thông báo nội bộ (teams liên quan, leadership).  
- Thông báo khách (nếu impact đáng kể – theo doc 95):  
  - trạng thái, phạm vi, đang làm gì, cần họ làm gì (nếu có).  
- Cập nhật liên tục cho incidents Sev1–2.

### 6.6 Learning & Follow-up

Sau khi incident kết thúc:
- thực hiện **post-incident review** (PIR) formal cho Sev1–2, lightweight cho Sev3;  
- document root cause, contributing factors, what went well/badly, action items;  
- update runbooks, alerts, mappings, config model, risk tier nếu cần;  
- link lại vào docs Packs 04–05 (nếu incident chỉ ra lỗ hổng patterns).

## 7. Vai trò và trách nhiệm trong incident

Các vai trò chính:

- **Incident Commander (IC)**  
  - chịu trách nhiệm điều phối response cho incident;  
  - đảm bảo triage đúng, tasks được assign rõ, communication diễn ra;  
  - không nhất thiết là người fix kỹ thuật.

- **Technical Lead(s)**  
  - Platform, Integration, Automation, Security tuỳ incident type;  
  - điều tra root cause, đề xuất containment & fix.

- **Ops/Support Lead**  
  - quản lý impact tới work & customers;  
  - điều phối workarounds;  
  - giúp thu thập thông tin từ frontline.

- **Customer Success Representative**  
  - là cầu nối với khách bị ảnh hưởng;  
  - phối hợp thông báo & expectations.  

- **Scribe/Recorder**  
  - ghi lại timeline, decisions, actions trong suốt incident;  
  - đảm bảo post-incident review có data.

RACI cho từng bước (detection, triage, containment, resolution, comms, PIR) sẽ được chi tiết hoá thêm trong doc 96, nhưng doc 92 đặt khung ban đầu.

## 8. Liên kết incident với lifecycle, SLA, exceptions và integrations

### 8.1 Lifecycle & exception cases

Pack 04 đã định nghĩa exceptions như work items đặc biệt. Trong incident:
- exceptions là **unit** để trace impact (bao nhiêu exceptions type X được tạo trong khoảng thời gian incident);  
- exceptions có thể được dùng để assign manual remediation tasks cho Ops;  
- lifecycle states như `Pending External`, `Integration Error`, `Reconciliation Required` là indicators incident integration (83).

### 8.2 SLA & breach

Sev & incident response phải align với SLA model (71):
- incidents gây breach SLA phải được ghi chú (tag) rõ;  
- có thể cần **SLA waivers** hoặc credits cho khách – phối hợp với CS;  
- signals SLA từ Pack 73 & 84 giúp đo lường severity thực.

### 8.3 Integration incidents & Pack 05

Đối với incidents liên quan Pack 05:
- dùng observability & health dashboards (84) để xác định integration/endpoint impacted;  
- dùng error/retry patterns (83) để quyết containment (tắt retry, disable integration);  
- dùng config model (86) để review last changes & rollback;  
- dùng pilot/go-live playbook (87) để hiểu scope rollout hiện tại.

## 9. Kết nối với risk tiers và control catalog (91)

Doc 91 định nghĩa Tier T1–T4. Doc 92 sử dụng Tier để:

- map incident liên quan Tier 3–4 vào Sev1–2;  
- quyết định cần IC formal hay chỉ xử lý nhẹ;  
- xác định có cần on-call 24/7 hay chỉ trong giờ hành chính;  
- xác định mức độ formal cho post-incident review;  
- xác định ai phải được thông báo (internal & external).

Ví dụ:
- incident trên integration Tier 4 xử lý payments → Sev1, IC + on-call + customer comms rộng.  
- incident trên automation Tier 2 chỉ ảnh hưởng queue nhỏ → Sev3, xử lý trong giờ làm việc, PIR nhẹ.

## 10. Anti-patterns cần tránh

1. Gọi mọi thứ là incident Sev1 – làm kiệt sức teams và giết độ ưu tiên thực.  
2. Ngược lại, không gọi đúng tên incidents severe – chỉ xem như "issue nhỏ" cho đến khi khách rời đi.  
3. Không có người chỉ huy (IC) – ai cũng vào debug nhưng không ai giữ cái nhìn tổng thể.  
4. Không dùng signals/dashboards – triage dựa trên cảm giác hoặc ticket ngẫu nhiên.  
5. Không làm post-incident review – "xong là thôi", không học được gì.  
6. Incident processes quá phức tạp, đòi hỏi paperwork không cần thiết, khiến team tránh report incidents.

## 11. Điều kiện hoàn thành của tài liệu

Incident Classification and Response Playbook được xem là đạt yêu cầu khi:
- teams có thể nhất quán phân biệt exception, issue, incident;  
- incidents mới được gán severity & type một cách hợp lý;  
- khi incident xảy ra, mọi người biết ai là IC, ai làm gì, kênh nào dùng;  
- post-incident reviews thực sự dẫn tới thay đổi patterns, config, observability;  
- và khách SMEs cảm nhận được rằng khi có sự cố, Nextflow phản ứng nhanh, minh bạch và có trách nhiệm.

## AG Execution Prompt

You are acting as an incident response architect, triage simplifier and learning facilitator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–05 define data, UX, work orchestration and integration; Pack 06 defines governance & operations.
- This document defines incident classification and response playbook.

### Objective
Refine this document into a practical incident classification and response guide that teams can follow under pressure.

### Inputs
- Use this document, risk tiers (91), exception handling (72), integration error/observability docs (83–84), and support guides (61).  
- Preserve focus on clarity under stress and linkages to signals & tools.  
- Keep it understandable to ops, support and product teams.

### Tasks
1. Clarify definitions of incident vs issue vs exception.  
2. Sharpen severity criteria and integration with risk tiers.  
3. Detail response stages, roles and communication expectations.  
4. Highlight connections to lifecycle, SLA and integration tooling.  
5. Identify anti-patterns and improvement mechanisms.

### Constraints
- Do not overcomplicate severity matrix – keep Sev1–4.  
- Do not assume large enterprise processes; keep suitable for SMEs.  
- Do not ignore integration-specific incidents.  
- Keep language simple enough to use at 3AM during an outage.

### Output Format
Return a revised markdown document with these sections:
1. Incident Thesis and Taxonomy  
2. Severity Levels and Incident Types  
3. Response Stages and Roles  
4. Integration with Lifecycle, SLA and Risk Tiers  
5. Anti-Patterns and Adoption Guidelines

### Acceptance Criteria
- The output must help teams act quickly and consistently during incidents.  
- The result must align with Pack 04–05 semantics, risk tiers and observability.  
- The playbook must be usable under real-world time pressure.
