# Nextflow OS – Pack 04 Work Observability and Control Views Requirements

**Document ID:** 73_PACK04_WORK_OBSERVABILITY_AND_CONTROL_VIEWS_REQUIREMENTS  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Product Analytics / Operations Design  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS, 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL, 72_PACK04_EXCEPTION_HANDLING_AND_RESOLUTION_PLAYBOOK

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Work Observability and Control Views Requirements** cho Pack 04. Nếu:
- lifecycle (68) là xương sống vòng đời work;  
- assignment & routing (69) phân phối work;  
- automation & rules (70) quyết định hệ thống làm gì tự động;  
- SLA/priority (71) gắn thời gian & độ khẩn;  
- exception playbook (72) chuẩn hoá cách xử lý ngoại lệ;

thì tài liệu này trả lời câu hỏi cho managers và operations:

> **Họ sẽ “nhìn thấy” toàn bộ work trong Nextflow OS như thế nào – queue, backlog, pipeline, exceptions, automation, SLA health – và họ có thể điều chỉnh những gì (assign lại, đổi queue, chỉnh view, can thiệp vào exceptions) từ các màn hình “control tower / work views”?**

Mục tiêu:
- xác định personas chính của các work views (manager, supervisor, ops, CS lead);  
- mô tả các loại view chính (list, board, queue, pipeline, exception, capacity);  
- gắn các view với signals Pack 03/04 (events, metrics, SLA, automation, exception);  
- yêu cầu tối thiểu về filter/sort/actions trong mỗi view;  
- đảm bảo views dùng được trong pilot và operations SME, không chỉ cho BI.

## 2. Thesis về work observability và control

Thesis có thể phát biểu như sau:

> **Một hệ điều phối công việc mà manager không “nhìn thấy” rõ work ở đâu, đang mắc ở đâu, ai đang quá tải, automation đang làm gì, exceptions đang gom ở đâu – thì không thể vận hành tốt. Pack 04 phải cung cấp một tập views đơn giản nhưng mạnh, để mỗi buổi sáng người quản lý có thể hiểu bức tranh, can thiệp vừa đủ, và rồi dùng signals đó để học và cải tiến.**

Nguyên lý:

1. Work views phải **phản ánh lifecycle và queues** – không phải một bảng static.  
2. Views phải **hiển thị được SLA, priority, assignment trạng thái** một cách dễ hiểu.  
3. Managers phải có **action nhanh** từ view: assign lại, đổi queue, mở exception case, thêm note.  
4. Views phải tận dụng **event taxonomy (49)** và metrics (42, 55) để hiển thị signals, không là chỗ nhập tay.  
5. Work observability không thay thế dashboards BI; nó là lớp real-time/near-real-time để vận hành ngày–tuần.  
6. Các view phải có thể cấu hình được (filter, save view) nhưng giữ đơn giản cho SME.  
7. Pack 04 views phải nhất quán với UX grammar Pack 03 về states, labels, copy.

## 3. Personas và nhu cầu

### 3.1 Team supervisor / line manager

- Cần thấy: work trong team hôm nay, ai đang làm gì, việc nào gấp.  
- Actions chính: reassign, hỗ trợ, nhắc nhở, giải quyết block đơn giản.  
- Quan tâm tới: queue team, SLA near-breach, work “kẹt” lâu.

### 3.2 Operations manager / area manager

- Cần thấy: tổng thể work theo khu vực/loại/queue, capacity đội.  
- Actions: điều chỉnh routing rules (ở mức cấu hình nhẹ), tái phân bổ workload giữa teams.  
- Quan tâm: SLA health, exception patterns, automation performance.

### 3.3 CS lead / support lead

- Cần thấy: complaints, exceptions, tickets liên quan work.  
- Actions: tạo/điều phối exception cases, làm việc với Product/Eng/Field.  
- Quan tâm: exceptions theo loại, resolution time, root cause patterns.

### 3.4 Product ops / pilot lead

- Cần thấy: work trong pilot, patterns assignment/SLA/exception.  
- Actions: manual overrides, tweak rules, log learnings cho post-pilot.  
- Quan tâm: impact của changes Pack 04 trên thực tế.

## 4. Loại work views chính

Pack 04 đề xuất ít nhất 5 loại view:

1. **Team Worklist View** – danh sách công việc của một team/queue.  
2. **Owner Worklist View** – danh sách công việc của một owner.  
3. **Pipeline / Stage View** – xem work theo lifecycle phases.  
4. **SLA & Priority Health View** – tập trung vào thời gian và mức khẩn.  
5. **Exception & Automation Health View** – tập trung vào exceptions và automation.

### 4.1 Team Worklist View

- Mục tiêu: cho supervisor thấy **work in queue/team** và can thiệp nhanh.  
- Thông tin tối thiểu per item:  
  - ID, loại work, customer/đối tượng;  
  - state UX chính;  
  - owner (nếu có) hoặc queue;  
  - due date, SLA status, priority;  
  - age (thời gian từ Created hoặc từ vào queue).  
- Filter/sort tối thiểu:  
  - theo state, owner, queue, SLA status, priority, loại work.  
- Actions:  
  - assign/reassign owner;  
  - chuyển queue;  
  - mở chi tiết;  
  - flag exception;  
  - thêm note.

### 4.2 Owner Worklist View

- Mục tiêu: cho mỗi cá nhân hoặc owner thấy **những việc mình chịu trách nhiệm**.  
- Thông tin tương tự team view nhưng ít filter hơn.  
- Hiển thị gọn trên Web và Mobile.  
- Có thể có grouping bởi “Hôm nay”, “Tuần này”, “Trễ hạn”.

### 4.3 Pipeline / Stage View

- Mục tiêu: cho operations thấy **công việc đang tập trung ở phase nào** của lifecycle (68).  
- Dạng Kanban/bucket: mỗi cột là một hoặc nhóm phase (Created/Ready/Assigned/In Progress/Pending Review/Resolved).  
- Cho phép drill down từ cột vào list items cụ thể.  
- Có thể overlay SLA status trên từng cột (bao nhiêu on track, at risk, breached).

### 4.4 SLA & Priority Health View

- Mục tiêu: tập trung vào **thời gian & mức khẩn**.  
- Dạng list với filter mạnh hoặc dạng bảng + mini chart (dựa vào 55).  
- Cho phép:  
  - xem tasks near-breach;  
  - xem tasks breached;  
  - sort theo time-to-due;  
  - xem phân bố priority vs thời gian còn lại.

### 4.5 Exception & Automation Health View

- Mục tiêu: tập trung vào **exceptions** (72) và hành vi automation (70).  
- Thông tin:  
  - số exception cases theo loại, severity;  
  - exception open vs resolved;  
  - automation events (auto-assign, auto-close, auto-escalate);  
  - override/waiver counts.  
- Actions:  
  - mở exception case;  
  - flag pattern cần review rules;  
  - link tới dashboards chi tiết.

## 5. Mapping view → signals, events và metrics

Mỗi view nên được build trên event taxonomy (49) và metrics (42, 55):

- Team/Owner Worklist:  
  - dựa trên events `task_created`, `task_assigned`, `task_state_changed`, `task_completed/closed`.  
- Pipeline View:  
  - dựa trên lifecycle phase mapping (68), events `phase_entered`, `phase_exited`.  
- SLA & Priority View:  
  - dựa trên `sla_started`, `sla_warning_issued`, `sla_breached`, `due_date_set/updated`, `priority_set/updated`.  
- Exception View:  
  - dựa trên `exception_case_created/resolved/closed`, `exception_type`.  
- Automation Health:  
  - dựa trên `rule_fired`, `auto_assignment_performed`, `auto_transition_performed`, `override_performed`, `waiver_granted`.

Pack 04 không phải là nơi thiết kế dashboards BI chi tiết, nhưng những view này nên dùng chung nguồn dữ liệu với dashboards (55) để nhất quán.

## 6. Control actions và authority

Từ các work views, managers/ops có thể thực hiện một số actions – nhưng phải tôn trọng authority (43, 50, 57):

- Reassign owner:  
  - chỉ roles có quyền mới làm được;  
  - events `task_reassigned` phải log ai → ai, khi nào.  
- Change queue:  
  - có thể giới hạn theo team/territory;  
  - cần đảm bảo routing rules vẫn meaningful.  
- Open/resolve exception:  
  - phải theo exception playbook (72);  
  - roles khác nhau có quyền triage vs quyết định.  
- Adjust priority/due date:  
  - có thể cho phép trong guardrails;  
  - cần log `priority_updated`/`due_date_updated` với reason (nếu cần).

Không nên cho phép từ views các hành động phá lifecycle (vd force-complete task mà không đủ dữ liệu) trừ khi qua cơ chế override/waiver (70, 57).

## 7. UX principles cho work views

Pack 03 chịu trách nhiệm cụ thể về UI, nhưng Pack 04 đề xuất nguyên tắc:

- **Clarity trước**: ít cột nhưng đúng cột; không biến worklist thành spreadsheet khổng lồ.  
- **Consistent labels**: dùng state/label/copy giống các screen khác.  
- **Progressive disclosure**: thông tin chi tiết (vd event history) nên nằm trong panel chi tiết, không trong list chính.  
- **Responsive to role**: supervisor thấy nhiều control hơn owner; CS lead thấy nhiều exception hơn.  
- **Mobile-aware**: các view cá nhân (owner worklist) phải dùng được trên Mobile; views phức tạp hơn có thể chỉ cần trên Web.

## 8. Pilot and continuous improvement sử dụng work views

Trong pilot, work views sẽ đóng vai trò:

- enabling supervisors và pilot leads **thấy ngay** patterns assignment, SLA, exception mà không cần BI riêng;  
- là nơi ghi nhận feedback về usability và meaning của states/labels;  
- là nơi experiment nhỏ – ví dụ thay đổi routing hoặc priority view – để xem impact nhanh.

Post-pilot synthesis (60) và retro (65) nên có phần “Work views & control”: cái gì giúp, cái gì gây nhiễu, cần view nào nữa.

## 9. Anti-pattern work observability cần tránh

1. Biến work views thành báo cáo read-only, không cho action nào; managers sẽ quay lại Excel/email.  
2. Tràn quá nhiều cột và filter, khiến user không dùng nổi.  
3. Hiển thị states/SLA/priority không align với copy Pack 03, gây hiểu nhầm.  
4. Cho phép control actions (reassign, close) quá rộng mà không check authority.  
5. Không reuse event/metrics taxonomy – mỗi view đọc dữ liệu khác nhau.  
6. Xem work views như “tính năng đẹp” chứ không dùng hàng ngày; dấu hiệu là managers vẫn phải export để xử lý ngoài.

## 10. Bàn giao sang các doc Pack 04 và Pack 06

Work Observability and Control Views Requirements là cầu nối giữa Pack 04 và:

- **Pack 03 Web Admin UX** – để thiết kế cụ thể screens.  
- **Pack 02 Data & Analytics** – để hiện thực hoá queries, aggregations, indexes phù hợp.  
- **Pack 06 Governance** – để xác định ai được thấy gì/làm gì trên các view control.  
- **Pack 04 doc 75** – automation pilot, khi view automation health trở thành một phần của maturity loop.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Work Observability and Control Views của Pack 04:

1. Pack 04 phải cung cấp một bộ work views vận hành (team/owner/pipeline/SLA/exception/automation), không chỉ dashboards.  
2. Các view này phải bám chặt lifecycle, assignment, automation, SLA, exception models, và sử dụng chung event/metrics taxonomy.  
3. Managers phải có khả năng hành động từ views trong phạm vi authority.  
4. UX work views phải được thiết kế cho clarity, role-based simplicity và nhất quán với Pack 03.  
5. Work views là công cụ trung tâm trong pilot và operations để đọc Pack 04 orchestration “đang sống” thế nào.  
6. Các cải tiến tương lai của Pack 04 nên xem work views như bề mặt điều khiển chính của hệ điều phối.

## 12. Điều kiện hoàn thành của tài liệu

Work Observability and Control Views Requirements được xem là đạt yêu cầu khi:
- Product/UX/Eng/Operations có chung hiểu biết về loại view cần có và thông tin/action trong mỗi view;  
- thiết kế Web Admin & control surfaces của Pack 03/04 có thể dựa trên đây để chi tiết hoá;  
- pilot sử dụng được các view này để điều phối work hàng ngày;  
- và metrics từ views được đưa vào post-pilot và retro để cải thiện orchestration.

## AG Execution Prompt

You are acting as a work-control UX strategist, observability requirements architect, and operations co-pilot designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 04 defines orchestration; Pack 03 defines UX; Pack 02/55 define metrics/dashboards.
- This document defines the requirements for operational work views and control surfaces.

### Objective
Refine this requirements doc into a clear set of work views, signals, and controls that managers and operations can use daily to understand and steer work.

### Inputs
- Use this document, lifecycle (68), assignment (69), automation (70), SLA (71), exception playbook (72), and Pack 03 UX docs as context.
- Preserve the distinction between operational views and BI dashboards.  
- Keep the requirements grounded in SME operations and pilots.

### Tasks
1. Clarify persona needs and view types.  
2. Sharpen view-specific information, filters and actions.  
3. Map each view to events and metrics.  
4. Highlight authority constraints on control actions.  
5. Identify anti-patterns and success indicators.

### Constraints
- Do not overload views with data; focus on what managers need to act.  
- Do not duplicate full BI dashboards.  
- Do not break Pack 03 UX grammar.  
- Keep views implementable with reasonable data infrastructure.

### Output Format
Return a revised markdown document with these sections:
1. Personas and Use Cases
2. Core Work Views
3. Signals, Events and Metrics
4. Controls and Authority
5. Anti-Patterns and Success Signals

### Acceptance Criteria
- The output must make work observability and control concrete and actionable.  
- The result must align with Pack 04 orchestration and Pack 03 UX semantics.  
- The requirements must be usable by UX and Engineering to design and build views.  
- The document must help ensure managers actually use the views in daily operations.
