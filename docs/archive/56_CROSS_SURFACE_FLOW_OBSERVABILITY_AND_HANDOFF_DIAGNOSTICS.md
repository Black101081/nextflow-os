# Nextflow OS – Cross-Surface Flow Observability and Handoff Diagnostics

**Document ID:** 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Analytics / Frontend Delivery / Mobile Platform / Backend Workflow  
**Dependent Packs:** Analytics & Data, QA & Support, Pilot Delivery, Customer Success, Reliability & Observability  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **observability và diagnostics chính thức cho các handoff giữa Web Admin và Mobile Ops** trong Pack 03 của Nextflow OS. Nếu tài liệu 21 và 22 đã định nghĩa hai trải nghiệm bề mặt, tài liệu 25 đã định nghĩa flows, tài liệu 39, 46 và 53 đã định nghĩa continuity và reconciliation, tài liệu 49 đã định nghĩa event taxonomy, tài liệu 50 đã định nghĩa role-permission mapping, và tài liệu 55 đã định nghĩa pilot dashboards, thì tài liệu này trả lời câu hỏi:

> **Khi một công việc, case hoặc task di chuyển qua lại giữa Web Admin và Mobile Ops – qua nhiều state, role, authority và continuity conditions – hệ thống phải phát tín hiệu gì, log gì, đo gì, và debug như thế nào để team có thể thấy rõ hành trình cross-surface đó, chẩn đoán vấn đề tại handoff nào, và không đổ lỗi mù vào “mobile” hoặc “web”?**

Nói cách khác, đây là tài liệu biến cross-surface flows từ “cảm giác là có” thành **đường đi nước bước có thể nhìn, có thể đo và có thể sửa**.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của cross-surface observability trong Pack 03.  
2. Cross-surface flow thesis của tài liệu.  
3. Các loại handoff và cross-surface flow chính trong wedge Pack 03.  
4. Các sự kiện và milestone cần được observability hóa ở mỗi handoff.  
5. Correlation IDs, identity mapping và object identity rules cho cross-surface flows.  
6. Rules cho state, authority, continuity và responsibility semantics khi qua surface.  
7. Requirements cho dashboards, diagnostics views và traces cross-surface.  
8. Rules cho QA coverage và pilot rehearsal của cross-surface flows.  
9. Rules cho triage khi có lỗi xảy ra ở handoff (who sees what, ai chịu trách nhiệm).  
10. Những anti-pattern cross-surface observability nghiêm trọng phải tránh.  
11. Cách dùng tài liệu này trong thiết kế flows, instrumentation và pilot triage.  
12. Liên kết với change impact review và mobile reconciliation.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Cross-Surface Flow Observability and Handoff Diagnostics

Trong Nextflow OS, nhiều flows sẽ chỉ thực sự “đầy đủ” khi đi qua cả Web Admin và Mobile Ops. Ví dụ:
- Web Admin triage và assign → Mobile Ops thực hiện → Web Admin review kết quả.  
- Mobile Ops capture dữ liệu hiện trường → Web Admin quyết định chính sách.  
- Import batch tạo tasks → Mobile Ops xử lý → Web Admin reconcile exceptions.

Nếu cross-surface observability không được thiết kế, các vấn đề sẽ xuất hiện:
- task “biến mất” giữa Web và Mobile theo cảm nhận user;  
- state hiển thị khác nhau ở hai surface;  
- Web Admin nghĩ Mobile chưa làm, Mobile nghĩ đã gửi xong;  
- authority rules bị hiểu là “lỗi app” vì thiếu thông tin trong handoff;  
- pilot triage không phân biệt được lỗi thuộc về mobile client, backend workflow hay Web Admin.

Tài liệu này nhằm đảm bảo rằng khi một cross-surface flow có vấn đề, team có thể đặt câu hỏi và có chỗ để nhìn:
- task/case đã đi qua milestone nào;  
- ở mỗi milestone đó đang đứng trên surface nào;  
- identity và state của object ở mỗi bước là gì;  
- authority và continuity conditions tại từng điểm;  
- events/logs nào chứng minh điều đó.

## 3. Cross-surface flow thesis cho Pack 03

Cross-surface thesis có thể phát biểu như sau:

> **Trong Pack 03, cross-surface flows phải được thiết kế như một đường ray liên tục chạy qua Web Admin và Mobile Ops; mỗi handoff là một mối nối có semantics rõ, quan sát được và kiểm thử được, chứ không phải “đoạn mù” nơi team chỉ biết đầu vào và đầu ra.**

Từ thesis này, mười nguyên lý được suy ra:

1. Mọi cross-surface flow phải có **milestone rõ ràng** trước, trong và sau mỗi handoff.  
2. Task identity và correlation IDs phải xuyên suốt, không đổi mỗi lần đổi surface.  
3. State và outcome semantics phải thống nhất, không có “dịch” khác nhau trên mỗi bề mặt.  
4. Authority và responsibility cues phải được giữ hoặc chuyển giao rõ ràng tại handoff.  
5. Continuity semantics (pending, sync, retry, offline) không được làm lu mờ cross-surface truth.  
6. Observability events phải đủ để dựng lại timeline cross-surface cho một object bất kỳ.  
7. Dashboards và diagnostics views phải cho phép nhìn cross-surface, không chỉ từng surface riêng rẽ.  
8. QA và pilot rehearsal phải có kịch bản cross-surface, không chỉ test Web và Mobile riêng.  
9. Khi cross-surface có lỗi, việc “ai chịu trách nhiệm” phải rõ từ design, không chỉ từ tổ chức.  
10. Cross-surface patterns phải được document để tránh mỗi squad tự giải theo cách khác.

## 4. Các loại handoff và cross-surface flow chính

Pack 03 nên tối thiểu nhận diện các handoff types sau:

1. **Web → Mobile assignment handoff** – Web Admin assign hoặc route công việc cho Mobile Ops.  
2. **Mobile → Web completion handoff** – Mobile Ops hoàn thành task, gửi kết quả cho Web Admin review hoặc auto-accept.  
3. **Web → Mobile clarification handoff** – Web Admin trả về task yêu cầu bổ sung hoặc chỉnh sửa tại hiện trường.  
4. **Mobile → Web exception handoff** – Mobile Ops đánh dấu exception, gửi về Web Admin để xử lý.  
5. **Import → Mobile execution handoff** – Import batch tạo jobs để Mobile Ops xử lý.  
6. **Mobile → Web evidence handoff** – Mobile Ops upload evidence, Web Admin xem và quyết định.  
7. **Cross-role review handoff qua surfaces** – Manager trên Web Admin và Frontline trên Mobile phối hợp trên cùng case.

Mỗi loại handoff có thể dùng một subset milestone giống nhau nhưng context khác nhau.

## 5. Milestones observability cần có ở mỗi handoff

## 5.1 Web → Mobile assignment handoff

Milestones chính:
- case_created_on_web;  
- case_ready_for_assignment;  
- assignment_decision_made (owner set);  
- mobile_task_created (backend);  
- mobile_task_synced_to_device;  
- mobile_task_first_opened.

Events nên bao gồm metadata: object_id, flow_id, assigned_role, assigned_user, site, priority, due_date nếu có.

## 5.2 Mobile → Web completion handoff

Milestones chính:
- mobile_task_marked_complete_locally;  
- sync_queue_enqueued (completion payload);  
- sync_attempt_started;  
- sync_confirmed;  
- backend_workflow_completed;  
- web_case_state_transitioned;  
- web_case_reviewed_or_auto_accepted.

Một timeline đầy đủ giúp trả lời: Mobile đã làm chưa? Sync có đến chưa? Backend đã xử lý chưa? Web đã thấy chưa?

## 5.3 Web → Mobile clarification handoff

Milestones chính:
- web_case_returned_for_more_info;  
- clarification_request_created;  
- mobile_task_clarification_sync_received;  
- mobile_task_clarification_viewed;  
- mobile_response_submitted;  
- response_synced_and_applied_on_web.

## 5.4 Mobile → Web exception handoff

Milestones chính:
- mobile_exception_flagged_locally;  
- exception_payload_enqueued (with type, severity, context);  
- exception_synced_to_backend;  
- web_case_exception_visible;  
- exception_review_decision_made;  
- exception_resolved / case_updated.

## 5.5 Import → Mobile execution handoff

Milestones chính:
- import_batch_created;  
- import_batch_validation_completed;  
- tasks_generated_for_mobile;  
- tasks_synced_to_devices;  
- tasks_processed_locally;  
- completions_synced;  
- reconciliation_completed_on_web.

## 5.6 Mobile → Web evidence handoff

Milestones chính:
- evidence_captured_locally;  
- attachment_upload_started;  
- attachment_upload_confirmed;  
- evidence_available_on_web;  
- evidence_viewed_by_reviewer;  
- evidence_influenced_decision (if trackable).

## 6. Correlation IDs, identity mapping và object identity rules

## 6.1 Identity essentials

Để cross-surface flows observable, mỗi task/case/object nên có:
- object_id (stable across surfaces);  
- flow_run_id hoặc case_run_id;  
- assignment_id nếu có;  
- attachment_id riêng cho evidence;  
- correlation_id or trace_id cho mỗi roundtrip client-server.

## 6.2 Mapping rules

- Web và Mobile phải dùng cùng object_id cho cùng case, không mapping mơ hồ qua nội dung.  
- Handoff events phải luôn include object_id + flow_id + surface metadata.  
- Dashboards và diagnostics views phải có khả năng filter theo object_id và reconstruct cross-surface timelines.

## 6.3 Session vs object

Session_id là cho user session; object_id và flow_run_id là cho trường hợp. Cross-surface diagnostics phải ưu tiên object-based view, không chỉ session-based view.

## 7. State, authority, continuity và responsibility semantics qua surfaces

## 7.1 State semantics

- State names và nghĩa phải thống nhất giữa Web và Mobile.  
- Có thể khác cách trình bày (UI layout) nhưng không khác meaning.  
- Cross-surface events state_transition phải dùng cùng state vocabulary.

## 7.2 Authority and responsibility

- Khi Web assign cho Mobile, trách nhiệm primary chuyển từ role này sang role kia; messaging và dashboards phải thể hiện điều đó.  
- Khi Mobile trả về exception hoặc completion, responsibility có thể quay lại Web hoặc kết thúc; semantics phải rõ.

## 7.3 Continuity

- Pending sync trên Mobile không đồng nghĩa đang pending review trên Web.  
- Dashboards và logs phải cho phép phân biệt: “Mobile đã xong nhưng chưa sync”, “Sync xong nhưng Web chưa review”, “Web đã review xong”.

## 8. Requirements cho dashboards và diagnostics cross-surface

## 8.1 Object-level timeline view

Cần có view cho một object: timeline các sự kiện cross-surface, gồm:
- khi nào tạo, assign, sync, mở, completed, review, exception, clarification, retry;  
- trên surface nào, bởi role/user nào.

## 8.2 Aggregate handoff health views

Dashboards nên có:
- số lượng handoff Web→Mobile và Mobile→Web theo thời gian;  
- tỉ lệ handoff thành công vs thất bại/tắc;  
- delay trung bình giữa milestones (assign→sync→open, complete→sync→web-update, exception_flag→web-visible, v.v.);  
- tần suất need_manual_intervention events.

## 8.3 Drill-down từ pilot dashboards

Từ dashboards pilot (tài liệu 55), người dùng nên có thể click vào một cohort (ví dụ tasks với retry_exhausted) và xem cross-surface timeline sample để hiểu root cause.

## 9. Rules cho QA coverage và pilot rehearsal cross-surface

## 9.1 QA scenarios

QA phải có scenarios cho:
- Web assign → Mobile nhận, thực hiện, gửi kết quả → Web thấy;  
- Mobile làm xong nhưng mất mạng, sync muộn, Web thấy muộn;  
- Web trả lại yêu cầu bổ sung → Mobile nhận → gửi lại → Web apply;  
- Mobile flag exception → Web xử lý → Mobile thấy kết quả;  
- Import tạo tasks → Mobile xử lý → Web reconcile;  
- Evidence captured trên Mobile → Web dùng để quyết định.

## 9.2 Pilot rehearsal

Demo/pilot environment (tài liệu 51) nên có object sets dành riêng cho cross-surface flows, với hướng dẫn chi tiết ai login ở đâu, làm gì trên surface nào và check ở đâu.

## 10. Rules cho triage khi có lỗi ở handoff

## 10.1 Who sees what

- Support/CS cần có tools để tra một object và xem cross-surface timeline;  
- Pilot Delivery cần biết lỗi phát sinh chủ yếu ở step nào;  
- Engineering cần event/log context đủ để debug.

## 10.2 Responsibility mapping

- Khi thất bại ở bước nào, component nào/squad nào chịu trách nhiệm?  
- Có signal gì cho biết đó là lỗi client, backend, config, hay data của pilot site?

## 11. Anti-pattern cross-surface observability nghiêm trọng phải tránh

1. Chỉ log events trên từng surface riêng, không bao giờ nối chúng lại.  
2. Dùng IDs khác nhau cho cùng một object ở Web và Mobile.  
3. Không có milestone rõ ràng cho handoff, chỉ “vài event rời rạc”.  
4. Dashboards chỉ cho thấy Web hoặc Mobile, không có view cross-surface.  
5. Pilot triage dựa vào lời kể “em trên hiện trường bảo là…” mà không có trace.  
6. Không có QA scenario nào cho cross-surface flows.  
7. Không ai chịu trách nhiệm tổng thể cho cross-surface health.

## 12. Cách dùng tài liệu này trong thiết kế, instrumentation và pilot triage

- Designers dùng tài liệu này để đảm bảo flows cross-surface có milestones rõ, state và authority semantics thống nhất.  
- Engineers dùng để thiết kế event emission, IDs và logs cho phép reconstruction timeline.  
- Analytics dùng để thiết kế dashboards và cohort analysis cross-surface.  
- Pilot triage dùng để đi từ signal “có vấn đề” tới chỗ trong flow cross-surface cần sửa.

## 13. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – ma trận test chi tiết cho authority boundaries, đặc biệt ở cross-surface flows.  
2. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – index và runbook cho toàn bộ scenario library (bao gồm cross-surface).  
3. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – playbook cho field users về behavior cross-surface và continuity.  
4. **60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE.md** – template tổng hợp học sau pilot, trong đó có phần cross-surface.  
5. **61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS.md** – hướng dẫn hỗ trợ và troubleshoot pilot dựa trên diagnostics cross-surface.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Cross-Surface Flow Observability and Handoff Diagnostics của Pack 03:

1. Cross-surface flows giữa Web Admin và Mobile Ops phải có milestones, IDs và events thống nhất, đủ để dựng lại timeline cho từng object.  
2. Assignment, completion, clarification, exception, import và evidence handoffs là các flow trọng yếu phải có observability rõ.  
3. State, authority, continuity và responsibility semantics phải được giữ nhất quán khi qua surface.  
4. Dashboards và tools phải hỗ trợ nhìn cross-surface, không chỉ từng surface đơn lẻ.  
5. QA và pilot rehearsal phải bao gồm kịch bản cross-surface có thiết kế, không chỉ flows đơn-surface.  
6. Triage lỗi phải dựa trên traces cross-surface chứ không chỉ anecdote.  
7. Tài liệu này là baseline để Nextflow OS có thể vận hành các flows phức tạp qua nhiều bề mặt mà vẫn giữ được transparency và trust.

## 15. Điều kiện hoàn thành của tài liệu

Cross-Surface Flow Observability and Handoff Diagnostics được xem là đạt yêu cầu khi:
- team có thể cho một object ID bất kỳ, dựng lại được hành trình qua Web và Mobile;  
- dashboards cho phép nhìn health của handoffs và phát hiện bottlenecks;  
- QA có bộ scenario cross-surface rõ;  
- pilot triage có thể dùng traces để phân loại lỗi và đề xuất sửa;  
- và cross-surface flows có thể evolve mà không tạo ra “vùng mù” mới.

## AG Execution Prompt

You are acting as a senior cross-surface experience architect, observability designer, and pilot diagnostics strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web and Mobile experience strategies, flows, state grammar, continuity semantics, event taxonomy, role-permission mapping, pilot dashboards, and triage model are already defined.
- This document defines cross-surface flow observability and handoff diagnostics for Pack 03.

### Objective
Refine this Cross-Surface Flow Observability and Handoff Diagnostics document into a production-grade blueprint that can guide event design, ID strategy, dashboards, QA scenarios, and pilot troubleshooting for cross-surface flows.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between Web and Mobile surfaces while enforcing shared semantics and IDs.  
- Keep the output concrete enough for design, engineering, analytics, QA, and support to implement and use.

### Tasks
1. Rewrite the cross-surface flow thesis into a sharper executive form.
2. Produce a catalog of handoff types and required milestones.  
3. Add rules for IDs, state/authority/continuity semantics, and responsibility across surfaces.  
4. Define dashboard and diagnostics requirements for cross-surface timelines and aggregate health views.  
5. Specify QA and pilot rehearsal coverage for cross-surface flows.  
6. Identify the top five cross-surface observability failures that would damage trust or make troubleshooting hard.  
7. Recommend the next documents that should operationalize this baseline into authority-boundary testing, scenario-library operations, field playbooks, and post-pilot synthesis.

### Constraints
- Do not let Web and Mobile drift into separate semantic universes.  
- Do not design observability only for one surface.  
- Do not ignore identity and correlation when defining events.  
- Keep the output concrete enough to be actionable in real pilots.

### Output Format
Return a revised markdown document with these sections:
1. Executive Cross-Surface Flow Thesis
2. Handoff Catalog and Milestones
3. IDs and Semantics Rules
4. Dashboards and Diagnostics Requirements
5. QA and Pilot Coverage
6. Cross-Surface Failure Risks
7. Governance and Implementation Rules
8. Recommended Next Documents

### Acceptance Criteria
- The output must make cross-surface flows observable, diagnosable, and governable.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams implement events, IDs, dashboards, and QA that support cross-surface flows.  
- The output must reduce ambiguity around what happens at each handoff between Web and Mobile.
