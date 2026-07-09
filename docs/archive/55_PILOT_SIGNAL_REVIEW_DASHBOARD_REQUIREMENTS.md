# Nextflow OS – Pilot Signal Review Dashboard Requirements

**Document ID:** 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Analytics / Pilot Delivery / UX Research  
**Dependent Packs:** Analytics & Data, Frontend Delivery, Backend Workflow, QA & Support, Customer Success, GTM Enablement, Program Delivery  
**Prerequisite Documents:** 03_MARKET_THESIS_AND_DEMAND_ANALYSIS, 04_WEDGE_STRATEGY_AND_GTM_ENTRY_PLAN, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST

## 1. Mục tiêu tài liệu

Tài liệu này xác định **requirements chính thức cho bộ Pilot Signal Review Dashboards** dùng trong Pack 03 của Nextflow OS. Nếu tài liệu 42 đã định nghĩa metrics framework, tài liệu 48 đã định nghĩa pilot triage model, tài liệu 49 đã khóa event taxonomy, tài liệu 50 đã khóa role-permission experience mapping, tài liệu 51 đã khóa demo/pilot environment setup, tài liệu 52 đã khóa release impact review template, tài liệu 53 đã khóa eventual consistency patterns và tài liệu 54 đã khóa semantic QA, thì tài liệu này trả lời câu hỏi:

> **Khi chạy pilot một wedge của Pack 03, team cần nhìn vào dashboard nào, metric nào, segmentation nào, trong cấu trúc màn hình nào, để đọc đúng được: execution quality, adoption, authority friction, continuity health, semantic drift, và impact của các thay đổi?**

Nói cách khác, đây là tài liệu chuyển từ “chúng ta có events và metrics” sang “chúng ta có một bảng điều khiển để nhìn pilot như một **hệ thống sống**”. Nó phải giúp:
- Product, Design, Pilot Delivery, QA, Customer Success và Leadership đọc signals từ cùng một chỗ.  
- Mỗi signal quan trọng đều có ngữ cảnh đúng: role, flow, state, environment, time window, site hoặc cohort.  
- Các câu hỏi pilot cơ bản – “đang chạy có trơn không?”, “chỗ nào bị nghẽn?”, “user có tin sản phẩm không?”, “change X có cải thiện hay làm tệ hơn?” – đều có nơi nhìn rõ.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của pilot signal dashboards trong Pack 03.  
2. Pilot-signal thesis của tài liệu.  
3. Các loại dashboard chính thức cần có trong Pack 03 pilot.  
4. Metrics và signal families bắt buộc phải xuất hiện.  
5. Segmentation và slicing cần hỗ trợ cho pilot đọc đúng ngữ cảnh.  
6. Requirements cho giao diện, drill-down và storytelling của dashboards.  
7. Mapping giữa event taxonomy, metrics framework, role-permission matrix và dashboards.  
8. Requirements về environment labeling, tenant/site filtering và time windows.  
9. Requirements về usage trong pilot triage, release impact review và governance.  
10. Ownership, cadence review và change management cho dashboards.  
11. Những anti-pattern pilot dashboard nghiêm trọng phải tránh.  
12. Cách dùng dashboards cho sales demo nâng cao và training nội bộ.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Pilot Signal Review Dashboards

Pilot không chỉ là kết nối một vài khách hàng dùng thử. Với Pack 03, pilot là giai đoạn mà:
- product phải chứng minh hypothesis về wedge;  
- UX phải chứng minh flow, state và authority semantics có thể vận hành trong thực địa;  
- Mobile Ops phải chứng minh offline/continuity patterns có thể chịu được mạng thật;  
- metrics và observability phải chứng minh có thể đọc được chất lượng thực thi, không chỉ lượng usage.

Nếu không có dashboards được thiết kế với bối cảnh Pack 03, pilot review sẽ rơi vào hai thái cực:
- dựa chủ yếu vào anecdotes và cảm nhận cá nhân (một vài call, một vài chat, một vài “cảm giác”);  
- hoặc dựa vào các bảng số tổng hợp usage không gắn với flow, role, state, authority hoặc continuity semantics.

Tài liệu này tồn tại để đảm bảo rằng khi team hỏi “pilot đang diễn ra như thế nào?”, câu trả lời không phải là “chúng tôi cảm giác là OK”, mà là một tập câu trả lời có cấu trúc, dựa trên signals đúng semantics Pack 03.

## 3. Pilot-signal thesis cho Pack 03

Pilot-signal thesis có thể phát biểu như sau:

> **Pilot chỉ thực sự hữu ích khi product và tổ chức có thể đọc được pilot như một hệ thống: ai đang làm gì, ở flow nào, với state nào, role nào, authority nào, continuity condition nào, và kết quả là gì; nếu signals chỉ cho biết “bao nhiêu màn được mở” mà không nói được “bao nhiêu công việc được hoàn thành đúng cách và người dùng cảm thấy thế nào”, pilot không trả lời được câu hỏi chiến lược.**

Từ thesis này, mười nguyên lý được suy ra:

1. Dashboards phải ưu tiên **signal interpretability over visual decoration**.  
2. Mọi metric quan trọng phải có định nghĩa semantics rõ, không chỉ có tên.  
3. Mọi signal phải có slicing chính để phân biệt roles, flows, sites, environments, versions.  
4. Continuity và authority friction là first-class signals, không phải chi tiết phụ.  
5. Pilot dashboards nên tối thiểu hỗ trợ view task/case lifecycle, không chỉ entry counts.  
6. Signals phải được đọc cùng với qualitative feedback, nhưng không bị lấn át bởi anecdotes.  
7. Dashboards phải giúp phát hiện drift của semantics hoặc copy (ví dụ lỗi wording làm behavior khác).  
8. Mỗi change lớn được ship vào pilot nên có signal expectation; dashboards phải cho thấy change đó có đạt được expectation hay không.  
9. Pilot dashboards không phải dashboards production-scaling đầy đủ, nhưng phải đủ trung thực với grammar Pack 03.  
10. Ownership dashboard phải rõ, tránh tình trạng “ai cũng xem nhưng không ai chịu trách nhiệm chỉnh sửa hoặc giải thích”.

## 4. Các loại dashboard chính thức trong Pack 03 pilot

Tài liệu đề xuất ít nhất năm loại dashboard chính:

1. **Execution and Throughput Dashboard** – nhìn tổng quan flow execution, completion, bottlenecks.  
2. **Authority and Permission Friction Dashboard** – nhìn các restricted, escalated, policy-blocked moments.  
3. **Continuity and Resilience Dashboard (Mobile)** – nhìn offline, sync, retry, failure patterns.  
4. **Experience and Error Semantics Dashboard** – nhìn validation errors, recovery usage, semantic hotspots.  
5. **Change-Impact and Drift Dashboard** – nhìn signals trước/ sau change, và drift drives.

Mỗi loại có mục tiêu, metrics core, segmentation và use-cases riêng.

## 5. Execution and Throughput Dashboard

### 5.1 Mục tiêu

Cho team cái nhìn tổng quan về việc **công việc thực sự được xử lý như thế nào** trong pilot, theo flow và role.

### 5.2 Metrics chính

- Số lượng tasks/cases được tạo theo thời gian.  
- Completion rate theo flow và role (completion theo semantics, không chỉ local actions).  
- Time-to-complete (từ entry tới outcome meaningful).  
- Drop-off rate tại các bước chính của flow.  
- Reopen rate hoặc backtracking events nếu có.  
- Queue dwell time (thời gian item nằm trong queue).  
- Handover counts (reassigns, escalations) nếu relevant cho throughput.

### 5.3 Segmentation bắt buộc

- Theo flow family.  
- Theo role/persona.  
- Theo site/tenant hoặc pilot cohort.  
- Theo environment (pilot vs demo vs staging).  
- Theo version/release.

### 5.4 Use-cases

- Trả lời câu hỏi: “Pilot có thực sự giúp xử lý công việc nhanh và đúng hơn không?”  
- Xác định flow nào là candidate cho refinement trước khi scale rộng.

## 6. Authority and Permission Friction Dashboard

### 6.1 Mục tiêu

Cho team thấy **người dùng bị chặn ở đâu, vì lý do gì**, và friction đó có đúng như thiết kế không.

### 6.2 Metrics và signals

- Count và rate của restricted_action_encountered events.  
- Count của restricted_action_explanation_shown.  
- Count của escalation_initiated và escalation_confirmed.  
- Count của policy_prerequisite_missing.  
- Count của review_only_mode_entered.  
- Số lần override attempted/blocked nếu hỗ trợ.  
- Distribution theo role, flow, screen family.

### 6.3 Segmentation bắt buộc

- Theo role/persona.  
- Theo action family (decision, control, escalation).  
- Theo boundary type (role restriction, authority threshold, policy prerequisite, state).  
- Theo site/tenant.  
- Theo release version khi có change authority.

### 6.4 Use-cases

- Phân biệt friction “đúng thiết kế” (policy cần cứng) vs friction “do copy/UI không rõ”.  
- Quyết định xem có cần đào tạo thêm, copy adjustment hay permission change.

## 7. Continuity and Resilience Dashboard (Mobile)

### 7.1 Mục tiêu

Cho team thấy **Mobile Ops có thực sự chịu được mạng thật** hay chỉ ổn trong lab.

### 7.2 Metrics và signals

- Count của local_persist_success.  
- Count của sync_queue_enqueued.  
- Count và rate của sync_attempt_started / sync_confirmed.  
- Count của sync_failed và retry_attempted.  
- Count của retry_exhausted.  
- Count của attachment_upload_started / attachment_upload_confirmed / attachment_upload_failed.  
- Time-to-sync (distribution).  
- Rate của offline sessions hoặc operations.

### 7.3 Segmentation bắt buộc

- Theo flow family/task type.  
- Theo role (frontline segments).  
- Theo site/region (để thấy khác biệt network).  
- Theo app version.  
- Theo device OS nếu có.

### 7.4 Use-cases

- Trả lời câu hỏi: “Khi ra ngoài hiện trường, sản phẩm có giữ được effort không?”  
- Nhìn xem retry_exhausted và backend_rejected after local success có ở mức chấp nhận được không.

## 8. Experience and Error Semantics Dashboard

### 8.1 Mục tiêu

Cho team thấy **tần suất và pattern của validation errors, warnings, recovery usage**, và semantic hotspots nơi người dùng bị “đụng” nhiều vào messaging.

### 8.2 Metrics và signals

- Count và rate của validation_error events theo field/type.  
- Count và rate của recovery_action_taken (retry, correct_and_resend, contact_support).  
- Distribution của error messages theo category (data missing, data invalid, state invalid, authority, policy).  
- Frequency của empty states được nhìn thấy trong các flows quan trọng.  
- Usage của help/tooltips nếu có.

### 8.3 Segmentation bắt buộc

- Theo flow family.  
- Theo role/persona.  
- Theo site/tenant.  
- Theo release/version (đặc biệt sau thay đổi copy hoặc validation rules).

### 8.4 Use-cases

- Phát hiện chỗ UX hoặc copy đang gây hiểu sai, khiến user bị “đánh” bằng lỗi nhiều.  
- Xác định cơ hội cải thiện forms, defaults, hoặc training.

## 9. Change-Impact and Drift Dashboard

### 9.1 Mục tiêu

Cho team thấy **trước và sau một change, signals đã thay đổi như thế nào**, và có drift bất ngờ nào không.

### 9.2 Metrics và capabilities

- Before/after view cho metrics chính trong flows bị chạm bởi change.  
- Highlight các metrics liên quan trực tiếp tới change-impact review records.  
- Ability để pin “expected direction” vs “observed direction” nếu có hypothesis.  
- Indicators cho semantic drift (ví dụ spike error message mới, shift distribution authority friction).

### 9.3 Segmentation bắt buộc

- Theo release version hoặc feature flag status.  
- Theo site/tenant pilot vs control (nếu có).  
- Theo role/persona nếu change là role-specific.

### 9.4 Use-cases

- Đọc xem change A có cải thiện completion rate hay chỉ chuyển friction sang chỗ khác.  
- Phát hiện change gây spike unexpected trong errors hoặc restricted_action events.

## 10. Mapping giữa event taxonomy, metrics framework và dashboards

### 10.1 Event-to-metric mapping

Mọi metric trong dashboards phải map rõ ràng tới event families và properties từ tài liệu 49. Không metric nào được tính từ event “tự phát minh” ngoài taxonomy.

### 10.2 Metric-to-dashboard mapping

Tài liệu 42 định nghĩa metrics, documents này định nghĩa dashboards. Mỗi metric nên biết nó xuất hiện ở dashboard nào, với filter nào và đối tượng audience nào.

### 10.3 Role-permission and environment mapping

Dashboards phải có khả năng filter theo role, permission context (nếu khả thi) và environment type (pilot vs demo vs QA) như đã định trong tài liệu 50 và 51.

## 11. Requirements về giao diện, drill-down và storytelling của dashboards

### 11.1 UI principles

- Ưu tiên clarity và interpretability, tránh clutter.  
- Group signals theo câu hỏi pilot (Throughput? Authority friction? Continuity? Errors? Drift?).  
- Dùng thuật ngữ từ terminology register, không invent label mới.

### 11.2 Drill-down

- Cho phép đi từ summary → flow → role → site → event timeline khi cần.  
- Hỗ trợ xem example traces hoặc sessions cho signals bất thường (spikes).  
- Không yêu cầu người xem phải biết schema events để tra cứu.

### 11.3 Storytelling support

- Dashboard nên support snapshot chụp lại (export hoặc bookmarking) để dùng trong pilot review meetings.  
- Hỗ trợ annotation hoặc notes để gắn insights với thời điểm.

## 12. Environment labeling, tenant filtering và time windows

### 12.1 Environment labeling

Mọi event phải ghi rõ environment (demo, QA, pilot, production) để dashboards có thể filter. Pilot dashboards mặc định nên exclude demo/QA noise.

### 12.2 Tenant/site filtering

- Hỗ trợ filter theo tenant/site, vì mỗi pilot site có bối cảnh khác nhau.  
- Có view “all pilot” và view “per pilot site”.

### 12.3 Time windows

- Hỗ trợ view theo ngày/tuần/tháng.  
- Hỗ trợ “since pilot start” và “since release X”.  
- Hỗ trợ comparison giữa hai khoảng thời gian.

## 13. Usage trong pilot triage, release review và governance

### 13.1 Pilot triage

- Dashboards là input chính cho pilot triage sessions (tài liệu 48).  
- Mỗi triage meeting nên dựa vào một vài “views chuẩn” thay vì mỗi lần filter lại từ đầu.

### 13.2 Release impact review

- Khi chạy release impact review (tài liệu 52), team sử dụng dashboards này để xem change impacts thật sự, không chỉ phỏng đoán.  
- Impact review records có thể link tới cụ thể dashboards/views.

### 13.3 Governance

- Leadership dùng dashboards để quyết định mở rộng pilot, kéo dài, hay adjust scope.  
- Product Council hoặc tương đương dùng signals để ưu tiên những cải tiến tiếp theo.

## 14. Ownership, cadence review và change management cho dashboards

### 14.1 Ownership

- Product Analytics là owner chính về configuration dashboards.  
- Product Management chịu trách nhiệm về lựa chọn signals và interpretability.  
- Pilot Delivery/Customer Success giúp đảm bảo dashboards phản ánh câu hỏi thực tế của hiện trường.  
- UX Research hỗ trợ interpretability và narrative.

### 14.2 Cadence

- Trong pilot, nên có review cadence tối thiểu hàng tuần cho signals chính.  
- Sau mỗi release có change lớn, nên có một review dành riêng cho change impact.

### 14.3 Change management

- Không thêm/bỏ metrics khỏi dashboards mà không update tài liệu này hoặc tài liệu 42/49 tương ứng.  
- Mọi thay đổi label trên dashboards phải đi qua Copy QA semantic checklist (tài liệu 54).

## 15. Anti-pattern pilot dashboard nghiêm trọng phải tránh

1. Dashboards chỉ đếm page views và clicks, không bám flow, state, role hoặc outcome.  
2. Mỗi team tự có “bảng số” riêng, không có nguồn sự thật chung.  
3. Dùng tên metric mơ hồ (“Hiệu suất”, “Chất lượng”) mà không định nghĩa semantics.  
4. Không phân biệt environment, khiến demo/QA lệch pilot thực.  
5. Không có segmentation theo role và flow, khiến signals khó hành động.  
6. Chỉ dùng dashboards như “bằng chứng” trong tranh luận, không dùng như nguồn học tập thực tế.  
7. Không ai chịu trách nhiệm cập nhật dashboards khi semantics hoặc flows đổi.

## 16. Dashboards cho sales demo nâng cao và training nội bộ

- Một số views từ pilot dashboards có thể được “sanitized” và dùng trong sales demo để kể câu chuyện value dựa trên số thật.  
- Dashboards cũng hữu ích cho training nội bộ (onboarding team mới, huấn luyện support/CS) để họ “nhìn thấy” hệ thống đang sống, không chỉ đọc tài liệu.

## 17. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics chi tiết cho các handoffs Web Admin ↔ Mobile Ops dựa trên signals.  
2. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – test matrix cho authority boundaries, exceptions và waivers.  
3. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – index và runbook cho scenario library và môi trường.  
4. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – tài liệu enablement cho field users về continuity/resilience.  
5. **60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE.md** – template tổng hợp học sau pilot và quyết định mở rộng/điều chỉnh.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Pilot Signal Review Dashboards của Pack 03:

1. Pack 03 cần một bộ dashboards được thiết kế đặc biệt cho pilot, không chỉ reuse dashboards production generic.  
2. Dashboards phải bám chặt metrics framework, event taxonomy, flow grammar, authority semantics, continuity semantics và triage model.  
3. Execution, authority friction, continuity, error semantics và change impact là five pillar signal families phải có.  
4. Segmentation theo flow, role, site, environment và version là bắt buộc để signals có ý nghĩa.  
5. Dashboards phải hỗ trợ pilot triage, release impact review và quyết định governance, không chỉ “trang trí số”.  
6. Dashboards phải có owner rõ ràng và change management gắn với semantic QA.  
7. Tài liệu này là baseline để Nextflow OS đọc được pilot như một hệ thống thực, chứ không chỉ qua vài câu chuyện lẻ.

## 19. Điều kiện hoàn thành của tài liệu

Pilot Signal Review Dashboard Requirements được xem là đạt yêu cầu khi:
- team có một set dashboards rõ ràng để nhìn execution, authority, continuity, error semantics và change impact trong pilot;  
- signals được định nghĩa semantics rõ và bám event taxonomy;  
- segmentation cho phép đọc signals theo flow, role, site, environment và version;  
- và pilot triage, release review và governance decisions có thể dựa vào dashboards này như nguồn sự thật chung.

## AG Execution Prompt

You are acting as a senior product analytics architect, pilot-operations strategist, and signal-to-decision translator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: metrics framework, event taxonomy, pilot triage model, role-permission mapping, continuity semantics, reconciliation patterns, and semantic QA checklist are already defined.
- This document defines the Pilot Signal Review Dashboard requirements for Pack 03.

### Objective
Refine these Pilot Signal Review Dashboard Requirements into a production-grade specification that can guide analytics implementation, dashboard design, pilot triage workflows, and post-pilot decision-making.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between execution, authority, continuity, error semantics, and change-impact signals.
- Keep the output concrete enough for data, product, and pilot teams to implement and use.

### Tasks
1. Rewrite the pilot-signal thesis into a sharper executive form.
2. Produce a dashboard taxonomy and metric list with clear mappings to events, flows, roles, and environments.
3. Add detailed segmentation, drill-down, and storytelling requirements.
4. Define ownership, review cadence, and change-management processes for dashboards.
5. Identify the top five pilot-dashboard failures that would mislead or under-inform Pack 03 decisions.
6. Recommend the next documents that should operationalize this baseline into cross-surface diagnostics, authority-boundary testing, scenario-library operations, field playbooks, and post-pilot synthesis.
7. Add governance rules to prevent metric ambiguity, environment confusion, and dashboard sprawl.

### Constraints
- Do not define metrics without tying them to events and semantics.  
- Do not overload dashboards with every possible chart; focus on decision-relevant signals.  
- Do not ignore environment, role, and flow context when designing views.  
- Keep the output concrete enough for real pilot operations.

### Output Format
Return a revised markdown document with these sections:
1. Executive Pilot-Signal Thesis
2. Dashboard Types and Metric Taxonomy
3. Segmentation and Drill-Down Requirements
4. Usage in Triage and Governance
5. Dashboard Failure Risks
6. Governance and Ownership Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 pilot dashboards explicit and actionable.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams implement dashboards that actually support pilot decisions.  
- The output must reduce ambiguity around which signals matter, where to see them, and how to interpret them.
