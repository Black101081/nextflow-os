# Nextflow OS – Pack 06 BAU Operations Runbook and Review Cadences

**Document ID:** 94_PACK06_BAU_OPERATIONS_RUNBOOK_AND_REVIEW_CADENCES  
**Pack:** 06 — Governance and Operations  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Operations / Platform / Product Ops  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility  
**Prerequisite Documents:** 01_PRODUCT_OVERVIEW, 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 10_NEXTFLOW_OS_PRODUCT_ARCHITECTURE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS, 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER, 77_PACK05_OVERVIEW_AND_STRATEGY, 79_PACK05_INBOUND_EVENT_AND_DATA_INTEGRATION_PATTERNS, 80_PACK05_OUTBOUND_EVENT_AND_API_INTEGRATION_PATTERNS, 82_PACK05_DATA_MAPPING_AND_TRANSFORMATION_GUIDE, 83_PACK05_INTEGRATION_ERROR_HANDLING_RETRY_AND_RECONCILIATION_PATTERNS, 84_PACK05_INTEGRATION_OBSERVABILITY_AND_HEALTH_DASHBOARDS_REQUIREMENTS, 86_PACK05_INTEGRATION_CONFIGURATION_AND_POLICY_MODELING_GUIDE, 87_PACK05_INTEGRATION_PILOT_PATTERNS_AND_GO_LIVE_PLAYBOOK, 88_PACK05_SUMMARY_AND_USAGE_GUIDE, 90_PACK06_GOVERNANCE_AND_OPERATIONS_OVERVIEW_AND_STRATEGY, 91_PACK06_RISK_TIERING_AND_CONTROL_CATALOG, 92_PACK06_INCIDENT_CLASSIFICATION_AND_RESPONSE_PLAYBOOK, 93_PACK06_CHANGE_MANAGEMENT_AND_RELEASE_GOVERNANCE

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **BAU Operations Runbook and Review Cadences** cho Pack 06. Sau khi chúng ta đã:
- đặt khung governance & risk tiers (90–91);  
- định nghĩa incident playbook (92);  
- định nghĩa change management & release governance (93);  
- xây toàn bộ nền tảng observability (73, 84) và integration config (86);  

…tài liệu này trả lời câu hỏi:

> **Khi Nextflow OS đã đi vào hoạt động "ổn định" với khách SMEs – sau pilots và go-live – ngày thường, tuần, tháng, quý đội Ops/Platform/Product/Ops-CS sẽ làm gì để giữ hệ khỏe, phát hiện vấn đề sớm, tối ưu, và cải tiến liên tục? Làm sao để BAU không chỉ là "chờ sự cố" mà là vận hành chủ động?**

Mục tiêu:
- định nghĩa runbook BAU: các routine daily/weekly/monthly/quarterly;  
- mô tả các buổi review (health, capacity, automation, integration, risk) và ai tham gia;  
- gắn BAU ops với lifecycle, SLA, exceptions, integration signals;  
- tạo nền cho continuous improvement dựa trên metrics & incidents.

## 2. Thesis về BAU operations

Thesis có thể phát biểu như sau:

> **BAU tốt không chỉ là "ít sự cố", mà là việc mỗi ngày chúng ta có một số thói quen nhỏ nhưng đều đặn: nhìn đúng dashboard, dọn đúng queue, review đúng số, nói chuyện đúng người. Với Nextflow và SMEs, nếu BAU tốt, khách sẽ cảm thấy hệ thống như "một đồng đội ổn định", không phải nguồn lo lắng.**

Nguyên lý:

1. BAU phải **nhẹ nhưng đều đặn** – không đòi hỏi offsite, chỉ vài nhịp rõ ràng mỗi ngày/tuần/tháng.  
2. BAU tận dụng **các views đã có** (Pack 73, 84) thay vì tạo thêm báo cáo thủ công.  
3. BAU không chỉ là Ops – Product, Integration, CS cũng có routine riêng.  
4. BAU phải **risk-aware**: dành nhiều focus hơn cho Tier 3–4 (91).  
5. BAU phải gắn với **change & incident**: review incidents & changes gần đây, không tách rời.  
6. BAU là nơi phát hiện cơ hội **cải tiến product & process**, không chỉ chữa cháy.

## 3. Các nhịp BAU chính

Chúng ta định nghĩa 4 cấp cadence:

1. **Daily** – nhịp ngày cho Ops/Support/Platform.  
2. **Weekly** – nhịp tuần cho squads Product/Ops/Integration.  
3. **Monthly** – nhịp tháng cho leadership wedge/region.  
4. **Quarterly** – nhịp quý cho cấp chiến lược (risk & roadmap).

## 4. Daily operations runbook

### 4.1 Mục tiêu daily

- Phát hiện sớm issues trending thành incidents.  
- Đảm bảo queues & backlogs dưới ngưỡng.  
- Đảm bảo integrations critical vẫn healthy.  
- Đảm bảo không có SLA breach bất ngờ.

### 4.2 Daily checklist cho Ops/Support

1. **Check dashboards work health (Pack 73)**  
   - backlog per queue;  
   - SLAs due/overdue;  
   - exceptions mở (72) – nhất là types liên quan integration và automation.  

2. **Check dashboards integration health (Pack 84)**  
   - status các integrations Tier 3–4;  
   - error rate ngày hôm qua;  
   - số tasks `Pending External` và exceptions integration;  
   - retries exhausted.  

3. **Check alerts & incidents**  
   - incidents mới mở/đóng (92);  
   - alerts xảy ra trong 24h; xác nhận đã triage hoặc close.  

4. **Check automation health (Pack 70, 75)**  
   - any anomalies: automation firing quá nhiều, override tăng bất thường;  
   - exceptions `AutomationPolicyViolation` hoặc tương tự.  

5. **Spot-check tickets & feedback từ CS/Support (61)**  
   - có patterns phàn nàn lặp lại liên quan flows chính hoặc integrations?  

Daily notes có thể ghi vào một log nhẹ (vd trong tool) để dùng cho weekly review.

### 4.3 Daily actions mẫu

Khi thấy:
- backlog tăng bất thường ở queue A → kiểm tra workload, routing, integration liên quan; có thể điều chỉnh tạm thời hoặc escalate Product.  
- error rate integration X spike → follow playbook integration (83, 92): triage, containment nếu cần.  
- exceptions loại Y tăng mạnh → tạo issue cho Product/Platform xem xét mapping/policies.

## 5. Weekly reviews

### 5.1 Weekly Ops & Integration Review

Participants: Ops, Platform/Integration, CS đại diện.

Agenda gợi ý:
- Review **incidents tuần qua** (92):  
  - Sev, type, resolution time;  
  - action items còn mở.  
- Review **integration metrics** (84):  
  - top errors;  
  - integrations Tier 3–4 health;  
  - pending external queues & reconciliation cases (83).  
- Review **automation & exceptions**:  
  - rules gây nhiều exceptions;  
  - queues có automation override nhiều.  
- Agree **small changes** cho tuần tới (lane A–B, có thể triển khai nhanh) và xác định changes high-risk cần lên plan (lane C–D) (93).

### 5.2 Weekly Product/Ops Sync per Wedge

Participants: Product wedge, Ops, CS.

Agenda gợi ý:
- Review **SLA & work health**:  
  - SLA hit vs breach;  
  - bottlenecks trong flows;  
  - customer feedback patterns.  
- Review **roadmap changes** và **impact operational**;  
- Ưu tiên hoá các **improvement items** (mapping, UX, automation tweaks) xuất phát từ BAU.

## 6. Monthly and quarterly reviews

### 6.1 Monthly Health Review

Participants: lãnh đạo Product/Platform/Ops/CS theo region/wedge.

Mục tiêu: nhìn **xu hướng** chứ không chỉ tuần/ngày.

Agenda:
- Metrics:  
  - incident trends (theo type/severity);  
  - SLA performance;  
  - automation coverage vs manual;  
  - integration errors & improvements.  
- Risk review:  
  - có integrations/automations cần nâng Tier (91)?  
  - có controls thiếu?  
- Decisions:  
  - xác định 1–3 initiatives ops/product quan trọng tháng tới.

### 6.2 Quarterly Governance & Risk Review

Participants: leadership cross-functional.

Mục tiêu: align governance với thực tế.

Agenda:
- Overview risk:  
  - summary Tier 3–4 integrations/automations;  
  - high-impact incidents;  
  - bất kỳ data/privacy/security concerns.  
- Review policies:  
  - có change management rules nào quá nặng/nhẹ;  
  - có areas nào cần thêm guardrails.  
- Align với roadmap:  
  - wedges mới, integrations mới high-risk;  
  - chuẩn bị governance trước khi build.

## 7. BAU runbook cho integration và automation

### 7.1 Integration BAU

Hàng tuần/tháng, Integration team nên:
- Review **integration catalog** (Pack 05, 86, 88):  
  - status;  
  - owners;  
  - tiers;  
  - config changes gần đây.  
- Review **outstanding mapping & transformation issues** (82):  
  - unmapped codes;  
  - reconciliation cases;  
  - customer complaints về data không khớp.  
- Xác định integrations nào **cần refactor, re‑pilot hoặc deprecate**.

### 7.2 Automation BAU

Automation owners (Pack 04) nên:
- Review rules high-impact;  
- Check **override & waiver patterns** (57, 70, 72):  
  - có rules nào thường xuyên bị override/waive → candidate để sửa hoặc hạ level.  
- Review **automation coverage**:  
  - có tasks lặp lại mà vẫn xử lý manual?  
  - candidate cho automation trong roadmap.

## 8. Kết nối BAU với incidents và changes

- BAU daily/weekly là nơi **spot** patterns trước khi thành incidents (92).  
- Sau mỗi **incident major**, BAU monthly nên follow up action items; không để action "treo".  
- Các **change high-risk** (93) nên được review kết quả trong weekly/monthly – change có đạt mục tiêu? có side-effect?  
- BAU tạo input cho **change backlog**: list cải tiến nhỏ lanes A–B, và change lớn lanes C–D.

## 9. Tooling và hỗ trợ cho BAU

Để BAU khả thi, Pack 06 giả định:
- Dashboards work & integration (73, 84) đã tồn tại và có filter theo tenant/wedge/queue;  
- Có nơi tập trung cho **incidents & changes** (92, 93):  
  - incident list;  
  - change history;  
  - links tới runbooks.  
- Có templates agenda cho weekly/monthly/quarterly review;  
- BAU không dựa trên Excel thủ công mà dùng trực tiếp công cụ Nextflow + monitoring.

## 10. Anti-patterns cần tránh

1. Không có BAU rõ – chỉ phản ứng khi có sự cố lớn.  
2. BAU quá nặng – đòi hỏi họp dài, báo cáo phức tạp, khiến teams bỏ qua.  
3. BAU chỉ tập trung vào số kỹ thuật (CPU, memory) mà quên work & customer outcomes.  
4. BAU không liên kết với changes & incidents – mọi thứ bị nhìn rời rạc.  
5. Không ưu tiên theo risk tiers – dành nhiều thời gian vào Tier 1 mà quên Tier 3–4.  
6. BAU thiếu người tham gia từ Product/CS – chỉ có Ops/Platform ngồi với nhau.

## 11. Điều kiện hoàn thành của tài liệu

BAU Operations Runbook and Review Cadences được xem là đạt yêu cầu khi:
- các đội Ops/Platform/Product/CS có thể chạy daily/weekly/monthly routines consistent;  
- dashboards & tools đủ để làm BAU mà không tốn thêm report thủ công;  
- incidents & changes được follow up trong các review đều đặn;  
- và health của Nextflow OS được nhìn thấy như một phần của công việc hàng ngày, không phải "bất ngờ".

## AG Execution Prompt

You are acting as a BAU operations designer, cadence planner and continuous improvement enabler.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–05 define data, UX, work orchestration, integration and observability; Pack 06 defines governance & operations.
- This document defines BAU operations routines and review cadences.

### Objective
Refine this document into practical routines and cadences that teams can adopt without heavy overhead.

### Inputs
- Use this document, observability docs (73, 84), incident & change docs (92–93), and Pack 05 summary (88) as context.  
- Preserve focus on light-but-regular habits and cross-functional participation.  
- Keep it understandable to ops, product and CS teams.

### Tasks
1. Clarify daily, weekly, monthly and quarterly routines.  
2. Specify how to use existing dashboards and signals in BAU.  
3. Link BAU to incident follow-up and change planning.  
4. Suggest simple tooling/agenda patterns.  
5. Identify anti-patterns and health indicators.

### Constraints
- Do not design heavyweight ITIL processes; keep SME-friendly.  
- Do not add reporting that duplicates existing dashboards.  
- Do not separate BAU from risk tiers and governance context.  
- Keep language concrete and example-driven.

### Output Format
Return a revised markdown document with these sections:
1. BAU Thesis and Goals  
2. Daily and Weekly Routines  
3. Monthly and Quarterly Reviews  
4. Integration with Incidents, Changes and Tooling  
5. Anti-Patterns and Adoption Signals

### Acceptance Criteria
- The output must make BAU operations feel achievable and valuable.  
- The result must align với work & integration observability, incident and change docs.  
- The routines must be adoptable by small cross-functional teams.
