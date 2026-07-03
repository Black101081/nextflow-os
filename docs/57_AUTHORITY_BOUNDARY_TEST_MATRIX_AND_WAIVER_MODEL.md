# Nextflow OS – Authority Boundary Test Matrix and Waiver Model

**Document ID:** 57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Security & Access Governance / QA Systems / Product Design  
**Dependent Packs:** Identity & Access, Backend Workflow, Analytics & Data, QA & Support, Pilot Delivery, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE, 56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **ma trận test authority boundaries và mô hình waiver (ngoại lệ có kiểm soát)** cho Pack 03 của Nextflow OS. Nếu tài liệu 43 và 50 đã khóa authority UX rules và role-permission experience mapping, tài liệu 42 và 49 đã khóa metrics và event taxonomy, tài liệu 48 và 55 đã khóa pilot triage và pilot dashboards, còn tài liệu 56 đã khóa cross-surface observability, thì tài liệu này trả lời câu hỏi:

> **Làm thế nào để chúng ta test được rằng các boundary thẩm quyền (ai được làm gì, ở đâu, trong state nào, với policy nào) thực sự hoạt động đúng – cả về mặt kỹ thuật lẫn trải nghiệm – và những chỗ cần ngoại lệ (waiver) thì được thiết kế, đo lường và quản trị thay vì “hack quyền”?**

Nói cách khác, đây là tài liệu biến “rule authority” từ mô hình backend+copy thành **một system testable và governable**: có ma trận test rõ, có waiver model rõ, có signals rõ, và có liên kết tới pilot learning.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của authority-boundary testing trong Pack 03.  
2. Authority-boundary thesis của tài liệu.  
3. Các loại boundary authority chính trong wedge Pack 03.  
4. Cấu trúc chuẩn của authority boundary test matrix.  
5. Rules cho test view-only, restricted, escalate, override và policy-blocked moments.  
6. Rules cho cross-surface authority behavior (Web ↔ Mobile).  
7. Rules cho telemetry và metrics gắn với authority boundaries.  
8. Rules cho pilot triage và waiver design khi boundary “đúng về policy nhưng khó dùng”.  
9. Mô hình waiver: khi nào cho phép, dạng nào, ai approve, quan sát thế nào.  
10. Rules cho QA coverage và regression kiểm tra authority và waiver.  
11. Những anti-pattern authority-boundary và waiver nghiêm trọng phải tránh.  
12. Cách dùng ma trận này trong release planning và access reviews.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần Authority Boundary Test Matrix và Waiver Model

Authority là một trong những vùng nhạy cảm nhất của Pack 03. Nếu boundaries quá lỏng, sản phẩm sẽ phá vỡ logic nghiệp vụ và risk governance; nếu boundaries quá chặt mà UX mơ hồ, user sẽ cảm thấy “hệ thống cản trở công việc” và tìm cách bypass ngoài hệ thống.

Trong thực tế, các vấn đề thường gặp:
- role nào đó thấy nút nhưng bấm thì lỗi, do authority threshold không được biểu đạt sớm;  
- restricted action không nói rõ vì sao bị chặn và phải làm gì tiếp;  
- escalation tồn tại nhưng không dễ tìm, dẫn đến việc người dùng bỏ cuộc hoặc dùng channel khác;  
- policy-blocked bị hiển thị giống hệt role-blocked;  
- cross-surface flows cho phép hành vi ở Mobile mà Web không cho (hoặc ngược lại) do drift;  
- khi cần ngoại lệ tạm thời (ví dụ case đặc biệt) thì team “nâng quyền” người dùng thay vì có waiver path.

Không có authority-boundary test matrix và waiver model, Pack 03 rất dễ đứng giữa hai lựa chọn xấu: hoặc “nới” quyền vô tội vạ cho tiện, hoặc “siết” quyền mà không test kỹ UX và flow, dẫn đến resistance và workarounds.

## 3. Authority-boundary thesis cho Pack 03

Authority-boundary thesis có thể phát biểu như sau:

> **Trong Pack 03, authority boundaries không chỉ là danh sách quyền trong admin console; đó là những đường ranh trải nghiệm xác định ai được thấy gì, làm gì, chịu trách nhiệm gì, cần escalate gì – và mọi boundary như vậy phải có test case, telemetry và cơ chế ngoại lệ có kiểm soát, nếu không hoặc là governance sẽ yếu, hoặc là UX sẽ bị bóp méo.**

Từ thesis này, mười nguyên lý được suy ra:

1. Mỗi boundary authority quan trọng phải có ít nhất một test case UX và một test case kỹ thuật.  
2. View-only, restricted, policy-blocked và escalate-available là **modes có chủ đích**, không phải side-effect.  
3. Cross-surface flows phải giữ boundary semantics nhất quán giữa Web và Mobile.  
4. Telemetry cho restricted and escalated moments là bắt buộc, không optional.  
5. Waiver là cơ chế controlled exception, không phải “nâng quyền tạm”.  
6. Các waiver phải được log, đo và expire, không tồn tại vĩnh viễn trong bóng tối.  
7. Pilot là cơ hội quan trọng để học về chỗ boundary cần điều chỉnh, nhưng không nên thay đổi boundary vội vã mà không thiết kế lại.  
8. Authority-boundary test matrix phải sống cùng role-permission matrix và change impact review.  
9. Mọi thay đổi quyền hoặc threshold phải trigger cập nhật matrix, QA, telemetry và dashboards.  
10. Khi nghi ngờ, ưu tiên transparency (giải thích rõ ràng) hơn là “giấu” logic bên trong.

## 4. Các loại boundary authority chính trong wedge Pack 03

Pack 03 nên nhận diện ít nhất các boundary families sau:

1. **Role-based access boundaries** – role không có capability kỹ thuật cho một action.  
2. **Authority-threshold boundaries** – role có capability, nhưng quyền chỉ cho trong một range hoặc scope nhất định (vd limit, region, tier).  
3. **State-based boundaries** – action chỉ hợp lệ ở một số state của item.  
4. **Policy-prerequisite boundaries** – action bị chặn nếu thiếu evidence, thiếu bước, thiếu điều kiện.  
5. **Cross-surface boundaries** – action chỉ cho phép trên Web hoặc chỉ trên Mobile, hoặc hành vi khác nhau theo surface.  
6. **Time/window boundaries** – hành động chỉ cho phép trong time window nhất định.  
7. **Override/waiver boundaries** – quyền override đặc biệt ngoài rule thông thường.

Mỗi boundary family sẽ có patterns test tương ứng.

## 5. Cấu trúc chuẩn của Authority Boundary Test Matrix

Mỗi hàng trong ma trận nên có ít nhất:

1. Boundary ID.  
2. Boundary family (role, authority threshold, state, policy, cross-surface, time, override).  
3. Flow family.  
4. Screen family / surface contexts.  
5. Action / capability.  
6. Roles in-scope (who is allowed, who is restricted).  
7. States in-scope (where action is allowed or restricted).  
8. Policy prerequisites.  
9. Expected experience mode (hidden, view-only, visible-disabled, visible-explained, actionable, escalate-available, review-only, policy-blocked).  
10. Expected copy / explanation family.  
11. Expected escalation or waiver path (if any).  
12. Observability events expected (restricted_action_encountered, escalation_initiated, policy_prerequisite_missing, override_attempt_blocked, v.v.).  
13. QA scenarios mapping.  
14. Metrics and dashboard references.  
15. Waiver model applicability (allowed? conditions?).  
16. Owners (Product, Security/Access, Design, QA).  
17. Notes / tenant-specific variations.

## 6. Rules cho test view-only, restricted, escalate, override và policy-blocked

## 6.1 View-only

Test cases phải xác nhận rằng:
- user có thể thấy context đủ để hiểu;  
- không có controls commit outcome;  
- copy gợi rõ vai trò quan sát / review;  
- telemetry phát review_only_mode_entered nếu relevant.

## 6.2 Restricted

Test cases phải cover:
- action không hiện (hidden) hoặc hiện disabled với explanation;  
- khi try-to-interact (nếu visible), message phân biệt rõ role vs authority vs policy;  
- restricted_action_encountered event được emit kèm boundary type.

## 6.3 Escalate-available

Test cases phải chứng minh:
- khi user không thể commit outcome, có path escalate rõ;  
- escalation flow chạy đúng người, đúng surface;  
- escalation_initiated và escalation_confirmed events được emit;  
- copy nói đúng semantics (“yêu cầu duyệt”, không phải “báo lỗi”).

## 6.4 Override

Nếu override tồn tại:
- test ai thấy option override;  
- test guardrails (confirmation, reason capture);  
- test override được log và observable;  
- test override_attempt_blocked khi criteria không đạt.

## 6.5 Policy-blocked

Test phân biệt rõ:
- blocked vì thiếu prerequisite (data, evidence, bước);  
- message gợi hành động sửa chữa, không nói “bạn không có quyền”;  
- policy_prerequisite_missing events được ghi;  
- metrics không coi đây là authority failure.

## 7. Cross-surface authority behavior

## 7.1 Consistency rules

- Nếu action bị chặn vì role ở Web, thì Mobile cũng không được “lách” trừ khi có lý do thiết kế đặc biệt.  
- Nếu Mobile cho phép local capture nhưng không cho commit, Web không được hiển thị như đã commit outcome.  
- Escalation paths cross-surface phải align với role-permission matrix.

## 7.2 Cross-surface test cases

QA nên có các test:
- role chỉ được approve trên Web, xem Mobile có option tương ứng không;  
- role chỉ được flag exception trên Mobile, xem Web có nhận đúng và không cho override trái policy;  
- state change trên Web có thể unlock hoặc lock action trên Mobile (nếu design quán triệt như vậy).

## 8. Telemetry và metrics cho authority boundaries

## 8.1 Required events

Cho mỗi boundary family, cần map tới event families tương ứng từ taxonomy:
- role-bound: restricted_action_encountered (role), restricted_action_explanation_shown.  
- authority-threshold: restricted_action_encountered (authority), escalation_initiated.  
- policy-bound: policy_prerequisite_missing, correction_prompt_shown, correction_completed.  
- override: override_attempted, override_confirmed, override_attempt_blocked.

## 8.2 Metrics

Một số metrics cần thiết:
- restricted-action rate theo role và flow.  
- escalation rate và resolution time.  
- policy-blocked rate và correction success rate.  
- override usage rate và override-blocked rate.  
- authority-friction index (kết hợp restricted, escalation, policy-blocked signals).

## 9. Waiver model

## 9.1 Khái niệm

Waiver là **ngoại lệ có kiểm soát** cho authority boundary: cho phép hành vi ngoài rule bình thường trong một phạm vi, thời gian hoặc điều kiện kiểm soát. Waiver khác với việc nâng quyền user vĩnh viễn.

## 9.2 Khi nào nên dùng waiver

- Khi có yêu cầu nghiệp vụ tạm thời mà policy chưa kịp cập nhật.  
- Khi pilot muốn thử relax boundary cho một cohort nhỏ.  
- Khi cần xử lý backlog hoặc sự cố đặc biệt.  
- Khi muốn test hypothesis về impact của việc nới boundary.

## 9.3 Dạng waiver

- Waiver by user (cho user cụ thể trong thời gian giới hạn).  
- Waiver by role in tenant (cho role trong tenant cụ thể).  
- Waiver by flow/state (cho phép hành động ở một state cụ thể).  
- Waiver by object (cho một case/task đặc biệt).

## 9.4 Governance cho waiver

- Mọi waiver phải có owner, scope, start/end date, lý do và expected impact.  
- Waiver phải được log với event riêng (waiver_applied, waiver_expired).  
- Dashboards pilot phải có ability filter theo waived vs non-waived để đọc impact.  
- Không để waiver sống vô hạn – phải có expiry hoặc review cadence.

## 10. QA coverage và regression cho authority và waiver

## 10.1 QA coverage

QA scenarios nên cover:
- boundary behavior bình thường;  
- behavior khi có waiver active;  
- behavior sau khi waiver hết hiệu lực.

## 10.2 Regression

Khi thay đổi authority rules hoặc waiver logic, phải rerun:
- authority boundary tests trong flows bị chạm;  
- metrics và event checks;  
- pilot dashboards filters nếu relevant.

## 11. Anti-pattern authority-boundary và waiver nghiêm trọng phải tránh

1. Nâng quyền user (tăng role) thay vì thiết kế waiver – dẫn đến quyền bị “phình” mãi.  
2. Dùng cùng message cho mọi loại block – role, authority, policy, state.  
3. Giữ waiver vô thời hạn, quên expire hoặc review.  
4. Không log waiver, không đo impact, không biết mình đã nới ở đâu.  
5. Mobile cho phép hành vi mà Web không cho, do thiếu test cross-surface.  
6. Test authority chỉ ở happy path (allowed), không test restricted/escalation/policy-blocked.  
7. Không có ai chịu trách nhiệm tổng thể cho authority UX và waiver governance.

## 12. Cách dùng ma trận và waiver model trong release planning và access reviews

- Trong release planning, dùng matrix để xem change mới chạm boundary nào, cần thêm test hoặc events nào.  
- Trong access reviews, dùng matrix và waiver logs để xem quyền thực tế có align với design không.  
- Sau pilot, dùng authority metrics và waiver usage để quyết định tighten/relax boundaries.

## 13. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – index và runbook cho toàn bộ scenario library, bao gồm authority-boundary scenarios.  
2. **59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS.md** – playbook cho người dùng hiện trường, giải thích quyền, boundaries và waivers.  
3. **60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE.md** – template tổng hợp học từ pilot, trong đó có authority và waiver decisions.  
4. **61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS.md** – hướng dẫn xử lý ticket liên quan tới authority và boundary issues.

## 14. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Authority Boundary Test Matrix and Waiver Model của Pack 03:

1. Authority boundaries là phần cốt lõi của trải nghiệm và governance, không chỉ là cấu hình backend.  
2. Mọi boundary quan trọng phải có hàng trong test matrix với flows, roles, states, experience modes, copy, telemetry và QA mapping rõ.  
3. View-only, restricted, policy-blocked, escalate-available và override đều phải được test như modes có chủ đích.  
4. Cross-surface authority behavior phải được test và observability-hóa, không để drift.  
5. Waivers là cơ chế ngoại lệ có kiểm soát, phải được log, đo và expire.  
6. Authority metrics và waiver usage phải feed vào pilot triage, release planning và access reviews.  
7. Tài liệu này là baseline để Pack 03 mở rộng role model và authority rules mà vẫn giữ được clarity, trust và governance integrity.

## 15. Điều kiện hoàn thành của tài liệu

Authority Boundary Test Matrix and Waiver Model được xem là đạt yêu cầu khi:
- mọi authority boundary quan trọng đều có test cases UX và kỹ thuật;  
- cross-surface flows nhạy cảm với authority đã có scenarios riêng;  
- telemetry và dashboards cho phép đọc authority friction và waiver usage;  
- và team có mô hình rõ ràng để thêm/sửa boundaries và waivers mà không phải “đập đi làm lại” mỗi lần.

## AG Execution Prompt

You are acting as a senior authority-governance architect, access-control strategist, and UX-embedded risk manager.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: authority UX rules, role-permission matrix, metrics framework, event taxonomy, pilot triage model, dashboards, and cross-surface observability are already defined.
- This document defines the authority boundary test matrix and waiver model for Pack 03.

### Objective
Refine this Authority Boundary Test Matrix and Waiver Model into a production-grade framework that can guide boundary definition, testing, observability, waiver design, and pilot-based learning for authority in Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between role-based, authority-threshold, state-based, policy, cross-surface, time-based, and override boundaries.
- Keep the output concrete enough for Product, Security, Design, QA, Analytics, and Pilot Delivery to implement and use.

### Tasks
1. Rewrite the authority-boundary thesis into a sharper executive form.
2. Produce a detailed authority boundary test matrix structure and examples.  
3. Add rules for testing view-only, restricted, escalate-available, override, and policy-blocked modes, including cross-surface cases.  
4. Define telemetry, metrics, and dashboard expectations for authority boundaries and waivers.  
5. Specify waiver types, governance, and impact measurement.  
6. Identify the top five authority-boundary and waiver failures that Pack 03 must avoid.  
7. Recommend the next documents that should operationalize this baseline into scenario libraries, field playbooks, post-pilot synthesis, and support runbooks.

### Constraints
- Do not collapse all boundaries into a single “no access” concept.  
- Do not rely on ad-hoc permission tweaks instead of waivers.  
- Do not ignore authority telemetry when reading pilot signals.  
- Keep the output concrete enough to shape real QA plans, dashboards, and access reviews.

### Output Format
Return a revised markdown document with these sections:
1. Executive Authority-Boundary Thesis
2. Boundary Types and Test Matrix
3. Testing Rules and Examples
4. Telemetry, Metrics, and Dashboards
5. Waiver Model and Governance
6. Failure Risks
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make authority boundaries and waivers testable, observable, and governable.  
- The result must remain consistent with Nextflow OS as an SME Business OS.  
- The document must help teams design, test, and refine authority rules and waivers using pilots and metrics.  
- The output must reduce ambiguity around where and how authority boundaries should be enforced or relaxed.
