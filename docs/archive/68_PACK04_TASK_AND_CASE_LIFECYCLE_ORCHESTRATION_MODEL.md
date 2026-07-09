# Nextflow OS – Pack 04 Task and Case Lifecycle Orchestration Model

**Document ID:** 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Program Delivery  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Task and Case Lifecycle Orchestration Model** cho Pack 04. Nếu Pack 03 đã định nghĩa grammar trải nghiệm (states, actions, copy, authority, continuity) ở mức người dùng, thì tài liệu này trả lời câu hỏi ở lớp orchestration:

> **Đằng sau mỗi nhiệm vụ (task) hoặc case trong Nextflow OS, vòng đời của nó (lifecycle) thực sự vận động như thế nào – từ lúc được tạo ra, assign, thực hiện, review, escalate, close, đến lúc được audit lại – và Pack 04 sẽ mô hình hóa, điều phối và quan sát vòng đời đó ra sao, mà không phá vỡ semantics của Pack 03?**

Mục tiêu của tài liệu:
- định nghĩa khung lifecycle chung cho task/case ở Pack 04;  
- chỉ rõ mối quan hệ giữa lifecycle “kỹ thuật” và các states Pack 03 trình bày cho người dùng;  
- phân tách rõ: transitions nào do user, transitions nào do automation/orchestration, transitions nào do hệ thống khác;  
- làm nền cho assignment, SLA, automation, exception handling, work observability trong các doc Pack 04 tiếp theo.

Tài liệu này không nhằm mô tả mọi flow nghiệp vụ chi tiết, mà đưa ra **model lifecycle có cấu trúc** để các wedge khác nhau (sales ops, field ops, service ops…) có thể map vào.

Tài liệu này phải khóa mười ba thứ:
1. Định nghĩa cơ bản về task, case và lifecycle trong bối cảnh Pack 04.  
2. Thesis lifecycle orchestration của tài liệu.  
3. Các giai đoạn (phases) chính trong lifecycle chung của task/case.  
4. Các loại transitions (user-triggered, rule-triggered, system-triggered, integration-triggered).  
5. Cách lifecycle Pack 04 gắn với states hiển thị trong Pack 03.  
6. Cách lifecycle xử lý cross-surface (Web ↔ Mobile).  
7. Cách lifecycle tương tác với authority model và role-permission matrix.  
8. Cách lifecycle tương tác với continuity/offline và reconciliation semantics.  
9. Các hook để automation, SLA, routing và exception handling gắn vào lifecycle.  
10. Cách ghi nhận events và observability cho lifecycle.  
11. Những anti-pattern modeling lifecycle cần tránh.  
12. Cách dùng lifecycle model khi thiết kế flows mới và khi pilot.  
13. Cách lifecycle model này bàn giao cho các doc Pack 04 tiếp theo.

## 2. Định nghĩa cơ bản

### 2.1 Task và case

- **Task**: một đơn vị công việc tương đối hẹp, thường có người thực hiện chính rõ ràng, ví dụ “Khảo sát địa điểm A”, “Gọi lại khách B”, “Kiểm kê khu vực C”.  
- **Case**: một “khung” rộng hơn, có thể chứa nhiều tasks và trạng thái, ví dụ “Onboard khách hàng X”, “Xử lý complaint Y”. Case thường gắn với một đối tượng kinh doanh (khách, hợp đồng, địa điểm) và sống lâu hơn.

Trong Pack 04, lifecycle model được thiết kế để áp dụng cho cả hai, với một số điểm khác biệt về granularity trong các doc sau.

### 2.2 Lifecycle

Lifecycle là **chuỗi các giai đoạn và chuyển đổi** mà một task/case trải qua từ khi được tạo đến khi kết thúc (hoặc bị huỷ), bao gồm:
- giai đoạn “chưa có” → được tạo → được nhận → đang làm → chờ review/approval → resolved/closed → archived;  
- các đường rẽ như bị trả lại, escalate, cancel, merge/split.

## 3. Thesis lifecycle orchestration

Thesis có thể phát biểu như sau:

> **Nếu Pack 03 giúp người dùng “thấy” và “chạm” vào states cụ thể, thì lifecycle orchestration của Pack 04 là bộ xương bên trong đảm bảo rằng không task/case nào lạc đường: luôn biết nó đang ở đâu, ai chịu trách nhiệm, bước tiếp theo khả dĩ là gì, và automation/SLAs có thể can thiệp vào những điểm nào mà vẫn giữ được nghĩa và quyền hạn.**

Từ thesis này, tám nguyên lý được suy ra:

1. Mọi task/case phải luôn có **trạng thái lifecycle rõ ràng** – không tồn tại “trạng thái mù” (no-man’s land).  
2. Tại mọi thời điểm phải trả lời được: **“Ai là chủ sở hữu hiện tại?”** (owner/queue), **“Bước hợp lệ tiếp theo là gì?”** và **“Ai có quyền kích hoạt bước đó?”**.  
3. Lifecycle phải vừa đủ chung để dùng lại qua nhiều wedge, vừa đủ mở để cấu hình extension theo domain.  
4. Lifecycle không được tự tiện “nhảy bước” vì automation; mọi chuyển dịch phải có trace và rationale.  
5. Lifecycle phải tương thích với offline/continuity: chấp nhận trạng thái tạm trên device nhưng luôn hội tụ về trạng thái lifecycle server-side.  
6. Lifecycle là nơi gắn các hook cho SLA, routing, exception handling, chứ không là nơi xử lý toàn bộ logic này.  
7. Observable events của lifecycle phải đủ để tái dựng lại “câu chuyện” của một task/case khi cần audit hoặc điều tra.  
8. Lifecycle không được làm phức tạp hoá trải nghiệm Pack 03 – người dùng không cần thấy toàn bộ “xương”, chỉ cần thấy những trạng thái có nghĩa với họ.

## 4. Các giai đoạn chính trong lifecycle chung

Pack 04 đề xuất một **lifecycle chuẩn** cho task/case gồm các phase sau (một số có thể không dùng trong từng wedge, nhưng khung chung nên nhất quán):

1. **Planned / Not Yet Created** (tiềm năng) – có nhu cầu nhưng chưa tạo record.  
2. **Created / Registered** – record đã được tạo trong hệ thống, chưa assign hoặc vừa vào pool.  
3. **Ready / In Queue** – đủ dữ liệu để giao việc, đang nằm trong một queue hoặc pool nào đó.  
4. **Assigned / Accepted** – đã có owner (user/role/team) cụ thể.  
5. **In Progress / Being Worked** – đang được xử lý (trên Web, Mobile hoặc cả hai).  
6. **Pending External / Waiting** – đang chờ điều kiện/đầu vào từ bên ngoài (khách, hệ thống khác, policy check).  
7. **Pending Review / Approval** – công việc chính đã xong, chờ review/duyệt/QA.  
8. **Rework / Returned** – bị trả lại để bổ sung/chỉnh sửa.  
9. **Resolved / Completed** – đã xử lý xong theo định nghĩa outcome.  
10. **Closed / Archived** – vòng đời chính kết thúc; chỉ còn để tra cứu/audit.  
11. **Cancelled** – bị huỷ có chủ đích (vì lỗi tạo, điều kiện thay đổi, v.v.).

Mỗi phase này **không nhất thiết là một state UI** trong Pack 03; chúng là cấu trúc nội bộ mà các state UX có thể map vào.

## 5. Loại transitions trong lifecycle

Transitions là những “đường chuyển” giữa các phase. Pack 04 phân loại:

1. **User-triggered transitions** – người dùng bấm nút hoặc thực hiện hành động (Start, Submit, Complete, Return, Cancel).  
2. **Rule-triggered transitions** – business rule trong hệ thống chuyển trạng thái (vd auto-assign, auto-close khi đã đủ điều kiện).  
3. **System-triggered transitions** – do event kỹ thuật, SLA, scheduler (vd move to “Expired SLA”, “Auto-reminder sent”).  
4. **Integration-triggered transitions** – do tín hiệu từ hệ thống bên ngoài (vd payment success, delivery confirmed) dẫn đến chuyển phase.

Mỗi transition phải được:
- gắn với một event trong taxonomy (49);  
- kiểm tra quyền (authority/role) trước khi thực hiện nếu liên quan user;  
- log lại để audit được.

## 6. Mapping lifecycle Pack 04 với states Pack 03

Pack 03 định nghĩa các **state hiển thị** mà người dùng thấy, ví dụ:
- Draft / Incomplete.  
- Assigned.  
- In Progress.  
- Submitted / Waiting for Review.  
- Approved / Rejected.  
- Completed / Closed.  
- Returned / Needs Changes.

Lifecycle Pack 04 **không thay thế** các state này, mà phục vụ như **xương sống**. Mapping mẫu:

- `Created / Registered` → UI có thể là Draft, New, To Do.  
- `Ready / In Queue` → UI có thể là “Chờ nhận”, “Chưa nhận việc”.  
- `Assigned / Accepted` → UI: Assigned; on Mobile: “Bạn được giao nhiệm vụ X”.  
- `In Progress` → UI: In Progress; Mobile: “Đang làm việc”.  
- `Pending Review / Approval` → UI: “Chờ duyệt”, “Đã gửi”.  
- `Rework / Returned` → UI: “Bị trả lại”, “Cần bổ sung”.  
- `Resolved / Completed` → UI: Completed/Done.  
- `Closed / Archived` → có thể không hiển thị riêng, chỉ là flag backend.

Khi thiết kế state UX mới, cần chỉ rõ **map vào phase lifecycle nào** để orchestration logic biết chèn automation/SLAs/routing vào đâu.

## 7. Cross-surface lifecycle (Web ↔ Mobile)

Pack 04 phải đảm bảo lifecycle hoạt động mượt giữa Web Admin và Mobile Ops, trên nền continuity Pack 03.

### 7.1 Ownership và handoff

- Web Admin thường là nơi **tạo, assign, review, close**.  
- Mobile thường là nơi **thực hiện, thu thập bằng chứng, cập nhật trạng thái tiến độ**.  
- Lifecycle phải support các pattern:  
  - Web assign → Mobile accept → Mobile in progress → Mobile submit → Web review → Web approve/return → final state.  
  - Mobile self-assign (trong một pool) → tương tự như trên.  
- Handoff events (từ Web sang Mobile, từ Mobile sang Web) phải được log (56) để đọc được khi có vấn đề.

### 7.2 Offline & eventual consistency

- Khi Mobile đang offline, lifecycle server-side có thể **chậm hơn** so với cảm nhận của user.  
- Các event như `local_task_update_saved`, `sync_pending`, `sync_confirmed` (53, 59) phải được gắn vào lifecycle để biết:  
  - một cập nhật đang “trong đường ống”;  
  - khi nào lifecycle truly chuyển phase server-side;  
  - khi nào có mismatch cần reconciliation.

Lifecycle model phải chấp nhận trạng thái tạm **client-side** mà không “double-close” hoặc “double-assign” khi sync lại.

## 8. Authority, role và lifecycle

Mỗi phase/transition trong lifecycle phải được kiểm soát bởi authority model Pack 03:

- Chỉ một số role được phép tạo task/case loại nhất định.  
- Chỉ role/owner phù hợp được phép chuyển từ Ready → In Progress, hoặc từ Pending Review → Approved/Rejected.  
- Các transitions đặc biệt (Cancel, Escalate, Override) thường thuộc về role cao hơn hoặc role khác.  
- Waivers (57) có thể cho phép tạm “đi tắt” trong trường hợp có lý do, nhưng vẫn phải log.

Điều này đảm bảo orchestration không tạo ra “đường tắt” trái với responsibility/accountability mà Pack 03 đã định nghĩa.

## 9. Continuity, offline và lifecycle

Lifecycle model phải hoà hợp với continuity:

- Khi user bật app Mobile và bấm “Hoàn tất” trong điều kiện offline, lifecycle phải:  
  - ghi nhận intent `complete_requested` client-side;  
  - lưu local;  
  - khi sync, apply transition trên server nếu không có conflict;  
  - nếu có conflict (vd case đã bị closed/cancel trên Web), dùng reconciliation patterns (53) để xử lý: có thể chuyển thành “late submission”, “ignored but logged”, v.v.  
- Các events liên quan local vs server phải map vào lifecycle events để audit.

## 10. Hooks lifecycle cho automation, SLA, routing, exceptions

Lifecycle model cung cấp các **“điểm móc” (hooks)**:

- Khi vào `Ready / In Queue` → hook cho **assignment & routing rules** (Pack 04 doc 69).  
- Khi ở `In Progress` → hook cho **SLA timers, reminders**, capacity signals.  
- Khi vào `Pending External` → hook cho integration timeouts, reminders.  
- Khi vào `Pending Review` → hook cho assignment tới reviewer và rules về auto-approve (doc 70, 71).  
- Khi quá SLA ở bất kỳ phase nào → hook cho escalation/accompanying exception case (doc 72).  
- Khi resolved/closed → hook cho downstream events (integration, analytics, billing...).

Lifecycle không chứa toàn bộ logic, nhưng định nghĩa nơi logic được “treo vào”.

## 11. Events và observability cho lifecycle

Mỗi chuyển động quan trọng của lifecycle cần được phát ra như một sự kiện trong taxonomy (49), ví dụ:

- `task_created`, `case_created`.  
- `task_assigned`, `task_reassigned`.  
- `task_started`, `task_paused`, `task_resumed`.  
- `task_submitted_for_review`.  
- `task_returned_for_rework`.  
- `task_approved`, `task_rejected`.  
- `task_completed`, `task_closed`, `task_cancelled`.  
- `sla_breached`, `sla_warning`, `escalation_triggered`.

Dashboards (55) và diagnostics cross-surface (56) sẽ dựa vào các events này để cho Product/Operations thấy được:
- công việc đang tập trung ở phase nào;  
- bottleneck ở đâu;  
- automation và routing có hoạt động như mong đợi không.

## 12. Anti-pattern modeling lifecycle cần tránh

1. Tạo quá nhiều state/phase nhỏ khiến lifecycle khó hiểu và khó maintain.  
2. Mix khái niệm state UI và phase lifecycle một cách tuỳ tiện.  
3. Cho phép transitions không có kiểm tra authority hoặc không log sự kiện.  
4. Để tồn tại các trạng thái “mù” – không ai own, không phase nào nhận.  
5. Đẩy quá nhiều logic nghiệp vụ domain into lifecycle core (thay vì để ở layer configuration/rules).  
6. Bỏ qua offline/continuity, giả định mọi chuyển đổi luôn ngay lập tức.  
7. Model lifecycle theo từng khách hàng riêng lẻ, không có khung chung để reuse.

## 13. Cách dùng lifecycle model khi thiết kế flows mới và pilot

### 13.1 Khi thiết kế flow mới

- Xác định: loại work là task hay case hay cả hai.  
- Mapping các bước nghiệp vụ vào các phase lifecycle chuẩn.  
- Chỉ rõ transitions nào do user, rule, system, integration.  
- Kiểm tra từng transition với authority model (50, 57).  
- Đảm bảo experience states (Pack 03) map rõ vào lifecycle phases.

### 13.2 Khi chuẩn bị pilot

- Chọn một số flows và tasks/cases tiêu biểu; map chúng vào lifecycle.  
- Đảm bảo instrumentation events được bật đầy đủ cho các transition quan trọng.  
- Dùng Scenario Library (58) để dựng kịch bản bao phủ các transitions; log lại những chỗ lifecycle chưa rõ.  
- Sau pilot, dùng post-pilot docs (60) và retro guide (65) để điều chỉnh lifecycle nếu cần.

## 14. Bàn giao từ lifecycle model sang các doc Pack 04 tiếp theo

Lifecycle model này là nền cho các tài liệu Pack 04 sau:

- **69 Assignment, Queue and Routing Strategy** – dùng phases `Ready`, `In Queue`, `Assigned`, `Pending Review` để định nghĩa routing/ownership.  
- **70 Automation Levels, Rule Types and Override Guardrails** – định rõ transitions nào có thể được automation chạm tới, dưới điều kiện nào.  
- **71 SLA, Due Date and Priority Model** – gắn timers và thresholds vào phases.  
- **72 Exception Handling and Resolution Playbook** – định nghĩa tăng/giảm severity, branch flows khi có exception trong mỗi phase.  
- **73 Work Observability and Control Views Requirements** – định nghĩa view cho managers để thấy lifecycle ở tầm cao.

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Task and Case Lifecycle Orchestration Model của Pack 04:

1. Task và case trong Nextflow OS sẽ dùng chung một khung lifecycle chuẩn gồm các phase từ Created tới Closed/Cancelled, với khả năng map linh hoạt cho từng wedge.  
2. Lifecycle Pack 04 là xương sống orchestration phía sau states UX Pack 03, không thay thế mà hỗ trợ chúng.  
3. Mọi transition trong lifecycle phải có loại rõ (user, rule, system, integration), tôn trọng authority model và được log.  
4. Lifecycle phải tương thích với offline/continuity và cross-surface semantics đã được Pack 03 định nghĩa.  
5. Lifecycle là nơi cung cấp hooks cho assignment, SLA, automation, routing, exceptions và observability nhưng không nhồi nhét toàn bộ logic domain vào.  
6. Các doc Pack 04 tiếp theo phải bám vào lifecycle này để tránh mỗi module tự định nghĩa một “vòng đời” riêng.

## 16. Điều kiện hoàn thành của tài liệu

Task and Case Lifecycle Orchestration Model được xem là đạt yêu cầu khi:
- các bên Product, Engineering, CS và Operations có chung ngôn ngữ về vòng đời task/case;  
- các flows mới đều được map vào lifecycle thay vì tự tạo khung riêng;  
- các module assignment, SLA, automation, exception và observability của Pack 04 dựa trên cùng model này;  
- và khi audit một task/case, có thể tái dựng hành trình của nó qua các phase và events một cách rõ ràng.

## AG Execution Prompt

You are acting as a lifecycle orchestration architect, workflow modeler, and cross-surface consistency guardian.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 defines the experience grammar; Pack 04 must define the lifecycle orchestration behind it.
- This document defines a shared task and case lifecycle model for Pack 04.

### Objective
Refine this lifecycle model into a clear, reusable backbone that other Pack 04 documents (assignment, SLA, automation, exceptions, work views) can build on while remaining consistent with Pack 03.

### Inputs
- Use this document plus key Pack 03 docs (states, authority, continuity, observability) and the Pack 04 overview as context.
- Preserve the distinction between UX states and orchestration phases.  
- Keep the lifecycle model simple enough to reuse, rich enough to support automation and governance.

### Tasks
1. Clarify phase definitions and reduce overlap.  
2. Tighten the mapping from UX states to lifecycle phases.  
3. Specify event patterns for key transitions.  
4. Identify where offline/continuity semantics most impact the lifecycle.  
5. Highlight how assignment, SLA, and automation modules should attach to the lifecycle.  
6. Flag anti-patterns and domain-specific variations that require extension.

### Constraints
- Do not overcomplicate the lifecycle with too many phases.  
- Do not collapse UX states and lifecycle phases into a single list.  
- Do not violate Pack 03’s authority or continuity semantics.  
- Keep the model grounded in SME operational realities.

### Output Format
Return a revised markdown document with these sections:
1. Lifecycle Thesis
2. Phases and Transitions
3. UX State Mapping
4. Cross-Surface and Continuity Considerations
5. Hooks for Assignment, SLA, Automation and Exceptions
6. Events and Observability
7. Anti-Patterns and Extensions

### Acceptance Criteria
- The output must provide a crisp, shared lifecycle backbone for Pack 04.  
- The result must align with Pack 03’s UX grammar and Nextflow OS strategy.  
- The document must give clear attachment points for subsequent Pack 04 modules.  
- The lifecycle must be understandable and usable by Product, Design, Engineering and Operations teams.
