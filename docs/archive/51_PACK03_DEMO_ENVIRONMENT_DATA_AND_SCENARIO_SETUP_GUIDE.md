# Nextflow OS – Pack 03 Demo Environment Data and Scenario Setup Guide

**Document ID:** 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Design / Pilot Delivery / QA Systems / Sales Enablement  
**Dependent Packs:** Frontend Delivery, Backend Workflow, Analytics & Data, QA & Support, Customer Success, GTM Enablement, Program Delivery  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES, 44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY, 45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL, 49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY, 50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING

## 1. Mục tiêu tài liệu

Tài liệu này xác định **guide chính thức cho việc thiết lập demo environment, pilot rehearsal environment, training environment và QA walkthrough environment** của Pack 03 trong Nextflow OS. Nếu các tài liệu trước đã khóa strategy, taxonomy, flows, authority rules, continuity semantics, QA scenarios, observability taxonomy, role-permission mapping và demo scripts, thì tài liệu này xử lý câu hỏi rất thực dụng nhưng cực kỳ quan trọng:

> **Để một demo, một buổi pilot rehearsal, một QA walkthrough hoặc một training session thật sự phản ánh đúng sản phẩm, team cần chuẩn bị những account nào, object nào, state nào, authority condition nào, continuity condition nào, environment flags nào, và sequence setup nào để câu chuyện được kể vừa mượt vừa đúng sự thật hệ thống?**

Không có tài liệu này, team thường rơi vào ba failure modes quen thuộc:
- demo chạy trên data ngẫu nhiên nên câu chuyện bị đứt;  
- QA có scenario nhưng không có data kit tương ứng để tái hiện ổn định;  
- pilot feedback xuất hiện nhưng không tái diễn được vì environment và object states đã drift sau mỗi lần dùng.

Tài liệu này vì vậy không chỉ là một checklist vận hành. Nó là **lớp chuẩn hóa giữa narrative, product truth, role truth, state truth và environment discipline** để mọi buổi demo hoặc rehearsal không vô tình làm sai baseline của Pack 03.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của demo environment và scenario setup guide trong Pack 03.  
2. Demo-environment thesis của tài liệu.  
3. Các loại environment và use cases chính thức.  
4. Cấu trúc chuẩn của data kits và scenario kits.  
5. Rules cho seed data, state setup và object variation design.  
6. Rules cho role-account setup, permission setup và authority conditions.  
7. Rules cho continuity/offline/retry setup trong Mobile Ops.  
8. Rules cho import-fix, recovery và exception setup.  
9. Rules cho observability, QA mapping và pilot traceability.  
10. Rules cho reset, refresh, versioning và environment hygiene.  
11. Rules cho ownership, governance và change control.  
12. Những anti-pattern demo-data và rehearsal-setup nghiêm trọng phải tránh.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao Pack 03 cần demo environment setup guide

Pack 03 đã đi tới mức mà một demo không còn chỉ là việc mở vài màn hình đẹp và click qua vài bước. Product lúc này đã có flow spine rõ, state grammar rõ, authority semantics rõ, continuity semantics rõ, QA scenarios rõ, demo script families rõ và event taxonomy rõ. Nếu environment không được thiết kế để phản ánh những thứ đó, mọi buổi demo hoặc rehearsal đều có nguy cơ tạo ra một phiên bản “giống sản phẩm nhưng không phải sản phẩm”.

Ví dụ, một Sales demo có thể trông rất trơn tru nếu dùng data quá sạch, nhưng lại che mất authority boundary hoặc recovery truth mà pilot sớm muộn cũng gặp. Một QA walkthrough có thể có step list tốt, nhưng nếu không có object IDs đúng state thì tester phải tự chế data, dẫn tới coverage không lặp lại được. Một pilot rehearsal có thể phát hiện issue lớn, nhưng nếu không ai biết object nào, account nào và environment condition nào đã tạo ra issue đó thì learning không quay lại governance được.

Tài liệu này tồn tại để biến demo/pilot environments thành **assets được thiết kế có chủ đích**, chứ không phải hệ quả ngẫu nhiên của một staging tenant.

## 3. Demo-environment thesis cho Pack 03

Demo-environment thesis của tài liệu này có thể phát biểu như sau:

> **Một buổi demo, rehearsal hoặc QA walkthrough chỉ đáng tin khi nó chạy trên dữ liệu, trạng thái, role mappings, authority conditions và continuity conditions được thiết kế có chủ đích để phản ánh đúng baseline Pack 03; nếu môi trường trình diễn không có cấu trúc, feedback và niềm tin thu được từ nó đều có nguy cơ sai nền.**

Từ thesis này, mười nguyên lý được suy ra:

1. Demo data phải ưu tiên **semantic representativeness over random realism**.  
2. Mỗi scenario quan trọng phải có object kit cụ thể, không phụ thuộc vào “tìm đại một case đang đúng state”.  
3. Sales demo, pilot rehearsal, training và QA walkthrough có nhu cầu khác nhau nhưng phải dùng chung một grammar setup.  
4. Seed data nên có cả happy paths và strategically chosen edge conditions.  
5. Role, authority và policy conditions phải được dàn sẵn, không để người trình bày tự ứng biến.  
6. Continuity scenarios cho Mobile Ops phải được tái hiện có chủ đích, không dựa vào may rủi mạng yếu thật.  
7. Demo kits phải hỗ trợ observability reading, không chỉ UI storytelling.  
8. Reset và refresh là một phần của product operations, không phải việc dọn dẹp phụ.  
9. Tài liệu setup phải đủ cụ thể để người mới cũng chạy được, không phụ thuộc trí nhớ của một người đứng demo lâu năm.  
10. Một môi trường được thiết kế tốt giúp team học nhanh hơn mà vẫn trung thành với product truth.

## 4. Các loại environment chính thức

Pack 03 nên phân biệt ít nhất bốn loại environment phục vụ mục đích khác nhau.

## 4.1 Sales demo environment

Đây là môi trường phục vụ Sales, GTM, investor-style walkthroughs hoặc executive storytelling. Nó phải ưu tiên mạch kể chuyện rõ, ít nhiễu không cần thiết, nhưng vẫn phải giữ những authority, state và continuity moments đủ đại diện để tránh over-polished unreality.

## 4.2 Pilot rehearsal environment

Đây là môi trường dùng trước và trong pilot để team tái hiện những stories gần với thực địa hơn. Nó nên có độ đa dạng tình huống cao hơn sales demo, bao gồm authority branches, policy blockers, exception handling, continuity friction và cross-role handoffs.

## 4.3 QA walkthrough / regression environment

Đây là môi trường cho QA execution và design/PM walkthroughs trước release. Môi trường này cần ổn định nhất về IDs, states, object kits và environment resets để testers có thể rerun cùng scenarios với cùng baseline.

## 4.4 Training / onboarding environment

Đây là môi trường cho internal onboarding, partner enablement hoặc training người dùng mới. Nó nên ít phức tạp hơn pilot rehearsal nhưng nhiều context hơn sales demo, để người mới hiểu role expectations, states, flows và handoffs mà không bị choáng bởi noise.

## 5. Bốn trục setup bắt buộc

Mọi environment trong Pack 03 đều phải được thiết kế theo bốn trục đồng thời.

## 5.1 Data trục

Cần xác định các object families chính sẽ xuất hiện trong môi trường, ví dụ request, case, queue item, task, attachment, exception note, import batch hoặc correction group. Mỗi family phải có enough variants để phản ánh không chỉ happy path mà cả blocked, pending, returned, retrying hoặc partially corrected situations.

## 5.2 State trục

Environment phải được seed bằng các states có chủ đích. Điều này gồm pre-action states, mid-flow states, post-decision states, continuity states, policy-blocked states và resolved states để người xem hoặc người test thấy được movement của hệ thống chứ không chỉ màn hình tĩnh.

## 5.3 Role trục

Mỗi account phải gắn rõ role group, capabilities, authority boundaries, default landing, queues liên quan và scenario ownership. Nếu account chỉ được đặt tên kiểu test1, test2 mà không có narrative mapping, team sẽ rất nhanh mất khả năng vận hành nhất quán.

## 5.4 Environment-condition trục

Một số scenario cần conditions đặc biệt như network offline, weak connectivity, delayed sync, specific authority threshold, missing prerequisite, seeded history hoặc pre-linked attachments. Những điều kiện này phải được mô tả rõ như một phần setup chứ không được để implicit.

## 6. Cấu trúc chuẩn của một environment fact sheet

Mỗi environment chính thức nên có một fact sheet đi kèm, tối thiểu gồm:

1. Environment name / ID.  
2. Intended use, ví dụ sales demo, QA regression hoặc pilot rehearsal.  
3. URL / app entry points.  
4. Build version hoặc release branch.  
5. Seed data version.  
6. List account kits.  
7. Scenario families được support.  
8. Known limitations.  
9. Reset method.  
10. Environment owner.  
11. Last refreshed date.  
12. Linked observability or dashboard references.

Fact sheet này giúp mọi người biết mình đang đứng trong môi trường nào và được kỳ vọng dùng nó cho mục đích gì.

## 7. Cấu trúc chuẩn của data kit và scenario kit

## 7.1 Data kit

Một data kit là tập object được seed có chủ đích cho một purpose nhất định. Mỗi data kit nên có ít nhất:
- data kit ID;  
- purpose;  
- included object IDs;  
- roles liên quan;  
- states hiện tại;  
- reset notes;  
- linked flows hoặc screen families.

## 7.2 Scenario kit

Một scenario kit là lớp story-level packaging trên data kit. Nó nên mô tả:
- scenario ID;  
- persona primary;  
- narrative objective;  
- starting account;  
- starting object;  
- setup prerequisites;  
- walkthrough sequence;  
- expected state changes;  
- authority/continuity moments;  
- linked demo script hoặc QA scenario references.

## 7.3 Rule

Data kit và scenario kit không nên bị trộn làm một. Data kit trả lời “có những object nào”, còn scenario kit trả lời “dùng object nào để kể câu chuyện nào”.

## 8. Seed-data design rules

## 8.1 Không seed chỉ happy path

Mỗi môi trường meaningful nên có tối thiểu:
- vài objects happy path để kể value clearly;  
- vài objects authority-sensitive;  
- vài objects policy-blocked hoặc correction-needed;  
- vài objects continuity-sensitive nếu có Mobile Ops;  
- vài objects completed/archived có trace để nhìn hậu quả quyết định.

## 8.2 Objects phải có nghĩa kể chuyện

Không nên seed 200 objects mà không object nào có purpose rõ. Tốt hơn là có 20–40 objects được annotate rõ vì sao tồn tại, ai dùng và phục vụ moment nào.

## 8.3 Variation design

Một object set tốt nên bao gồm các cặp hoặc nhóm có đối chiếu ý nghĩa, ví dụ:
- cùng một flow nhưng một case allowed và một case policy-blocked;  
- cùng một task nhưng một case sync success và một case retry needed;  
- cùng một review path nhưng một case direct approve và một case escalation-required.

## 9. Object families nên có trong Pack 03 environments

Pack 03 nên chuẩn hóa tối thiểu các object families sau:

1. **Web Admin review cases** – pending approval, in review, returned, rejected, completed.  
2. **Queue items** – unassigned, assigned, escalated, priority-marked, stale hoặc backtracked cases.  
3. **Mobile tasks** – not started, in progress, blocked, completed, sync-pending, retry-needed tasks.  
4. **Attachments/evidence** – local-only, uploaded, failed-upload, replaced hoặc missing-evidence examples.  
5. **Import batches** – valid batch, partially invalid batch, grouped correction batch, retry-ready batch.  
6. **Correction artifacts** – records needing fix, records fixed, records blocked by unresolved issue.  
7. **History / audit examples** – cases có prior decisions, reassignments hoặc returned-for-more-info loops.  
8. **Exception / recovery examples** – help requested, exception reported, resumed task hoặc restored draft examples.

## 10. State-setup rules cho Web Admin

Web Admin environments nên seed ít nhất các states sau nếu chúng tồn tại trong wedge:
- pending approval;  
- in review;  
- returned for more info;  
- rejected;  
- completed;  
- reassigned;  
- escalated;  
- policy-blocked hoặc correction-needed states.

Ngoài việc có state tĩnh, team nên seed cả sequences có thể diễn ra trong walkthrough. Ví dụ một case có thể bắt đầu ở pending approval trong environment reset, sau demo được approve, rồi reset script trả nó về pending để dùng lại cho buổi sau.

## 11. State-setup rules cho Mobile Ops

Mobile Ops environments nên seed tối thiểu:
- open tasks;  
- in-progress tasks;  
- blocked or exception tasks;  
- locally captured but pending sync tasks;  
- retry-needed tasks;  
- server-confirmed completions;  
- restored-draft examples;  
- attachment-failed examples nếu product hỗ trợ.

Một Mobile Ops demo kit tốt không chỉ cho thấy user tap xong là completed. Nó phải đủ giàu để thể hiện continuity truth và recovery truth mà Pack 03 đã coi là rất quan trọng.

## 12. Role-account setup rules

## 12.1 Naming

Account names nên phản ánh role và purpose, ví dụ manager_demo_01, coordinator_pilot_01, mobile_frontline_sync_01 hoặc onboarding_support_qa_01. Tránh các account tên chung chung như test_user_a, vì chúng không có narrative clarity.

## 12.2 Role mapping

Mỗi account nên có một account card mô tả:
- role group;  
- primary flows;  
- capabilities;  
- authority threshold notes;  
- default landing;  
- demo/pilot scenarios mà account này tham gia.

## 12.3 Permission discipline

Không nên dùng một super-admin account cho mọi demo. Điều đó làm authority UX mất hết nghĩa, che khuất review-only, escalation và restricted moments mà product thật cần xử lý.

## 13. Sales demo kit blueprint

## 13.1 Mục tiêu

Sales demo kit phải giúp đội commercial kể chuyện nhanh, mượt và thuyết phục mà vẫn trung thành với product truth. Nó không cần phủ hết edge cases như QA kit, nhưng phải có enough substance để chứng minh hệ thống có control, authority và operational continuity thực tế.

## 13.2 Core persona bundle

Một sales demo kit tối thiểu nên hỗ trợ ba lenses:
- manager / approver lens;  
- coordinator / dispatcher lens;  
- frontline / mobile operator lens.

## 13.3 Suggested object sets

- Manager set: một case dễ approve, một case policy-blocked, một case returned-for-more-info.  
- Coordinator set: một queue item chưa assign, một item cần reassign, một item authority-sensitive cần escalate.  
- Mobile set: một task normal, một task sync-pending, một task attachment-failed hoặc retry-needed.

## 13.4 Story discipline

Sales demo nên có mapping rõ từ mỗi object tới story goal. Ví dụ object M1 dùng để kể review clarity, object M2 dùng để kể policy truth, object F2 dùng để kể offline resilience. Không nên mở object bất kỳ chỉ vì nó đang ở đúng state.

## 14. Pilot rehearsal kit blueprint

## 14.1 Mục tiêu

Pilot rehearsal kit phải gần với thực địa hơn sales demo kit. Nó nên hỗ trợ reenact multi-role, show handoffs, authority thresholds, blocked paths, continuity friction và observability reading sau session.

## 14.2 Cross-role sequence design

Một pilot rehearsal kit tốt nên cho phép ít nhất một story đi qua:
- Mobile Ops capture hoặc field execution;  
- queue visibility hoặc review intake bên Web Admin;  
- decision, correction hoặc reassignment;  
- follow-up state reconciliation.

## 14.3 Evidence needs

Mỗi pilot rehearsal scenario nên có linked screenshots, expected event milestones hoặc dashboard checks để team không chỉ nhìn UI mà còn xác thực telemetry, copy truth và state truth.

## 15. QA walkthrough kit blueprint

## 15.1 Mục tiêu

QA walkthrough kit phải tối ưu cho repeatability. Mỗi major scenario nên map tới object IDs cố định, account cố định, steps rõ và reset logic rõ.

## 15.2 Scenario annotation

Các objects phục vụ QA nên có annotation quy chuẩn như:
- QA_APPROVAL_BASIC_01  
- QA_POLICY_BLOCK_02  
- QA_SYNC_PENDING_03  
- QA_ATTACHMENT_FAIL_04  
- QA_REASSIGN_FLOW_05

Tên quy ước cụ thể có thể đổi, nhưng pattern annotation phải giúp tester biết object này sinh ra để test điều gì.

## 15.3 Regression discipline

Khi release changes chạm flow hoặc semantics, team không chỉ update UI. Họ cũng phải update data kit mappings để QA không tiếp tục test bằng objects đã mất meaning.

## 16. Training / onboarding kit blueprint

Training environment nên nhẹ hơn pilot rehearsal nhưng sâu hơn sales demo. Nó nên giúp người mới hiểu:
- các role chính;  
- màn hình nào là primary cho mỗi role;  
- state movement trông như thế nào;  
- restricted moments được giải thích ra sao;  
- continuity states trên mobile mang nghĩa gì.

Training kits nên ưu tiên clarity hơn realism tuyệt đối. Tuy nhiên chúng vẫn phải dùng preferred terminology, authority cues và continuity wording đúng baseline.

## 17. Authority-condition setup rules

## 17.1 Case pairing

Để authority UX được kể rõ, environment nên seed theo pairs hoặc triplets như:
- một case role hiện tại có thể quyết trực tiếp;  
- một case role hiện tại chỉ review-only;  
- một case role hiện tại phải escalate hoặc request higher approval.

## 17.2 Policy distinction

Ngoài authority pairing, cần có objects mà role đúng nhưng action vẫn blocked vì policy prerequisites. Điều này giúp người trình bày hoặc tester phân biệt no authority với missing prerequisite.

## 17.3 Screen expectations

Authority objects nên được phân bổ để xuất hiện ở cả queue/list context lẫn detail/review context, nếu product hỗ trợ. Chỉ nhìn authority restriction trong detail view có thể không đủ để hiểu orientation và expectation-setting trước đó.

## 18. Continuity và offline setup rules cho Mobile Ops

## 18.1 Continuity scenario families

Environment nên hỗ trợ ít nhất các continuity stories sau:
- local capture then waiting to sync;  
- sync in progress then confirmed;  
- sync failed then retry;  
- attachment upload failed while record remains captured or confirmed;  
- draft restored after interruption.

## 18.2 Controlled network conditions

Nếu có thể, team nên mô tả cách tạo weak/offline conditions có kiểm soát thay vì dựa vào mạng thật ngẫu nhiên. Ví dụ, rehearsal notes có thể nói chính xác thời điểm tắt kết nối, background app hoặc khôi phục mạng để tái hiện same continuity moment.

## 18.3 Truth discipline

Mọi continuity demo phải map đúng với handshake semantics. Nếu scenario intended là local capture only, UI và script không được vô tình diễn đạt như server-confirmed success.

## 19. Import-fix, correction và exception setup rules

## 19.1 Import-fix kits

Nếu wedge gồm import support, environment nên có:
- một batch fully valid;  
- một batch partially invalid;  
- một grouped correction case;  
- một retry-ready batch;  
- một batch có unresolved issues để show blocked subset.

## 19.2 Exception and recovery kits

Environment cũng nên có examples cho:
- reported exception;  
- recovery after validation issue;  
- return-for-more-info loops;  
- correction then resubmission;  
- reopened item sau stale condition hoặc backend response.

## 19.3 Rule

Các kits này rất hữu ích cho pilot, QA và internal alignment vì chúng giúp team nhìn product ngoài happy path mà vẫn có cấu trúc.

## 20. Observability và dashboard-readiness rules

## 20.1 Event readiness

Mỗi scenario kit quan trọng nên map tới expected event families hoặc event milestones. Điều này giúp team dùng environment không chỉ để trình diễn UI mà còn để kiểm tra instrumentation integrity.

## 20.2 Environment labeling

Events trong demo, pilot rehearsal hoặc QA environment nên có environment tags rõ để không làm bẩn production analytics. Đồng thời, tags này phải cho phép tách từng environment ra khi review logs hoặc dashboards.

## 20.3 Dashboard exercises

Một số pilot rehearsal scenarios nên có bước hậu kiểm như:
- mở dashboard hoặc logs;  
- xác nhận state milestones có bắn đúng;  
- xem restricted-action events có xuất hiện đúng;  
- kiểm tra retry hoặc attachment events theo expected path.

## 21. Linkage với demo scripts, QA scenarios và traceability

## 21.1 Demo script linkage

Mỗi sales hoặc pilot scenario kit nên tham chiếu demo script families từ tài liệu 44, để người trình bày biết object nào đi với script nào. Điều này giảm rất mạnh việc kể sai câu chuyện dù dùng đúng màn hình.

## 21.2 QA linkage

Mỗi QA walkthrough kit nên map trực tiếp tới scenario IDs từ tài liệu 41 và liên kết với object kit IDs. Nhờ đó, QA reruns không còn phụ thuộc vào trí nhớ hoặc việc tự tạo data thủ công mỗi lần.

## 21.3 Traceability linkage

Scenario kits nên map tới flow families, screen families và trace IDs từ tài liệu 45. Việc này giúp mọi thay đổi trong environment setup vẫn đọc được impact ở cấp Pack 03 chứ không bị coi là “chỉ đổi data demo”.

## 22. Reset, refresh và environment hygiene rules

## 22.1 Reset methods

Mỗi environment nên có reset path rõ, có thể là script reset, snapshot restore, data reseed hoặc checklist thao tác tay. Điều quan trọng không phải kỹ thuật nào được dùng, mà là team có thể quay environment về baseline nhanh và nhất quán.

## 22.2 Refresh cadence

Data kits nên được refresh khi:
- flow semantics đổi;  
- state names đổi;  
- role-permission mapping đổi;  
- continuity semantics đổi;  
- authority conditions đổi;  
- demo story hoặc QA scenario baseline đổi.

## 22.3 Hygiene rules

- Không demo trên environment QA nếu điều đó làm gãy regression state.  
- Không để demo users tự ý mutate seed data mà không có reset path.  
- Không dùng production-like confidential data nếu không có approval và masking phù hợp.  
- Không giữ scenario kits cũ nhưng đổi scripts mới mà không review coherence.

## 23. Ownership, governance và change control

## 23.1 Ownership model

- Product Management giữ narrative priorities và scenario relevance.  
- Product Design giữ alignment với flow, role và state truth.  
- QA giữ repeatability cho QA walkthrough kits.  
- Pilot Delivery hoặc Customer Success giữ usability của rehearsal kits.  
- Sales Enablement giữ sales-demo usability nhưng không tự thay đổi baseline semantics.  
- Engineering hoặc Product Ops có thể giữ reset tooling và environment operations.

## 23.2 Change requests

Mọi thay đổi lớn đối với object kits, scenario kits hoặc role-account setup nên được review như một governance change nhỏ. Điều này đặc biệt quan trọng nếu change chạm authority, continuity, copy semantics hoặc observability expectations.

## 23.3 Versioning

- Mỗi environment nên có seed-data version.  
- Mỗi scenario kit nên có revision note khi object IDs, story steps hoặc expected outcomes đổi.  
- Không silently thay object trong một script mà không update tài liệu setup.

## 24. Anti-pattern demo-data và rehearsal-setup nghiêm trọng phải tránh

## 24.1 Random staging tenant syndrome

Dùng một staging tenant lộn xộn làm demo environment mặc định sẽ khiến storytelling, QA repeatability và pilot learning cùng suy yếu.

## 24.2 Super-admin demos

Dùng một tài khoản full quyền cho mọi câu chuyện sẽ phá sạch authority UX, review-only modes và escalation truth.

## 24.3 Happy-path theater

Chỉ seed data đẹp, sạch và luôn thành công sẽ khiến demo trông mạnh nhưng product learning rất yếu khi gặp thực địa.

## 24.4 No reset discipline

Không có reset path rõ sẽ làm objects trôi state, scripts lỗi nhịp và QA coverage không lặp lại được.

## 24.5 Scenario-memory dependence

Nếu chỉ một vài người biết object nào nên mở, account nào nên dùng và lúc nào nên tắt mạng, tổ chức đang vận hành demo bằng trí nhớ chứ không phải bằng hệ thống.

## 24.6 Data without observability intent

Scenario kits không map tới expected events hoặc dashboard checks sẽ bỏ lỡ cơ hội dùng rehearsal như một bài test observability.

## 24.7 Demo drift from Pack 03 baseline

Scripts, scenario kits, copy cues và role-account setup thay đổi theo cảm hứng từng team mà không review chung sẽ làm demo layer dần nói một ngôn ngữ khác product layer.

## 25. Governance rules cho mọi scenario kit hoặc environment setup mới

Mọi scenario kit hoặc setup mới nên đi qua các câu hỏi sau:

1. **Scenario này phục vụ ai và mục tiêu học / trình bày là gì?**  
2. **Data kit nào và object IDs nào hỗ trợ nó?**  
3. **Role, authority và policy conditions nào phải hiện rõ?**  
4. **Có continuity, recovery hoặc exception semantics nào cần chuẩn bị trước không?**  
5. **Expected state movement là gì?**  
6. **Expected events hoặc dashboard checks là gì?**  
7. **Reset path là gì sau khi chạy xong?**  
8. **Scenario này đã tham chiếu demo scripts, QA scenarios, traceability và terminology baseline chưa?**

## 26. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **52_PACK03_RELEASE_CHANGE_IMPACT_REVIEW_TEMPLATE.md** – template review impact thay đổi dùng với traceability matrix, permission matrix, scenario kits và pilot triage outcomes.  
2. **53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS.md** – tài liệu đào sâu reconciliation behavior cho delayed confirm, stale return, retry exhaustion và backend conflict.  
3. **54_PACK03_COPY_QA_AND_SEMANTIC_REGRESSION_CHECKLIST.md** – checklist review semantic regressions cho copy, state wording, authority explanations và continuity cues.  
4. **55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS.md** – requirements cho dashboard review pilot signals bám metrics framework, event taxonomy và rehearsal learning loops.  
5. **56_CROSS_SURFACE_FLOW_OBSERVABILITY_AND_HANDOFF_DIAGNOSTICS.md** – diagnostics cho cross-surface handoffs giữa Web Admin và Mobile Ops.  
6. **57_AUTHORITY_BOUNDARY_TEST_MATRIX_AND_WAIVER_MODEL.md** – ma trận test authority boundaries, waivers, policy exceptions và controlled overrides.  
7. **58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK.md** – runbook vận hành hóa toàn bộ scenario kits và environment maintenance nếu Pack 03 tiếp tục mở rộng.

## 27. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Demo Environment Data and Scenario Setup của Pack 03:

1. Pack 03 cần một **demo/pilot/training/QA environment setup guide chính thức**, không chỉ dựa vào staging data ngẫu nhiên.  
2. Mọi environment phải được thiết kế đồng thời theo data, state, role và environment-condition trục.  
3. Sales demo, pilot rehearsal, QA walkthrough và training environments có nhu cầu khác nhau nhưng phải dùng chung grammar semantics.  
4. Data kits, scenario kits, role-account cards và environment fact sheets là các artifacts vận hành chính thức.  
5. Authority, policy, continuity, recovery và observability conditions phải được seed có chủ đích, không để người dùng tự ứng biến giữa buổi.  
6. Reset, refresh, ownership và versioning là một phần bắt buộc của environment governance.  
7. Tài liệu này là baseline để mọi buổi demo và rehearsal của Pack 03 vừa mượt về narrative vừa đúng về product truth.

## 28. Điều kiện hoàn thành của tài liệu

Pack 03 Demo Environment Data and Scenario Setup Guide được xem là đạt yêu cầu khi:
- team có một mô hình rõ để thiết kế data kits, scenario kits, role-account kits và environment conditions;  
- mọi buổi sales demo, pilot rehearsal, QA walkthrough và training đều có thể dùng môi trường lặp lại được và có reset path rõ;  
- authority, continuity, recovery, import-fix và observability moments không còn bị trình diễn ngẫu hứng;  
- và Pack 03 có một lớp vận hành môi trường đủ chắc để storytelling, QA, pilot learning và governance cùng dựa vào.

## AG Execution Prompt

You are acting as a senior demo-environment architect, pilot-rehearsal designer, QA scenario-operations lead, and product enablement systems strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: UX flows, state grammar, authority rules, continuity handshake notes, observability taxonomy, role-permission mapping, demo scripts, QA scenarios, and traceability matrix are already defined.
- This document defines the official guide for environment setup, data kits, scenario kits, and account-role setup across sales demos, pilot rehearsal, training, and QA walkthroughs.

### Objective
Refine this Demo Environment Data and Scenario Setup Guide into a production-grade operating baseline that can guide seed-data design, scenario packaging, role-account preparation, authority/continuity setup, reset discipline, observability readiness, and cross-functional environment governance across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between sales-demo, pilot-rehearsal, training, and QA-walkthrough needs while keeping their semantics aligned.
- Keep the output concrete enough for day-to-day use by Product, Design, QA, Pilot Delivery, Sales Enablement, and Engineering.

### Tasks
1. Rewrite the demo-environment thesis into a sharper executive form.
2. Produce a framework for environment fact sheets, data kits, scenario kits, role-account cards, and seed-data design.
3. Add practical rules for authority conditions, policy blockers, Mobile Ops continuity conditions, import-fix/correction kits, observability checks, and reset/refresh workflows.
4. Define ownership, governance, versioning, and environment hygiene rules.
5. Identify the top five environment-setup failures that would make Pack 03 demos smooth but misleading, or QA repeatable but semantically weak.
6. Recommend the next documents that should operationalize this baseline into change-impact review, reconciliation patterns, semantic regression checklists, dashboard requirements, handoff diagnostics, and authority-boundary test matrices.
7. Add governance rules to prevent super-admin demos, random staging-tenant drift, happy-path-only environments, no-reset chaos, and scenario-memory dependence.

### Constraints
- Do not let environment setup drift away from Pack 03 flow, state, authority, and continuity truth.  
- Do not reduce setup guidance to generic demo checklists.  
- Do not rely on tribal memory for account, object, or state setup.  
- Do not ignore observability and reset discipline.  
- Keep the output concrete enough for downstream pilot operations, QA execution, and sales enablement use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Thesis
2. Environment Types and Setup Framework
3. Data Kits, Scenario Kits, and Role-Account Rules
4. Continuity, Authority, and Observability Setup Rules
5. Governance, Reset, and Hygiene Rules
6. Failure Risks
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 demo and rehearsal environment setup explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams prepare environments, objects, accounts, and states that support better storytelling, QA repeatability, pilot learning, and governance integrity.
- The output must reduce ambiguity around seed data, scenario ownership, authority conditions, continuity setup, observability readiness, and reset discipline.
