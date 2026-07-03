# Nextflow OS – Pack 06 Governance Roles and RACI Matrix

**Document ID:** 96_PACK06_GOVERNANCE_ROLES_AND_RACI_MATRIX  
**Pack:** 06 — Governance and Operations  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Governance & Risk / Product Leadership / Platform & Operations  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 74_PACK04_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 81_PACK05_IDENTITY_AUTH_AND_TENANT_BOUNDARIES_FOR_INTEGRATION, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS, 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS, 86_PACK05_INTEGRATION_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 87_PACK05_INTEGRATION_PILOT_PATTERNS_AND_GO_LIVE_PLAYBOOK, 88_PACK05_SUMMARY_AND_USAGE_GUIDE, 90_PACK06_GOVERNANCE_AND_OPERATIONS_OVERVIEW_AND_STRATEGY, 91_PACK06_RISK_TIERING_AND_CONTROL_CATALOG, 92_PACK06_INCIDENT_CLASSIFICATION_AND_RESPONSE_PLAYBOOK, 93_PACK06_CHANGE_MANAGEMENT_AND_RELEASE_GOVERNANCE, 94_PACK06_BAU_OPERATIONS_RUNBOOK_AND_REVIEW_CADENCES, 95_PACK06_CUSTOMER_FACING_GOVERNANCE_AND_SLA_MODEL

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Governance Roles and RACI Matrix** cho Pack 06. Sau khi Pack 06 đã thiết kế:
- khung governance & operations (90);  
- risk tiering & controls (91);  
- incident playbook (92);  
- change management & BAU (93–94);  
- governance & SLA customer-facing (95);  

…tài liệu này trả lời câu hỏi:

> **Cụ thể thì ai làm gì? Khi thiết kế integration Tier 3, khi đổi automation rule high-impact, khi xảy ra incident Sev1, khi review BAU, khi cam kết SLA với khách – đội nào/role nào Responsible, Accountable, Consulted, Informed?**

Mục tiêu:
- định nghĩa các vai trò governance & operations trọng yếu cho Nextflow;  
- xây RACI matrix cho các process chính Pack 06;  
- giúp tránh tình trạng "mọi người và không ai" chịu trách nhiệm;  
- giúp nhanh chóng biết phải gọi ai, mời ai khi có change/incident/risk review.

## 2. Các vai trò chính trong governance & operations

### 2.1 Nhóm vai trò nội bộ Nextflow

1. **Product Owner (PO)** – theo wedge hoặc module  
   - chịu trách nhiệm outcomes business & trải nghiệm;  
   - quyết định trade-off feature vs risk cho wedge đó.

2. **Platform Engineering Lead (Platform)**  
   - chịu trách nhiệm kiến trúc & độ tin cậy platform;  
   - owner technical controls (auth, infra, integration platform).

3. **Integration Owner / Architect**  
   - owner một integration cụ thể hoặc một nhóm connectors;  
   - tập trung patterns Pack 05 (79–84, 86–87).

4. **Operations Lead (Ops)**  
   - chịu trách nhiệm BAU operations & queue health;  
   - điều phối daily/weekly ops routines (94).

5. **Support Lead**  
   - owner frontline support & ticket triage (61);  
   - cầu nối signal từ khách lên incident/change.

6. **Customer Success Manager (CSM)**  
   - owner relationship với khách;  
   - giải thích governance & SLA, dẫn dắt reviews với khách (95).

7. **Security & Governance Lead (SecGov)**  
   - chịu trách nhiệm policy về auth, data, risk tiering & controls (81–82, 91);  
   - tham gia approvals cho high-risk changes & incidents.

8. **Data & Analytics Lead (Data)**  
   - owner observability frameworks (42, 73, 84);  
   - support dashboards, metrics cho Pack 06.

9. **Incident Commander (IC)**  
   - role dynamic, được gán khi có incident (92);  
   - điều phối response, không nhất thiết là người fix kỹ thuật.

### 2.2 Vai trò phía khách hàng SME

1. **Customer Sponsor**  
   - lãnh đạo phía khách, chịu trách nhiệm adoption & outcomes.  

2. **Customer Admin / Ops Lead**  
   - người quản Nextflow hàng ngày (users, queues, configs nhẹ);  
   - điểm liên lạc chính trong incidents & changes.

3. **Customer IT / Integration Contact**  
   - đối tác cho integration, SSO, data exchange;  
   - phối hợp test & rollout integrations high-risk.

## 3. Các process chính và RACI frame

Pack 06 tập trung vào một số process governance & operations chính:

1. **Risk Tiering & Control Assignment** (91)  
2. **Design & Approval of High-Risk Integrations** (Pack 05, 91)  
3. **Design & Approval of High-Risk Automations** (Pack 04, 70–75)  
4. **Change Management & Release** (93)  
5. **Incident Response & Post-Incident Review** (92)  
6. **BAU Daily/Weekly/Monthly Reviews** (94)  
7. **Customer-Facing Governance & SLA Updates** (95)

Trong các phần sau, chúng ta mô tả RACI ở mức khung (role-level). Chi tiết theo team cụ thể sẽ được tuỳ biến trong tổ chức.

## 4. RACI – Risk Tiering & Control Assignment (91)

### 4.1 Mô tả process

Khi có integration/automation/config/data sharing mới hoặc thay đổi lớn, chúng ta cần:
- đánh giá risk tier (T1–T4) (91);  
- gán control set tối thiểu (monitoring, approvals, pilot,…).

### 4.2 RACI

- **Product Owner (PO)** – R (đề xuất tier dựa trên use case & impact)  
- **Platform Engineering Lead** – C (đưa vào input kỹ thuật về complexity & dependency)  
- **Integration Owner / Automation Owner** – R (đánh giá technical behavior, mapping, failure modes)  
- **Security & Governance Lead (SecGov)** – A (phê duyệt tier cuối & controls bắt buộc)  
- **Ops Lead** – C (input về ops impact, BAU capacity)  
- **CSM** – C (input về criticality đối với khách)  
- **Customer Admin/IT** – I (được thông báo tier & implications khi cần)

## 5. RACI – Design & Approval of High-Risk Integrations (Tier 3–4)

### 5.1 Mô tả process

- Áp dụng Pack 05 (79–84, 86–87): design inbound/outbound, auth/tenant, mapping, error/retry, observability, config, pilots.  
- Risk Tier 3–4 theo 91, changes Level C–D theo 93.

### 5.2 RACI

- **Product Owner** – A (own business outcome, scope, go/no-go)  
- **Integration Owner/Architect** – R (design technical, mapping, error/retry, observability, config)  
- **Platform Engineering Lead** – C (architectural fit, platform constraints)  
- **Security & Governance Lead** – C/A cho phần auth/data (81–82, 91)  
- **Ops Lead** – C (BAU readiness, queue impact)  
- **Support Lead** – C (supportability, runbooks, troubleshooting)  
- **Data & Analytics Lead** – C (metrics & dashboards, signals để review)  
- **CSM** – C (pilot & rollout plan với khách, expectations)  
- **Customer IT / Admin** – C (cùng test & xác nhận mapping, auth)

## 6. RACI – Design & Approval of High-Risk Automations

### 6.1 Mô tả process

Các rules/flows automation Tier 3–4 (70–75): auto-approve/cancel, mass reassign, SLA changes.

### 6.2 RACI

- **Product Owner** – A (policy business, hành vi mong muốn)  
- **Automation Owner / Platform** – R (design rule, guardrails, override pattern)  
- **Security & Governance Lead** – C (risks & waiver model – 57)  
- **Ops Lead** – C (impact lên queues & BAU)  
- **Support Lead** – C (exception handling – 72, support patterns)  
- **Data & Analytics Lead** – C (metrics để đo automation health)  
- **CSM & Customer Sponsor** – C/I tuỳ mức impact (chấp nhận automation mức nào, thông báo khách)

## 7. RACI – Change Management & Release (93)

### 7.1 Mô tả process

Change types A–D: code, config, integrations, ops.  
RACI thay đổi theo level; ở đây mô tả high-level:

### 7.2 RACI theo Level

- **Level A–B (Low/Medium)**  
  - PO – A cho changes trong wedge/module của mình;  
  - Dev/Engineer/Owner – R;  
  - Platform – C/I tuỳ ảnh hưởng;  
  - Ops & Support – I (được thông báo nếu ảnh hưởng flows);  
  - SecGov – I (nếu không chạm auth/data).  

- **Level C–D (High/Critical)**  
  - PO – A (business)  
  - Platform – A/C (technical & reliability)  
  - SecGov – C/A cho phần risk & policy  
  - Ops Lead – C (operational feasibility)  
  - Support Lead – C (support readiness)  
  - CSM – C (customer comms)  
  - Customer Admin/IT – I/C (nhận thông báo & tham gia tests/pilots khi phù hợp)

## 8. RACI – Incident Response & Post-Incident Review (92)

### 8.1 During Incident

- **Incident Commander (IC)** – A/R cho toàn bộ orchestration;  
- **Technical Lead(s)** (Platform/Integration/Automation) – R cho diagnosis & fix;  
- **Ops Lead** – R/C cho workarounds, rerouting work;  
- **Support Lead** – R/C cho ticket triage & frontline comms;  
- **CSM** – C/I cho customer comms, expectations;  
- **SecGov** – C (nếu liên quan security/data/risk);  
- **Data Lead** – C (hỗ trợ queries & analysis nếu cần).

### 8.2 Post-Incident Review

- **IC hoặc Owner Incident** – R (soạn PIR, đề xuất actions)  
- **Product Owner** – A (cho actions ảnh hưởng roadmap/behaviour)  
- **Platform & Integration Leads** – R/C (cho fixes technical)  
- **Ops & Support Leads** – C (cho runbooks, BAU changes)  
- **SecGov** – C (cho controls/policies)  
- **CSM** – C (cho follow-up với khách)  
- **Data Lead** – C (cho metrics & incident analysis)

## 9. RACI – BAU Operations and Reviews (94)

### 9.1 Daily Operations

- **Ops Lead** – R (điều phối daily checks)  
- **Support Lead** – R (tickets & frontline signals)  
- **Platform/Integration** – C/I (khi có anomalies cần điều tra)  
- **Product Owner** – I (được thông báo issues relevant wedge)  
- **CSM** – I (issues ảnh hưởng khách)

### 9.2 Weekly/Monthly Reviews

- **Ops Lead** – R (chuẩn bị & dẫn weekly ops/integration reviews)  
- **Product Owner** – A/R (dẫn weekly wedge reviews)  
- **Platform/Integration** – C (input about tech & integrations)  
- **Support Lead** – C (patterns tickets & incidents)  
- **CSM** – C (feedback khách & risk khách quan trọng)  
- **SecGov** – I/C (monitor risk trends, nếu cần)

### 9.3 Quarterly Governance Review

- **Product Leadership** – A  
- **SecGov** – R (chuẩn bị risk overview, policy proposals)  
- **Platform/Ops/CSM** – C (input, evidence, proposals)

## 10. RACI – Customer-Facing Governance & SLA (95)

### 10.1 Định nghĩa & cập nhật SLA/SLO

- **Product Leadership** – A (chiến lược SLA/SLO)  
- **SecGov & Platform** – C (ensure align với capabilities thực)  
- **CSM** – C (feedback từ khách, clarity)  
- **Legal/Commercial (nếu có)** – C (contractual alignment)

### 10.2 Incident & Change Communications

- **Support Lead** – R (comms tình huống ngắn, FAQs)  
- **CSM** – R/C (comms với khách key, service reviews)  
- **Product/Platform** – C (input technical & roadmap)  
- **SecGov** – C (comms cho incidents security/privacy high-risk)

## 11. Cách sử dụng RACI trong thực tế

### 11.1 Không cứng nhắc nhưng là reference

- RACI là khung; teams bisa adapt theo context, nhưng **phải có lý do rõ** khi lệch.  
- RACI nên được bề mặt hoá trong tools (vd integration definition hiển thị owner & approvers; incident record hiển thị IC & leads; change record hiển thị approvers cần thiết).

### 11.2 Onboarding & training

- RACI là tài liệu onboarding cho thành viên mới trong Product/Platform/Ops/CS;  
- dùng để giải thích:  
  - khi muốn design integration, tìm ai;  
  - khi thấy vấn đề production, gọi ai;  
  - khi cần thay đổi SLA, nói với ai.

## 12. Anti-patterns cần tránh

1. Không có RACI rõ – mọi người assume người khác sẽ xử lý.  
2. RACI quá phức tạp – quá nhiều roles, khiến không ai nhớ nổi.  
3. Không cập nhật RACI khi tổ chức thay đổi – doc nhanh chóng lỗi thời.  
4. Không bề mặt RACI trong tools – chỉ tồn tại trên wiki ít ai đọc.  
5. Dùng RACI như "vũ khí" đùn đẩy trách nhiệm, thay vì công cụ hợp tác.

## 13. Điều kiện hoàn thành của tài liệu

Governance Roles and RACI Matrix được xem là đạt yêu cầu khi:
- các teams có thể sử dụng nó để biết ai làm gì trong design, change, incidents, BAU, SLA;  
- trách nhiệm không bị chồng chéo hoặc rơi vào khoảng trống;  
- and the RACI can be adapted easily khi Nextflow mở rộng wedges & tổ chức.

## AG Execution Prompt

You are acting as a governance roles designer, RACI clarifier and collaboration facilitator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–05 define core semantics; Pack 06 defines governance & operations.
- This document defines roles and RACI across Pack 06 processes.

### Objective
Refine this document into a clear roles & RACI guide that teams actually use day-to-day.

### Inputs
- Use this document, Pack 03 role/permission matrix (50), and Pack 06 docs (90–95) as context.  
- Preserve focus on clarity, brevity and practicality.  
- Keep it understandable to all cross-functional team members.

### Tasks
1. Clarify roles and their responsibilities.  
2. Sharpen RACI for risk, change, incidents, BAU and SLA.  
3. Suggest how to surface RACI in tools and onboarding.  
4. Identify anti-patterns and adaptation principles.

### Constraints
- Do not create too many roles; reuse existing ones where possible.  
- Do not make RACI so detailed that it becomes unmaintainable.  
- Do not forget customer roles in governance.  
- Keep language concise but explicit.

### Output Format
Return a revised markdown document with these sections:
1. Roles Overview  
2. RACI by Key Process  
3. Tooling, Onboarding and Evolution  
4. Anti-Patterns and Usage Principles

### Acceptance Criteria
- The output must make it obvious who does what in Pack 06 processes.  
- The result must align with role/permission model (50) and Pack 06 docs.  
- The guide must be usable as a day-to-day reference.
