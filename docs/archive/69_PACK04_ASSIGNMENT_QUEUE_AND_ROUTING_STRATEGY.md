# Nextflow OS – Pack 04 Assignment, Queue and Routing Strategy

**Document ID:** 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Operations Design  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Assignment, Queue and Routing Strategy** cho Pack 04. Nếu lifecycle (68) đã trả lời “task/case đi qua những phase nào từ Created tới Closed”, thì tài liệu này trả lời:

> **Khi một task/case đã vào trạng thái Ready/In Queue, làm thế nào nó được giao cho người phù hợp (hoặc team, queue phù hợp), bằng cách nào (manual/self-assign/auto-assign), theo chiến lược nào (round robin, capacity-based, skill-based, territory-based), và làm sao để routing không phá vỡ authority, continuity và UX semantics của Pack 03?**

Mục tiêu:
- định nghĩa các mô hình assignment (manual, self-assign, auto-assign) phù hợp với SME;  
- định nghĩa khái niệm queue và các kiểu queue/backlog;  
- định nghĩa chiến lược routing cơ bản (rules, priority, capacity, territory);  
- chỉ rõ hooks giữa assignment/routing với lifecycle, authority, SLA, automation, observability;  
- đặt nền cho các doc về automation, SLA và work views.

## 2. Thesis assignment & routing cho Pack 04

Thesis có thể phát biểu như sau:

> **Assignment và routing tốt là khi người phù hợp nhận đúng việc, vào đúng thời điểm, với mức chủ động vừa đủ: không phải “ai nhanh tay bấm thì được”, không phải “all auto” đến mức mất kiểm soát, mà là một sự phối hợp rõ giữa queue chung, quyền tự nhận việc, và các rules tự động đơn giản – có thể giải thích và điều chỉnh theo thực tế vận hành.**

Từ thesis này, chín nguyên lý:

1. Assignment phải **minh bạch** – người dùng hiểu vì sao mình nhận nhiệm vụ này (hoặc không nhận).  
2. Queue không phải là “dump” – queue phải có nghĩa (theo flow, theo khu vực, theo loại work).  
3. Routing rules phải **đọc được** và có thể chỉnh, không là “hộp đen”.  
4. Quyền nhận/assign phải gắn với authority model (50, 57).  
5. Self-assign là pattern quan trọng cho SME – nhưng phải trong hàng rào quyền và SLA.  
6. Automation assignment phải bắt đầu đơn giản, có pilot và observability rõ.  
7. Tài liệu này không ép một chiến lược routing duy nhất, mà đưa ra khung để cấu hình theo mô hình vận hành khách.  
8. Assignment/routing phải chịu ảnh hưởng của lifecycle (phase) và SLA/priority.  
9. Experience Pack 03 (Web/Mobile) phải biểu diễn assignment & queue một cách dễ hiểu, không để người dùng phải “đoán”.

## 3. Thành phần khái niệm chính

### 3.1 Owner vs Queue vs Team

- **Owner**: người (hoặc bot) chịu trách nhiệm chính hiện tại của một task/case.  
- **Queue**: tập hợp các task/case đang chờ được nhận bởi một hoặc nhiều owners tiềm năng (vd queue “Tồn kho khu vực A”).  
- **Team**: nhóm người chia sẻ một số queue, có thể được dùng như target của routing (assign to team, rồi team members self-assign).

Trong nhiều SME, pattern phổ biến là: system/manager đẩy việc vào queue/team, rồi field users hoặc agents **tự nhận** việc từ queue đó.

### 3.2 Types of assignment

- **Direct assignment** – assign cụ thể cho một owner (thường từ Web Admin/manager hoặc automation).  
- **Pool-based assignment** – assign vào một queue/team; member sẽ self-assign.  
- **Self-assign** – user tự lấy việc từ queue/pool theo rules.  
- **Reassignment** – chuyển owner hoặc queue khi cần (manual hoặc auto dựa trên rules/SLA).

### 3.3 Routing rule

Routing rule trả lời câu hỏi: “Một task/case mới (hoặc chuyển phase) nên được **đặt vào đâu**?” – queue nào, owner nào, team nào, với priority nào. Các rule này có thể dựa trên:
- loại work;  
- khu vực/territory;  
- skill/role;  
- giờ làm việc;  
- tải hiện tại (capacity);  
- khách hàng/đối tượng liên quan.

## 4. Hooks với lifecycle (68)

Tài liệu 68 đã định nghĩa các phase như: Created, Ready/In Queue, Assigned/Accepted, In Progress, Pending Review, v.v. [code_file:417]

Assignment và routing gắn vào lifecycle như sau:

- Khi task/case từ `Created` → `Ready/In Queue`:  
  - **Routing rule** chạy để quyết định queue/team/owner ban đầu.  
  - Nếu là direct assignment, có thể nhảy thẳng tới `Assigned/Accepted` (với xác nhận).  
- Khi ở `Ready/In Queue`:  
  - user có thể self-assign (transition tới `Assigned/Accepted`).  
  - manager có thể direct-assign.  
  - automation có thể auto-assign theo rule (doc 70).  
- Khi `Assigned/Accepted` mà owner từ chối (nếu được phép):  
  - có thể quay lại `Ready/In Queue` hoặc route sang queue khác.  
- Khi SLA/priority thay đổi trong `Ready/In Queue` hoặc `Assigned`:  
  - có thể trigger re-routing (escalate tới team khác, queue khác).

## 5. Các mô hình queue cơ bản cho SME

Pack 04 đề xuất một số **mô hình queue/backlog** thường gặp mà hệ thống nên support:

1. **Functional queues** – theo loại công việc (vd “Kiểm kê định kỳ”, “Survey khách hàng”, “Xử lý complaint”).  
2. **Territory queues** – theo địa bàn/khu vực (vd “Khu vực Miền Bắc”, “Quận 1”).  
3. **Team queues** – gắn với một đội cụ thể (vd “Team Field Ops A”).  
4. **Priority queues** – hàng chờ riêng cho task/case high priority.  
5. **Exception/Review queues** – dành cho case bị flag hoặc chờ review đặc biệt.

Queue có thể kết hợp filter (loại + khu vực + priority), nhưng Pack 04 nên định nghĩa **một số kiểu queue canonical** để metrics và views (73) có thể dựa trên.

## 6. Chiến lược assignment

### 6.1 Manual assignment (manager-driven)

- Manager chọn nhiệm vụ và assign trực tiếp cho owner.  
- Phù hợp với môi trường nhỏ, số lượng work ít, hoặc khi cần kiểm soát chặt.  
- Rủi ro: bottleneck ở manager, khó scale.

### 6.2 Self-assign từ queue

- Nhiệm vụ được đưa vào queue team/territory; members tự vào queue và bấm “Nhận việc” (theo authority Pack 03).  
- Phù hợp với field ops, call centers SME, nơi team lead muốn chia việc linh hoạt.  
- Cần có:  
  - luật để tránh một người “găm” quá nhiều việc chưa làm;  
  - khả năng trả lại (với lý do) khi nhận nhầm.

### 6.3 Auto-assign (rule-based)

- Hệ thống tự động chọn owner dựa trên rule:  
  - round-robin;  
  - capacity-based (ít việc hơn ưu tiên);  
  - skill-based/territory-based;  
  - kết hợp priority/SLA.  
- Cần pilot cẩn thận (doc 75), có observability (ai nhận bao nhiêu, load ra sao) và khả năng override.

### 6.4 Hybrid patterns

- Rule đẩy vào một **team queue**; trong team đó, self-assign diễn ra.  
- Rule gợi ý owner nhưng vẫn để manager confirm.  
- Manager định nghĩa “default routing”, nhưng có thể thủ công override cho case riêng.

## 7. Routing logic: từ đơn giản đến phức tạp

Pack 04 khuyến nghị một **bậc thang phức tạp** cho routing:

1. **Level 1 – Rules đơn giản**: theo loại work + territory → queue/team.  
2. **Level 2 – Skill + Territory**: thêm skill/role tags vào rule.  
3. **Level 3 – Capacity-aware**: dùng metrics workload hiện tại để phân bổ đều hơn.  
4. **Level 4 – SLA-aware**: xem xét due dates, escalations để ưu tiên route case gần quá hạn cho người phù hợp.  
5. **Level 5 – Learning-based** (future): dùng dữ liệu lịch sử để gợi ý routing tối ưu.

Ở mỗi level, cần ability để **tắt/bật và quan sát** kết quả qua dashboards.

## 8. Authority và routing

Assignment/routing không được vượt qua boundary role & authority Pack 03:

- Một user chỉ có thể trở thành owner nếu role của họ có quyền action cần thiết cho tasks/cases đó (50, 57).  
- Routing rule không thể assign nhiệm vụ phê duyệt cho một role không có quyền phê duyệt, dù capacity có thấp.  
- Self-assign phải tuân theo cùng check – user chỉ thấy/nhận được tasks mà họ có quyền xử lý.  
- Các “delegation” đặc biệt (vd manager tạm assign việc review cho người khác) phải đi kèm semantics waiver (57) và events tương ứng.

## 9. Continuity, offline và assignment

Đặc biệt với Mobile Ops:

- Khi user self-assign từ mobile, hệ thống phải đảm bảo **server-side lifecycle** cũng cập nhật, tránh double-assign.  
- Khi offline, không nên cho phép self-assign “ảo” trên device nếu không có chiến lược reconciliation rõ (53).  
- Các events như `assignment_pending_sync`, `assignment_sync_confirmed` cần được định nghĩa để đọc được khi có mismatch.  
- Playbook 59 và FAQ 64 nên giải thích rõ cho field users về việc nhận/trả nhiệm vụ trong điều kiện mạng yếu.

## 10. Observability cho assignment & queues

Từ góc nhìn Pack 04 & analytics:

- Dashboards nên cho thấy:  
  - số nhiệm vụ trong mỗi queue theo loại/priority;  
  - thời gian trung bình trong trạng thái Ready/In Queue;  
  - tỷ lệ self-assign vs auto-assign vs manual;  
  - tải (số task) trên mỗi owner/team;  
  - số lần reassignment và lý do.  
- Event taxonomy (49) nên include:  
  - `task_routed_to_queue`, `task_routed_to_owner`;  
  - `task_self_assigned`, `task_auto_assigned`, `task_manually_assigned`;  
  - `task_reassigned`, `task_returned_to_queue`.

Các signals này quan trọng cho pilot (55, 60, 65) để đánh giá routing strategy.

## 11. Anti-pattern assignment & routing cần tránh

1. Không có queue rõ, mọi thứ assign trực tiếp bằng tay, dẫn tới bottleneck.  
2. “Ai nhanh tay thì được việc” – self-assign không có rules hoặc guardrails.  
3. Routing rule quá phức tạp, không ai hiểu được, khó chỉnh khi pilot cho thấy vấn đề.  
4. Auto-assign bỏ qua authority model, giao việc nhầm role.  
5. Không log events assignment/reassignment, khó audit khi khách hỏi “tại sao tới tôi?”.  
6. Không nhìn vào metrics queue/assignment khi làm retro, chỉ nhìn completion rates.  
7. Cố gắng làm capacity-based routing quá sớm khi dữ liệu chưa đủ.

## 12. Cách dùng chiến lược này khi thiết kế & pilot

### 12.1 Khi thiết kế

- Chọn mô hình assignment chính cho mỗi flow: manual, self-assign, auto-assign hay hybrid.  
- Xác định queue types cần cho wedge.  
- Định nghĩa routing rule level 1 (đơn giản) trước; planning cho level 2–3 sau.  
- Xác định check authority cần thiết cho mỗi kiểu assignment.

### 12.2 Khi pilot

- Bắt đầu với rules đơn giản, nhiều manual override; quan sát signals.  
- Dùng Scenario Library (58) để tạo các case routing nhất quán trong pilot.  
- Dùng dashboards (55) để xem thời gian chờ, tải trên owner/queue, tỷ lệ reassignment.  
- Ghi lại feedback từ field users/manager về fairness, clarity trong assignment; đưa vào post-pilot synthesis (60) và retro (65).

## 13. Bàn giao sang các doc Pack 04 tiếp theo

Chiến lược assignment, queue và routing này là nền cho:

- **70 Automation Levels, Rule Types and Override Guardrails** – định nghĩa chi tiết các rule auto-assign, auto-route, override scenarios.  
- **71 SLA, Due Date and Priority Model** – kết nối SLA với queue/assignment (vd route near-breach tasks).  
- **72 Exception Handling and Resolution Playbook** – xác định khi nào exception tạo case mới, assign tới team đặc biệt.  
- **73 Work Observability and Control Views Requirements** – định nghĩa views cho managers để điều chỉnh queues và routing.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Assignment, Queue and Routing Strategy của Pack 04:

1. Pack 04 sẽ dùng kết hợp owner, queue và team làm khái niệm cốt lõi cho phân phối công việc.  
2. Assignment hỗ trợ manual, self-assign và auto-assign, với hybrid patterns, nhưng luôn tôn trọng authority model.  
3. Routing strategy sẽ tiến hoá theo bậc: từ rule đơn giản theo loại/territory tới capacity/SLA-aware, có pilot và observability ở mỗi bước.  
4. Assignment và routing gắn chặt với lifecycle phases `Ready/In Queue`, `Assigned/Accepted` và `Pending Review`.  
5. Observability của assignment & queues là bắt buộc để triage, retro và cải tiến.  
6. Các doc Pack 04 sau phải bám chiến lược này để tránh mỗi module tự định nghĩa cách assign/routing riêng.

## 15. Điều kiện hoàn thành của tài liệu

Assignment, Queue and Routing Strategy được xem là đạt yêu cầu khi:
- các bên liên quan có chung hiểu biết về các mô hình assignment/queue;  
- flows mới đều định nghĩa rõ assignment model, queue types và routing rules;  
- pilot có thể thử các pattern assignment khác nhau nhưng vẫn trong guardrails chung;  
- và metrics về queue/assignment được dùng thực sự trong pilot và retro để cải tiến.

## AG Execution Prompt

You are acting as an assignment and routing strategist, work-distribution architect, and SME operations pragmatist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 04 defines orchestration; Pack 03 defines UX and authority semantics.
- This document defines the strategy for assignment, queues, and routing in Pack 04.

### Objective
Refine this strategy into a clear, configurable framework for how tasks and cases move from queues to owners in SME contexts, building on the lifecycle model and respecting Pack 03.

### Inputs
- Use this document, the lifecycle model (68), and key Pack 03 docs (authority, continuity, observability) as context.
- Preserve the distinction between owner, queue, and team, and between manual, self-assign, and auto-assign.  
- Keep the strategy practical for SME pilots and operations.

### Tasks
1. Clarify queue types and when to use each.  
2. Sharpen the assignment models and hybrid patterns.  
3. Define sample routing rules for early pilots.  
4. Specify key events and metrics for monitoring assignment and queues.  
5. Identify anti-patterns to watch for during pilots.  
6. Suggest how this strategy should evolve with automation maturity.

### Constraints
- Do not design overly complex routing that SME teams cannot understand or adjust.  
- Do not bypass authority semantics when assigning work.  
- Do not assume perfect data or workload estimates from day one.  
- Keep room for manual control and override.

### Output Format
Return a revised markdown document with these sections:
1. Assignment and Routing Thesis
2. Core Concepts (Owner, Queue, Team)
3. Assignment Models and Routing Rules
4. Lifecycle and Authority Hooks
5. Metrics, Events and Observability
6. Anti-Patterns and Evolution Path

### Acceptance Criteria
- The output must make assignment and routing understandable and tunable for SME customers.  
- The result must align with Pack 04 lifecycle and Pack 03 authority grammar.  
- The framework must be directly usable in pilot design and operational rollout.  
- The strategy must support gradual increase in automation over time.
