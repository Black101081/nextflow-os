# Nextflow OS – Admin Console Permission and Authority Experience Rules

**Document ID:** 43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Product Design / Security & Access Governance  
**Dependent Packs:** Frontend Delivery, Engineering Implementation, Identity & Access, QA & Support, Program Delivery  
**Prerequisite Documents:** 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bộ rules chính thức cho permission experience, authority semantics và escalation behavior trên Web Admin** của Nextflow OS trong Pack 03. Nếu các tài liệu trước đã khóa control-surface strategy, screen taxonomy, decision-input patterns, density rules, copy system, UX QA scenarios và measurement framework, thì tài liệu này đi vào một lớp rất nhạy cảm nhưng thường bị xử lý nửa kỹ thuật nửa ngẫu hứng trong nhiều sản phẩm admin:

> **Khi người dùng trên Web Admin có hoặc không có quyền thực hiện một hành động, khi một quyết định vượt quá authority hiện tại, khi một item cần được escalate, khi một action bị chặn bởi permission boundary hoặc policy boundary, hệ thống phải biểu đạt điều đó như thế nào để vừa bảo vệ governance, vừa giữ clarity, vừa không làm control surface trở nên mù nghĩa hoặc quan liêu hóa trải nghiệm?**

Trong một SME Business OS, permission không chỉ là chuyện “hiện hay ẩn nút”. Authority không chỉ là chuyện backend cho phép hay từ chối. Đây là những lớp semantics ảnh hưởng trực tiếp tới:
- user hiểu mình có trách nhiệm gì;  
- user biết tại sao một item đang đứng ở đây;  
- user hiểu vì sao mình không thể tiến tiếp;  
- user biết ai có thể xử lý tiếp;  
- và hệ thống giữ accountability đủ rõ mà không đẩy người dùng về chat hoặc hỏi tay.

Nếu permission UX yếu, các drift nguy hiểm rất dễ xảy ra:
- user thấy nút nhưng không hiểu vì sao bấm không được;  
- user không thấy nút nên tưởng hệ thống thiếu tính năng;  
- decision paths bị chặn nhưng không có escalation cue;  
- cùng một boundary nhưng mỗi màn hình giải thích một kiểu;  
- hoặc authority semantics bị che thành generic errors làm trust giảm mạnh.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của permission và authority experience trong Pack 03.  
2. Khác biệt giữa permission boundary, authority boundary và policy boundary.  
3. Authority thesis cho Web Admin.  
4. Các loại permission moments chính thức phải được thiết kế.  
5. Rules cho hidden, visible-disabled, visible-explained và escalation-required actions.  
6. Rules cho authority-aware decision flows.  
7. Rules cho request-elevation, reassignment và escalation patterns.  
8. Rules cho permission messaging, copy và accountability cues.  
9. Rules cho list/detail/review screens dưới permission pressure.  
10. Rules cho auditability, trace visibility và cross-role clarity.  
11. Những anti-pattern permission UX nghiêm trọng phải tránh.  
12. Cách review authority UX trong governance, QA và metrics.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Permission, authority và policy khác nhau thế nào

Trong Pack 03, ba khái niệm sau không nên bị trộn lẫn:

## 2.1 Permission boundary

Permission boundary là **hệ thống có cho tài khoản hoặc role hiện tại truy cập hoặc kích hoạt một capability cụ thể hay không**. Đây là lớp gần với access control nhất. Ví dụ một người có thể xem queue nhưng không thể reassign item, hoặc có thể mở detail nhưng không thể approve.

## 2.2 Authority boundary

Authority boundary là **người dùng có thẩm quyền nghiệp vụ để đưa ra quyết định hoặc làm phát sinh một outcome vận hành nhất định hay không**. Một người có thể có technical access vào màn hình nhưng không có đủ authority để phê duyệt vượt ngưỡng, override một rule hoặc đóng một trường hợp nhạy cảm.

## 2.3 Policy boundary

Policy boundary là **hệ thống hoặc tổ chức đang áp dụng quy tắc nghiệp vụ nào khiến một hành động không hợp lệ trong bối cảnh hiện tại**, kể cả khi người dùng có permission và thường cũng có role phù hợp. Ví dụ item đang ở sai state để approve, evidence bắt buộc còn thiếu, hoặc tenant rule yêu cầu thêm một bước trước khi hoàn tất.

Ba lớp này có thể cùng dẫn tới việc user “không làm được”, nhưng nghĩa UX của chúng khác nhau rất mạnh. Nếu copy và behavior không phân biệt, control surface sẽ nhanh chóng trở nên mơ hồ.

## 3. Authority thesis cho Web Admin

Authority thesis của tài liệu này có thể phát biểu như sau:

> **Web Admin phải làm rõ không chỉ người dùng có thể làm gì, mà còn vì sao họ có thể hoặc không thể làm điều đó, outcome nào cần authority cao hơn, và con đường nào hợp lệ để tiếp tục khi boundary xuất hiện; nếu hệ thống chỉ chặn mà không giải thích, hoặc chỉ ẩn mà không định hướng, authority UX đang thất bại.**

Từ thesis này, mười nguyên lý được suy ra:

1. Authority UX phải ưu tiên **clarity of responsibility** hơn kỹ xảo che giấu quyền.  
2. Không phải mọi restricted action đều nên bị ẩn; một số cần được thấy để user hiểu flow.  
3. Visible-but-disabled chỉ hợp lệ khi explanation đủ rõ và có ích.  
4. Generic permission errors là lựa chọn cuối cùng, không phải mặc định.  
5. Escalation hoặc request-elevation paths phải gần với nơi user gặp boundary.  
6. Decision flows phải phản ánh ngưỡng authority thật, không tạo cảm giác arbitrary.  
7. Policy blockers phải được nói như điều kiện công việc, không bị nhầm thành thiếu quyền cá nhân.  
8. Auditability và traceability là một phần của authority trust.  
9. Cross-role clarity quan trọng không kém self-role clarity; user cần hiểu ai có thể xử lý tiếp.  
10. Authority experience phải đủ gọn để không biến control surface thành bureaucratic maze.

## 4. Các permission moments chính thức phải được thiết kế

Pack 03 nên phân loại tối thiểu tám permission/authority moments chính thức:

1. **View restricted** – không được xem một vùng hoặc item.  
2. **Action restricted** – thấy context nhưng không được thực hiện action.  
3. **Authority threshold exceeded** – action tồn tại nhưng vượt thẩm quyền hiện tại.  
4. **Policy prerequisite missing** – action bị chặn vì thiếu điều kiện nghiệp vụ.  
5. **Escalation required** – cần chuyển sang người hoặc cấp có thẩm quyền hơn.  
6. **Temporary unavailable due to state** – action chưa hợp lệ ở state hiện tại.  
7. **Conditional access with explanation** – được phép trong một số điều kiện và phải hiểu rõ điều kiện đó.  
8. **Trace-visible but action-locked** – user cần xem trace hoặc history nhưng không được sửa hoặc commit.

Các moments này không nên bị gộp hết thành “permission denied”. Chúng cần semantics riêng vì hành vi và next step khác nhau.

## 5. Decision model: ẩn, hiện nhưng khóa, hiện và giải thích, hay chuyển escalation

Một trong những quyết định UX khó nhất ở admin products là khi nào nên ẩn action, khi nào nên hiện nhưng disable, và khi nào nên hiện kèm escalation path.

## 5.1 Khi nào nên ẩn hoàn toàn

Ẩn action là hợp lý khi:
- action hoàn toàn không liên quan tới role đó trong mental model thường ngày;  
- việc nhìn thấy action không giúp orientation hoặc responsibility;  
- action quá hiếm hoặc quá nhạy cảm khiến hiện ra thường xuyên chỉ gây noise;  
- hoặc policy/security yêu cầu không lộ capability đó trong context này.

## 5.2 Khi nào nên visible-disabled

Hiện nhưng disable là hợp lý khi:
- action thuộc mental model của flow và user cần hiểu rằng bước đó tồn tại;  
- user có thể trở thành người làm được ở bối cảnh khác hoặc state khác;  
- việc biết “chưa làm được vì sao” giúp định hướng tốt hơn;  
- hoặc action đang bị chặn bởi trạng thái tạm thời hoặc điều kiện có thể hoàn tất.

## 5.3 Khi nào nên visible-explained

Visible-explained hợp lý khi system cần giúp user hiểu boundary một cách chủ động, ví dụ:
- “Only managers can approve this request”;  
- “Add evidence before completing”;  
- “This item is waiting for branch confirmation”;  
- “You can review details, but reassignment requires coordinator access”.

## 5.4 Khi nào nên chuyển sang escalation path

Nếu user gặp boundary nhưng vẫn có trách nhiệm đẩy công việc tiến lên, hệ thống nên cung cấp một path như Request Approval, Escalate, Reassign to Manager, Send for Review hoặc Request Override. Chặn đơn thuần mà không mở đường là anti-pattern mạnh trong control UX.

## 6. Rules cho view restrictions và access-denied surfaces

## 6.1 View restriction phải có nghĩa

Nếu user không được xem một screen, item hoặc data region, hệ thống nên ưu tiên nói đủ để user hiểu đây là hạn chế gì, trừ các trường hợp bảo mật đòi hỏi im lặng hơn. Một blank dead-end hoặc generic forbidden page thường làm user không biết do bug, do role hay do điều kiện khác.

## 6.2 Rules

1. Nếu user đến từ deep link hoặc notification mà không có access, screen nên giải thích ngắn gọn và đưa ra exit path hợp lý.  
2. Nếu screen family vẫn relevant nhưng scope dữ liệu bị hạn chế, UI nên làm rõ phạm vi thấy được thay vì khiến user tưởng dữ liệu bị thiếu do lỗi.  
3. Access-denied messaging không nên lộ dữ liệu nhạy cảm beyond what the role may know, nhưng vẫn phải giữ orientation cơ bản khi có thể.  
4. Nếu có người hoặc nhóm phù hợp hơn để xử lý, cue đó nên được hiện khi hợp lệ.

## 7. Rules cho action restrictions trên list, queue và detail screens

## 7.1 Trên queue/list screens

- Restricted actions trong row-level menus không nên xuất hiện lẫn lộn với permitted actions theo cách khó học.  
- Nếu action rất liên quan tới công việc nhưng bị hạn chế, explanation nên đủ gần để user không cần mở sâu mới biết vì sao.  
- Queue không nên trông như có quá nhiều “nút chết” chỉ vì permission matrix phức tạp.

## 7.2 Trên detail/review screens

- Nếu primary action bị restricted, screen phải cực rõ điều gì đang chặn và ai hoặc điều kiện nào cần tiếp theo.  
- Nếu decision context vẫn có giá trị cho user dù không thể commit, layout nên hỗ trợ review-only mode một cách có chủ đích.  
- Restricted action không được nhìn giống bug hoặc broken button.

## 7.3 Action hierarchy dưới permission pressure

Khi một primary action không được phép, hệ thống nên tái cân bằng hierarchy để secondary next-best action hoặc escalation action đủ nổi. Không nên để screen rơi vào trạng thái “biết là tắc nhưng không biết làm gì tiếp”.

## 8. Rules cho authority-aware decision flows

## 8.1 Approval thresholds

Nếu approval có ngưỡng authority, flow phải làm rõ ngưỡng đó ở mức user cần biết để quyết định hoặc escalation đúng, không nhất thiết phơi bày mọi policy nội bộ chi tiết. Người dùng không nên bấm xong mới biết mình không có đủ authority trong những flow lẽ ra có thể báo sớm hơn.

## 8.2 Override decisions

Override là một authority-heavy moment và nên được đối xử như vậy trong UX. Nếu user thiếu authority, system nên nói rõ đây là override-restricted action chứ không chỉ báo lỗi mơ hồ. Nếu user có authority, reasoning structure và trace cues phải mạnh hơn approval thông thường.

## 8.3 Request-more-info versus reject

Nếu một role không được phép reject trực tiếp nhưng có thể request more info hoặc escalate, UI phải làm distinction này cực rõ. Nếu không, user sẽ nghĩ hệ thống đang khóa vô lý thay vì đang bảo vệ policy.

## 9. Rules cho escalation, request-elevation và reassignment paths

## 9.1 Escalation phải là path thật, không phải lời khuyên mơ hồ

Nếu UX nói “contact your manager” nhưng không đưa path nào trong hệ thống ở những flow quan trọng, đó là dấu hiệu authority experience chưa hoàn thiện. Ở mức tối thiểu, system nên hỗ trợ một trong các cách sau khi phù hợp:
- escalate item;  
- send for review;  
- request override;  
- reassign to authorized owner;  
- create follow-up requiring higher approval.

## 9.2 Escalation outcome phải rõ

User cần biết item sẽ đi đâu, chờ ai, và trách nhiệm của mình còn hay không sau escalation. Nếu không, escalation chỉ đổi một sự mơ hồ thành sự mơ hồ khác.

## 9.3 Request-elevation copy rules

- Nói rõ user đang xin quyền cho item này hay đang gửi item sang người có quyền.  
- Tránh verbs quá mơ hồ như Process, Continue hoặc Send nếu outcome authority-sensitive không rõ.  
- Nếu escalation có SLA hoặc chờ phê duyệt cấp trên, cue đó có thể cần được làm rõ ở các flow quan trọng.

## 10. Rules cho permission messaging và accountability cues

## 10.1 Message structure

Một permission/authority message tốt nên cố gắng trả lời ngắn gọn ba ý:
1. Bạn không thể làm gì lúc này.  
2. Vì sao.  
3. Điều gì hoặc ai có thể xử lý tiếp.

## 10.2 Distinction rules

Copy phải phân biệt rõ các họ message sau:
- you do not have access;  
- you can view but not edit;  
- this action needs higher approval;  
- this action is unavailable until condition X is met;  
- this item is waiting for another role;  
- this decision requires escalation.

## 10.3 Accountability cues

Ở các moments authority-sensitive, UI nên làm lộ đủ rằng ai đã đưa ra quyết định trước, ai là next owner, ai currently holds responsibility, hoặc role nào đang cần xử lý. Điều này quan trọng cho trust và cho giảm chasing ngoài hệ thống.

## 11. Rules cho policy blockers so với permission blockers

## 11.1 Policy blocker không nên nghe như personal denial

Nếu action bị chặn vì item thiếu evidence, sai state hoặc chưa qua bước trước đó, message không nên làm user nghĩ vấn đề nằm ở quyền cá nhân của họ. Đây là lỗi copy rất phổ biến và làm trách nhiệm trở nên mơ hồ.

## 11.2 Policy blocker nên gắn với condition có thể hiểu

Các ví dụ tốt hơn thường đi theo hướng:
- Add evidence before completing.  
- This request is waiting for branch confirmation.  
- Reassignment is available after current review is closed.  
- Approval can continue after missing fields are corrected.

## 11.3 Khi policy blocker và authority cùng xuất hiện

Nếu một action vừa bị thiếu điều kiện vừa vượt thẩm quyền, UI nên ưu tiên logic dễ hành động nhất và không nhồi hai ba blockers lẫn nhau trong cùng một message rối. Có thể cần hierarchy: condition blocker trước, authority cue sau hoặc ngược lại tùy case.

## 12. Rules cho trace visibility, auditability và cross-role clarity

## 12.1 Trace visibility là một phần của authority UX

Khi user không thể hành động, trace thường càng quan trọng hơn vì nó giải thích chuyện gì đã xảy ra và ai đang giữ bóng. Review-only access nhưng có trace rõ vẫn tạo trust tốt hơn nhiều so với blocked action và history mù nghĩa.

## 12.2 Auditability rules

1. Decisions authority-heavy nên để lại trace đọc được, không chỉ log kỹ thuật.  
2. Override, reject, reassignment và escalation nên có narrative đủ rõ cho review sau này.  
3. Nếu một action bị từ chối do authority boundary, đó không nhất thiết phải thành audit event visible cho mọi role, nhưng UX vẫn cần logic nhất quán về phản hồi.

## 12.3 Cross-role clarity

Một người có thể không làm được action, nhưng vẫn cần hiểu role nào làm được. Điều này đặc biệt quan trọng khi item đi qua nhiều vai trò trong cùng một flow. Hệ thống nên giúp user biết “bây giờ bóng đang ở đâu” thay vì để họ tự đoán hoặc hỏi tay.

## 13. Density và responsive implications cho authority UX

Authority semantics không được hy sinh khi layout co lại.

## 13.1 Rules

1. Permission explanations cho primary blocked actions không được biến mất chỉ vì viewport hẹp hơn.  
2. Escalation CTAs nếu là next-best action không được chìm xuống dưới metadata phụ.  
3. Review-only mode phải vẫn giữ được distinction giữa viewable context và locked actions.  
4. Hidden vs disabled logic phải nhất quán giữa responsive states, không để cùng action lúc thì biến mất lúc thì hiện khóa vô cớ.

## 14. QA scenarios cho permission và authority UX

QA cho authority UX nên bao gồm tối thiểu các cases sau:

1. User không có view access nhưng vào bằng deep link.  
2. User xem được item nhưng không được edit.  
3. User thấy action nhưng thiếu authority để commit.  
4. User thiếu policy prerequisite chứ không thiếu role.  
5. User gặp escalation-required path.  
6. User request more info được nhưng không reject được.  
7. User reassign được nhưng không override được.  
8. Responsive view vẫn giữ permission explanation và next step đủ rõ.

Mỗi case nên kiểm tra orientation, explanation quality, next-step clarity, copy consistency và trace visibility.

## 15. Metrics và observability signals cho authority UX

Framework đo lường của Pack 03 nên theo dõi ít nhất một số tín hiệu liên quan authority semantics:

- restricted-action encounter rate;  
- restricted-action abandonment rate;  
- escalation path usage rate;  
- time from escalation to next owner action;  
- permission-error frequency by screen family;  
- request-more-info versus reject substitution patterns;  
- repeated attempts on disabled or blocked actions;  
- support or pilot confusion themes liên quan authority.

Những signals này không tự nói hết sự thật, nhưng chúng giúp phát hiện sớm nơi authority UX đang mơ hồ hoặc không cạnh tranh được với hỏi tay ngoài hệ thống.

## 16. Anti-pattern permission UX nghiêm trọng phải tránh

## 16.1 Hidden everything

Ẩn mọi thứ user không làm được có thể làm UI trông gọn, nhưng thường phá orientation và làm user không hiểu flow đầy đủ.

## 16.2 Disabled without explanation

Một nút bị khóa mà không nói tại sao là một anti-pattern cổ điển và vẫn rất phá trust trong admin UX.

## 16.3 Generic permission denied

Dùng cùng một error cho thiếu role, thiếu authority, sai state hoặc thiếu prerequisite sẽ làm user không biết nên làm gì tiếp.

## 16.4 Policy framed as personal lack

Nếu item thiếu evidence mà message lại nghe như “bạn không có quyền”, product đang mô tả sai thực tế công việc.

## 16.5 Escalation by chat

Khi system biết escalation là nhánh hợp lệ nhưng lại đẩy user ra ngoài hệ thống để tự nhắn người có quyền, control-surface integrity bị suy yếu mạnh.

## 16.6 Permission drift across screens

Cùng một boundary mà queue nói một kiểu, detail nói một kiểu, toast nói một kiểu khác sẽ làm learnability sụt rất nhanh.

## 16.7 Audit darkness

Authority-heavy decisions mà để lại rất ít trace đọc được sẽ phá accountability về sau, ngay cả khi action technically đúng.

## 17. Governance rules cho mọi authority UX quyết định mới

Mọi quyết định authority UX mới nên đi qua các câu hỏi sau:

1. **Boundary này là permission, authority hay policy?**  
2. **User có cần thấy action để hiểu flow không?**  
3. **Nếu action bị khóa, explanation nào là hữu ích nhất?**  
4. **Có next-best action hoặc escalation path nào nên được nổi lên không?**  
5. **Copy hiện tại có làm user hiểu sai trách nhiệm không?**  
6. **Responsive behavior có làm mất authority meaning không?**  
7. **Trace và next-owner clarity có đủ cho review và accountability không?**  
8. **Decision này có giữ Web Admin là control surface rõ nghĩa thay vì maze hành chính không?**

## 18. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – thư viện demo scripts ngắn cho sales, pilot và onboarding bám storyboards và copy system.  
2. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa components, screens, flows, states, authority semantics, metrics và QA coverage.  
3. **46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES.md** – handshake notes giữa UX continuity semantics và implementation semantics.  
4. **47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY.md** – register chính thức cho product language, authority terms và microcopy inventory.  
5. **48_PACK03_PILOT_FEEDBACK_TO_GOVERNANCE_TRIAGE_MODEL.md** – mô hình chuyển feedback pilot và signal clusters thành governance actions.  
6. **49_PACK03_EXPERIENCE_OBSERVABILITY_EVENT_TAXONOMY.md** – taxonomy sự kiện quan sát trải nghiệm cho analytics và QA.  
7. **50_ROLE_PERMISSION_MATRIX_AND_EXPERIENCE_MAPPING.md** – ma trận nối role/permission backend với expectations ở cấp UX semantics.

## 19. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho permission và authority experience của Web Admin:

1. Web Admin cần một **bộ authority UX rules chính thức**, không chỉ dựa vào access control kỹ thuật.  
2. Permission boundary, authority boundary và policy boundary phải được phân biệt rõ trong behavior và copy.  
3. Hidden, visible-disabled, visible-explained và escalation-required là bốn mô thức chính phải được chọn có chủ đích.  
4. Restricted actions phải đi kèm next-step clarity khi người dùng vẫn có trách nhiệm đẩy flow tiến lên.  
5. Policy blockers không được bị diễn đạt như thiếu quyền cá nhân.  
6. Trace visibility, next-owner clarity và auditability là một phần cốt lõi của authority trust.  
7. Tài liệu này là baseline để Product, Design, Security, Frontend, QA và Analytics cùng đánh giá authority UX bằng một ngôn ngữ chung.

## 20. Điều kiện hoàn thành của tài liệu

Admin Console Permission and Authority Experience Rules được xem là đạt yêu cầu khi:
- các launch-critical decision flows đã có semantics rõ cho permission, authority và policy boundaries;  
- restricted actions không còn gây cảm giác bug, arbitrary denial hoặc dead-end;  
- escalation và next-owner paths đủ rõ để giảm chasing ngoài hệ thống;  
- và team Product, Design, Security, QA và Frontend có cùng baseline để review authority-sensitive experiences trên Web Admin.

## AG Execution Prompt

You are acting as a senior admin-UX strategist, authority-experience architect, and governance-sensitive interaction designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Web Admin is the control surface, with decision-input rules, density rules, copy system, UX QA scenarios, and metrics framework already defined.
- This document defines permission and authority experience rules for Web Admin.

### Objective
Refine this Admin Console Permission and Authority Experience Rules document into a production-grade baseline that can guide restricted-action behavior, escalation patterns, authority-aware decision flows, permission messaging, QA review, metrics interpretation, and UX-to-access-control alignment across Pack 03.

### Inputs
- Use this document plus the relevant Pack 03 baseline documents as the primary source of truth.
- Preserve the control-surface role and wedge-first launch focus.
- Keep the output concrete enough for real implementation and governance review.

### Tasks
1. Rewrite the authority thesis into a sharper executive form.
2. Produce a boundary framework covering permission, authority, and policy restrictions.
3. Add practical rules for hidden vs disabled vs explained vs escalation-required actions.
4. Define authority-aware patterns for review screens, decision flows, escalation paths, messaging, trace visibility, and accountability cues.
5. Identify the top five authority UX failures that would weaken trust, clarity, or governance.
6. Recommend the next documents that should operationalize this baseline into demo script libraries, traceability matrices, microcopy inventories, pilot triage models, and role-permission mappings.
7. Add governance rules to prevent generic permission denial, policy/authority confusion, explanation-less disabled states, and off-system escalation drift.

### Constraints
- Do not reduce permission UX to simple show/hide logic.  
- Do not let policy blockers masquerade as personal lack of authority.  
- Do not leave restricted flows without a clear next step when the user still has responsibility.  
- Do not let authority-heavy decisions become audit-dark.  
- Keep the output concrete enough for downstream design, frontend, QA, and security collaboration.

### Output Format
Return a revised markdown document with these sections:
1. Executive Authority Thesis
2. Boundary Framework
3. Usage Rules by Permission Moment
4. Messaging, Escalation, and Trace Rules
5. Authority UX Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 authority UX explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design restricted and authority-sensitive flows with better clarity, accountability, and escalation behavior.
- The output must reduce ambiguity around hidden actions, disabled actions, policy blockers, permission boundaries, and next-step guidance.
