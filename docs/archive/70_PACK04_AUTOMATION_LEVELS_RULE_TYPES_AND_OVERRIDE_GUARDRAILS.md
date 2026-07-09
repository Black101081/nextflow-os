# Nextflow OS – Pack 04 Automation Levels, Rule Types and Override Guardrails

**Document ID:** 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Data & Decisioning  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Automation Levels, Rule Types and Override Guardrails** cho Pack 04. Nếu lifecycle (68) là xương sống “task/case đi qua những phase nào”, và assignment/routing (69) quyết định “work đi từ queue nào tới tay ai”, thì tài liệu này trả lời câu hỏi:

> **Ở những điểm nào trong lifecycle và routing, Nextflow OS nên – và không nên – tự động làm thay người dùng (auto-assign, auto-transition, auto-approve, auto-close…), dưới hình thức rule gì, ở mức độ nào (gợi ý, default, auto), và với hàng rào (guardrails) nào để không phá vỡ authority, continuity và khả năng audit?**

Mục tiêu:
- định nghĩa các level automation phù hợp với SME;  
- phân loại rule types chính (condition, threshold, routing, exception, suggestion);  
- xác định attachment points của rules vào lifecycle và assignment;  
- đặt guardrails cho override, waiver, audit và rollback;  
- tạo nền cho pilot automation (doc 75) và governance (Pack 06).

## 2. Thesis automation cho Pack 04

Thesis có thể phát biểu như sau:

> **Automation trong Pack 04 không nhằm thay thế con người, mà nhằm loại bỏ thao tác lặp lại, giảm việc “bấm nút cho có lệ”, và đảm bảo công việc không rơi vào khoảng trống – nhưng luôn trong phạm vi quyền hạn, có thể giải thích và có thể override. Một automation tốt là automation mà user hiểu được, tin tưởng, và có thể tắt hoặc chỉnh khi bối cảnh thay đổi.**

Từ thesis này, chín nguyên lý:

1. Automation phải **giải thích được** (“vì sao hệ thống làm vậy?”).  
2. Automation phải **tôn trọng authority** – không đưa ra quyết định vượt quyền hoặc không thể audit.  
3. Mức automation nên tăng dần theo maturity – bắt đầu từ gợi ý, sau đó mới tới auto.  
4. Mọi hành vi auto phải có **events** để quan sát và đánh giá hiệu quả.  
5. Override là bình thường – nhưng override phải có log và, nếu cần, rationale.  
6. Không nên “đóng cứng” logic domain vào code; rules phải được cấu hình, version hoá, kiểm soát.  
7. Automation phải xem xét continuity/offline – đừng giả định rằng mọi thing luôn real-time.  
8. SME không cần ML phức tạp ngay từ đầu; rules đơn giản, rõ ràng thường đủ tốt cho giai đoạn đầu.  
9. Pilot automation phải có kế hoạch rollback hoặc giảm mức nếu signals cho thấy vấn đề.

## 3. Automation levels trong Pack 04

Pack 04 đề xuất một **ladder automation** gồm 4 level chính:

1. **Level 0 – No automation (Manual)**  
   - Người dùng hoặc manager làm mọi việc; hệ thống chỉ ghi nhận.  
   - Dùng làm baseline để so sánh.

2. **Level 1 – Assistive / Guided**  
   - Hệ thống **đề xuất** (gợi ý owner, gợi ý action tiếp theo, cảnh báo SLA, highlight priority) nhưng không tự thực hiện.  
   - User vẫn phải bấm nút và chịu trách nhiệm.

3. **Level 2 – Defaulted / Auto-fill**  
   - Hệ thống **tự điền** hoặc set default cho một số field/actions (vd auto chọn queue, auto set due date), nhưng user có thể sửa trước khi xác nhận.  
   - Quyết định cuối vẫn là của user; hệ thống chỉ giảm thao tác.

4. **Level 3 – Fully Automated (With Override)**  
   - Hệ thống tự động thực hiện một số transitions hoặc assignments khi đủ điều kiện: auto-assign, auto-close, auto-escalate.  
   - User có thể override trong một số khung, hoặc sau đó (vd reopen, reassign, cancel).

Trong mỗi wedge/pilot, Pack 04 nên **bắt đầu ở Level 1–2**, chỉ nâng lên Level 3 khi:  
- signals cho thấy pattern ổn định;  
- governance (Pack 06) đã chấp thuận.

## 4. Loại rule (Rule Types)

Pack 04 phân loại rule types chính:

1. **Routing rules** – quyết định queue/team/owner (liên kết với doc 69).  
2. **Transition rules** – quyết định khi nào lifecycle chuyển phase (68).  
3. **SLA/time-based rules** – dựa trên due date, SLA, thời lượng ở phase (liên kết với doc 71).  
4. **Exception rules** – flag exceptions, mở case resolution (doc 72).  
5. **Suggestion rules** – gợi ý next action, gợi ý owner, gợi ý priority.  
6. **Validation rules** – kiểm tra dữ liệu trước khi cho transition (ít liên quan automation, nhưng cùng cơ chế rule).  
7. **Integration-trigger rules** – phản ứng với events từ hệ thống ngoài (Pack 05).

Mỗi rule type có thể hoạt động ở Level 1–3 tuỳ maturity.

## 5. Attachment points của rules vào lifecycle & assignment

Dựa trên lifecycle 68 và assignment 69, Pack 04 định nghĩa các **điểm hay** để gắn rules:

- Khi task/case **được tạo** (`Created`):  
  - routing rule (queue/team), default due date, default priority.  
- Khi vào `Ready/In Queue`:  
  - suggestion/assignment rule (gợi ý owner), SLA start, first reminder.  
- Khi chuyển `Ready → Assigned/Accepted`:  
  - validation rule (vd chỉ auto-assign nếu owner có skill/role phù hợp).  
- Khi `In Progress`:  
  - SLA/time-based rules cho reminders, escalation.  
- Khi chuyển `In Progress → Pending Review`:  
  - routing rule cho reviewer; validation rules về dữ liệu.  
- Khi `Pending Review`:  
  - auto-approve rule cho case đơn giản; exception rules cho case phức tạp.  
- Khi `Resolved/Completed`:  
  - auto-close rules, integration-trigger rules (notify downstream systems).

## 6. Guardrails authority & override

Automation không được vượt authority Pack 03:

- **Authority guardrails**:  
  - Không auto-approve actions mà role hiện tại không có quyền.  
  - Không auto-assign tasks review/approval cho role không có permission đó.  
  - Không auto-escalate vượt quá chain of command đã định nghĩa.  
- **Override guardrails**:  
  - Cho phép override trong những trường hợp domain cho phép (vd manager có thể đổi owner, reopen case) nhưng luôn log event như `override_performed` với who/when/why.  
  - Một số actions không được override (vd ghi nhận pháp lý), được governed bởi Pack 06.  
- **Waiver model** (57):  
  - Một số rule có thể “bị bỏ qua” cho case cụ thể nếu có waiver, với audit trail rõ.

## 7. UX & copy considerations cho automation

Automation phải **cảm** đúng với người dùng Pack 03:

- Khi auto-assign: messaging nên rõ (“Hệ thống đã tự động giao nhiệm vụ này cho bạn vì…”).  
- Khi auto-approve/auto-close: messaging phải giải thích lý do (“Đã tự động đóng vì đủ điều kiện X, Y, Z và hết hạn phản hồi”).  
- Khi suggestion: wording nên phân biệt rõ giữa “Hệ thống đề xuất” và “Hệ thống đã làm”.  
- Khi SLA-based escalation: copy cần nói rõ escalate tới ai và vì sao.

Những điểm này phải phù hợp với copy system (40, 47) và tránh semantic drift (54).

## 8. Observability cho automation và rule effectiveness

Automation phải được đo lường:

- Metric gợi ý:  
  - tỷ lệ suggestion được user chấp nhận;  
  - tỷ lệ auto-assign dẫn tới reassign;  
  - tỷ lệ auto-approve dẫn tới reopen hoặc complaint;  
  - mức giảm trong time-to-complete sau khi bật rule;  
  - số override/waiver theo loại rule.  
- Events:  
  - `rule_evaluated`, `rule_fired`, `rule_skipped`;  
  - `auto_assignment_performed`, `auto_transition_performed`;  
  - `override_performed`, `waiver_granted`.  
- Dashboards (55) nên có view riêng cho automation performance, ít nhất cho các pilot đầu.

## 9. Anti-pattern automation cần tránh

1. Bật automation Level 3 ngay từ đầu mà không qua giai đoạn assistive/default.  
2. Để automation chạy “ngầm” mà không có messaging và audit rõ.  
3. Automation bypass authority model, dẫn tới quyết định vượt quyền.  
4. Nhồi mọi logic domain vào rules, không phân lớp (vd rule engine trở thành chỗ duy nhất encode nghiệp vụ).  
5. Không có cơ chế tắt rule nhanh khi pilot cho thấy vấn đề.  
6. Không dùng metrics để đánh giá automation, chỉ dựa vào cảm giác.  
7. Thiết kế automation mà không xem xét offline/continuity, giả định mọi event đều online và tức thì.

## 10. Cách triển khai automation theo maturity

Pack 04 khuyến nghị một **maturity path**:

- **Phase 1 (Pilot)**:  
  - Chủ yếu Level 1 (assistive) và vài Level 2 đơn giản (default due dates, queues).  
  - Bật logging events đầy đủ, dashboard đơn giản.  
- **Phase 2 (Early rollout)**:  
  - Level 2 rộng hơn, một số Level 3 nhỏ và low-risk (auto-assign queue/team, auto-reminder).  
  - Thiết lập guardrails override rõ, training cho users.  
- **Phase 3 (Mature)**:  
  - Thêm Level 3 cho các pattern ổn định, có giám sát.  
  - Bắt đầu thử rule phức tạp hơn (capacity/SLA-aware), có CI loop (65) chặt chẽ.

Mọi bước chuyển phase nên được log trong decision log (60) và review trong retro (65).

## 11. Bàn giao sang các doc Pack 04 tiếp theo

Automation levels & rule types & guardrails này là nền cho:

- **71 SLA, Due Date and Priority Model** – gắn time-based rules vào lifecycle/queues.  
- **72 Exception Handling and Resolution Playbook** – dùng rules để flag exceptions và mở flows resolution.  
- **73 Work Observability and Control Views Requirements** – yêu cầu views để thấy automation đang làm gì.  
- **75 Automation Pilot Patterns and Maturity Ladder** – chi tiết hoá cách pilot automation, đánh giá và nâng mức.

## 12. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Automation Levels, Rule Types and Override Guardrails của Pack 04:

1. Automation sẽ được triển khai theo levels (assistive → default → auto), không nhảy thẳng lên full auto.  
2. Rule types bao gồm routing, transition, SLA/time, exception, suggestion, validation, integration-trigger, với attachment points rõ vào lifecycle và assignment.  
3. Mọi automation phải tôn trọng authority, continuity và auditability; override và waivers phải được log.  
4. Automation phải có metrics và events riêng để đánh giá hiệu quả.  
5. Thiết kế automation phải xem xét tính pilotable và khả năng rollback/change.  
6. Các doc Pack 04 tiếp theo phải dùng khung levels & rule types & guardrails này để tránh mỗi module “tự bịa” logic automation.

## 13. Điều kiện hoàn thành của tài liệu

Automation Levels, Rule Types and Override Guardrails được xem là đạt yêu cầu khi:
- đội Product/Eng/Operations có chung hiểu biết về những gì automation được phép làm;  
- mọi rule mới đều được gắn vào một level và type rõ ràng, với guardrails authority & override;  
- automation có thể được pilot, quan sát và điều chỉnh dựa trên signals;  
- và Pack 04 có thể mở rộng automation mà không làm rối Pack 03 hoặc phá authority/continuity semantics.

## AG Execution Prompt

You are acting as an automation systems designer, rule framework architect, and governance-conscious product strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 04 defines orchestration; Pack 03 defines UX and authority semantics.
- This document defines automation levels, rule types and guardrails for Pack 04.

### Objective
Refine this framework into a practical ladder of automation, with clear rule types, attach points, and guardrails that SME customers can understand, pilot, and evolve over time.

### Inputs
- Use this document, the lifecycle (68), assignment (69), and key Pack 03 docs as context.
- Preserve the levels (assistive, defaulted, auto) and connection to authority and continuity.  
- Keep focus on rules that are realistic for SME operations.

### Tasks
1. Clarify automation levels with examples.  
2. Sharpen rule type definitions and attach points.  
3. Define key events and metrics to track automation performance.  
4. Highlight authority, override and waiver patterns.  
5. Identify common automation pitfalls in SME pilots.  
6. Suggest a maturity path and governance checkpoints.

### Constraints
- Do not introduce heavy ML/AI complexity; focus on rules.  
- Do not break Pack 03 semantics.  
- Do not remove human oversight where it is critical for risk/compliance.  
- Keep the framework explainable to non-technical stakeholders.

### Output Format
Return a revised markdown document with these sections:
1. Automation Thesis and Levels
2. Rule Types and Attach Points
3. Authority, Override and Waivers
4. Events, Metrics and Observability
5. Pitfalls and Maturity Path

### Acceptance Criteria
- The output must give a clear, explainable automation ladder for Pack 04.  
- The result must integrate cleanly with lifecycle and assignment strategy.  
- The framework must be pilotable and governable in SME contexts.  
- The document must help avoid over-automation and authority violations.
