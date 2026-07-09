# Nextflow OS – Empty States, Errors, and Recovery Messages

**Document ID:** 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Writing / Product Management  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **grammar chính thức cho empty states, error states, validation messages, retry guidance và recovery messaging** trong Nextflow OS cho Pack 03. Nếu các tài liệu trước đã chốt user flows, state grammar, UX guardrails, input patterns và wireframe blueprints cho cả Web Admin lẫn Mobile Ops, thì tài liệu này khóa lớp ngôn ngữ vận hành cuối cùng nhưng cực kỳ ảnh hưởng tới cảm nhận sử dụng thật:

> **Khi hệ thống không có dữ liệu để hiển thị, khi một thao tác không thành công, khi người dùng nhập thiếu hoặc nhập sai, khi item bị blocked, khi network chậm, khi quyền không đủ, hoặc khi một bước cần được sửa để flow tiếp tục, hệ thống phải nói gì, nói ngắn thế nào, nói ở đâu, và dẫn người dùng hồi phục ra sao để họ không mất niềm tin hoặc rời khỏi luồng làm việc?**

Trong một SME Business OS, messaging ở các khoảnh khắc xấu quan trọng không kém messaging ở happy path. Một empty state mơ hồ làm người dùng nghi ngờ hệ thống có lỗi. Một error message chung chung làm người dùng không biết phải làm gì. Một validation message đến quá muộn làm họ bực. Một recovery message yếu làm họ quay ra chat hoặc gọi điện. Nói cách khác, **nếu status grammar giúp người dùng hiểu hệ thống đang ở đâu, thì error/recovery grammar giúp họ hiểu phải quay lại quỹ đạo bằng cách nào**.

Tài liệu này phải khóa mười hai thứ:
1. Vai trò của empty/error/recovery messaging trong Nextflow OS.  
2. Các loại empty states chính thức của phase đầu.  
3. Các loại errors và failure moments chính thức.  
4. Các nguyên tắc viết validation messages.  
5. Các nguyên tắc viết error messages trên web và mobile.  
6. Các nguyên tắc viết retry guidance và recovery guidance.  
7. Các nguyên tắc viết blocked / waiting / approval-needed explanations.  
8. Các nguyên tắc placement cho inline messages, banners, toasts, sheets và full-state screens.  
9. Những anti-pattern messaging nghiêm trọng phải tránh.  
10. Cách Pack 03 nên chuẩn hóa microcopy và message tokens.  
11. Cách QA nên review messaging quality.  
12. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Messaging trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, empty/error/recovery messaging không chỉ là copywriting. Nó là **một phần của operating model UX**. Khi người dùng đọc một message, họ không chỉ cần “hiểu câu chữ” mà còn cần hiểu:
- chuyện gì đang xảy ra;  
- điều gì không xảy ra như mong đợi;  
- việc này có nghiêm trọng hay không;  
- tôi nên làm gì tiếp theo;  
- và sau khi tôi làm điều đó thì item hay phiên làm việc của tôi sẽ đi đâu.

Điều này có nghĩa là messaging phải vừa làm chức năng giải thích, vừa làm chức năng định hướng, vừa làm chức năng khôi phục niềm tin. Nếu product chỉ coi messages như lớp chữ gắn vào component, toàn bộ recovery UX sẽ yếu đi rõ rệt.

## 3. Messaging thesis cho Pack 03

Messaging thesis của tài liệu này có thể phát biểu như sau:

> **Mọi empty state, error state và recovery message trong Nextflow OS phải giúp người dùng hiểu nguyên nhân gần đúng, mức ảnh hưởng hiện tại và bước hồi phục gần nhất bằng ngôn ngữ công việc ngắn, rõ, không đổ lỗi và không buộc họ tự suy luận điều hệ thống lẽ ra phải nói.**

Từ thesis này, chín nguyên lý messaging được suy ra:

1. Message phải ưu tiên **clarity over cleverness**.  
2. Message phải viết theo **ngôn ngữ công việc**, không theo jargon kỹ thuật.  
3. Empty states phải giải thích **vì sao trống** thay vì chỉ nói “không có dữ liệu”.  
4. Validation errors phải gần field hoặc gần action đã gây lỗi nhất có thể.  
5. Error messages phải nói **impact** và **next step**, không chỉ nói fail.  
6. Recovery guidance phải ngắn nhưng có tính hành động.  
7. Web và Mobile có thể khác độ dài, nhưng không được khác semantics.  
8. Người dùng không được bị đổ lỗi cho lỗi hệ thống hoặc lỗi context mà họ không kiểm soát.  
9. Messages phase đầu phải được chuẩn hóa vừa đủ để tạo consistency mà không làm copy trở nên robot quá mức.

## 4. Phân loại empty states chính thức

Pack 03 nên phân biệt ít nhất sáu loại empty states khác nhau. Đây là điểm rất quan trọng vì “trống” không phải lúc nào cũng mang cùng ý nghĩa.

1. **No work yet** – chưa có item thực sự để làm.  
2. **No results for current filter** – có dữ liệu nhưng filter/view hiện tại không khớp.  
3. **Nothing assigned to you** – workload hiện không được giao cho user này.  
4. **No recent history / no notes / no evidence yet** – vùng phụ chưa có dữ liệu bổ trợ.  
5. **No approvals pending** – inbox/approval queue trống theo nghĩa tích cực.  
6. **Data not available yet / loading completed with no usable content** – dữ liệu chưa sẵn hoặc response rỗng theo ngữ cảnh đặc biệt.

Từng loại này phải có wording và treatment khác nhau. Không thể dùng một câu “No data” cho tất cả.

## 5. Quy tắc cho empty states

## 5.1 Empty states phải trả lời “tại sao trống”

Một empty state tốt nên giúp user hiểu đây là do:
- chưa có gì phát sinh;  
- filter đang quá hẹp;  
- chưa được assign;  
- hay một vùng dữ liệu phụ chưa có nội dung.

## 5.2 Empty states phải giữ được tone phù hợp

Không phải empty state nào cũng là vấn đề. “No approvals pending” có thể là tín hiệu tích cực. “No work assigned” có thể trung tính. “No results for current filter” là một tín hiệu cần điều chỉnh view chứ không phải thất bại.

## 5.3 Empty states nên có recovery/action khi hợp lý

Nếu empty state có thể được xử lý bằng một bước gần như Clear filters, Refresh, Go to My Work, View all items, Check another queue hoặc Start setup correction, message nên gợi ý điều đó.

## 5.4 Empty states không nên quá hài hước hoặc quá marketing

Với sản phẩm vận hành, người dùng đang làm việc thật. Empty state nên hữu ích hơn là “dễ thương”.

## 6. Phân loại errors và failure moments chính thức

Pack 03 nên phân biệt rõ các loại failure moments sau để message semantics không bị trộn lẫn.

1. **Field validation errors** – thiếu field bắt buộc, format sai, value ngoài phạm vi.  
2. **Action validation errors** – chưa thể complete action vì state, quyền hoặc prerequisite chưa đủ.  
3. **Network / submission failures** – gửi request không thành công hoặc response không ổn định.  
4. **Permission / access failures** – user không có quyền phù hợp cho action hoặc view.  
5. **Conflict / stale-state failures** – item đã đổi trạng thái hoặc context không còn mới.  
6. **Import / data validation failures** – lỗi ở onboarding/import/correction flows.  
7. **System unavailable / partial outage messages** – hệ thống hoặc phần nào đó tạm thời không dùng được.  
8. **Business-rule refusal messages** – hành động bị từ chối vì rule nghiệp vụ hoặc policy boundary.

## 7. Quy tắc cho validation messages

## 7.1 Validation phải càng gần nguồn lỗi càng tốt

Nếu người dùng bỏ trống một field, message tốt nhất là inline gần field đó. Nếu một action thiếu prerequisite tổng thể, message có thể nằm gần action zone.

## 7.2 Validation phải chỉ đúng cái thiếu hoặc sai

Các câu như “Invalid input” hoặc “Please check your form” quá yếu. Tốt hơn là “Add a reason before sending for approval” hoặc “Completion proof is required to mark this item complete” khi phù hợp.

## 7.3 Validation nên ưu tiên hướng dẫn hơn phán xét

Nội dung nên nói cần làm gì để đi tiếp, thay vì chỉ phán rằng người dùng đã làm sai.

## 7.4 Validation severity phải đúng mức

Nếu chỉ là recommended info, message không nên mang tone blocking error. Nếu là hard blocker, UI và message phải làm rõ điều đó.

## 7.5 Validation không được làm mất công nhập liệu

Khi validation lỗi, user phải còn giữ được các selections, note hoặc evidence đã nhập trước đó ở mức hợp lý.

## 8. Quy tắc cho action error messages

## 8.1 Action error phải nói action nào không thành công

Thay vì “Something went wrong”, tốt hơn là “Could not mark this item complete” hoặc “Could not send this request for approval” vì nó gắn lỗi với hành động thực.

## 8.2 Action error phải nói mức ảnh hưởng hiện tại

Người dùng cần biết item có còn ở trạng thái cũ không, dữ liệu có thể chưa được lưu không, hay chỉ một phần của thao tác chưa thành công.

## 8.3 Action error phải nói bước hồi phục gần nhất

Ví dụ:
- Retry now.  
- Add missing info.  
- Refresh this item.  
- Ask a manager with the right permission.  
- Reopen from My Work and try again.

## 8.4 Không đổ lỗi mù mờ cho hệ thống hoặc người dùng

Những câu như “Unexpected error” chỉ nên là fallback cuối cùng. Hệ thống phải cố hết sức nói lỗi ở mức meaning gần với bối cảnh công việc.

## 9. Quy tắc cho network, timeout và retry messages

## 9.1 Network messages phải trấn an trước

Khi phù hợp, message nên làm rõ rằng thao tác có thể chưa được ghi nhận và user chưa nên giả định item đã cập nhật thành công.

## 9.2 Retry messages phải nói retry cái gì

“Try again” quá chung nếu user không rõ đang gửi note, hoàn tất item hay attach evidence. Cần gắn retry với action cụ thể.

## 9.3 Nếu dữ liệu được giữ lại, phải nói rõ

Một câu như “Your note is still here” hoặc “Your selections were kept” có giá trị lớn cho trust, nhất là trên mobile.

## 9.4 Nếu cần refresh vì stale state, phải giải thích ngắn

Ví dụ “This item changed while you were viewing it. Refresh to see the latest status.” rõ hơn nhiều so với “Conflict error”.

## 10. Quy tắc cho permission và access messages

## 10.1 Quyền không đủ phải được diễn đạt theo action

Thay vì “Forbidden”, message nên nói “You can view this item, but only managers can approve it” hoặc “You need branch-admin access to edit this mapping” khi phù hợp.

## 10.2 Permission messages nên tránh tone trừng phạt

Thiếu quyền không đồng nghĩa user làm sai. Messaging nên mang tính định hướng và boundary clarity.

## 10.3 Nếu có con đường thay thế, nên nói rõ

Ví dụ yêu cầu manager review, quay lại queue, hoặc gửi item sang authority phù hợp.

## 11. Quy tắc cho conflict / stale-state messages

## 11.1 Người dùng phải hiểu item đã thay đổi từ lúc họ mở nó

Đây là loại message rất quan trọng trong operating systems. User cần hiểu vì sao action vừa rồi không còn hợp lệ.

## 11.2 Message phải nối lại vào state truth mới

Không chỉ nói xung đột; message nên chỉ ra item đang chờ approval, đã được người khác nhận, đã complete hoặc đã chuyển queue nếu biết ở mức phù hợp.

## 11.3 Recovery path phải đơn giản

Thường là Refresh, Reopen, Review latest status hoặc Go back to queue. Không nên viết giải thích dài dòng về concurrency nếu user không cần.

## 12. Quy tắc cho blocked / waiting / approval-needed explanations

## 12.1 Messages phải phân biệt ba meaning khác nhau

- **Blocked**: không thể đi tiếp nếu chưa giải quyết trở ngại.  
- **Waiting**: đang chờ bước, người hoặc thông tin khác.  
- **Pending approval**: đang chờ quyết định có thẩm quyền.

## 12.2 Explanation nên trả lời “đang chờ gì hoặc ai”

Ví dụ “Waiting for branch confirmation”, “Blocked: missing delivery photo”, “Pending approval from area manager”. Những cách nói này giúp user follow-up đúng hướng.

## 12.3 Nếu user không phải next owner, message phải nói điều đó

Điều này giúp tránh việc user cố làm tiếp thứ không thuộc quyền hoặc không còn thuộc lượt mình.

## 13. Placement policy cho messages

## 13.1 Inline field messages

Dùng cho validation errors hoặc helper guidance gắn trực tiếp với một field cụ thể. Đây là loại placement ưu tiên khi lỗi thuộc về input cục bộ.

## 13.2 Inline action-region messages

Dùng cho action blockers, reasoning-required warnings hoặc update failures gắn với một action zone cụ thể.

## 13.3 Banners

Dùng cho page-level states như blocked context tổng quát, permission scope, stale state cần refresh hoặc imported-data warnings. Banners phải đủ nổi nhưng không nuốt nhiệm vụ chính của màn hình.

## 13.4 Toasts

Chỉ nên dùng cho feedback ngắn, ít mơ hồ và không cần đọc lâu. Toasts không phù hợp cho các lỗi cần recovery reasoning dài hoặc bước tiếp theo phức tạp.

## 13.5 Empty-state panels / full-state screens

Dùng khi cả vùng hoặc cả screen không có nội dung hữu ích. Panel hoặc full-state phải giải thích đủ ngữ cảnh của sự trống đó.

## 13.6 Sheets / modals for recovery

Chỉ nên dùng khi recovery đòi xác nhận hoặc input ngắn rất gần action. Không nên dùng modal như nơi nhét toàn bộ giải thích dài dòng cho mọi lỗi.

## 14. Message structure templates cho phase đầu

Pack 03 nên chuẩn hóa một số cấu trúc câu đủ đơn giản để tạo consistency.

## 14.1 Empty state template

**[Why it is empty] + [optional next step]**

Ví dụ logic:
- No items match this filter. Clear filters to see all open work.  
- Nothing is assigned to you right now. Refresh or check back later.

## 14.2 Validation template

**[What is missing or wrong] + [what to do]**

Ví dụ logic:
- Add a reason before sending this for approval.  
- Completion proof is required to mark this item complete.

## 14.3 Action error template

**[Action failed] + [current impact] + [nearest recovery step]**

Ví dụ logic:
- Could not complete this item. It is still in progress. Try again after adding the required proof.

## 14.4 Stale-state template

**[Item changed] + [what changed or may have changed] + [refresh/reopen step]**

Ví dụ logic:
- This item changed while you were viewing it. Refresh to see the latest status before taking another action.

## 14.5 Permission template

**[Boundary] + [who can do it] + [what you can do next]**

Ví dụ logic:
- Only managers can approve this item. Send it for review or return to the queue.

## 15. Web vs Mobile messaging rules

## 15.1 Web có thể chứa thêm context, nhưng không nên dài dòng

Trên Web Admin, người dùng có thể chịu thêm một chút giải thích, nhất là với approval, import validation hoặc recovery states. Tuy nhiên message vẫn phải ngắn và hành động được.

## 15.2 Mobile phải ngắn hơn nhưng không mơ hồ hơn

Trên Mobile Ops, copy thường phải ngắn hơn, nhưng vẫn phải giữ đủ semantics về state, impact và next step.

## 15.3 Cross-surface consistency là bắt buộc

Nếu blocked trên web được giải thích là thiếu proof, mobile không nên gọi đó là generic failure hoặc under review nếu semantics thực không đổi.

## 16. Tone and voice rules cho failure moments

## 16.1 Bình tĩnh, rõ, không đổ lỗi

Message nên có giọng bình tĩnh, thực tế và hướng giải quyết. Không nên mang cảm giác trách móc user.

## 16.2 Không dùng corporate fog

Các câu như “Your request could not be processed at this time” thường yếu hơn nhiều so với câu gắn vào action thật.

## 16.3 Không dùng kỹ thuật ngữ khi user không cần

Người dùng không cần biết timeout code, server exception hay conflict ID trừ khi có value vận hành thực sự.

## 16.4 Không quá thân mật hoặc đùa cợt

Những khoảnh khắc thất bại hoặc blocked không phải nơi để copy “dễ thương”. Tin cậy và rõ ràng quan trọng hơn cá tính hóa quá mức.

## 17. Anti-patterns messaging nghiêm trọng phải tránh

## 17.1 “No data” cho mọi tình huống trống

Đây là anti-pattern lớn vì nó xóa mất nghĩa vận hành của từng empty state.

## 17.2 “Something went wrong” without context

Generic error không cho biết action nào fail, impact là gì hay nên làm gì tiếp.

## 17.3 Validation đến muộn và mơ hồ

User submit xong mới bị chặn bởi một lỗi lẽ ra có thể biết sớm hơn là trải nghiệm rất tệ.

## 17.4 Đổ lỗi cho người dùng khi system/context gây lỗi

Ví dụ item đã stale hoặc quyền không đủ nhưng message khiến user cảm giác mình làm sai là rất hại trust.

## 17.5 Toast-only recovery

Nếu lỗi cần người dùng hiểu và phục hồi, chỉ toast ngắn là không đủ.

## 17.6 Recovery message không nói outcome của recovery

Nếu user refresh, retry hoặc send for approval mà không hiểu việc đó sẽ làm gì, message vẫn còn nửa vời.

## 18. Message-token standardization cho Pack 03

Để tránh copy drift giữa teams, Pack 03 nên chuẩn hóa một số token hoặc wording families.

## 18.1 Action verbs nhất quán

Ví dụ dùng nhất quán các từ như Assign, Reassign, Complete, Request Info, Request Approval, Mark Blocked, Retry, Refresh, Reopen.

## 18.2 State words nhất quán

Các từ Blocked, Waiting, Pending Approval, In Progress, Completed, Overdue, Rejected nên được dùng cùng nghĩa xuyên messages và status labels.

## 18.3 Role words nhất quán

Nếu hệ thống dùng manager, supervisor, operator, branch admin hay back office thì messages nên dùng cùng family thuật ngữ đó thay vì thay đổi lung tung.

## 18.4 Scope words nhất quán

Queue, branch, team, item, work, approval, proof, note, mapping, import run cũng nên được dùng ổn định để người dùng học một lần.

## 19. QA heuristics cho messaging review

QA cho Pack 03 không nên chỉ kiểm tra message có hiện hay không. QA nên kiểm tra chất lượng semantics của message.

## 19.1 Bộ câu hỏi QA

1. Message có nói rõ chuyện gì xảy ra không?  
2. Message có đúng với state truth và action truth không?  
3. Message có nói impact hiện tại không?  
4. Message có nói next step gần nhất không?  
5. Placement của message có gần nguồn vấn đề không?  
6. User có bị mất dữ liệu hay mất orientation sau message không?  
7. Web và Mobile có giữ cùng semantics không?  
8. Message có dùng jargon kỹ thuật không cần thiết không?

## 19.2 Tình huống QA bắt buộc

- Empty states theo từng loại trống khác nhau.  
- Validation failures trên mobile inputs và web decision inputs.  
- Network fail trong quick updates.  
- Permission boundary cases.  
- Stale-state conflicts.  
- Recovery after blocked / request info / approval-needed moments.  
- Import validation errors và correction paths.

## 20. Governance rules cho mọi message mới

Mọi message mới trong Pack 03 nên đi qua các câu hỏi sau:

1. **Message này đang giải thích loại moment nào: empty, validation, error, blocked, stale, permission hay recovery?**  
2. **Người dùng cần biết nguyên nhân gần đúng nào?**  
3. **Mức ảnh hưởng hiện tại là gì?**  
4. **Bước hồi phục gần nhất là gì?**  
5. **Placement nào gần nguồn vấn đề nhất?**  
6. **Message này có dùng ngôn ngữ công việc hay đang rơi vào jargon kỹ thuật?**  
7. **Web và Mobile có đang nói cùng một meaning không?**  
8. **Nếu người dùng chỉ đọc một lần rất nhanh, họ có biết phải làm gì tiếp theo không?**

## 21. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance mechanism cho toàn Pack 03.  
2. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules cho mobile execution patterns.  
3. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – form và decision-input patterns cho Web Admin.  
4. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona cho sales, pilot và onboarding.  
5. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules về density và responsive states cho Web Admin.  
6. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho interruption-heavy mobile usage.  
7. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing rules cấp hệ thống cho toàn Pack 03.

## 22. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho empty states, errors và recovery messaging:

1. Nextflow OS phải phân biệt rõ nhiều loại empty state thay vì dùng một thông điệp “No data” chung chung.  
2. Error messages phải gắn với action thật, impact thật và next step gần nhất.  
3. Validation messages phải gần nguồn lỗi, nói rõ cái thiếu hoặc sai và không làm mất công nhập liệu.  
4. Blocked, Waiting và Pending Approval explanations phải giữ semantics riêng.  
5. Web và Mobile có thể khác độ dài nhưng không được khác meaning.  
6. Toasts không đủ cho mọi lỗi; placement phải phù hợp với mức ảnh hưởng và độ dài recovery reasoning.  
7. Pack 03 phải chuẩn hóa message templates và wording families đủ mạnh để tránh copy drift.

## 23. Điều kiện hoàn thành của tài liệu

Empty States, Errors, and Recovery Messages được xem là đạt yêu cầu khi:
- team Product, UX Writing, Frontend và QA có cùng grammar cho failure và emptiness moments;  
- các launch-critical flows đã có baseline messaging đủ rõ để đi vào implementation và test scenarios;  
- users có thể hiểu empty/error/recovery moments mà không cần tự suy diễn quá nhiều;  
- và consistency giữa Web Admin và Mobile Ops đã được giữ ở level semantics.

## AG Execution Prompt

You are acting as a senior UX writer, operational microcopy strategist, and recovery-experience designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: user flows, state grammar, UX guardrails, input patterns, and wireframe blueprints are already defined for Web Admin and Mobile Ops.
- This document defines the official grammar for empty states, errors, validation messages, retry guidance, and recovery messages.

### Objective
Refine this Empty States, Errors, and Recovery Messages document into a production-grade messaging baseline that can guide UX writing, frontend implementation, QA validation, state messaging consistency, and recovery quality across Pack 03.

### Inputs
- Use this document plus First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Data Entry and Evidence Capture Patterns, Web Admin Wireframe Blueprints, and Mobile Ops Wireframe Blueprints as the primary source of truth.
- Preserve the distinction between control and execution contexts and the wedge-first launch scope.
- Keep the output concrete enough for message libraries, component implementation, and QA scenario design.

### Tasks
1. Rewrite the messaging thesis into a sharper executive form.
2. Produce a message-type register for empty states, validation errors, action errors, network failures, stale-state conflicts, permission messages, and recovery prompts.
3. Add message structure templates with rationale and placement guidance.
4. Define launch-phase rules for tone, verbosity, token consistency, and cross-surface semantics.
5. Identify the top five messaging failures that would damage trust or usability.
6. Recommend the next documents that should operationalize this baseline into copy systems, component rules, and QA checklists.
7. Add governance rules to prevent generic-error drift, no-data drift, and technical-jargon drift.

### Constraints
- Do not use generic messages when the system knows more context.  
- Do not let empty states erase operational meaning.  
- Do not blame users for state conflicts, permission limits, or system instability they do not control.  
- Do not rely on toasts alone for recovery-heavy situations.  
- Keep the output concrete enough for downstream implementation.

### Output Format
Return a revised markdown document with these sections:
1. Executive Messaging Thesis
2. Message-Type Register
3. Message Structure Templates
4. Tone and Consistency Rules
5. Messaging Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make empty-state, error, and recovery messaging explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams write messages that preserve trust, clarity, and recovery momentum.
- The output must reduce ambiguity around emptiness, validation, failed actions, stale state, permission limits, and recovery guidance.
