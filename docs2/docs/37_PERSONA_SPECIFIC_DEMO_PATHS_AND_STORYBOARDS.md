# Nextflow OS – Persona-Specific Demo Paths and Storyboards

**Document ID:** 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Product Management / GTM Enablement  
**Dependent Packs:** Sales Enablement, Pilot Delivery, Customer Onboarding, Frontend Delivery, QA & Support  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **các demo paths và storyboard chính thức theo từng persona** cho Nextflow OS trong Pack 03. Nếu các tài liệu trước đã khóa strategy, screen taxonomy, flow spine, state grammar, input patterns, wireframe blueprints, messaging, governance, component behaviors và decision-input patterns, thì tài liệu này trả lời câu hỏi rất thực tế nhưng có tác động lớn tới adoption và alignment:

> **Khi cần giới thiệu, bán, pilot, onboarding hoặc nội bộ walkthrough Nextflow OS, team nên kể câu chuyện sản phẩm như thế nào cho từng persona để người xem hiểu đúng giá trị, đúng vai trò surface và đúng operational outcomes thay vì chỉ xem một loạt màn hình rời rạc?**

Một sản phẩm vận hành như Nextflow OS không thể demo tốt chỉ bằng cách mở random screens và click quanh giao diện. Càng nhiều screens, trạng thái, decisions và exception paths, rủi ro demo sai càng cao. Khi demo sai, người xem có thể hiểu nhầm thứ product mạnh nhất, đánh giá thấp execution value, hoặc tệ hơn là tưởng Web Admin và Mobile Ops chỉ là hai lớp UI rời nhau.

Tài liệu này vì vậy không phải tài liệu marketing đơn thuần. Nó là **tài liệu dịch baseline UX thành các đường kể chuyện có kỷ luật**, để sales, founders, pilot team, onboarding team, product và design cùng kể đúng một product logic nhưng với góc nhấn khác nhau theo từng người xem.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của demo paths trong Pack 03.  
2. Sự khác nhau giữa demo path và user flow.  
3. Các persona cần có demo riêng.  
4. Các nguyên tắc kể chuyện sản phẩm theo persona.  
5. Cấu trúc demo path chuẩn.  
6. Storyboard cho người điều hành / owner / operations lead.  
7. Storyboard cho manager / approver / coordinator.  
8. Storyboard cho frontline / field / execution user.  
9. Storyboard cho admin-support / onboarding / import-support persona.  
10. Các demo bridges giữa Web Admin và Mobile Ops.  
11. Các anti-pattern demo nghiêm trọng phải tránh.  
12. Cách dùng demo paths trong sales, pilot, onboarding và internal reviews.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Demo path khác gì user flow

Trong Pack 03, **user flow** và **demo path** có liên hệ chặt nhưng không giống nhau.

User flow trả lời:
- người dùng làm việc gì;  
- theo thứ tự nghiệp vụ nào;  
- qua những states, decisions và recovery moments nào;  
- để đạt một outcome vận hành cụ thể.

Demo path trả lời:
- khi kể lại một flow cho một persona hoặc stakeholder, nên bắt đầu ở đâu;  
- nên nhấn mạnh điều gì;  
- nên bỏ bớt chi tiết nào để giữ clarity;  
- nên bridge giữa web và mobile ở khoảnh khắc nào;  
- và nên kết thúc ở outcome nào để người xem hiểu giá trị của product.

Nói cách khác, user flow là logic làm việc của hệ thống, còn demo path là logic **truyền đạt đúng giá trị của hệ thống**. Một flow tốt nhưng demo path yếu sẽ làm người xem thấy nhiều màn hình nhưng không hiểu tại sao product đáng dùng. Ngược lại, một demo path tốt phải trung thành với flow thật chứ không được bịa ra một câu chuyện “mượt” nhưng sai product reality.

## 3. Demo-story thesis cho Pack 03

Demo-story thesis của tài liệu này có thể phát biểu như sau:

> **Mỗi demo của Nextflow OS phải làm người xem hiểu rõ công việc bắt đầu từ đâu, ai nhìn thấy gì, ai quyết định gì, khi nào flow bị chặn, hệ thống giúp recovery ra sao và vì sao Web Admin cùng Mobile Ops là một hệ vận hành thống nhất; nếu demo chỉ cho thấy UI đẹp hoặc nhiều tính năng mà không làm rõ operational movement, demo đó là thất bại.**

Từ thesis này, mười nguyên lý kể chuyện được suy ra:

1. Demo phải kể theo **vấn đề vận hành và tiến trình công việc**, không theo thứ tự menu.  
2. Mỗi persona phải thấy vai trò của mình trong hệ thống trước khi thấy quá nhiều screens.  
3. Mỗi demo path nên có một outcome rõ: faster execution, better control, cleaner approval, clearer exception recovery, safer onboarding dữ liệu, hoặc tương đương.  
4. Web Admin và Mobile Ops phải được bridge như hai nửa của một câu chuyện, không phải hai mini-products riêng.  
5. States và decisions phải được nhấn ở những khoảnh khắc người xem dễ hiểu nhất.  
6. Demo phải ưu tiên wedge-first flows thay vì tham feature breadth.  
7. Không nên mở quá nhiều edge cases trong demo chính; edge cases có thể được giữ cho appendix path.  
8. Mỗi storyboard phải có opening situation, tension, system response và outcome.  
9. Người demo phải luôn biết “vì sao đang ở màn hình này” chứ không chỉ “đây là màn hình gì”.  
10. Demo path phải đủ ổn định để dùng lặp lại trong sales, pilot và onboarding mà không làm méo logic của product.

## 4. Các persona cần có demo riêng

Ở baseline Pack 03, nên có tối thiểu bốn nhóm persona cần demo paths chuyên biệt:

1. **Owner / Ops Lead / Business Operator** – người quan tâm visibility, control, bottlenecks, work movement và status truth.  
2. **Manager / Approver / Coordinator** – người quan tâm triage, decision quality, routing, blocked items và exception handling.  
3. **Frontline / Field / Execution User** – người quan tâm workload clarity, action speed, notes/evidence, help requests và return-to-work momentum.  
4. **Admin Support / Onboarding / Import-Support Persona** – người quan tâm setup readiness, data intake, import issues, correction paths và launch support.

Tùy giai đoạn, một số buyers hoặc internal stakeholders có thể muốn xem demo tổng hợp. Tuy nhiên, demo tổng hợp vẫn nên được ráp từ các persona paths chuẩn, không nên được improvise từ đầu mỗi lần.

## 5. Cấu trúc chuẩn của một demo path

Mỗi demo path trong Pack 03 nên đi theo một cấu trúc có kỷ luật để tránh lan man.

## 5.1 Opening situation

Mở bằng một tình huống công việc ngắn, cụ thể, dễ hiểu. Không mở bằng menu tree hoặc “đây là dashboard của chúng tôi”. Người xem phải hiểu một vấn đề hoặc một ngày làm việc đang bắt đầu.

## 5.2 Role lens

Nói rõ persona hiện tại là ai, họ chịu trách nhiệm gì và áp lực chính của họ là gì. Điều này giúp mọi màn hình sau đó có khung diễn giải đúng.

## 5.3 Work entry point

Cho người xem thấy nơi persona bắt đầu công việc, ví dụ persona-based landing, queue, task list hoặc import review summary. Đây là khoảnh khắc thiết lập logic surface.

## 5.4 Critical movement

Đi qua 2–4 bước chuyển động quan trọng nhất của flow, không cố show toàn bộ product. Hãy chọn các moments làm lộ rõ state changes, decision points, execution actions hoặc recovery branches.

## 5.5 Outcome

Kết bằng kết quả có meaning với persona đó: item được xử lý, queue được sạch hơn, approval được quyết đúng, exception được đẩy vào path hợp lý, dữ liệu import được cứu, hoặc frontline quay lại làm việc nhanh hơn.

## 5.6 Optional appendix path

Nếu cần, giữ các edge conditions hoặc deeper details cho nhánh appendix sau demo chính. Đừng cho appendix phá nhịp của câu chuyện chính.

## 6. Storyboard 1 – Owner / Ops Lead / Business Operator

## 6.1 Mục tiêu demo

Storyboard này phải làm persona thấy rằng Nextflow OS không chỉ là nơi “xem số liệu” mà là nơi **nhìn được công việc đang đứng ở đâu, chỗ nào nghẽn, đội nào chậm, item nào cần can thiệp và vì sao hệ thống giúp điều hành mà không cần chasing thủ công**.

## 6.2 Opening situation

Một ngày làm việc bắt đầu với nhiều công việc đang chạy, một vài item đã quá hạn, một vài item đang chờ duyệt và một số trường hợp đang bị chặn do thiếu thông tin hoặc ngoại lệ. Owner cần nhanh chóng hiểu hệ thống đang căng ở đâu trước khi quyết định can thiệp.

## 6.3 Entry point nên dùng

- Persona-based landing của Web Admin.  
- Priority queues hoặc summary zones phản ánh blocked / overdue / pending approval.  
- Một slice list hoặc work queue đại diện cho khu vực đang cần attention.

## 6.4 Những khoảnh khắc phải nhấn

1. Cách landing không chỉ là dashboard mà là **control surface**.  
2. Cách priority signals nổi lên đủ sớm.  
3. Cách owner đi từ summary sang một queue hoặc item cụ thể.  
4. Cách item state và bottleneck được nhìn như operational truth chứ không phải chỉ là cosmetic status.  
5. Cách một can thiệp trên Web Admin tạo thay đổi downstream thật.

## 6.5 Bridge nên có

Sau khi owner nhìn thấy một blocked cluster hoặc pending area, nên bridge sang flow manager/coordinator hoặc frontline để cho thấy hệ thống không dừng ở mức nhận biết vấn đề mà còn nối được tới action path hoặc recovery path.

## 6.6 Outcome nên chốt

Owner phải rời demo với cảm giác rằng hệ thống giúp họ **đi từ visibility đến can thiệp có cấu trúc**, thay vì chỉ nhìn báo cáo hoặc nhắn người khác xử lý.

## 7. Storyboard 2 – Manager / Approver / Coordinator

## 7.1 Mục tiêu demo

Storyboard này phải chứng minh rằng Nextflow OS giúp manager hoặc coordinator xử lý hàng chờ, đưa ra quyết định, điều phối ownership và giải quyết ngoại lệ với clarity tốt hơn email, chat hoặc spreadsheet chắp vá.

## 7.2 Opening situation

Một nhóm item đang chờ review: có item cần approve, có item thiếu thông tin, có item nên reassign và có item đang blocked. Manager cần triage nhanh nhưng không được quyết định mù.

## 7.3 Entry point nên dùng

- Queue hoặc review list của Web Admin.  
- Một detail view hoặc approval workspace có summary rõ.  
- Có thể mở từ landing nếu muốn cho thấy workflow continuity.

## 7.4 Những khoảnh khắc phải nhấn

1. Triage signals trên queue.  
2. Decision context gần action zone.  
3. Khác biệt giữa approve, request more info, reject hoặc reassign.  
4. Outcome preview hoặc confirmation của decision.  
5. Traceability sau khi quyết định xong.

## 7.5 Bridge nên có

Nên bridge sang Mobile Ops hoặc sang queue outcome để chứng minh quyết định của manager không nằm cô lập. Khi manager request more info hoặc reassign, người xem nên thấy item thực sự đi vào nhánh mới nào.

## 7.6 Outcome nên chốt

Manager phải rời demo với cảm giác rằng họ có thể **quyết đúng nhanh hơn, ít chasing hơn và ít nhầm hậu quả hơn** so với cách vận hành rời rạc trước đó.

## 8. Storyboard 3 – Frontline / Field / Execution User

## 8.1 Mục tiêu demo

Storyboard này phải làm người xem thấy Mobile Ops là một execution surface thật sự: vào việc nhanh, hiểu việc rõ, cập nhật nhanh, báo ngoại lệ nhanh, và quay lại công việc tiếp theo không bị mắc kẹt trong form nặng.

## 8.2 Opening situation

Người dùng frontline mở hệ thống trong bối cảnh đang phải xử lý nhiều việc liên tiếp. Họ không có thời gian đọc nhiều, không muốn bị kéo vào quy trình nhập liệu nặng và cần biết ngay việc nào làm trước, trạng thái nào đang chặn mình, action nào là bước tiếp theo.

## 8.3 Entry point nên dùng

- Persona-based landing hoặc task list trên Mobile Ops.  
- Workload list với state cues rõ.  
- Một item action screen đại diện cho flow tần suất cao.

## 8.4 Những khoảnh khắc phải nhấn

1. Workload clarity và state visibility.  
2. Dominant action trên item.  
3. Quick update hoặc complete path ngắn.  
4. Note / evidence / exception path gần action.  
5. Post-action confirmation và return-to-work logic.

## 8.5 Bridge nên có

Nên cho một khoảnh khắc item gặp ngoại lệ hoặc cần escalation để bridge ngược lên Web Admin. Điều này giúp người xem hiểu mobile không bị cô lập, và rằng help / blocked moments đi vào hệ thống có cấu trúc chứ không trôi sang chat ngoài.

## 8.6 Outcome nên chốt

Frontline phải rời demo với cảm giác rằng hệ thống giúp họ **đi nhanh hơn mà vẫn được hệ thống hiểu đúng**, không phải hy sinh tốc độ để đổi lấy tính kỷ luật dữ liệu.

## 9. Storyboard 4 – Admin Support / Onboarding / Import Support

## 9.1 Mục tiêu demo

Storyboard này phải chứng minh rằng Nextflow OS không chỉ mạnh khi đã chạy ổn định, mà còn có cách đưa dữ liệu và readiness vào hệ thống một cách có kiểm soát hơn các cách ad-hoc.

## 9.2 Opening situation

Một tenant hoặc nhóm mới cần được hỗ trợ nhập dữ liệu, xử lý lỗi import hoặc bổ sung các thông tin readiness cần thiết để khởi chạy wedge đầu. Có lỗi, có thiếu mapping, có records hợp lệ và không hợp lệ lẫn nhau.

## 9.3 Entry point nên dùng

- Import summary hoặc onboarding support workspace trên Web Admin.  
- Một import review screen có error grouping.  
- Một correction path ngắn cho validation gaps.

## 9.4 Những khoảnh khắc phải nhấn

1. Hệ thống cho thấy quy mô vấn đề trước khi lao vào sửa từng dòng.  
2. Cách nhóm lỗi hoặc validation issues giúp giảm cognitive load.  
3. Cách sửa xong thì data đi đâu tiếp.  
4. Cách valid subset và invalid subset được xử lý có trật tự.  
5. Cách readiness blockers được nhìn như operational blockers thật, không phải chi tiết setup vô danh.

## 9.5 Outcome nên chốt

Người xem phải hiểu rằng product có **đường vào dữ liệu và readiness có cấu trúc**, không phải chỉ đẹp ở phần runtime execution.

## 10. Demo bridges giữa Web Admin và Mobile Ops

Một trong những giá trị lớn nhất của Pack 03 là tính thống nhất giữa control surface và execution surface. Vì vậy demo paths không nên đứng riêng từng surface quá lâu mà nên có các bridge có chủ đích.

## 10.1 Bridge loại 1 – Control to execution

Bắt đầu từ Web Admin khi có queue, blocked area hoặc approval moment, rồi chuyển sang Mobile Ops để cho thấy frontline thực sự nhìn thấy và thực hiện phần việc liên quan như thế nào.

## 10.2 Bridge loại 2 – Execution to control

Bắt đầu từ Mobile Ops khi frontline complete, báo ngoại lệ, gửi help request hoặc thêm evidence, rồi chuyển sang Web Admin để cho thấy manager/coordinator thấy gì và xử lý ra sao.

## 10.3 Bridge loại 3 – Shared state truth

Cho người xem thấy cùng một item được hiểu nhất quán giữa hai surfaces, đặc biệt ở blocked, waiting, pending approval, overdue hoặc exception-related contexts.

## 10.4 Bridge loại 4 – Recovery loop

Chọn một trường hợp item bị thiếu info, bị blocked hoặc phải reassign, sau đó cho thấy hệ thống giúp quay về quỹ đạo qua nhiều vai trò chứ không để flow gãy thành nhắn tay.

## 11. Demo packs theo mục đích sử dụng

Để tài liệu có giá trị vận hành thật, demo paths nên được đóng gói theo mục đích thay vì chỉ theo persona thuần túy.

## 11.1 Sales demo pack

Sales demo nên thiên về **clarity of value**, dùng ít nhánh hơn, nhấn mạnh movement và role fit, tránh lạc vào cấu hình sâu hoặc edge cases kỹ thuật. Tuy nhiên, nó vẫn phải trung thành với operational truth của product.

## 11.2 Pilot demo pack

Pilot demo nên cụ thể hơn, dùng ngôn ngữ gần use case thật hơn, và mở thêm một số exception / recovery branches có liên quan tới môi trường pilot. Nó không nên hào nhoáng hơn thực tế, vì pilot là nơi trust được kiểm chứng.

## 11.3 Onboarding demo pack

Onboarding demo nên tập trung vào “đây là cách bạn bắt đầu một ngày làm việc và đây là chỗ bạn quay lại thường xuyên nhất”. Nó nên ít bán hàng hơn và nhiều orientation hơn.

## 11.4 Internal alignment pack

Internal pack dùng cho product, design, engineering, QA, support hoặc leadership nên nhấn mạnh state grammar, transitions, cross-surface coherence và launch-critical flows. Đây là nơi storyboard giúp mọi team nói cùng một product story.

## 12. Thời lượng và độ sâu khuyến nghị

## 12.1 Demo ngắn 5–7 phút

Chỉ nên dùng một persona, một path chính và tối đa một bridge. Mục tiêu là người xem hiểu giá trị lõi rất nhanh.

## 12.2 Demo tiêu chuẩn 10–15 phút

Có thể đi qua hai persona liên quan, ví dụ frontline và manager, hoặc owner và manager. Đây là độ dài tốt nhất để cho thấy Web Admin và Mobile Ops là một hệ thống chung.

## 12.3 Demo sâu 20–30 phút

Dùng cho pilot, onboarding chuyên sâu hoặc internal walkthrough. Ở đây có thể thêm import/correction path hoặc deeper exception branch, nhưng vẫn phải giữ một spine rõ ràng.

## 13. Script blocks chuẩn cho mỗi storyboard

Mỗi storyboard nên có các block script tối thiểu sau để người demo không bị nói lan man:

1. **Situation** – chuyện gì đang xảy ra.  
2. **Role** – ai đang chịu trách nhiệm lúc này.  
3. **Surface** – họ đang ở Web Admin hay Mobile Ops, và vì sao.  
4. **What they need now** – câu hỏi vận hành hiện tại là gì.  
5. **What the system shows** – hệ thống làm lộ điều gì quan trọng.  
6. **What action happens** – hành động hoặc quyết định chính là gì.  
7. **What changes next** – state, owner hoặc queue đổi ra sao.  
8. **Why this matters** – giá trị vận hành nằm ở đâu.

## 14. Anti-pattern demo nghiêm trọng phải tránh

## 14.1 Demo by navigation tour

Đi qua menu này tới menu khác mà không có problem spine sẽ khiến người xem nhớ giao diện nhưng không nhớ giá trị.

## 14.2 Demo by screen count

Nhiều màn hình không đồng nghĩa với product mạnh. Quá nhiều jumps làm người xem mất logic của câu chuyện.

## 14.3 Demo by feature laundry list

Liệt kê mọi capability một cách phẳng sẽ làm mất wedge focus và làm mờ thứ product giải quyết tốt nhất.

## 14.4 Demo without persona lens

Nếu không rõ đang kể cho ai, người xem sẽ không biết phần nào đáng quan tâm với họ.

## 14.5 Demo without state movement

Nếu demo không cho thấy item đổi state, đổi owner, đổi queue hoặc recovery path thì product sẽ trông như một lớp UI tĩnh.

## 14.6 Demo that breaks Web/Mobile relationship

Khi Web Admin và Mobile Ops được demo như hai app tách biệt, giá trị hệ thống sẽ bị giảm mạnh.

## 14.7 Demo too polished to be true

Một demo chỉ cho happy path siêu sạch nhưng né mọi blocked, waiting hoặc exception moments sẽ tạo kỳ vọng sai và làm pilot trust yếu đi.

## 15. Cách dùng tài liệu này trong vận hành thật

## 15.1 Dùng cho sales enablement

Mỗi persona storyboard nên được chuyển thành sales script rút gọn, kèm screen order, main talking points, bridge moments và “what not to over-explain”. Điều này giúp tránh tình trạng mỗi người bán demo theo một style khác hẳn nhau.

## 15.2 Dùng cho pilot preparation

Trước pilot, team nên chọn 1–2 demo paths sát use case nhất, đổi wording theo domain của khách hàng nhưng giữ nguyên logic flow, state và role-fit. Đây là cách vừa cá nhân hóa vừa không làm vỡ baseline UX story.

## 15.3 Dùng cho onboarding

Onboarding nên bắt đầu từ storyboard đúng persona của người dùng, không phải từ product tour tổng quát. Người dùng học nhanh hơn khi nhìn thấy câu chuyện “một ngày làm việc của mình” thay vì toàn bộ sản phẩm một lúc.

## 15.4 Dùng cho internal reviews

Product, design, frontend và QA có thể dùng storyboards như walkthrough scripts để kiểm tra xem implementation hiện tại còn kể được câu chuyện đúng như baseline hay không.

## 16. Governance rules cho mọi demo path mới

Mọi demo path mới nên đi qua các câu hỏi sau:

1. **Demo này đang phục vụ persona nào?**  
2. **Operational situation mở đầu có đủ thật và đủ rõ không?**  
3. **Path này có bám launch-critical flows không?**  
4. **Bridge giữa Web Admin và Mobile Ops có hợp lý không?**  
5. **Người xem có thấy movement của state, owner hoặc queue không?**  
6. **Có đang show quá nhiều screens mà không tăng hiểu biết không?**  
7. **Story này có trung thành với product reality không hay đang “tô bóng” quá mức?**  
8. **Kết thúc path có gắn với một outcome meaningful không?**

## 17. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules cho density, hierarchy và responsive clarity của Web Admin.  
2. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho offline weakness, interruption-heavy usage và recovery continuity trên Mobile Ops.  
3. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03.  
4. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness UX QA scenarios theo persona và flow.  
5. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo adoption quality, friction và execution signals.  
6. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – authority experience rules cho control-surface decisions nếu cần đào sâu phase sau.  
7. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – thư viện script ngắn cho sales, pilot và onboarding dựa trên storyboards này.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho demo paths và storyboards của Pack 03:

1. Pack 03 cần một **bộ demo paths chính thức theo persona**, không demo ngẫu hứng theo menu hoặc theo feature list.  
2. Demo paths phải được xây từ user flows thật nhưng được biên tập theo logic kể chuyện phù hợp từng người xem.  
3. Owner/Ops Lead, Manager/Approver/Coordinator, Frontline/Execution User và Admin Support/Onboarding là bốn nhóm persona tối thiểu phải có storyboard riêng.  
4. Mọi storyboard phải có opening situation, role lens, work entry, critical movement, bridge logic và meaningful outcome.  
5. Web Admin và Mobile Ops phải được demo như một hệ vận hành thống nhất, không phải hai app độc lập.  
6. Sales, pilot, onboarding và internal review có thể dùng các biến thể khác nhau của cùng một storyboard baseline.  
7. Tài liệu này là baseline để mọi hoạt động demo, walkthrough và narrative alignment giữ đúng logic sản phẩm của Pack 03.

## 19. Điều kiện hoàn thành của tài liệu

Persona-Specific Demo Paths and Storyboards được xem là đạt yêu cầu khi:
- mỗi persona chính trong wedge đầu có ít nhất một demo path rõ ràng;  
- Web Admin và Mobile Ops được nối với nhau bằng các bridge có chủ đích;  
- các team sales, pilot, onboarding, product và design có thể dùng chung một product story nhất quán;  
- và demo không còn phụ thuộc vào trí nhớ cá nhân hoặc gu kể chuyện ngẫu hứng của từng người trình bày.

## AG Execution Prompt

You are acting as a senior product storyteller, demo-experience architect, pilot enablement strategist, and UX narrative systems lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: strategy, screen taxonomy, user flows, state grammar, input patterns, wireframes, governance, Mobile component behavior, and Web decision-input patterns are already defined.
- This document defines official persona-specific demo paths and storyboards.

### Objective
Refine this Persona-Specific Demo Paths and Storyboards document into a production-grade narrative baseline that can guide sales demos, pilot walkthroughs, onboarding demos, internal reviews, and cross-functional story alignment without distorting the real product logic.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between control and execution surfaces and the wedge-first launch focus.
- Keep the output concrete enough for repeatable real-world demo use.

### Tasks
1. Rewrite the demo-story thesis into a sharper executive form.
2. Produce a persona-demo register covering owner/ops lead, manager/approver, frontline/execution, and onboarding/import-support personas.
3. Define a standard demo-path structure with opening situation, role lens, work entry, critical movement, bridge moments, and outcome.
4. Add storyboard guidance for bridging Web Admin and Mobile Ops in ways that show state truth and operational movement.
5. Identify the top five demo failures that would cause users or buyers to misunderstand the product.
6. Recommend the next documents that should operationalize this baseline into responsive rules, copy systems, QA walkthroughs, and script libraries.
7. Add governance rules to prevent menu-tour demos, feature-laundry-list demos, and misleadingly polished happy-path demos.

### Constraints
- Do not turn demos into generic feature tours.  
- Do not let demo storytelling break product truth.  
- Do not separate Web Admin and Mobile Ops into unrelated stories.  
- Do not over-index on edge cases in the main path.  
- Keep the output concrete enough for repeatable use by non-design teams.

### Output Format
Return a revised markdown document with these sections:
1. Executive Demo Thesis
2. Persona Demo Register
3. Standard Demo Path Structure
4. Storyboards by Persona
5. Demo Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make persona-specific demo paths explicit and reusable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams tell the product story with better role-fit, clearer operational movement, and stronger cross-surface coherence.
- The output must reduce ambiguity around what to show, when to bridge surfaces, and how to end demos with meaningful outcomes.
