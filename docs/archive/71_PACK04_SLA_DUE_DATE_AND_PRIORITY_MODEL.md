# Nextflow OS – Pack 04 SLA, Due Date and Priority Model

**Document ID:** 71_PACK04_SLA_DUE_DATE_AND_PRIORITY_MODEL  
**Pack:** 04 — Orchestration, Automation and Work Management  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Workflow & Orchestration / Operations Design / Governance  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Operations & Governance  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 07_STRATEGY_PACK_SUMMARY_AND_DECISION_LOG, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE, 65_PACK03_RETROSPECTIVE_AND_CONTINUOUS_IMPROVEMENT_GUIDE, 67_PACK04_OVERVIEW_AND_STRATEGY, 68_PACK04_TASK_AND_CASE_LIFECYCLE_ORCHESTRATION_MODEL, 69_PACK04_ASSIGNMENT_QUEUE_AND_ROUTING_STRATEGY, 70_PACK04_AUTOMATION_LEVELS_RULE_TYPES_AND_OVERRIDE_GUARDRAILS

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **SLA, Due Date and Priority Model** cho Pack 04. Nếu lifecycle (68) là khung phase, assignment/routing (69) phân phối work, automation (70) quyết định mức auto, thì tài liệu này trả lời:

> **Làm thế nào để Nextflow OS mô hình hoá thời gian và độ ưu tiên của công việc – SLA, due date, priority – gắn vào lifecycle, queues và automation: khi nào bắt đầu đếm, đếm cái gì, nhìn thấy ở đâu, escalation ra sao, và tất cả phải dễ hiểu, dễ cấu hình cho SME nhưng vẫn đủ mạnh để điều phối?**

Mục tiêu:
- định nghĩa khái niệm SLA, due date, priority trong bối cảnh Pack 04;  
- xác định điểm gắn (attach points) của SLA/priority vào lifecycle và queues;  
- mô tả cách hiển thị SLA/priority trong UX Pack 03 (Web/Mobile) mà không làm rối người dùng;  
- làm rõ cách automation & routing sử dụng SLA/priority;  
- đặt nền governance và pilot cho SLA model.

## 2. Thesis về SLA, due date và priority

Thesis có thể phát biểu như sau:

> **SLA và priority trong Pack 04 không chỉ là “hai field thêm vào task”, mà là một cách để hệ thống giúp đội vận hành nhìn rõ việc gì cần làm trước, việc gì có thể chờ, và việc gì đang có nguy cơ rơi khỏi chuẩn dịch vụ – theo cách có thể giải thích, cấu hình và đo lường được.**

Nguyên lý xuất phát:

1. SLA phải **rõ nghĩa** – SLA của cái gì (response, resolution, first action), bắt đầu và kết thúc khi nào.  
2. Due date phải **có nguồn gốc** – từ policy, từ input user, hay từ rule (70) – và có thể override trong guardrails.  
3. Priority phải **thực sự ảnh hưởng** tới routing/view, không chỉ là con số để “cho có”.  
4. SLA/priority phải được hiển thị một cách **dễ hiểu** cho field users và managers, đặc biệt trên Mobile.  
5. Sự chậm trễ và vi phạm SLA phải **quan sát được** và dẫn tới hành động, không bị chôn trong log.  
6. SLA model phải tương thích với offline/continuity – không phạt user vì mất mạng ngoài tầm kiểm soát.  
7. SME cần mô hình SLA/priority đơn giản nhưng có thể mở rộng dần – không bắt họ lập tức dùng scheme enterprise phức tạp.  
8. Mọi escalation vì SLA/priority phải tôn trọng authority và auditability.

## 3. Định nghĩa khái niệm

### 3.1 SLA (Service Level Agreement)

Trong Pack 04, **SLA** được hiểu là một cam kết về thời gian xử lý một loại work cụ thể, thường đo bằng:
- **Response SLA** – thời gian từ khi tạo/assign tới khi có hành động đầu tiên (start work, contact khách).  
- **Resolution SLA** – thời gian từ khi tạo/assign tới khi work đạt trạng thái resolved/completed.  
- **Step SLA** – thời gian cho một phase cụ thể (vd thời gian tối đa ở Pending Review).

### 3.2 Due date

**Due date** là thời điểm mà trước đó công việc nên được hoàn thành hoặc đạt một milestone nhất định, có thể:
- được nhập trực tiếp (người dùng chọn);  
- được tính toán từ rule (vd ngày tạo + N ngày, trừ ngày lễ);  
- được lấy từ hệ thống khác (vd ngày giao hàng, ngày hết hạn hợp đồng).

### 3.3 Priority

**Priority** biểu thị mức độ ưu tiên của công việc so với các work khác. Pack 04 nên support ít nhất:
- một thang đơn giản (vd Low / Normal / High / Critical);  
- numeric priority (vd 1–5) nếu cần;  
- kết hợp với SLA (vd tasks gần breach SLA có priority tăng tạm thời).

## 4. Attach points SLA/due date/priority vào lifecycle & queues

Dựa trên lifecycle (68) và assignment (69), Pack 04 định nghĩa:

- Khi **task/case được tạo** (`Created`):  
  - có thể set default SLA/due date/priority dựa trên loại work, khách hàng, territory, channel.  
  - rule Level 2 (70) có thể auto-fill due date/priority, cho phép user chỉnh trong guardrails.
- Khi **vào Ready/In Queue**:  
  - **start του response SLA** (nếu được định nghĩa), hoặc có thể start ngay khi Created tuỳ policy.  
  - priority được dùng để sắp xếp trong queue và gợi ý assignment.  
- Khi **Assigned/Accepted**:  
  - có thể start resolution SLA (hoặc đã start trước).  
  - due date có thể được update nếu owner có quyền và policy cho phép.
- Khi **In Progress**:  
  - SLA timers chạy; reminders và warnings có thể được gửi cho owner/manager khi gần tới hạn.  
- Khi **Pending Review**:  
  - có thể có Step SLA riêng cho thời gian review.  
  - priority có thể tăng nếu sát hạn cho toàn case.
- Khi **Resolved/Completed/Closed**:  
  - SLA được đánh dấu met / breached.  
  - ngay cả nếu bị breached, info này được dùng cho metrics và retro.

## 5. Hiển thị SLA, due date và priority trong UX (Pack 03)

Pack 03 chịu trách nhiệm hiển thị; Pack 04 phải đề xuất nguyên tắc:

- Trên **Web Admin** (view manager):  
  - hiển thị cột due date, SLA status (On track / At risk / Breached) và priority trong list cho work views.  
  - cho phép sort/filter theo due date, SLA status, priority.  
  - dùng màu sắc/icon đơn giản (vd xanh – on track, vàng – at risk, đỏ – breached).  
- Trên **Mobile Ops**:  
  - hiển thị due date và độ “khẩn cấp” một cách nhẹ nhàng: “Hôm nay”, “Còn 2 ngày”, “Đã trễ 1 ngày”.  
  - tránh hiển thị toàn bộ chi tiết SLA, chỉ tập trung vào điều field user cần: việc nào nên làm trước.  
- Copy & terminology:  
  - dùng ngôn ngữ đơn giản như “Hạn xử lý”, “Ưu tiên cao”, “Sắp quá hạn”, “Đã trễ”.  
  - align với copy system (40, 47), tránh technical jargon.

## 6. SLA/priority và automation/routing

SLA, due date, priority là inputs quan trọng cho rules (70) và routing (69):

- **Routing**:  
  - rule có thể tránh assign tasks near-breach cho người đã quá tải, hoặc ngược lại, ưu tiên assign cho người nhanh.  
  - priority có thể dùng để sắp xếp queue/board, highlight tasks cần pick up trước.
- **Automation**:  
  - rules Level 2 có thể auto tăng priority khi còn ít thời gian tới hạn.  
  - rules Level 3 có thể auto-escalate hoặc notify khi SLA đã breach (vd tạo exception case, assign cho manager).  
  - reminder rules có thể gửi notification khi gần đến due date.  
- **Decisioning**:  
  - trong retro (65), signals về SLA breaches kết hợp với assignment metrics để điều chỉnh rules.

## 7. Continuity, offline và SLA

Đặc biệt với Mobile Ops, phải cẩn trọng để **không phạt sai**:

- Nếu field user ở vùng không mạng, app vẫn phải cho phép họ làm việc offline (59), và mapping events sync (53) phải cho phép phân biệt **thời điểm user thực sự làm** và **thời điểm server nhận được**.  
- SLA nên được thiết kế để **tính theo thời gian business** và (khi có thể) dựa vào thời điểm action thực sự diễn ra, không chỉ thời điểm sync.  
- Một số khách có thể chọn SLA “tính tới khi user hoàn tất trên mobile” thay vì “tới khi dữ liệu về server” trong vài loại work.

## 8. Observability và metrics cho SLA/priority

Pack 04 phải define các metrics tối thiểu:

- Tỷ lệ work **đáp ứng SLA** (response, resolution, step).  
- Phân bố **time-in-phase** cho từng phase lifecycle (68).  
- Số và tỷ lệ **SLA breach** theo loại work, customer, territory, team.  
- Tỷ lệ work được **escalate vì SLA**.  
- Mối tương quan giữa **priority** và actual time-to-complete.

Events cần có trong taxonomy (49):
- `sla_started`, `sla_paused` (nếu có), `sla_resumed`, `sla_met`, `sla_breached`.  
- `due_date_set`, `due_date_updated`.  
- `priority_set`, `priority_updated`.  
- `sla_warning_issued`, `sla_escalation_triggered`.

Dashboards (55) nên có view **SLA & Priority Health** để manager/operations nhìn nhanh.

## 9. Governance và pilot cho SLA model

Vì SLA liên quan tới cam kết dịch vụ, cần governance:

- **Định nghĩa SLA**:  
  - nên được chốt với stakeholders khách (nếu là external SLA) hoặc với leadership nội bộ (internal SLA).  
  - được ghi lại trong docs governance (Pack 06) và decision log (07, 60).  
- **Pilot SLA**:  
  - bắt đầu với SLA mềm (chỉ cảnh báo, không phạt), quan sát metrics.  
  - điều chỉnh thresholds trước khi gắn vào hợp đồng cứng.  
- **Waivers**:  
  - có cơ chế ghi nhận các trường hợp SLA breach “hợp lệ” (ngoài tầm kiểm soát, ví dụ bão, thiên tai), để không đánh giá sai performance.  
- **Review định kỳ**:  
  - SLA/priority model nên được review cùng retro Pack 04 (65), update khi bối cảnh thay đổi.

## 10. Anti-pattern SLA/priority cần tránh

1. Thêm field SLA/priority nhưng không dùng cho routing hoặc view – “SLA trên giấy”.  
2. Định nghĩa SLA quá phức tạp so với khả năng vận hành của SME.  
3. Tính SLA theo timestamp server mà không xem xét offline/continuity, dẫn tới “phạt oan” field users.  
4. Bật auto-escalation mạnh ngay từ đầu, không qua giai đoạn cảnh báo mềm.  
5. Không log events SLA, chỉ lưu field, khiến khó audit.  
6. Không align SLA với trải nghiệm: người dùng không thấy hoặc không hiểu cái gì là “gần quá hạn”.  
7. Không review lại SLA/priority khi pattern work hoặc capacity thay đổi.

## 11. Bàn giao sang các doc Pack 04 tiếp theo

SLA, Due Date and Priority Model này là nền cho:

- **72 Exception Handling and Resolution Playbook** – vì nhiều exception cases xuất phát từ SLA breach.  
- **73 Work Observability and Control Views Requirements** – yêu cầu views cho managers để theo dõi SLA và điều phối.  
- **75 Automation Pilot Patterns and Maturity Ladder** – chi tiết hóa cách pilot rules SLA/priority và escalation.

## 12. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho SLA, Due Date and Priority Model của Pack 04:

1. SLA, due date và priority được coi là phần lõi của orchestration Pack 04, không chỉ là fields phụ.  
2. SLA/priority phải được gắn vào lifecycle và queues, và phải ảnh hưởng tới routing, automation và views.  
3. SLA model phải tương thích với offline/continuity và không phạt người dùng vì giới hạn mạng.  
4. SLA/priority phải được hiển thị rõ ràng, dễ hiểu trong UX Pack 03.  
5. SLA/priority phải có metrics, events và governance rõ ràng để pilot, đánh giá và chỉnh sửa.  
6. Các doc Pack 04 tiếp theo (exception, work views, automation pilot) phải dùng model này làm nền.

## 13. Điều kiện hoàn thành của tài liệu

SLA, Due Date and Priority Model được xem là đạt yêu cầu khi:
- các bên Product, Operations, CS và khách hàng (khi cần) cùng hiểu SLA/priority nghĩa là gì trong từng flow;  
- flows mới đều gắn SLA/priority vào lifecycle và routing một cách có ý thức;  
- dashboards cho thấy rõ health SLA và priority;  
- và SLA/priority thực sự được dùng để điều phối công việc, không chỉ để báo cáo “cho đẹp”.

## AG Execution Prompt

You are acting as a time-and-priority modeling architect, SLA governance designer, and orchestration strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 04 defines orchestration; Pack 03 defines UX and continuity semantics.
- This document defines the SLA, due date and priority model Pack 04 will use.

### Objective
Refine this model into a practical, SME-friendly way of representing time and priority, tightly integrated with lifecycle, queues, automation and UX.

### Inputs
- Use this document, lifecycle (68), assignment (69), automation (70), and Pack 03 continuity/UX docs as context.
- Preserve the focus on clarity, pilotability and observability.  
- Keep the model simple to start, but extensible.

### Tasks
1. Clarify SLA types and when to use them.  
2. Sharpen attach points into the lifecycle and routing logic.  
3. Define UX patterns for showing SLA/priority in Web and Mobile.  
4. Specify key events and metrics for SLA and due date.  
5. Identify common pitfalls in SME SLA implementations.  
6. Suggest governance and pilot patterns.

### Constraints
- Do not design an enterprise-grade SLA engine that is overkill for SME.  
- Do not ignore offline/continuity in measuring time.  
- Do not overcomplicate priority schemes.  
- Keep the model understandable to non-technical operations leads.

### Output Format
Return a revised markdown document with these sections:
1. SLA and Priority Thesis
2. Concepts and Attach Points
3. UX Representation
4. Automation and Routing Use
5. Metrics, Observability and Governance

### Acceptance Criteria
- The output must give a clear, simple but extensible SLA/priority model.  
- The result must align with lifecycle, assignment and automation strategy.  
- The framework must be pilotable in SME contexts.  
- The document must help avoid “SLA on paper only” patterns.
