# Nextflow OS – Mobile Eventual Consistency and Reconciliation Patterns

**Document ID:** 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Mobile Platform / Backend Workflow / Product Design  
**Dependent Packs:** Frontend Delivery, Mobile Platform, Backend Services, Analytics & Data, QA & Support, Reliability & Observability, Pilot Delivery  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **pattern eventual consistency và reconciliation chính thức cho Mobile Ops** trong Pack 03 của Nextflow OS. Nếu tài liệu 39 đã khóa offline resilience patterns, tài liệu 46 đã khóa continuity handshake semantics, tài liệu 42 đã khóa measurement signals, và tài liệu 49 đã khóa event taxonomy, thì tài liệu này đi sâu vào câu hỏi:

> **Khi local state và server state không trùng nhau trong một khoảng thời gian – do delay, sync fail, retry, conflict, stale reads hoặc partial success – thì hệ thống Mobile Ops phải xử lý như thế nào để vừa bảo vệ nỗ lực của người dùng, vừa giữ được truth của sản phẩm, vừa không làm measurement và pilot learning bị méo?**

Nói cách khác, đây là tài liệu chuyển từ “offline và pending sync mô tả được” sang “eventual consistency behavior có thiết kế”, bao gồm:
- các pattern reconciliation chấp nhận được;  
- các pattern cần tránh;  
- các state UX được phép dùng;  
- copy, event và QA behaviors đi kèm.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của eventual consistency và reconciliation trong Mobile Ops.  
2. Reconciliation thesis cho Pack 03.  
3. Các tình huống inconsistency điển hình trong Mobile Ops wedge.  
4. Các pattern reconciliation chính thức được chấp nhận.  
5. Rules cho local-vs-server truth khi conflict hoặc delay.  
6. Rules cho presentation, copy và interaction trong reconciliation moments.  
7. Rules cho attachment vs record reconciliation.  
8. Rules cho metrics và event semantics khi có eventual consistency.  
9. Rules cho QA coverage và pilot rehearsal.  
10. Rules cho rollback, override và user-noticeable corrections.  
11. Những anti-pattern reconciliation nghiêm trọng phải tránh.  
12. Cách dùng tài liệu này trong thiết kế Mobile Ops, backend workflow và observability.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần eventual consistency và reconciliation patterns

Mobile Ops không thể giả định rằng mọi update đều synchronous và tức thời giữa client và server. Thực tế sẽ có:
- mạng yếu;  
- loss of connectivity;  
- server-side validation chậm;  
- workflow logic backend phức tạp;  
- attachment upload pipelines riêng;  
- replay, retry, idempotency keys;  
- và đôi khi cả conflict thực sự giữa hai tác nhân (client khác, Web Admin, batch import, v.v.).

Nếu Pack 03 chỉ dừng lại ở việc nói “có offline” và “có sync”, mà không định nghĩa **các pattern reconcile** cho các trường hợp delay, conflict, partial success, stale state, server correction hoặc reject muộn, thì UX sẽ phải ứng biến theo từng ticket, dẫn đến:
- copy thiếu nhất quán;  
- metrics đếm sai moment complete;  
- QA khó chứng minh truth-of-state;  
- user mất trust vì thấy điều họ làm bị “sửa lại” mà không biết vì sao.

Tài liệu này vì vậy là lớp nối giữa continuity semantics và actual consistency behavior – ở cấp product, không chỉ ở cấp kỹ thuật.

## 3. Reconciliation thesis cho Pack 03

Reconciliation thesis có thể phát biểu như sau:

> **Trong Mobile Ops của Pack 03, eventual consistency là một đặc tính có thiết kế, không phải side-effect của lỗi mạng; mọi tình huống local state và server state không trùng nhau phải đi theo một pattern reconciliation có chủ đích, với rules rõ về local truth, server truth, khi nào im lặng điều chỉnh, khi nào phải báo cho user, và khi nào phải escalated ra flow khác.**

Từ thesis này, mười nguyên lý được suy ra:

1. Reconciliation phải ưu tiên **user-effort protection over naive overwrites**.  
2. Server truth là authoritative cho outcome, nhưng local truth là authoritative cho context và effort.  
3. Không phải mọi mismatch đều cần user-facing alert; nhưng mọi mismatch có nghĩa nghiệp vụ phải có pattern xử lý.  
4. UX không được giả vờ synchronous nếu không phải, nhưng cũng không được bắt user gánh mọi chi tiết kỹ thuật về consistency.  
5. Attachment và record có thể có lifecycle khác nhau và reconciliation riêng.  
6. Metrics và events phải phản ánh correct milestone semantics trong bối cảnh eventual consistency.  
7. QA phải test nhiều timeline – không chỉ “server phản hồi ngay lập tức”.  
8. Reconciliation decisions phải nhất quán với traceability và authority semantics.  
9. Khi không chắc, product nên chọn pattern ít gây mất niềm tin hơn, ngay cả khi không tối ưu về cảm giác “tức thời”.  
10. Reconciliation patterns phải được documented để pilot learning và bug triage có ngôn ngữ chung.

## 4. Các tình huống inconsistency điển hình trong Mobile Ops wedge

Pack 03 nên assume ít nhất các trường hợp inconsistency sau sẽ xảy ra trong thực tế:

1. **Delayed success** – local update thành công, request gửi muộn, backend cuối cùng chấp nhận.  
2. **Delayed rejection** – local update tạm coi là pending hoặc optimistic, nhưng backend reject sau đó.  
3. **Partial success** – record được chấp nhận nhưng một hoặc nhiều attachment fail.  
4. **Duplicate submission attempts** – do repeated taps, retries hoặc unclear feedback.  
5. **Stale server state** – mobile đang xem version cũ của item trong khi Web Admin đã cập nhật.  
6. **Stale local state** – app resume từ background với local cache không còn trùng sự thật server.  
7. **Cross-channel conflict** – mobile và Web Admin update cùng một record hoặc field theo sequence khác nhau.  
8. **Server-side correction** – backend workflow hoặc admin sửa lại dữ liệu sau khi mobile đã “thấy” một kết quả khác.  
9. **Retry exhaustion** – hệ thống hết khả năng tự retry nhưng local vẫn có payload.  
10. **Event or metrics lag** – signals được emit muộn hơn UI reconciliation.

## 5. Các pattern reconciliation chính thức

Tài liệu này đề xuất một bộ pattern reconciliation mà Pack 03 nên dùng nhất quán.

## 5.1 Pattern A – Silent alignment after eventual success

Use khi:
- local đã capture;  
- server cuối cùng chấp nhận cùng outcome;  
- không có conflict và không có thay đổi meaning;  
- user không cần action thêm.

Behavior:
- UI chuyển từ pending/pseudo-state sang confirmed state;  
- local copy được overwrite bằng server truth nếu không có khác biệt nghĩa;  
- events reflect sync_confirmed milestone;  
- no explicit toast nếu điều đó không thêm clarity.

## 5.2 Pattern B – Gentle correction after server-side adjustment

Use khi:
- local outcome đúng hướng nhưng backend phải điều chỉnh chi tiết (ví dụ rounding, normalizing fields, enriching với data khác);  
- hoặc backend áp dụng policy corrections nhẹ không làm đảo ngược ý nghĩa hành động.

Behavior:
- UI refresh data với server truth;  
- optional một subtle info note nếu correction có thể gây bối rối (ví dụ “giá trị đã được điều chỉnh theo quy tắc X”);  
- metrics và events reflect server final;  
- không yêu cầu user làm lại.

## 5.3 Pattern C – Explicit disagreement with guided resolution

Use khi:
- server reject outcome;  
- hoặc server outcome khác meaning với local expectation (ví dụ reject thay vì accept);  
- mismatch có nghĩa nghiệp vụ và user cần hiểu.

Behavior:
- UI hiển thị rõ state hiện tại theo server;  
- một message family từ recovery/exception register giải thích mismatch và next step;  
- offer recovery path: chỉnh sửa và resend, bỏ qua, escalate hoặc contact support;  
- events reflect backend_rejected hoặc conflict, không đếm như completion.

## 5.4 Pattern D – Dual-track outcome: record vs attachment

Use khi:
- record thành công nhưng một hoặc nhiều attachment fail;  
- hoặc ngược lại nếu kiến trúc cho phép.

Behavior:
- State record thể hiện success hoặc pending theo semantics;  
- attachment chips/slots thể hiện fail/pending riêng với retry options;  
- copy không gộp hai outcome thành một message chung chung;  
- metrics tách record_success vs attachment_success;  
- QA scenarios test mixed outcomes.

## 5.5 Pattern E – Stale view detection and refresh

Use khi:
- app resume hoặc user quay lại view cũ;  
- có khả năng server đã đổi state quan trọng.

Behavior:
- lightweight freshness check;  
- nếu stale, UI refresh data;  
- optional message nếu state change là meaningful (ví dụ “yêu cầu đã được xử lý bởi người khác”);  
- tránh “đá văng” user khỏi flow trừ khi action họ định làm không còn hợp lệ.

## 5.6 Pattern F – Conflict fallback and escalation

Use khi:
- backend phát hiện conflict thật sự (hai update incompatible);  
- không thể auto-merge.

Behavior:
- UI nhận trạng thái conflict;  
- hiển thị summary new vs previous nếu feasible;  
- hướng user tới resolution path: chọn một version, merge thủ công, hoặc escalate;  
- không giả vờ success;  
- events gắn conflict type rõ ràng.

## 5.7 Pattern G – Retry exhaustion with preserved draft

Use khi:
- retry engine không thể gửi payload thành công sau nhiều attempts;  
- local payload vẫn còn.

Behavior:
- giữ draft hoặc local copy an toàn;  
- hiển thị rõ là system đã dừng retry;  
- gợi ý next step (thử lại khi có mạng tốt hơn, liên hệ support, v.v.);  
- không xóa effort im lặng;  
- metrics và events reflect retry_exhausted.

## 6. Rules cho local-vs-server truth

## 6.1 Principle hierarchy

1. Server truth thắng khi nói về **outcome nghiệp vụ** (đã phê duyệt, đã từ chối, đã ghi nhận).  
2. Local truth thắng khi nói về **effort và context người dùng** (đã nhập cái gì, đã cố gắng làm gì, đã thấy gì).  
3. Khi mismatch có thể giải thích được mà không cần user involvement, pattern A hoặc B nên được dùng.  
4. Khi mismatch làm thay đổi meaning của outcome đối với user, pattern C hoặc F phải được dùng.

## 6.2 No silent reversal of meaning

Không được im lặng biến một attempt mà user tin là “completed” thành “rejected” mà không có dấu hiệu nào ở UI khi user quay lại xem.

## 6.3 Idempotency and duplicates

Nếu backend dùng idempotency keys hoặc client-generated IDs, UX nên assume rằng repeated taps trong một khoảng thời gian nhỏ không tạo nhiều outcomes. Trong logs, events vẫn phải thể hiện attempt counts để QA và analytics đọc được.

## 7. Presentation, copy và interaction trong reconciliation moments

## 7.1 State presentation

Khi reconcile, state hiển thị cuối cùng phải **trung thành với server truth** cho outcome, nhưng vẫn đủ context để user hiểu điều gì đã xảy ra. Điều này có thể cần thêm secondary labels hoặc history snippets.

## 7.2 Copy families

Reconciliation copy nên reuse families từ terminology register:
- continuity phrases (saved locally, waiting to sync, retry needed);  
- outcome phrases (completed, rejected, returned);  
- recovery phrases (try again, correct and resend);  
- authority/policy phrases nếu liên quan.

Không phát minh “from scratch” cho mỗi error.

## 7.3 Interaction affordances

Khi mismatch đòi hỏi user action, UI phải cung cấp CTA rõ (chỉnh sửa, resend, bỏ qua, xem chi tiết, liên hệ). Không chỉ hiển thị message rồi bắt user tự đoán phải quay lại màn nào.

## 8. Attachment vs record reconciliation rules

## 8.1 Separate but linked semantics

Record và attachment nên có semantics riêng, nhưng UI phải giúp user hiểu mối quan hệ:
- record có thể completed nhưng attachment fail;  
- record có thể pending vì chờ attachment;  
- attachment có thể re-upload mà không đổi outcome record.

## 8.2 Visual pattern

Attachment states nên được biểu diễn bằng chips, badges hoặc inline status riêng, không reuse state-line chính của record. Copy phải nói rõ “ảnh bị lỗi” khác với “tác vụ bị lỗi”.

## 8.3 Metrics and events

Events nên phân biệt record_outcome, attachment_upload_started/failed/confirmed. Completion metrics cho flow không nên coi attachment_fail là flow_success nếu product semantics yêu cầu evidence.

## 9. Metrics và event semantics trong eventual consistency

## 9.1 Milestone mapping

Trong presence eventual consistency, Pack 03 nên chốt rõ milestones:
- local_persist_success;  
- sync_queue_enqueued;  
- sync_attempt_started;  
- sync_confirmed;  
- backend_rejected;  
- conflict_detected;  
- retry_exhausted;  
- attachment_upload_confirmed/failed;  
- reconciliation_completed.

## 9.2 Metrics definitions

Metrics như completion rate, retry rate, failure rate, time-to-confirm, conflict frequency phải được định nghĩa dựa trên các milestone này, không chỉ trên UI events hoặc local actions.

## 9.3 Pilot reading

Trong pilot, team nên đọc signals eventual consistency theo cluster, ví dụ:
- high retry_exhausted;  
- many backend_rejected after local success;  
- frequent conflicts for certain flows.  

Pattern này có thể báo hiệu thiết kế flow, copy, authority semantics hoặc backend rules cần xem lại.

## 10. QA coverage và pilot rehearsal cho reconciliation

## 10.1 QA scenarios bắt buộc

QA phải có scenarios cho:
- delayed success;  
- delayed rejection;  
- partial success (record vs attachment);  
- stale view refresh;  
- conflict detection;  
- retry exhaustion;  
- reconciliation after app resume.

## 10.2 Pilot rehearsal

Demo/pilot rehearsal environment nên có objects và steps cụ thể cho mỗi pattern reconciliation. Người trình bày không nên phải “hi vọng” mạng sẽ rớt đúng lúc.

## 10.3 Acceptance criteria

Một reconciliation pattern chỉ được coi là pass khi:
- state hiển thị, copy, interaction, backend truth và events đều thống nhất;  
- user effort không bị xóa im lặng;  
- QA có thể chứng minh cả truth-of-state lẫn truth-of-copy.

## 11. Rollback, override và user-noticeable corrections

## 11.1 Rollback rules

Rollback local-only (chưa server confirm) có thể im lặng hơn rollback sau khi server đã chấp nhận. Với rollback sau confirm, cần coi đây là một quyết định nghiệp vụ mới, không phải undo kỹ thuật.

## 11.2 Override rules

Nếu hệ thống cho phép override backend decision (ví dụ Web Admin override), Mobile UX phải thể hiện rõ: outcome hiện tại là kết quả của override, không phải của hành động trước đó của user mobile.

## 11.3 User-noticeable corrections

Khi correction làm thay đổi điều user nghĩ đã xảy ra (ví dụ điểm đã cộng bị trừ lại), product nên ưu tiên minh bạch với note vừa phải hơn là che giấu correction hoàn toàn.

## 12. Anti-pattern reconciliation nghiêm trọng phải tránh

## 12.1 Fake synchrony

UI giả vờ mọi thứ xong ngay dù server chưa confirm, không có pending states, không có retry semantics, không có events meaningful.

## 12.2 Silent semantic reversal

Outcome bị đảo từ success sang reject hoặc từ completed sang reopened mà không có tín hiệu nào user có thể thấy khi quay lại.

## 12.3 Attachment conflation

Gộp attachment fail vào một trạng thái “submit thất bại” chung, khiến user tưởng họ phải làm lại mọi thứ.

## 12.4 Metrics at local milestone only

Đếm completion ngay sau local save trong khi product flow yêu cầu server confirm để outcome có giá trị.

## 12.5 QA happy-path only

Chỉ test case server phản hồi ngay; bỏ qua toàn bộ timelines delay/retry/conflict.

## 12.6 Reconciliation by chance

Dựa vào behavior hiện tại của backend hoặc network thay vì thiết kế pattern reconciliation rõ ràng.

## 13. Cách dùng tài liệu này trong thiết kế, backend workflow và observability

## 13.1 Thiết kế Mobile Ops

Designers nên dùng các pattern trong tài liệu này khi:
- thiết kế continuity flows;  
- quyết định các trạng thái pending, retry, conflict, resolved;  
- viết copy cho các moment reconciliation.

## 13.2 Backend workflow

Backend teams nên tham chiếu patterns này khi:
- quyết định idempotency, conflict detection và resolution;  
- thiết kế rules về delayed acceptance hoặc rejection;  
- phát sự kiện phản ánh milestones đúng semantics.

## 13.3 Observability and analytics

Analytics nên dùng taxonomy và patterns để:
- định nghĩa metrics đúng mốc;  
- xây dashboards đọc eventual consistency health;  
- hỗ trợ pilot triage khi feedback chạm continuity/trust.

## 14. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST.md** – checklist review copy và semantics trước release, đặc biệt cho continuity và authority messaging.  
2. **55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS.md** – requirements cho dashboards đọc signals về execution quality, trust và eventual consistency.  
3. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics cho các handoffs giữa Web Admin và Mobile Ops khi có eventual consistency.  
4. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – test matrix cho authority boundaries, overrides và waivers.  
5. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – index và runbook vận hành toàn bộ scenario library bao gồm eventual consistency patterns.  
6. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – playbook giải thích cho field users về continuity và reconciliation behavior (dưới dạng tài liệu enablement).

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho eventual consistency và reconciliation trong Mobile Ops của Pack 03:

1. Eventual consistency không phải lỗi phụ mà là một đặc tính có thiết kế, với patterns A–G chính thức.  
2. Server truth quyết định outcome nghiệp vụ, nhưng local truth quyết định cách product giữ và tôn trọng nỗ lực người dùng.  
3. Delayed success, delayed rejection, partial success, stale views, conflicts và retry exhaustion đều phải có pattern reconciliation riêng, không xử lý ad-hoc.  
4. Attachment và record có semantics riêng, metrics riêng và UX representation riêng.  
5. Metrics và events phải bám milestones semantic đúng trong bối cảnh eventual consistency.  
6. QA và pilot rehearsal phải cover timelines delay/retry/conflict, không chỉ happy path synchronous.  
7. Tài liệu này là baseline để Mobile Ops của Pack 03 có thể hoạt động trong thế giới mạng thật mà không đánh mất trust và coherence trải nghiệm.

## 16. Điều kiện hoàn thành của tài liệu

Mobile Eventual Consistency and Reconciliation Patterns được xem là đạt yêu cầu khi:
- team có bộ patterns reconciliation rõ cho các tình huống inconsistency chính;  
- local vs server truth được xử lý nhất quán trên UI, backend và metrics;  
- QA và pilot rehearsal có thể tái hiện và verify các patterns này;  
- và Mobile Ops có thể triển khai offline, retry, delayed confirm và conflict một cách có chủ đích và có thể quản trị.

## AG Execution Prompt

You are acting as a senior mobile continuity architect, eventual-consistency strategist, and reconciliation-patterns designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops flows, continuity semantics, offline patterns, copy system, QA scenarios, metrics, traceability, observability taxonomy, and demo environment setup are already defined.
- This document defines the eventual consistency and reconciliation patterns for Mobile Ops.

### Objective
Refine this Mobile Eventual Consistency and Reconciliation Patterns document into a production-grade pattern library that can guide client-state handling, backend workflows, UI presentation, copy, metrics, QA, and pilot learning for eventual consistency in Pack 03.

### Inputs
- Use this document plus the relevant Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between local effort, server outcome, record vs attachment, and different inconsistency scenarios.
- Keep the output concrete enough for design, engineering, QA, and analytics to implement and validate.

### Tasks
1. Rewrite the reconciliation thesis into a sharper executive form.
2. Produce a catalog of inconsistency scenarios and associated reconciliation patterns.
3. Add rules for local-vs-server truth, state presentation, copy, interaction, and attachment vs record semantics.
4. Define metrics and event semantics for eventual consistency milestones.
5. Specify QA and pilot rehearsal coverage requirements.
6. Identify the top five reconciliation failures that would damage trust or data integrity.
7. Recommend the next documents that should operationalize this baseline into copy QA checklists, pilot dashboards, cross-surface diagnostics, authority-boundary tests, and scenario-library operations.

### Constraints
- Do not assume synchronous behavior when reality will not guarantee it.  
- Do not collapse record and attachment outcomes into a single vague success/failure state.  
- Do not silently reverse meaning without user-visible reconciliation.  
- Do not design metrics or events that ignore eventual consistency timelines.  
- Keep the output concrete enough for real-world mobile operations and field conditions.

### Output Format
Return a revised markdown document with these sections:
1. Executive Reconciliation Thesis
2. Inconsistency Scenario Catalog
3. Reconciliation Patterns and Rules
4. Metrics, Events, and QA Coverage
5. Reconciliation Failure Risks
6. Governance and Implementation Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 eventual consistency and reconciliation patterns explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams implement and test eventual consistency behavior with clear semantics and user trust.  
- The output must reduce ambiguity around local vs server truth, delayed outcomes, conflicts, mixed record/attachment results, and reconciliation UX.
