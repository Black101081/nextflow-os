# Nextflow OS – Role Permission Matrix and Experience Mapping

**Document ID:** 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Security & Access Governance / Product Design  
**Dependent Packs:** Identity & Access, Frontend Delivery, Backend Workflow, QA & Support, Analytics & Data, Program Delivery  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY

## 1. Mục tiêu tài liệu

Tài liệu này xác định **ma trận role-permission và lớp experience mapping chính thức** cho Pack 03 của Nextflow OS. Nếu tài liệu 43 đã khóa authority UX rules ở level nguyên tắc, tài liệu 45 đã khóa traceability, tài liệu 47 đã khóa terminology register, và tài liệu 49 đã khóa observability event taxonomy, thì tài liệu này xử lý phần giao nhau cụ thể nhất giữa **mô hình quyền kỹ thuật** và **hành vi trải nghiệm thực tế**:

> **Mỗi role trong Nextflow OS được xem gì, làm gì, không làm gì, chỉ-review được gì, escalate được gì, bị chặn theo kiểu nào, thấy copy gì, có next-best action nào, và những khác biệt đó phải biểu hiện ra sao ở level screen, state, component, QA coverage, telemetry và pilot governance?**

Nói cách khác, đây là tài liệu biến “permission model” từ một danh sách backend capabilities thành **một bản đồ trải nghiệm có nghĩa**. Nếu chỉ có role-permission matrix kỹ thuật mà không có experience mapping, team rất dễ rơi vào những vấn đề sau:
- backend chặn đúng nhưng frontend biểu đạt sai;  
- cùng một permission boundary nhưng mỗi screen hiển thị một kiểu;  
- role A và role B thấy cùng màn nhưng không rõ ai có trách nhiệm thật;  
- review-only mode bị làm nửa vời, vừa không cho làm vừa không cho hiểu;  
- escalation paths tồn tại ở policy level nhưng không hiện ra như next step usable;  
- QA test technical allow/deny nhưng không test authority meaning;  
- analytics đo restricted events nhưng không map được về role expectations.

Tài liệu này vì vậy là lớp **translation contract** giữa access control, authority semantics và product experience. Nó giúp Product, Design, Frontend, Backend, QA, Security và Analytics không nói lệch nhau về cùng một boundary.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của role-permission experience mapping trong Pack 03.  
2. Thesis của tài liệu.  
3. Các lớp role, permission, authority và experience phải được nối với nhau.  
4. Cấu trúc chuẩn của role-permission matrix có nghĩa ở level UX.  
5. Rules cho capability types và permission granularity.  
6. Rules cho view, act, review-only, escalate, reassign, override và policy-blocked moments.  
7. Rules cho screen-level expectations theo role.  
8. Rules cho copy, messaging, state visibility và accountability cues theo role/permission context.  
9. Rules cho QA coverage, telemetry mapping và traceability linkage.  
10. Rules cho ownership, governance, versioning và rollout control.  
11. Những anti-pattern role-permission UX nghiêm trọng phải tránh.  
12. Cách dùng ma trận này trong pilot hardening, release planning và access reviews.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần role-permission matrix gắn với experience

Trong nhiều hệ thống, role-permission matrix thường tồn tại như bảng access control nội bộ: role nào có can_view, can_edit, can_approve, can_delete. Điều đó cần nhưng chưa đủ cho Pack 03. Với Nextflow OS, một capability kỹ thuật chỉ có ý nghĩa khi team còn biết:
- capability đó xuất hiện trong flow nào;  
- nếu không có capability thì UI nên ẩn, khóa hay chuyển sang review-only;  
- người dùng còn trách nhiệm gì nếu không thể commit;  
- escalation có phải next-best action hay không;  
- copy phải giải thích ra sao;  
- QA nên test case nào;  
- telemetry nên phát event gì khi boundary xảy ra.

Nếu không có lớp experience mapping, permission model sẽ gây cảm giác tùy tiện. Cùng một hành động “approve” có thể có ba trường hợp khác nhau:
- role không có quyền thấy nút đó;  
- role thấy nút nhưng thiếu authority threshold;  
- role có authority nhưng item đang thiếu policy prerequisite.  

Ba trường hợp này có thể đều kết thúc bằng “không approve được”, nhưng trải nghiệm phải rất khác nhau. Tài liệu này tồn tại để khóa sự khác nhau đó thành hệ thống có thể maintain.

## 3. Thesis cho role-permission experience mapping

Thesis của tài liệu này có thể phát biểu như sau:

> **Một permission model chỉ thực sự hoàn chỉnh khi mỗi capability kỹ thuật được dịch ra thành kỳ vọng trải nghiệm rõ ràng cho từng role, từng screen và từng flow; nếu hệ thống biết ai được làm gì nhưng không biết người đó nên thấy gì, hiểu gì và làm gì tiếp khi bị chặn, authority UX vẫn chưa được giải xong.**

Từ thesis này, mười nguyên lý được suy ra:

1. Mapping phải ưu tiên **responsibility clarity over raw access tables**.  
2. Role semantics và permission semantics không nên bị trộn làm một nếu authority khác capability.  
3. Một capability kỹ thuật có thể dẫn tới nhiều experience modes khác nhau tùy context.  
4. Review-only là một mode có chủ đích, không phải fallback nghèo nàn.  
5. Escalation và next-owner visibility là một phần của permission UX, không phải feature phụ.  
6. Policy blockers phải được tách khỏi role-based restriction.  
7. Screen expectations theo role phải đủ rõ để frontend không tự phát minh behavior.  
8. QA, telemetry và triage đều phải map được từ role-permission matrix này.  
9. Ma trận phải sống cùng release changes; stale permission mapping là risk governance thật.  
10. Một mapping tốt phải giúp security governance mạnh hơn mà trải nghiệm vẫn rõ hơn.

## 4. Các lớp thực thể phải được nối với nhau

Ma trận này không nên chỉ nối role với capability. Ít nhất Pack 03 cần nối tám lớp sau:

1. **Role / role group**  
2. **Permission or capability**  
3. **Authority level or threshold context**  
4. **Policy prerequisite context**  
5. **Surface / screen family**  
6. **Experience mode**  
7. **Message / action expectation**  
8. **QA / telemetry / traceability coverage**

Nhờ đó team có thể trả lời những câu như:
- role này ở screen này đang ở mode nào;  
- nếu không được làm action chính thì có review-only hay escalation path không;  
- next-best action là gì;  
- copy explanation nào phải hiện;  
- event nào nên được phát;  
- QA case nào bắt buộc phải có.

## 5. Phân biệt role, permission, authority và policy

## 5.1 Role

Role là nhãn tổ chức hoặc nhãn chức năng nền để gom nhóm hành vi kỳ vọng, ví dụ owner, manager, coordinator, frontline hoặc admin support. Role giúp dự đoán bối cảnh trách nhiệm nhưng không tự động mô tả toàn bộ khả năng kỹ thuật.

## 5.2 Permission / capability

Permission là khả năng kỹ thuật hoặc logic mà hệ thống cho phép, ví dụ view queue, open detail, edit fields, approve request, reassign item, override outcome hoặc upload evidence.

## 5.3 Authority

Authority là ngưỡng thẩm quyền nghiệp vụ để tạo ra một outcome nhất định. Một user có thể technically vào screen nhưng chưa chắc có authority để commit quyết định ở mọi case.

## 5.4 Policy prerequisite

Policy prerequisite là điều kiện nghiệp vụ hoặc state condition cần thỏa trước khi action hợp lệ, bất kể role và authority có phù hợp hay không. Ví dụ thiếu evidence, thiếu thông tin, wrong state hoặc chưa xong bước trước.

## 5.5 Hệ quả cho UX

Bốn lớp này có thể cùng ảnh hưởng tới một action, nhưng experience modes của chúng phải được phân biệt. Nếu không, UI sẽ diễn đạt sai trách nhiệm và user sẽ không biết vì sao mình bị chặn.

## 6. Capability types và granularity rules

Pack 03 nên phân loại capability theo ít nhất sáu nhóm lớn để matrix không bị phẳng:

1. **View capabilities** – xem landing, queue, item detail, history, evidence, audit trail.  
2. **Input capabilities** – edit fields, add note, attach evidence, correct data, provide reason.  
3. **Decision capabilities** – approve, reject, request more info, complete, confirm, close.  
4. **Control capabilities** – assign, reassign, route, move queue, override, reopen.  
5. **Escalation capabilities** – request approval, escalate, send for review, request override.  
6. **Administrative capabilities** – import repair, bulk correction, configuration-adjacent admin tasks nếu thuộc wedge scope.

## 6.1 Granularity rule

Capability không nên quá thô kiểu “manage requests” nếu team cần UX behavior khác nhau cho approve, reject, request more info và reassign. Ngược lại, cũng không nên vi mô đến mức matrix không maintain nổi. Granularity nên bám các moments có meaning UX hoặc governance khác nhau.

## 7. Experience modes chính thức trong matrix

Mỗi ô role x capability x context không chỉ nên trả về allow/deny. Pack 03 nên có một vocabulary experience mode rõ ràng như sau:

1. **Hidden** – capability không hiện ra vì không giúp orientation hoặc không nên lộ.  
2. **View-only** – user thấy context nhưng không có editable or commit controls.  
3. **Visible-disabled** – action hiện nhưng chưa khả dụng, cần explanation.  
4. **Visible-explained** – action hiện cùng explanation rõ vì sao không thể làm.  
5. **Actionable** – user có thể thực hiện trực tiếp.  
6. **Escalate-available** – user không thể commit outcome chính nhưng có path đẩy flow tiếp.  
7. **Review-only with trace** – user không làm được action nhưng vẫn thấy đủ history và accountability cues.  
8. **Policy-blocked** – capability về role có thể đúng nhưng context hiện tại chưa hợp lệ.

Các experience modes này là cầu nối trực tiếp giữa matrix và UX rules ở tài liệu authority.

## 8. Cấu trúc chuẩn của role-permission matrix có nghĩa ở level UX

Mỗi row hoặc mapping unit trong ma trận nên có ít nhất các trường sau:

1. Matrix Row ID.  
2. Role / role group.  
3. Surface.  
4. Screen family hoặc interaction context.  
5. Flow family hoặc task family.  
6. Capability name.  
7. Capability type.  
8. Authority requirement.  
9. Policy prerequisites.  
10. Experience mode when allowed.  
11. Experience mode when restricted.  
12. Preferred copy / explanation family.  
13. Next-best action or escalation path.  
14. Traceability references.  
15. QA scenario references.  
16. Telemetry event references.  
17. Owner(s).  
18. Version / last reviewed date.  
19. Notes about exceptions or tenant-specific variations.

Cấu trúc này giúp matrix phục vụ không chỉ access review mà cả design, frontend behavior, QA và analytics.

## 9. Rules cho view moments theo role

## 9.1 View access không chỉ là yes/no

Một user có thể:
- không thấy screen;  
- vào được screen nhưng chỉ thấy subset data;  
- thấy full context nhưng không thấy actions;  
- thấy context và action placeholders để hiểu flow;  
- hoặc thấy review-only mode với trace.

Matrix phải thể hiện các khác biệt này thay vì coi mọi view là giống nhau.

## 9.2 Orientation requirement

Nếu một role vẫn phải hiểu item đang ở đâu dù không được hành động, matrix nên chọn mode giúp orientation còn nguyên. Điều này đặc biệt quan trọng với manager review chains, coordinator handoffs và read-only audit contexts.

## 10. Rules cho action, decision và control moments

## 10.1 Actionability rules

Nếu role có capability và authority đủ, action nên vào mode actionable với copy bình thường theo copy system. Nếu capability có nhưng authority chưa đủ, action không nên bị hiển thị như actionable rồi fail muộn trừ khi không thể biết sớm hơn.

## 10.2 Decision moments

Với approve / reject / request more info / override, matrix nên ghi rõ:
- role nào có decision trực tiếp;  
- role nào chỉ review và escalate;  
- role nào chỉ thấy outcome sau khi người khác quyết;  
- role nào có conditional decision tùy authority threshold.

## 10.3 Control moments

Với assign / reassign / route / queue move, matrix phải làm rõ role nào được thay ownership, role nào chỉ đề xuất hoặc request change, role nào chỉ xem current owner. Đây là vùng rất dễ drift giữa product và backend nếu không map rõ.

## 11. Rules cho review-only mode

## 11.1 Review-only phải là mode có chủ đích

Review-only không nên là một màn “bị rút hết nút” mà không còn logic. Nếu matrix chọn review-only, screen cần giữ ít nhất:
- dominant state;  
- context summary;  
- relevant history / trace;  
- explanation về giới hạn hiện tại;  
- next-best action nếu user còn trách nhiệm follow-up.

## 11.2 Khi nào nên dùng

Review-only nên dùng khi:
- role cần hiểu trạng thái và tiến trình nhưng không được commit outcome;  
- accountability hoặc audit visibility quan trọng;  
- coordination value vẫn còn dù không có control rights.

## 12. Rules cho escalation và next-best-action mapping

## 12.1 Escalation as experience output

Nếu role không thể hoàn tất action chính nhưng vẫn chịu trách nhiệm đẩy flow tiếp, matrix phải ghi next-best action rõ. Ví dụ:
- request manager review;  
- escalate for approval;  
- reassign to authorized coordinator;  
- request override;  
- return for more info.

## 12.2 Không để dead-end

Một ô matrix restricted mà không có explanation và không có next-best action ở một flow launch-critical thường là dấu hiệu mapping chưa hoàn chỉnh.

## 12.3 Escalation visibility

Nếu escalation path là hành vi bình thường của role đó, UI nên support nó như capability chính thức chứ không như “mẹo xử lý”. Matrix phải thể hiện điều này ở level capability family và experience mode.

## 13. Rules cho policy-blocked moments

## 13.1 Tách khỏi role restrictions

Nếu role có quyền và authority phù hợp nhưng item thiếu prerequisite, matrix phải map trường hợp này sang policy-blocked mode, không được dùng cùng explanation family với no-access hoặc insufficient authority.

## 13.2 Ví dụ contexts

- approve blocked vì thiếu fields;  
- complete blocked vì thiếu evidence;  
- reassign blocked vì review hiện tại chưa đóng;  
- override blocked vì state chưa phù hợp.

## 13.3 UI implication

Policy-blocked rows nên map tới correction/recovery prompts, không phải permission-denied messaging. Đây là chỗ matrix nối trực tiếp vào copy system và authority rules.

## 14. Screen-level expectations theo role

## 14.1 Web Admin landing và queue screens

Matrix nên mô tả role nào thấy landing summary nào là primary, queue nào là default, filters nào là available, row-level actions nào được hiện, và restricted cues nào cần xuất hiện ở queue contexts.

## 14.2 Review workspace screens

Matrix nên mô tả role nào có:
- decision actions trực tiếp;  
- review-only mode;  
- authority explanation;  
- override access;  
- reassignment access;  
- trace-only access.

## 14.3 Mobile Ops screens

Dù tài liệu này thiên về authority mapping, Mobile Ops vẫn cần role-permission experience mapping ở mức wedge, nhất là với note, evidence, exception, completion, help/report paths và visibility of assigned work.

## 14.4 Import and remediation screens

Với admin support hoặc onboarding support, matrix nên làm rõ ai được sửa gì, retry gì, xem grouped issue gì, và khi nào subset đã đủ readiness để tiến tiếp.

## 15. Copy, messaging và accountability cues theo role context

## 15.1 Copy linkage

Mỗi restricted hoặc conditional mode nên map tới copy family phù hợp trong terminology register và microcopy inventory. Matrix không cần chứa final strings, nhưng phải chỉ rõ loại explanation hoặc cue nào bắt buộc.

## 15.2 Accountability cues

Ở những flows nhiều vai trò, matrix nên chỉ rõ role nào cần thấy:
- current owner;  
- next owner;  
- waiting-for role;  
- who made prior decision;  
- who can act now.

## 15.3 Continuity and role context

Nếu một role trên mobile có thể local-capture update nhưng chưa có permission cho outcome khác, matrix nên làm rõ distinction giữa what can be captured và what can be confirmed. Đây là chỗ authority semantics có thể gặp continuity semantics.

## 16. QA coverage rules cho role-permission experience

## 16.1 QA phải test hơn allow/deny

QA coverage nên kiểm tra ít nhất:
- hidden vs visible-disabled behavior;  
- explanation correctness;  
- next-best action presence;  
- review-only integrity;  
- policy-blocked distinction;  
- authority-threshold behavior;  
- telemetry emission cho restricted moments.

## 16.2 Scenario matrix

Mỗi launch-critical capability nên có ít nhất ba góc test khi relevant:
1. allowed happy path;  
2. restricted by role or authority;  
3. blocked by policy or state condition.

## 16.3 Regression rule

Khi role-permission mapping đổi, team không nên chỉ rerun auth tests kỹ thuật. UX QA và semantic QA cho affected screens cũng phải rerun.

## 17. Telemetry và observability mapping rules

## 17.1 Event linkage

Mỗi restricted hoặc escalated capability quan trọng nên map tới event families như:
- restricted_action_encountered;  
- restricted_action_explanation_shown;  
- escalation_initiated;  
- escalation_confirmed;  
- policy_prerequisite_missing;  
- review_only_mode_entered.

## 17.2 Segmentation

Telemetry nên segment được theo role, capability family, surface, flow family và boundary type. Nếu không, team sẽ thấy số restricted events cao nhưng không biết đó là user đúng bị policy-blocked hay role mapping đang sai.

## 17.3 Pilot reading

Role-permission mapping giúp pilot triage đọc được restricted-event clusters như trust problem, training problem, policy misdesign hay permission misconfiguration. Đây là chỗ observability nối thẳng vào governance.

## 18. Traceability, ownership và governance rules

## 18.1 Traceability linkage

Mỗi row quan trọng trong matrix nên tham chiếu trace IDs hoặc ít nhất component/screen/flow clusters trong traceability matrix. Điều này giúp mọi thay đổi permission-impactful có thể được đánh giá ảnh hưởng hệ thống.

## 18.2 Ownership model

- Product Management giữ responsibility model và flow implications.  
- Security / Access Governance giữ capability truth và change control.  
- Product Design giữ experience mode semantics và copy expectations.  
- Frontend / Backend giữ implementation alignment.  
- QA giữ scenario coverage.  
- Analytics giữ telemetry mapping integrity.

## 18.3 Versioning and rollout control

- Matrix cần version rõ khi role model hoặc capability model đổi.  
- Tenant-specific overrides phải được đánh dấu, không được lẫn vào baseline chung.  
- Không silently repurpose một capability name cho meaning mới mà không review downstream UX impact.

## 19. Cách dùng matrix trong pilot hardening, release planning và access reviews

## 19.1 Pilot hardening

Matrix giúp team phân biệt feedback “không thấy nút”, “không bấm được”, “không hiểu ai xử lý tiếp” hoặc “bị chặn vô lý” đang là issue về role config, authority explanation, policy design hay onboarding gap.

## 19.2 Release planning

Khi release thêm capability hoặc đổi authority threshold, matrix giúp xác định screen nào, copy family nào, QA scenarios nào và telemetry events nào phải đổi theo.

## 19.3 Access reviews

Trong access reviews định kỳ, ma trận này giúp security và product review không chỉ raw privileges mà còn review xem trải nghiệm boundary có còn đúng với current operating model hay không.

## 20. Anti-pattern role-permission UX nghiêm trọng phải tránh

## 20.1 Raw allow/deny matrix only

Chỉ có bảng quyền kỹ thuật mà không có experience mode, copy expectation hoặc next-best action mapping.

## 20.2 Hidden by default everywhere

Ẩn mọi restricted capability khiến UI gọn hơn nhưng phá orientation và làm user không hiểu flow đầy đủ.

## 20.3 Review-only as stripped screen

Biến review-only thành màn gần như vô dụng, không có trace, không có explanation và không có accountability cues.

## 20.4 Policy-role confusion

Dùng cùng explanation cho thiếu quyền, thiếu authority và thiếu prerequisite sẽ làm user hiểu sai nguyên nhân bị chặn.

## 20.5 No escalation semantics

Có authority chain ngoài đời thật nhưng không map nó thành capability / experience path trong hệ thống.

## 20.6 Permission drift by screen

Cùng một capability bị biểu hiện khác nhau ở queue, detail và review screens mà không có lý do rõ ràng.

## 20.7 No telemetry for restricted moments

Restricted experiences xảy ra nhưng measurement layer không nhìn thấy được nên governance luôn mù.

## 21. Governance rules cho mọi role/capability mapping mới hoặc thay đổi

Mọi mapping mới hoặc thay đổi nên đi qua các câu hỏi sau:

1. **Role này có trách nhiệm gì trong flow này?**  
2. **Capability này là view, input, decision, control, escalation hay administrative?**  
3. **Restriction hiện tại là do role, authority threshold hay policy prerequisite?**  
4. **Experience mode đúng là hidden, review-only, visible-disabled, visible-explained, actionable hay escalate-available?**  
5. **Người dùng cần hiểu gì nếu không được làm action này?**  
6. **Next-best action hoặc next-owner cue có cần xuất hiện không?**  
7. **QA, telemetry, copy register và traceability rows nào phải update?**  
8. **Tenant-specific variation có đang làm lệch baseline hay không?**

## 22. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE.md** – guide chuẩn bị demo data, pilot data, seed states và scenario setup cho walkthroughs, QA và enablement.  
2. **52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE.md** – template review impact thay đổi dùng với traceability matrix, permission matrix và pilot triage outcomes.  
3. **53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS.md** – tài liệu đào sâu reconciliation behavior cho delayed confirm, conflict, stale return và eventual consistency.  
4. **54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST.md** – checklist review semantic regressions, wording drift, authority drift và continuity truth before release.  
5. **55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS.md** – requirements cho dashboard review pilot signals bám metrics framework, triage model và event taxonomy.  
6. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics cho handoffs giữa Web Admin và Mobile Ops.  
7. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – ma trận test riêng cho authority boundaries, waivers và controlled exceptions.

## 23. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho role-permission matrix và experience mapping của Pack 03:

1. Pack 03 cần một **role-permission matrix gắn với experience mapping**, không chỉ một access table kỹ thuật.  
2. Role, capability, authority threshold, policy prerequisite, experience mode, copy family, QA coverage và telemetry mapping phải được nối với nhau.  
3. Hidden, view-only, visible-disabled, visible-explained, actionable, escalate-available, review-only with trace và policy-blocked là các experience modes chính thức.  
4. Restricted moments phải có explanation semantics và khi phù hợp phải có next-best action hoặc next-owner visibility.  
5. QA và telemetry phải test và quan sát được authority meaning, không chỉ technical access outcome.  
6. Matrix phải có owner, versioning và linkage rõ với traceability, terminology, QA và observability layers.  
7. Tài liệu này là baseline để Product, Security, Design, Frontend, Backend, QA và Analytics cùng điều phối authority-sensitive experiences của Pack 03 bằng một ngôn ngữ chung.

## 24. Điều kiện hoàn thành của tài liệu

Role Permission Matrix and Experience Mapping được xem là đạt yêu cầu khi:
- các launch-critical roles và capabilities đều có mapping rõ sang screen expectations, experience modes, explanations và next-best actions;  
- technical permission logic không còn tách rời authority UX behavior;  
- QA, telemetry và pilot triage có thể đọc restricted moments theo cùng một baseline;  
- và team có một cấu trúc đủ chắc để mở rộng role model mà không làm authority UX drift theo từng màn hình.

## AG Execution Prompt

You are acting as a senior authority-experience strategist, access-governance integrator, and role-capability mapping architect.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: authority UX rules, traceability matrix, terminology register, observability taxonomy, and pilot triage model are already defined.
- This document defines the role-permission matrix and experience mapping baseline for Pack 03.

### Objective
Refine this Role Permission Matrix and Experience Mapping document into a production-grade baseline that can connect backend capabilities, authority thresholds, policy prerequisites, screen expectations, UX modes, messaging, QA coverage, and telemetry mapping across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between role restrictions, authority restrictions, and policy blockers.
- Keep the output concrete enough for real access-review, implementation, QA, and governance use.

### Tasks
1. Rewrite the thesis into a sharper executive form.
2. Produce a role-permission-to-experience framework covering capability types, screen expectations, experience modes, escalation paths, review-only modes, and policy-blocked contexts.
3. Define a practical matrix structure, ownership model, telemetry linkage, QA linkage, and traceability linkage.
4. Add rules for view, action, decision, control, escalation, and policy-blocked moments.
5. Identify the top five role-permission UX failures that would weaken clarity, trust, or governance integrity.
6. Recommend the next documents that should operationalize this baseline into demo data setup, release change-impact review, reconciliation patterns, semantic regression checklists, dashboard requirements, and authority-boundary test matrices.
7. Add governance rules to prevent raw allow/deny-only modeling, policy-role confusion, stripped review-only screens, permission drift by screen, and missing restricted-moment telemetry.

### Constraints
- Do not reduce the matrix to raw access control only.  
- Do not let role restrictions, authority thresholds, and policy blockers collapse into one vague UX outcome.  
- Do not leave restricted flows without explanation or next-step semantics when responsibility continues.  
- Do not leave QA and telemetry unable to observe restricted experiences meaningfully.  
- Keep the output concrete enough for downstream governance and delivery use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Thesis
2. Mapping Framework
3. Matrix Structure and Usage Rules
4. QA, Telemetry, and Traceability Linkage
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 role-permission experience mapping explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams connect capabilities, restrictions, explanations, next actions, QA coverage, and telemetry in one maintainable system.
- The output must reduce ambiguity around role expectations, authority thresholds, policy blockers, screen behavior, and restricted-moment semantics.
