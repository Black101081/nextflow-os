# Nextflow OS – Pack 04 Automation Pilot Patterns and Maturity Ladder

**Document ID:** 75_PACK04_AUTOMATION_PILOT_PATTERNS_AND_MATURITY_LADDER  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Product Analytics / Program Delivery / Operations Design  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK, 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS

## 1. Mục tiêu tài liệu

Tài liệu này là **Automation Pilot Patterns and Maturity Ladder** cho Pack 04. Sau khi Pack 04 đã định nghĩa:
- lifecycle (68);  
- assignment/queues/routing (69);  
- automation levels & rule types & guardrails (70);  
- SLA/due date/priority (71);  
- exception handling (72);  
- work views & control surfaces (73);

thì tài liệu này trả lời câu hỏi:

> **Làm thế nào để Nextflow OS và khách hàng SME thử nghiệm (pilot) các rule automation & orchestration – auto-assign, auto-reminder, auto-escalate, auto-close – một cách an toàn, có thể quan sát, có thể rollback, và theo một “thang trưởng thành” rõ ràng, thay vì bật/tắt cảm tính?**

Mục tiêu:
- định nghĩa các pattern pilot automation cơ bản;  
- mô tả maturity ladder từ manual tới automation cao, gắn với Pack 04;  
- mô tả cách đo lường và đánh giá automation pilot;  
- mô tả role & trách nhiệm trong pilot automation;  
- nối automation pilot vào triage, post-pilot learning, retro và governance.

## 2. Thesis về automation pilot cho Pack 04

Thesis có thể phát biểu như sau:

> **Automation mạnh chỉ có ý nghĩa khi nó được xây trên những bước nhỏ, học được từ dữ liệu thực tế và có thể giảm lại nếu cần. Với SME, điều quan trọng không phải là “AI mạnh tới đâu”, mà là “chúng ta có dám bật automation hay không, và nếu bật, chúng ta biết rõ nó đang làm gì, giúp hay hại ở đâu”.**

Nguyên lý:

1. Pilot automation phải bắt đầu từ **rule đơn giản, dễ giải thích**.  
2. Mỗi pilot phải có **hypothesis rõ**: automation này muốn cải thiện điều gì, đo bằng metric nào.  
3. Mọi automation bật trong pilot phải có **cách tắt nhanh** và rollback.  
4. Pilot phải có **guardrails authority & continuity** (70, 53, 57).  
5. Work views (73) và dashboards (55) phải hiển thị signals automation.  
6. Post-pilot docs (60) và retro (65) phải thu lại học & quyết định với từng rule.  
7. Maturity ladder phải cho phép khách hàng dừng ở mức mà họ cảm thấy an toàn, không ép phải lên cao nhất.

## 3. Maturity ladder cho automation Pack 04

Dựa trên 70, Pack 04 đề xuất một maturity ladder theo **cả chiều sâu automation và phạm vi áp dụng**.

### 3.1 Level A – Manual + Logging

- Mọi assignment, transitions, escalations đều manual.  
- Hệ thống chỉ log events đầy đủ.  
- Mục tiêu: hiểu baseline hiện tại, time-to-complete, queue times, SLA health.

### 3.2 Level B – Assistive (Guided)

- Bật các **suggestion rules** (70 Level 1): gợi ý owner, gợi ý next action, cảnh báo SLA, highlight priority.  
- Không có action nào auto; người dùng bấm tay.  
- Dùng pilot để đo:  
  - users có chấp nhận gợi ý không;  
  - suggestion có hợp lý không;  
  - có giảm thời gian suy nghĩ không.

### 3.3 Level C – Defaulted (Auto-fill)

- Bật các **default rules** (70 Level 2): auto set queue, default due date, default priority, default route cho review.  
- Users vẫn có thể sửa trước khi xác nhận.  
- Pilot đo:  
  - số lần user giữ nguyên default vs sửa;  
  - lỗi do default gây ra (nếu có);  
  - độ hài lòng của supervisor.

### 3.4 Level D – Limited Auto (Safe auto-actions)

- Bật một số **Level 3 rules** low-risk:  
  - auto-reminder trước SLA;  
  - auto-assign vào team queue (không đến owner cụ thể);  
  - auto-flag exception khi có pattern rõ (vd SLA breach).  
- Luôn có override và logging; không auto-approve/resolution ở level này.  
- Pilot đo:  
  - hiệu quả (giảm việc trễ, giảm manual work);  
  - side-effects (tăng exceptions, override nhiều?).

### 3.5 Level E – Extended Auto (High-confidence auto-actions)

- Bật thêm rules auto-assign tới owner, auto-close case đơn giản, auto-approve một số pattern low-risk.  
- Đòi hỏi:  
  - đã qua nhiều vòng pilot ở level thấp hơn;  
  - có governance Pack 06 chấp thuận;  
  - có monitoring chặt.  
- Pilot ở level này nên theo cohort nhỏ (subset khách hàng, khu vực) trước khi mở rộng.

## 4. Patterns pilot automation cơ bản

### 4.1 Pilot auto-reminder SLA

- Scope: một loại work cụ thể (vd follow-up call) ở một pilot site.  
- Rule: gửi reminder cho owner 24h trước due date nếu chưa In Progress.  
- Measurement:  
  - tỉ lệ SLA breach trước/sau;  
  - phản hồi users về “spam” hay hữu ích;  
  - số lần owner hành động sau reminder.

### 4.2 Pilot auto-assign vào team queue

- Scope: tasks tạo ra từ một channel (vd forms online).  
- Rule: auto-route tasks mới vào queue của team X dựa trên territory.  
- Measurement:  
  - thời gian từ Created đến Ready/In Queue;  
  - load theo team;  
  - feedback supervisors về fairness.

### 4.3 Pilot suggestion owner (assistive)

- Scope: các tasks phức tạp cần skill;  
- Rule: gợi ý owner dựa trên skill/territory/capacity, user vẫn chọn.  
- Measurement:  
  - tỷ lệ gợi ý được chấp nhận;  
  - thời gian assign;  
  - cảm nhận users.

### 4.4 Pilot auto-flag exception

- Scope: SLA breach hoặc integration error.  
- Rule: tạo exception case khi condition xảy ra.  
- Measurement:  
  - số exceptions;  
  - thời gian resolve exception;  
  - pattern root cause;  
  - impact lên cải tiến flows/rules.

### 4.5 Pilot auto-close simple cases

- Scope: cases có pattern đơn giản (vd “chỉ cần confirm” sau 3 ngày không có feedback).  
- Rule: auto-close nếu đủ điều kiện X/Y/Z và không có activity trong N ngày.  
- Guardrails:  
  - clear messaging;  
  - khả năng reopen;  
  - cohort nhỏ.  
- Measurement:  
  - reduction in open backlog;  
  - número reopen;  
  - feedback khách hàng.

## 5. Đo lường và đánh giá automation pilot

Các chỉ số nên được định nghĩa trước pilot:

- Target metrics:  
  - time-to-assign, time-to-first-action, time-to-complete;  
  - SLA breach rate;  
  - queue times;  
  - manual operations (số lần assign/manual action).  
- Risk metrics:  
  - override/waiver count;  
  - exception cases do automation;  
  - complaints hoặc negative feedback;  
  - authority violations (nếu có).  
- Adoption metrics:  
  - tỷ lệ suggestion accepted;  
  - tỷ lệ users bật/tắt automation (nếu user-level);  
  - usage work views automation health.

Pilot nên có **baseline** (trước automation) và **comparison window** (sau automation) với điều kiện tương tự.

## 6. Roles & responsibilities trong automation pilot

- **Product Management**:  
  - định nghĩa scope & hypothesis;  
  - ưu tiên rule sử dụng.  
- **Workflow & Orchestration / Engineering**:  
  - implement rules;  
  - đảm bảo logging events;  
  - support rollback.  
- **Product Analytics**:  
  - định nghĩa metrics;  
  - chuẩn bị dashboards;  
  - phân tích kết quả.  
- **Program Delivery / Pilot Lead**:  
  - điều phối pilot;  
  - thu feedback từ users.  
- **Operations / CS / Supervisors**:  
  - cung cấp phản hồi thực tế;  
  - dùng work views để giám sát;  
  - escalates issues.  
- **Governance / Pack 06**:  
  - đánh giá risk cho automation cấp cao;  
  - phê duyệt mức automation cao hơn.

## 7. Tích hợp automation pilot vào triage, post-pilot và retro

Automation pilot không đứng riêng:

- **Triage model (48)**: gắn tag automation vào issues & exceptions để phân tích.  
- **Post-pilot synthesis (60)**: có section riêng “Automation learnings & decisions”; log rule nào giữ, chỉnh, tắt.  
- **Decision log (07, 60)**: ghi lại “Enable/Disable/Change rule X tại cohort Y, vì lý do Z”.  
- **Retro Pack 04 (65)**: review automation pilot như một theme:  
  - cái gì giúp;  
  - cái gì gây rủi ro;  
  - communication/training cần gì thêm.

## 8. Anti-pattern automation pilot cần tránh

1. Bật nhiều rule cùng lúc, không biết rule nào ảnh hưởng gì.  
2. Không định nghĩa hypothesis & metrics từ trước, pilot xong không biết thành công hay thất bại.  
3. Không có rollback path – buộc phải “sống với” automation tệ.  
4. Bỏ qua authority/continuity guardrails, gây rủi ro cho người dùng hiện trường.  
5. Không involve supervisors/ops trong design pilot; automation “rơi từ trên xuống”.  
6. Không sử dụng work views và dashboards để đọc pilot; chỉ nghe anecdote.  
7. Không log decisions; vài tháng sau không ai nhớ đã thử những gì.

## 9. Dấu hiệu maturity automation Pack 04

Automation maturity tăng khi:

- nhiều flows đã đi qua Level B/C/D với kết quả rõ;  
- rules có performance tracked, có điều chỉnh dựa trên data;  
- supervisors tin tưởng automation vì họ thấy được hành vi trên work views;  
- exceptions do automation giảm dần;  
- governance có quy trình chuẩn duyệt & review rules;  
- khách hàng bên SME coi automation như “một phần bình thường” của hệ thống, không phải “thứ nguy hiểm phải tránh”.

## 10. Bàn giao sang Pack 06 và các packs khác

Automation Pilot Patterns and Maturity Ladder là cầu nối sang:

- **Pack 06 Operations & Governance** – để định nghĩa quy trình phê duyệt automation, kiểm soát rủi ro, audit.  
- **Pack 02 Core Platform & Data** – để hiện thực rule engine, logging, feature flags.  
- **Pack 03 Experience & UX** – để đảm bảo messaging & UX hỗ trợ bật/tắt và giải thích automation.  
- **GTM/Customer Success packs** – để kể câu chuyện automation với khách hàng một cách thực tế.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Automation Pilot Patterns and Maturity Ladder của Pack 04:

1. Automation phải được roll-out qua các mức maturity (A→E), bắt đầu từ assistive & default, rồi mới tới auto.  
2. Mỗi pilot automation phải có hypothesis, metrics, guardrails và rollback rõ ràng.  
3. Work views & dashboards là bề mặt quan sát chính cho automation pilot.  
4. Automation pilot là trách nhiệm chung của Product, Engineering, Analytics, Program Delivery, Operations và Governance.  
5. Automation decisions phải được log và xem lại trong retrospectives.  
6. Pack 04 automation phải trọng pilotability và explainability hơn là độ “thông minh” thuần tuý.

## 12. Điều kiện hoàn thành của tài liệu

Automation Pilot Patterns and Maturity Ladder được xem là đạt yêu cầu khi:
- đội ngũ có thể dùng nó để thiết kế và chạy pilot automation có cấu trúc;  
- khách hàng SME có thể hiểu và đồng ý tham gia pilot;  
- kết quả pilot dẫn tới quyết định rõ ràng về việc giữ/sửa/tắt automation;  
- và Pack 04 automation mature dần mà không đánh mất sự tin tưởng của người dùng.

## AG Execution Prompt

You are acting as an automation rollout strategist, pilot designer, and risk-aware product leader.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 04 defines orchestration and automation; Pack 03 defines UX and authority semantics; Pack 02 & 06 support data and governance.
- This document defines how to pilot and mature automation in Pack 04.

### Objective
Refine this document into a concrete set of pilot patterns and a maturity ladder that teams can follow to introduce automation safely and effectively for SME customers.

### Inputs
- Use this document, Pack 04 lifecycle/assignment/automation/SLA/exception/view docs, and Pack 03/06 governance concepts as context.
- Preserve the ladder structure and focus on hypothesis-driven pilots.  
- Keep patterns realistic and explainable.

### Tasks
1. Clarify maturity levels with concrete examples.  
2. Define 3–5 standard pilot patterns with metrics.  
3. Specify roles, responsibilities and governance checkpoints.  
4. Integrate work views and dashboards into pilot monitoring.  
5. Identify anti-patterns and success indicators.

### Constraints
- Do not assume heavy ML/AI; focus on rules and simple heuristics.  
- Do not break Pack 03 authority or continuity semantics.  
- Do not make pilots so complex that SME teams cannot run them.  
- Keep the ladder usable across different wedges/domains.

### Output Format
Return a revised markdown document with these sections:
1. Automation Pilot Thesis
2. Maturity Levels
3. Pilot Patterns and Metrics
4. Roles, Governance and Monitoring
5. Anti-Patterns and Success Signals

### Acceptance Criteria
- The output must make automation pilots structured, measurable and safe.  
- The result must align with Pack 04 orchestration and Pack 03/06 governance.  
- The document must be usable as a playbook for real automation rollouts.  
- The ladder must support gradual, data-driven increase in automation.
