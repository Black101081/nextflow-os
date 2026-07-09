# Nextflow OS – Pack 03 Release Change Impact Review Template

**Document ID:** 52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Design / QA Systems / Product Analytics  
**Dependent Packs:** Frontend Delivery, Backend Workflow, Identity & Access, Analytics & Data, QA & Support, Pilot Delivery, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE

## 1. Mục tiêu tài liệu

Tài liệu này xác định **template chính thức cho mọi buổi review impact thay đổi liên quan tới Pack 03** trước khi code được ship vào pilot hoặc production. Nếu các tài liệu trước đã lần lượt khóa strategy, flows, state grammar, component rules, authority rules, continuity semantics, copy system, QA scenarios, metrics framework, traceability matrix, pilot triage model, observability taxonomy, role-permission mapping và demo environment setup, thì tài liệu này là lớp vận hành ngay trước release:

> **Khi một thay đổi UX hoặc product được đề xuất – dù là sửa lỗi, tinh chỉnh interaction, đổi copy, đổi authority, đổi continuity behavior, thêm event, đổi component hay thêm flow – team phải hỏi những câu hỏi gì, rà qua những lớp nào, kéo những owner nào, và đi đến quyết định ship/không ship kèm guardrails như thế nào để Pack 03 không drift?**

Không có release change impact review template, team rất dễ rơi vào hai cực đoan:
- coi mọi change là nhỏ, xử lý ad-hoc theo từng squad và chỉ test cục bộ;  
- hoặc coi mọi change là “rất lớn”, buộc phải đi qua governance nặng nề nên dần dần template bị bỏ qua.

Tài liệu này tồn tại để tạo **một khung nhẹ nhưng có kỷ luật** cho mọi thay đổi đáng kể trong Pack 03, để:
- Product, Design, QA, Engineering, Analytics và Pilot Delivery **nhìn cùng một bản đồ impact**;  
- decision ship/hold/widen-scope có **logics và traceability**;  
- và Pack 03 có thể tiến hóa mà không đánh mất grammar nền đã xây.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của change impact review trong Pack 03.  
2. Release-impact thesis của tài liệu.  
3. Các loại change phải đi qua review template.  
4. Cấu trúc chuẩn của một change-impact review record.  
5. Khung câu hỏi về impact theo flows, screens, components và personas.  
6. Khung câu hỏi về impact theo states, copy, authority, continuity và terminology.  
7. Khung câu hỏi về impact theo QA, metrics, observability và pilot triage.  
8. Khung câu hỏi về impact theo role-permission mapping và demo environments.  
9. Rules cho classification change: local tweak, pattern change, semantic-system change, permission change hoặc observability change.  
10. Rules cho decision outcomes: ship as is, ship with guardrails, gate behind feature flag, defer, hoặc escalate governance.  
11. Rules cho ownership, review cadence và sign-off.  
12. Những anti-pattern release-impact review nghiêm trọng phải tránh.  
13. Cách dùng template này trong pilot hardening, release planning và post-release learning.

## 2. Vì sao Pack 03 cần release change impact review template

Pack 03 đã tích tụ một lượng lớn grammar: flow structures, state semantics, continuity semantics, authority semantics, copy system, role-permission mapping, QA scenarios, metrics signals, event taxonomy, traceability matrix và demo/pilot scenarios. Ở giai đoạn này, risk chính không còn là “thiếu tính năng” mà là **drift âm thầm**:

- Một component thay behavior “nhẹ” nhưng lại xuất hiện trên nhiều screen families.  
- Một copy change nhỏ làm lệch một state term quan trọng.  
- Một chỉnh sửa authority local làm hỏng review-only semantics ở nơi khác.  
- Một thay đổi continuity code path làm event taxonomy mất meaning.  
- Một tweak demo environment làm sale script và QA scenario lệch nhau.

Nếu mọi change được xử lý như bug nhỏ hoặc “chỉnh UI” mà không qua impact review, Pack 03 sẽ dần mất coherence dù từng PR riêng lẻ đều nhìn hợp lý. Template này giúp team **kéo các lớp đã xây vào mỗi decision** mà không phải đọc lại toàn bộ doc pack mỗi lần.

## 3. Release-impact thesis cho Pack 03

Release-impact thesis có thể phát biểu như sau:

> **Trong Pack 03, không có thay đổi UX nào thực sự “nhỏ” nếu nó chạm flow, state, authority, continuity, copy hoặc role semantics; mọi thay đổi như vậy phải được đọc qua lăng kính traceability, QA, metrics, observability, pilot triage và demo environment, để đảm bảo Pack 03 tiến hóa mà không vỡ grammar nền.**

Từ thesis này, mười nguyên lý được suy ra:

1. Impact review phải ưu tiên **semantic stability over local convenience**.  
2. Một change “ở một màn hình” hiếm khi chỉ thuộc một màn hình nếu component hoặc state được tái dùng.  
3. Đổi copy, đổi state label hoặc đổi authority message là đổi semantics, không phải chỉ đổi chữ.  
4. Thêm event hoặc đổi thời điểm bắn event là đổi meaning của metrics, không chỉ thêm telemetry.  
5. Thêm exception path, recovery path hoặc import-fix logic là đổi flow grammar.  
6. Thêm role, đổi permission hoặc đổi authority threshold là đổi responsibility model.  
7. Demo environment và QA kits phải theo kịp nếu không release sẽ gây lệch story.  
8. Impact review không nên là barrier nặng nề mà là “structured thinking aid”.  
9. Một change không có ai chịu trách nhiệm đánh giá impact là một risk governance thực sự.  
10. Khi không chắc về impact, cứ giả định rằng change có lan tỏa rộng hơn cảm nhận ban đầu và kiểm tra bằng traceability.

## 4. Các loại change phải đi qua template

Không phải mọi change đều cần full ceremony. Tuy nhiên Pack 03 nên yêu cầu mọi change thuộc các loại sau đi qua template này (ở mức độ phù hợp):

1. **Flow change** – thêm, bỏ, reorder hoặc hợp nhất bước trong launch-critical flows.  
2. **Screen-level layout / hierarchy change** – thay đổi vùng chính, density lớn hoặc control clusters trong screen families core.  
3. **Component behavior change** – đặc biệt là Mobile Ops components và Web Admin decision patterns.  
4. **State / status semantics change** – thêm state, đổi tên state, đổi rule chuyển state hoặc đổi cách hiển thị state.  
5. **Authority / permission / role model change** – thêm role, đổi capability, đổi authority threshold hoặc thêm branch authority mới.  
6. **Continuity / offline / sync behavior change** – đổi cách local capture, queue semantics, retry, upload handling hoặc reconciliation.  
7. **Copy / terminology change** cho state terms, action verbs, authority phrases, continuity phrases, validation/recovery messages.  
8. **Event taxonomy / metrics / observability change** – thêm/sửa event, đổi semantics event hoặc đổi mapping giữa events và metrics.  
9. **Demo / QA / pilot scenario kit change** – đổi data kits, scenario kits hoặc environment fact sheets cho flows quan trọng.  
10. **Cross-surface handoff change** – đổi cách item chuyển giữa Web Admin và Mobile Ops.

Những change thật sự local như bug fix hiển nhiên, alignment pixel nhỏ, hoặc text typo trong non-semantic copy có thể được filter nhẹ hơn, nhưng nên có một bước check tối thiểu.

## 5. Cấu trúc chuẩn của change impact review record

Mỗi change đáng kể nên có một record chuẩn, dù được lưu ở tool nào (ticket, doc, form). Các trường tối thiểu:

1. Change ID / ticket link.  
2. Title và short description.  
3. Change type(s) (từ danh sách ở trên).  
4. Surfaces involved (Web Admin, Mobile Ops, both).  
5. Personas / roles primarily affected.  
6. Flow(s) and sub-flow(s) affected.  
7. Screen families and key screens affected.  
8. Component families affected.  
9. State / status semantics touched.  
10. Authority / permission semantics touched.  
11. Continuity / offline / sync semantics touched.  
12. Copy / terminology families touched.  
13. Event / metrics / observability aspects touched.  
14. Demo / QA / pilot scenarios and environment kits touched.  
15. Traceability IDs or references.  
16. Scope classification: local tweak, pattern change, semantic-system change, permission change, observability change hoặc multi-class.  
17. Proposed mitigations and guardrails.  
18. QA and regression implications.  
19. Metrics and signal implications.  
20. Pilot and demo implications.  
21. Owners for Product, Design, QA, Engineering, Analytics, Pilot Delivery.  
22. Decision outcome: ship as is, ship with guardrails, gate, defer, or escalate.  
23. Sign-offs and date.

## 6. Khung câu hỏi impact theo flows, screens, components và personas

Template nên dẫn dắt team qua vài nhóm câu hỏi chính.

## 6.1 Flow-level questions

1. Change này chạm launch-critical flow nào?  
2. Nó đổi số bước, thứ tự bước, branching hay chỉ đổi behavior trong một bước?  
3. Nó tạo thêm path mới hay chỉ chỉnh path cũ?  
4. Có flow nào khác reuse patterns này không?  
5. QA scenario nào gắn với flow này cần update hoặc rerun?

## 6.2 Screen-level questions

1. Screen families nào bị ảnh hưởng?  
2. Có thay đổi layout/hierarchy hay chỉ component khu trú?  
3. Density hoặc information hierarchy có thay đổi không?  
4. Entry/exit context của screen này còn giống narrative cũ không?  
5. Demo scripts nào dùng screen này như heart of story?

## 6.3 Component-level questions

1. Component nào đổi behavior hoặc appearance?  
2. Component đó có được tái sử dụng ở nhiều nơi không?  
3. State, authority hoặc continuity semantics nào embed vào component này?  
4. Có component sibling nào cần nhìn lại để giữ consistency?  
5. Có QA scenario nào test component family này trực tiếp không?

## 6.4 Persona-level questions

1. Personas nào sẽ cảm nhận change này rõ nhất?  
2. Role responsibility model có thay đổi không?  
3. Có rủi ro role mất clarity về việc ai làm gì, khi nào không?  
4. Onboarding, training hoặc demo cho personas này cần update gì?

## 7. Khung câu hỏi impact theo states, copy, authority, continuity và terminology

## 7.1 State / status impact

1. Change có tạo state mới hoặc bỏ state cũ không?  
2. Transition rules có đổi không?  
3. State này có xuất hiện ở summary, queue hoặc notifications không?  
4. Terminology register có term tương ứng không, hay cần thêm/sửa?  
5. Metrics đang tính theo state này cần cập nhật không?

## 7.2 Copy / terminology impact

1. Change có chạm state terms, action verbs, authority phrases hoặc continuity phrases không?  
2. Preferred term có bị thay không?  
3. Có avoided variants nào vô tình được đưa vào không?  
4. Message family nào (validation, warning, recovery, confirmation) đang bị chạm?  
5. Demo scripts, training materials hoặc support docs cần update để tránh drift không?

## 7.3 Authority / permission impact

1. Change có đổi role-permission matrix hoặc experience mode nào (hidden, view-only, visible-disabled, visible-explained, actionable, escalate-available, review-only, policy-blocked) không?  
2. Có thêm hoặc bớt escalation paths không?  
3. Policy blockers có tách biệt rõ khỏi role restrictions vẫn không?  
4. Authority explanations có còn đúng technical/policy truth không?  
5. QA authority-boundary scenarios cần update không?

## 7.4 Continuity / offline / sync impact

1. Change có dính tới local capture, queue semantics, retry, upload, draft hoặc reconciliation không?  
2. Có đổi meaning của saved on device, waiting to sync, upload in progress, retry needed hoặc server confirmed không?  
3. Event milestones cho continuity có cần đổi không?  
4. Mobile Ops continuity scenarios trong QA và demo environment cần update không?  
5. Risk lớn nhất nếu continuity semantics drift là gì và có guardrail nào?

## 8. Khung câu hỏi impact theo QA, metrics, observability và pilot triage

## 8.1 QA impact

1. QA scenarios nào phải được rerun?  
2. Có cần tạo scenario mới để cover change này không?  
3. Có scenario nào trở nên obsolete hoặc sai meaning không?  
4. Regression scope phù hợp là gì (local, pattern, flow, semantic-system)?  
5. Pre-release UX QA checklist có mục nào liên quan trực tiếp tới change này không?

## 8.2 Metrics & observability impact

1. Change có thay cách đếm một metric hiện có không?  
2. Event nào cần thêm, bớt hoặc đổi semantics?  
3. Có biến metrics nào cần được annotate lại để tránh misinterpretation không?  
4. Dashboards dùng cho pilot review có cần update không?  
5. Có observability gaps nào được phát hiện khi review change này không?

## 8.3 Pilot triage & feedback impact

1. Change có xuất phát từ cluster feedback pilot nào không?  
2. Nếu có, pilot triage record đã được link chưa?  
3. Change có ảnh hưởng cách đọc feedback cũ không (ví dụ signals cũ phải reinterpret)?  
4. Có pilot scenarios hoặc site nào cần chú ý đặc biệt sau khi change ship không?  
5. Team sẽ đo thành công của change này qua tín hiệu nào sau pilot?

## 9. Khung câu hỏi impact theo role-permission mapping và demo environments

## 9.1 Role-permission impact

1. Change có đổi capability, authority threshold hoặc experience mode cho role nào không?  
2. Có tạo new role hoặc merge role không?  
3. Có rủi ro role hiện tại mất ability quan trọng ngoài ý muốn không?  
4. Access reviews có cần update theo mapping mới không?

## 9.2 Demo & training environment impact

1. Scenario kits nào trong demo/training environment đang rely on behavior cũ?  
2. Có object kits nào cần sửa state, owner hoặc attributes không?  
3. Demo scripts có thể dùng lại như cũ hay cần update sequencing hoặc phrasing?  
4. Training content và onboarding flows có cần điều chỉnh không?  
5. Reset scripts hoặc environment reseed logic có ảnh hưởng không?

## 10. Classification rules cho loại change

Sau khi trả lời các khối câu hỏi, team nên classify change theo các bucket chuẩn để biết mức governance cần thiết.

## 10.1 Local tweak

Change chỉ chạm một screen, không đổi semantics, không chạm component tái dùng, không chạm states, authority, continuity, copy families hoặc metrics. Những change này có thể đi qua review nhẹ nhưng vẫn nên được log.

## 10.2 Pattern change

Change chạm component behaviors, templates hoặc interactions được tái dùng nhiều nơi. Cần review traceability matrix để biết impact breadth.

## 10.3 Semantic-system change

Change chạm flow grammar, state semantics, authority semantics, continuity semantics hoặc terminology register. Cần governance review sâu hơn và update docs baseline.

## 10.4 Permission / authority change

Change chạm role-permission matrix, authority thresholds hoặc experience modes restricted vs actionable. Cần cross-functional review với Security / Access Governance.

## 10.5 Observability / metrics change

Change chạm event taxonomy, signal semantics hoặc metric definitions. Cần review với Analytics / Data để tránh phá longitudinal comparisons.

## 11. Decision outcomes và guardrails

Template nên định nghĩa các outcomes chuẩn để decisions không rơi vào “mập mờ đã chấp nhận”.

## 11.1 Ship as-is

Áp dụng khi impact đã được review, risk thấp và QA/metrics/demo impacts nhỏ hoặc đã được xử lý.

## 11.2 Ship with guardrails

Áp dụng khi change có tiềm năng tốt nhưng vẫn có risk chưa kiểm chứng. Guardrails có thể gồm:
- feature flag;  
- limited rollout (pilot-only, tenant subset);  
- additional metrics and dashboards;  
- stricter QA exit criteria.

## 11.3 Gate behind feature flag

Áp dụng khi change chưa sẵn sàng cho tất cả, nhưng cần vào codebase. Flag logic phải có owner, plan bật/tắt và observability phù hợp.

## 11.4 Defer / reject

Áp dụng khi change không đủ lợi ích so với risk hoặc không align với Pack 03 strategy. Template nên yêu cầu ghi rõ lý do và liên kết tới triage/pilot feedback nếu liên quan.

## 11.5 Escalate governance

Áp dụng khi change chạm grammar nền hoặc cross-pack dependencies. Cần đưa ra forum cao hơn (product council, design council, access governance board, v.v.).

## 12. Ownership, review cadence và sign-off

## 12.1 Ownership

- Product Management chịu trách nhiệm cuối cùng về decision ship/hold và impact trên flows, personas, roadmap.  
- Product Design chịu trách nhiệm về impact trên UX grammar, screens, states, copy system.  
- QA chịu trách nhiệm về regression scope và coverage.  
- Engineering chịu trách nhiệm về feasibility và implementation risk.  
- Analytics chịu trách nhiệm về metrics, events và signal semantics.  
- Pilot Delivery / Customer Success chịu trách nhiệm về pilot implications và client-facing risk.

## 12.2 Review cadence

- Minor change batches có thể review theo sprint (ví dụ sprint-end impact review).  
- Major semantic-system hoặc permission changes nên review riêng, có agenda chuẩn và documentation đầy đủ.  
- Trước pilot hoặc major release, nên có release-wide impact review nhìn cả cluster changes.

## 12.3 Sign-off

Template nên yêu cầu sign-off explicit ít nhất từ Product, Design và QA cho các change có semantic weight. Với authority hoặc observability changes, cần thêm sign-off từ Access Governance và Analytics tương ứng.

## 13. Anti-pattern release-impact review nghiêm trọng phải tránh

## 13.1 “Small change” myth

Giả định rằng mọi chỉnh sửa một màn hình hoặc một copy block đều nhỏ, không cần review, dẫn tới drift tích lũy.

## 13.2 Doc-only governance

Review impact bằng cách sửa doc mà không mapping tới code, QA, metrics, demo environment hoặc pilot triage.

## 13.3 Metrics-blind changes

Đổi behavior hoặc semantics nhưng không đổi cách đo, dẫn tới metrics trông “cải thiện” hoặc “xấu đi” vì meaning khác, không phải vì outcome khác.

## 13.4 Permission-blind UX tweaks

Thay đổi UX cho đẹp hoặc tiện mà quên rằng roles khác nhau có capabilities khác nhau, làm vỡ authority UX hoặc trách nhiệm.

## 13.5 Observability-afterthought

Thêm hoặc sửa flows/behaviors mà không nghĩ tới events, properties và dashboards tới tận sau release.

## 13.6 No pilot linkage

Sửa theo feedback pilot mà không link lại pilot triage model, khiến học từ pilot không trở thành tri thức lâu dài.

## 13.7 No closure discipline

Không ghi lại decision outcome, không update docs baseline, không update QA scenarios hoặc demo kits tương ứng.

## 14. Cách dùng template này trong pilot hardening và release planning

## 14.1 Pilot hardening

Template giúp xem mỗi change đề xuất sau pilot là patch local, pattern fix, baseline update, metrics update hay enablement update. Điều này nối trực tiếp với tài liệu pilot triage.

## 14.2 Release planning

Impact review records có thể được dùng như input cho release scope decisions: change nào đủ safe, change nào cần guardrail, change nào nên đưa sang release sau.

## 14.3 Post-release learning

Sau release, team có thể đối chiếu impact reviews với real signals và feedback để xem decision lúc đó là đúng hay sai, từ đó cải thiện governance.

## 15. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS.md** – đào sâu reconciliation cho delayed confirms, conflicts, retry exhaustion và stale returns.  
2. **54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST.md** – checklist để review regressions về semantics và copy trước release.  
3. **55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS.md** – requirements cho dashboards phục vụ pilot signal review dựa trên metrics framework và event taxonomy.  
4. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics cho handoffs giữa Web Admin và Mobile Ops.  
5. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – ma trận test cho authority boundaries, policy exceptions và waivers.  
6. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – index và runbook vận hành cho toàn bộ scenario library và môi trường.

## 16. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho release change impact review của Pack 03:

1. Pack 03 cần một **release change impact review template chính thức**, không chỉ dựa vào cảm giác của từng squad.  
2. Mọi change chạm flows, states, authority, continuity, terminology, metrics, observability hoặc demo/QA environments đều phải được đọc qua nhiều lăng kính, không chỉ một.  
3. Change-impact records phải nối được tới traceability matrix, role-permission matrix, event taxonomy, QA scenarios, demo environment setup và pilot triage model.  
4. Classification local tweak / pattern change / semantic-system change / permission change / observability change là bắt buộc để biết governance depth nào phù hợp.  
5. Decision outcomes phải rõ ràng: ship, ship with guardrails, gate, defer hoặc escalate, chứ không để “implicitly accepted”.  
6. Ownership và sign-off phải cross-functional cho các change có semantic weight.  
7. Tài liệu này là baseline để Pack 03 có thể tiến hóa với tốc độ thực tế mà không đánh mất coherence sản phẩm.

## 17. Điều kiện hoàn thành của tài liệu

Pack 03 Release Change Impact Review Template được xem là đạt yêu cầu khi:
- mọi change semantic-significant có một record impact review dễ tìm, dễ đọc;  
- các nhóm Product, Design, QA, Engineering, Analytics và Pilot Delivery có chung view về impact, risk và decision;  
- docs baseline, QA scenarios, metrics, observability, demo kits và pilot triage đều được cập nhật nhất quán sau các change quan trọng;  
- và Pack 03 có thể triển khai các đợt release/pilot tiếp theo mà không phải “đoán” mình đã làm vỡ điều gì trong grammar nền.

## AG Execution Prompt

You are acting as a senior UX governance lead, release-impact architect, and cross-functional decision facilitator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: flows, state grammar, authority rules, continuity semantics, copy system, QA scenarios, metrics framework, traceability matrix, observability taxonomy, role-permission mapping, pilot triage model, and demo environment setup are already defined.
- This document defines the official change impact review template for Pack 03 releases.

### Objective
Refine this Release Change Impact Review Template into a production-grade tool that can guide impact assessment, decision-making, guardrail definition, documentation updates, QA planning, metrics updates, and pilot learning loops across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between local tweaks, pattern changes, semantic-system changes, permission changes, and observability changes.
- Keep the output concrete enough for real release planning, sprint reviews, and pilot hardening use.

### Tasks
1. Rewrite the release-impact thesis into a sharper executive form.
2. Produce a structured review template covering flows, screens, components, personas, states, copy, authority, continuity, QA, metrics, observability, role-permission, and demo environments.
3. Add practical classification rules and decision outcomes with guardrails.
4. Define ownership, review cadence, and sign-off expectations.
5. Identify the top five impact-review failures that would let Pack 03 drift despite having strong baselines.
6. Recommend the next documents that should operationalize this baseline into reconciliation patterns, copy QA checklists, pilot-signal dashboards, handoff diagnostics, and authority-boundary test matrices.
7. Add governance rules to prevent "small change" myths, doc-only governance, metrics-blind changes, permission-blind tweaks, observability-afterthought, and no-closure behavior.

### Constraints
- Do not treat semantic-significant changes as trivial.  
- Do not overload teams with unnecessary ceremony for truly local visual tweaks.  
- Do not ignore cross-document and cross-layer implications of changes.  
- Do not let impact review become a box-ticking exercise without real thinking.  
- Keep the output concrete enough for squads and governance forums to use in practice.

### Output Format
Return a revised markdown document with these sections:
1. Executive Release-Impact Thesis
2. Change-Impact Review Framework
3. Classification and Decision Rules
4. Ownership and Cadence
5. Impact-Review Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 change-impact review explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams assess, discuss, and decide on changes with a shared understanding of impact and risk.
- The output must reduce ambiguity around when and how to run impact reviews, who is involved, and what must be updated after decisions.
