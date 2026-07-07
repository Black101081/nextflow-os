# Nextflow OS – Data Entry and Evidence Capture Patterns

**Document ID:** 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Systems / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY

## 1. Mục tiêu tài liệu

Tài liệu này xác định **các pattern chính thức cho data entry, notes, evidence capture và exception-related input** trong Nextflow OS. Nếu Mobile Ops Experience Strategy đã chốt rằng execution surface phải giúp người dùng hành động nhanh với ma sát thấp, First Wedge User Flows đã chốt các operational journeys launch-critical, State and Status Presentation Rules đã chốt cách hệ thống biểu đạt trạng thái, UX Guardrails đã chốt các luật nền về interaction, và Mobile Ops Screen Taxonomy đã chốt các loại màn hình mobile chính thức, thì tài liệu này đi vào một lớp quyết định trực tiếp adoption thật:

> **Khi người dùng phải nhập dữ liệu, xác nhận một bước, thêm ghi chú, chụp bằng chứng, báo ngoại lệ hoặc gửi thông tin bổ sung, trải nghiệm phải được thiết kế theo pattern nào để họ thực sự làm trong đời thực — nhanh, rõ, ít lỗi và vẫn đủ có cấu trúc để hệ thống giữ được operational truth?**

Đây là tài liệu rất quan trọng vì trong các sản phẩm vận hành, nhiều flow nhìn ổn trên sơ đồ nhưng gãy ngay tại điểm nhập liệu. Chỉ cần một action thường xuyên trở nên quá dài, một form quá nhiều field, một bước upload evidence quá nặng, một message lỗi quá mơ hồ hoặc một flow note quá tự do không gắn với state change, người dùng sẽ quay lại chat, gọi điện hoặc ghi ra ngoài. Một execution surface mạnh chỉ tồn tại khi **data entry friction thấp hơn đáng kể so với ma sát của cách làm cũ**.

Tài liệu này phải khóa mười hai thứ:
1. Vai trò của data entry patterns trong Nextflow OS.  
2. Phân loại các loại input moments khác nhau.  
3. Pattern cho quick status updates.  
4. Pattern cho structured note entry.  
5. Pattern cho evidence capture.  
6. Pattern cho exception / blocked / needs-info reporting.  
7. Pattern cho approvals-related input yêu cầu reasoning.  
8. Quy tắc giảm typing và giảm field burden.  
9. Quy tắc validation, error handling và retry behavior.  
10. Quy tắc giữ item context trong suốt input flow.  
11. Những anti-pattern nghiêm trọng về data entry phải tránh.  
12. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Data entry trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, data entry không chỉ là việc người dùng nhập dữ liệu vào form. Nó là **khoảnh khắc chuyển hóa hành động thực tế thành sự thật có cấu trúc trong hệ thống**. Khi operator đánh dấu hoàn tất, khi supervisor yêu cầu thêm thông tin, khi người dùng chụp một bằng chứng, khi manager ghi lý do override hoặc khi một item bị báo blocked, tất cả những khoảnh khắc đó đều là data entry moments.

Điều này có nghĩa là data entry trong Nextflow OS phải được nhìn qua bốn lăng kính cùng lúc:
- **Outcome lens** – người dùng đang cố hoàn thành điều gì.  
- **Truth lens** – thông tin nào cần được hệ thống giữ lại có cấu trúc.  
- **Usability lens** – nhập thế nào để người dùng chịu làm thật.  
- **Flow lens** – input này sẽ đẩy item đi đâu tiếp theo.

Nếu chỉ nhìn data entry như một form problem, product sẽ tạo ra UI nhập liệu đúng về mặt kỹ thuật nhưng sai về mặt vận hành.

## 3. Data-entry thesis cho Pack 03

Data-entry thesis của Pack 03 có thể phát biểu như sau:

> **Mọi input flow trong Nextflow OS phải thu được đúng lượng thông tin tối thiểu cần thiết để duy trì operational truth và ra quyết định đúng, nhưng không được đòi người dùng mang gánh nặng nhập liệu lớn hơn giá trị họ nhận thấy từ việc hoàn thành công việc.**

Từ thesis này, chín nguyên lý nền được suy ra:

1. Ưu tiên **minimum sufficient input** hơn là “thu càng nhiều càng tốt”.  
2. Tách rõ **high-frequency input** và **high-impact input** vì chúng cần patterns khác nhau.  
3. Giảm typing khi có thể thay bằng selections, defaults, toggles hoặc short prompts.  
4. Input phải luôn gắn với **item context** và **expected outcome**.  
5. Evidence chỉ nên được yêu cầu khi nó có giá trị flow, approval, traceability hoặc recovery thật.  
6. Notes nên có cấu trúc vừa đủ, không hoàn toàn free-form nếu điều đó làm hệ thống khó dùng lại thông tin.  
7. Error handling phải bảo vệ công sức nhập liệu của người dùng.  
8. Mobile input patterns phải tôn trọng thực tế thiết bị, thời gian và sự phân mảnh chú ý.  
9. Input UX không được âm thầm phát minh business steps hoặc hidden state transitions.

## 4. Phân loại các input moments chính thức

Để tránh mỗi team nghĩ input theo cách khác nhau, Pack 03 nên phân loại các input moments của wedge đầu thành sáu families chính thức.

1. **Quick status input moments** – cập nhật trạng thái nhanh và lặp thường xuyên.  
2. **Structured note input moments** – thêm thông tin ngắn có cấu trúc vừa đủ.  
3. **Evidence capture moments** – ảnh, file, proof hoặc xác nhận đi kèm item.  
4. **Exception reporting moments** – blocked, needs help, needs info, needs approval.  
5. **Decision reasoning moments** – approve, reject, override, request more info với reasoning phù hợp.  
6. **Correction and recovery moments** – sửa thông tin lỗi, retry, bổ sung dữ liệu còn thiếu.

Mỗi family cần pattern riêng vì tần suất, mức rủi ro, mức ngữ cảnh và mức kỳ vọng của người dùng khác nhau rất mạnh.

## 5. Pattern family 1 – Quick status update patterns

## 5.1 Khi nào dùng

Pattern này dùng cho các khoảnh khắc người dùng chỉ cần xác nhận một thay đổi trạng thái đơn giản như bắt đầu xử lý, đánh dấu xong, chuyển sang waiting, hoặc cập nhật bước nhỏ trong flow.

## 5.2 Mục tiêu

- Cực ít bước.  
- Rõ outcome.  
- Không đòi thông tin thừa.  
- Trả item về flow đúng ngay sau action.

## 5.3 Pattern shape ưu tiên

- Một action chính rõ.  
- Nếu cần thêm input thì chỉ là một hoặc vài trường rất ngắn.  
- Confirmation có thể inline hoặc lightweight thay vì modal nặng, trừ khi action rủi ro cao.  
- Feedback sau submit phải chỉ rõ trạng thái mới hoặc queue mới.

## 5.4 Khi không nên dùng

Không nên dùng quick pattern cho các actions cần reasoning sâu, cần nhiều evidence hoặc có hậu quả điều hành lớn như reject/override phức tạp.

## 5.5 Ví dụ áp dụng

- Mark In Progress.  
- Mark Completed.  
- Confirm step done.  
- Send back to waiting state với một reason ngắn nếu policy cho phép.

## 5.6 Luật thiết kế

- Một màn hình hoặc sheet quick update không nên có quá một quyết định chính.  
- Nếu người dùng phải nhập quá ba trường ngắn, pattern có thể đã không còn là quick update nữa.  
- Thành công phải trả lời “đã ghi nhận chưa” và “item đi đâu tiếp theo”.

## 6. Pattern family 2 – Structured note entry patterns

## 6.1 Khi nào dùng

Pattern này dùng khi người dùng cần để lại ngữ cảnh ngắn giúp người khác hiểu item, giúp approval nhanh hơn hoặc giúp trace review dễ hơn.

## 6.2 Mục tiêu

- Cho phép ghi chú nhanh.  
- Vẫn giữ đủ cấu trúc để note có ích về sau.  
- Không biến note thành nơi thay thế state transition hoặc action chính.

## 6.3 Pattern shape ưu tiên

- Text area ngắn hoặc short prompt.  
- Có thể có reason presets hoặc note categories khi thật sự hữu ích.  
- Hiển thị rõ note đang gắn với item nào và action nào.  
- Có preview hoặc confirmation sau khi lưu.

## 6.4 Khi không nên dùng

Không nên lạm dụng notes để người dùng mô tả những thứ lẽ ra phải được capture qua state, selection hoặc structured action. “Ghi chú cho đủ” không thay thế được model đúng.

## 6.5 Ví dụ áp dụng

- Add handoff note.  
- Add completion note.  
- Add short context before request approval.  
- Add clarification after missing-info prompt.

## 6.6 Luật thiết kế

- Nếu cùng một loại note lặp đi lặp lại, nên cân nhắc thêm presets hoặc structured prompt.  
- Notes trên mobile nên ưu tiên ngắn, rõ và task-attached.  
- Notes không nên là điều kiện bắt buộc cho mọi action nếu không có giá trị rõ.

## 7. Pattern family 3 – Evidence capture patterns

## 7.1 Khi nào dùng

Pattern này dùng khi một hành động cần bằng chứng trực quan, file, xác nhận hoặc proof để hỗ trợ completion, approval, dispute review hoặc traceability.

## 7.2 Mục tiêu

- Thu evidence đủ tin cậy.  
- Giảm tối đa friction của capture/upload.  
- Giữ bằng chứng gắn đúng item, đúng thời điểm, đúng action.

## 7.3 Pattern shape ưu tiên

- Entry point evidence luôn nằm gần action đang thực hiện.  
- Capture flow ngắn, ít context switching.  
- Có preview hoặc confirmation cho thấy evidence đã gắn thành công.  
- Có wording rõ về vì sao bằng chứng đang được yêu cầu nếu điều đó không tự hiển nhiên.

## 7.4 Khi không nên dùng

Không nên yêu cầu evidence như một phản xạ mặc định cho mọi update nhỏ. Evidence chỉ nên bắt buộc khi thiếu nó sẽ làm flow kém tin cậy đáng kể hoặc gây rủi ro vận hành rõ ràng.

## 7.5 Ví dụ áp dụng

- Completion proof for a field task.  
- Supporting image before marking issue resolved.  
- Evidence for out-of-policy approval request.  
- Attachment for dispute-sensitive closure.

## 7.6 Luật thiết kế

- Nếu evidence là required, hệ thống phải nói rõ required vì điều gì.  
- Evidence flow không nên làm mất action context ban đầu.  
- Nếu upload lỗi, người dùng không được mất toàn bộ phần mô tả hoặc state lựa chọn vừa nhập.

## 8. Pattern family 4 – Exception / blocked / needs-info reporting patterns

## 8.1 Khi nào dùng

Pattern này dùng khi người dùng không thể đi tiếp theo happy path và cần báo lý do ngắn gọn để đưa item vào recovery flow đúng.

## 8.2 Mục tiêu

- Báo ngoại lệ nhanh hơn hoặc ít nhất cũng nhẹ hơn việc nhắn tin ngoài hệ thống.  
- Làm rõ loại vấn đề.  
- Ghi được lý do vừa đủ.  
- Chuyển item sang state / queue / authority phù hợp.

## 8.3 Pattern shape ưu tiên

- Nhóm các reasons phổ biến thành selectable options trước.  
- Cho nhập note bổ sung ngắn khi cần.  
- Luôn nói item sẽ chuyển sang đâu hoặc đang chờ gì sau khi báo ngoại lệ.  
- Nếu ngoại lệ cần authority khác, wording phải làm rõ điều đó.

## 8.4 Khi không nên dùng

Không nên dùng pattern ngoại lệ như nơi người dùng “ghi đại” mọi vấn đề. Categories và wording phải đủ rõ để recovery paths không bị mơ hồ.

## 8.5 Ví dụ áp dụng

- Mark Blocked.  
- Needs Info.  
- Request Help.  
- Request Approval because step cannot continue under normal rule.

## 8.6 Luật thiết kế

- Ngoại lệ phổ biến phải có reason presets dễ chọn.  
- Nếu cần free text, chỉ nên là lớp bổ sung sau reason chính.  
- Sau submit, feedback phải nói rõ ai hoặc queue nào thấy tiếp theo.

## 9. Pattern family 5 – Decision reasoning input patterns

## 9.1 Khi nào dùng

Pattern này dùng cho manager/supervisor/coordinator khi action có hậu quả cao và cần reasoning, như reject, override, request more info hoặc quyết định ngoài chuẩn.

## 9.2 Mục tiêu

- Bảo đảm người dùng có ngữ cảnh trước khi nhập.  
- Thu được reasoning đủ ngắn gọn nhưng hữu ích.  
- Gắn reasoning với decision outcome có trace.

## 9.3 Pattern shape ưu tiên

- Reason selection hoặc reason categories khi phù hợp.  
- Free text bổ sung cho nuance.  
- Decision consequence hiển thị ngay gần input zone.  
- Confirmation trước submit nếu action khó đảo ngược hoặc nhạy cảm.

## 9.4 Khi không nên dùng

Không nên bắt reasoning dài dòng cho các actions quá thường xuyên và rủi ro thấp. Over-documentation làm users ghét hệ thống mà không tăng truth hữu ích tương xứng.

## 9.5 Ví dụ áp dụng

- Reject with reason.  
- Override with rationale.  
- Request more information.  
- Approval with note trong trường hợp policy nhạy cảm.

## 9.6 Luật thiết kế

- Không yêu cầu essay text nếu một reason preset cộng một note ngắn là đủ.  
- Nếu reasoning là bắt buộc, UI phải nói rõ vì sao nó cần thiết.  
- Sau submit, history phải làm lộ decision cùng reasoning ở mức phù hợp.

## 10. Pattern family 6 – Correction and recovery input patterns

## 10.1 Khi nào dùng

Pattern này dùng khi người dùng cần sửa dữ liệu sai, bổ sung thông tin thiếu, retry một bước thất bại hoặc khôi phục flow về quỹ đạo đúng.

## 10.2 Mục tiêu

- Giảm công sức sửa lỗi.  
- Giữ context của lỗi rõ.  
- Không bắt người dùng nhập lại từ đầu nếu không cần.  
- Đưa item quay lại flow một cách minh bạch.

## 10.3 Pattern shape ưu tiên

- Chỉ highlight các fields cần sửa hoặc cần bổ sung.  
- Giữ lại dữ liệu đã nhập đúng trước đó.  
- Chỉ ra rõ lỗi nào đang chặn submit.  
- Feedback sau sửa phải cho biết item quay về state/queue nào.

## 10.4 Khi không nên dùng

Không nên reset cả form hoặc bắt người dùng lặp lại toàn bộ flow chỉ vì một lỗi nhỏ hoặc một field sai.

## 10.5 Ví dụ áp dụng

- Fix missing branch info.  
- Add missing completion proof.  
- Retry validation-failed submission.  
- Correct note / field before approval can proceed.

## 10.6 Luật thiết kế

- Recovery flow phải gần error context.  
- Validation messages phải chỉ đúng field hoặc đúng nguyên nhân.  
- Không tạo impression rằng hệ thống đã “nuốt mất” công sức trước đó.

## 11. Quy tắc giảm typing và giảm field burden

## 11.1 Selection trước free text khi hợp lý

Nếu một tập lý do hoặc lựa chọn lặp lại thường xuyên, ưu tiên cho chọn nhanh trước khi yêu cầu người dùng gõ tay. Điều này đặc biệt quan trọng trên mobile.

## 11.2 Defaults tốt hơn blank forms

Nếu context đã biết branch, owner, task type hoặc next state, đừng bắt người dùng nhập lại. Defaults tốt làm giảm thời gian và lỗi.

## 11.3 Chỉ hỏi cái quyết định outcome

Mỗi field nên tự biện minh bằng cách trả lời: nó có ảnh hưởng tới state, routing, decision, evidence value hoặc traceability không? Nếu không, cân nhắc bỏ khỏi phase đầu.

## 11.4 Progressive disclosure cho input phức tạp

Thông tin phụ hoặc tùy chọn hiếm nên mở ra khi cần thay vì hiện ngay từ đầu. Điều này giúp giữ form nhẹ mà vẫn không mất khả năng xử lý case đặc biệt.

## 11.5 Typing dài là tín hiệu cảnh báo

Nếu một action high-frequency thường xuyên yêu cầu người dùng gõ nhiều câu, rất có thể pattern đang sai hoặc product model đang thiếu structure.

## 12. Quy tắc giữ item context trong suốt input flow

## 12.1 Người dùng luôn phải biết mình đang nhập cho item nào

Ở mọi note, evidence, exception hay correction flow, item identity tối thiểu phải hiện diện đủ rõ để tránh gắn nhầm.

## 12.2 Người dùng phải hiểu input này đang phục vụ action nào

Một note trước completion khác với một note trước approval request. UX phải làm rõ ngữ cảnh hành động để người dùng nhập đúng loại thông tin.

## 12.3 Input flow không được làm mất orientation

Sau khi mở sheet, modal hoặc màn con để nhập, người dùng phải dễ dàng quay lại nơi mình đến mà không mất bối cảnh công việc.

## 12.4 Sau submit, outcome phải nối lại flow chính

Người dùng không nên bị bỏ ở trạng thái lửng. Họ phải biết item đã đổi thế nào và bây giờ nên quay lại workload, ở lại item hay chờ authority khác.

## 13. Validation và error-handling rules

## 13.1 Validate càng gần thời điểm lỗi càng tốt

Nếu một field bắt buộc hoặc một format sai có thể được báo sớm, nên làm như vậy thay vì để người dùng submit xong mới biết.

## 13.2 Chỉ rõ lỗi cụ thể, không báo lỗi chung chung

“Submission failed” hiếm khi đủ hữu ích. Tốt hơn là nói field nào còn thiếu, evidence nào chưa có, quyền nào chưa đủ hoặc item đã đổi trạng thái thế nào.

## 13.3 Không làm mất dữ liệu đã nhập

Đây là luật gần như bắt buộc. Dù network chậm, validation fail hay session timeout ngắn, hệ thống phải cố giữ lại note, selections và input chưa gửi xong ở mức hợp lý.

## 13.4 Retry phải có ngữ cảnh

Nếu người dùng cần thử lại, UX nên giúp họ hiểu đang retry cái gì và liệu dữ liệu trước đó còn nguyên không.

## 13.5 Validation severity phải đúng mức

Không phải mọi thiếu sót đều là blocking error. Một số có thể là warning hoặc recommended info. Nếu chặn quá mạnh cho những thứ ít giá trị, adoption sẽ giảm.

## 14. Rules riêng cho mobile execution input

## 14.1 Một tay và vài giây là giả định mặc định

Patterns mobile nên được thiết kế với giả định người dùng đang bận, có thể thao tác bằng một tay và chỉ có vài giây chú ý cho một update.

## 14.2 Sheet / modal chỉ tốt khi cực rõ

Bottom sheet hoặc lightweight modal có thể rất hợp cho quick inputs, nhưng chỉ khi entry/exit rõ và không tạo chuỗi overlay gây mất orientation.

## 14.3 Keyboard là chi phí thật

Mỗi lần bật keyboard là một gián đoạn. Hãy tránh bật keyboard nếu user chỉ cần chọn lý do, xác nhận bước hoặc chọn một preset.

## 14.4 Capture flow phải chịu được sự gián đoạn

Người dùng có thể thoát app, bị gọi, bị chuyển bối cảnh. Input patterns nên hạn chế mất dữ liệu và nên resume được ở mức hợp lý.

## 15. Rules riêng cho web admin input

## 15.1 Web có thể chứa nhiều context hơn, nhưng không được thành form dump

Web Admin cho phép hiển thị nhiều ngữ cảnh hơn mobile, nhất là với approvals hoặc corrections, nhưng vẫn phải giữ hierarchy và không biến input thành bức tường field.

## 15.2 Reasoning inputs trên web nên hỗ trợ quyết định tốt hơn, không chỉ dài hơn

Thêm chỗ nhập text dài không tự động làm quality tốt hơn. Web pattern nên giúp người dùng đưa ra reasoning đúng loại, đúng chỗ, có hệ quả rõ.

## 15.3 Bulk hoặc admin-oriented inputs phải cẩn trọng hơn

Các flows như bulk corrections, import validation fixes hoặc multi-item actions trên web cần có guardrails chặt hơn vì sai sót có thể lan rộng hơn mobile single-item actions.

## 16. Mapping patterns với launch-critical flows

## 16.1 Flow C – Operator execution and status update

Flow này phụ thuộc mạnh nhất vào quick status updates, structured notes ngắn, evidence capture nhẹ và feedback outcome rõ.

## 16.2 Flow D – Manager review and approval decision

Flow này phụ thuộc vào decision reasoning patterns và correction/recovery patterns cho request-more-info hoặc reject/override cases.

## 16.3 Flow E – Exception / blocked / missing-info handling

Flow này phụ thuộc mạnh vào exception reporting patterns, short reason presets và context-aware recovery input.

## 16.4 Flow F – Completion, confirmation and trace review

Flow này thường chạm evidence capture, completion note và confirmation feedback patterns.

## 16.5 Flow G – Data import and onboarding assist flow

Flow này chạm correction/recovery patterns nhiều hơn, đặc biệt quanh validation errors và field-level fixes.

## 17. Anti-patterns nghiêm trọng phải tránh

## 17.1 Form-first thinking for every action

Không phải action nào cũng xứng đáng có một form đầy đủ. Nếu mọi thứ đều bị biến thành form, execution UX sẽ nặng và chậm.

## 17.2 Free-text as universal escape hatch

Khi thiếu structure, team thường cho người dùng “gõ thêm ghi chú”. Đây là giải pháp tạm dễ làm nhưng lâu dài làm mờ truth và khó automation.

## 17.3 Mandatory evidence without clear value

Yêu cầu bằng chứng cho mọi update chỉ để “an toàn hơn” thường làm adoption giảm rất nhanh, đặc biệt trên mobile.

## 17.4 Validation that punishes instead of guides

Lỗi đến muộn, báo mơ hồ, xóa dữ liệu hoặc bắt nhập lại từ đầu là một trong những cách nhanh nhất khiến người dùng mất niềm tin.

## 17.5 Hidden outcome after submit

Nếu người dùng submit xong mà không biết item đi đâu, đã chờ ai hay có cần làm gì nữa không, pattern đó chưa đạt.

## 17.6 Modal stack overload

Nhiều lớp sheet, dialog, picker và confirm chồng nhau sẽ làm input flow rối và dễ bỏ dở.

## 18. Governance rules cho mọi pattern nhập liệu mới

Mọi pattern nhập liệu mới trong Pack 03 nên đi qua các câu hỏi sau:

1. **Người dùng đang cố hoàn thành outcome gì?**  
2. **Thông tin nào là tối thiểu cần thiết để outcome đó có truth đủ tốt?**  
3. **Có thể thay typing bằng selection, default hoặc preset không?**  
4. **Input này có gắn rõ với item context và action context không?**  
5. **Sau submit, item đi đâu và người dùng có thấy điều đó rõ không?**  
6. **Nếu lỗi xảy ra, người dùng có mất dữ liệu hoặc mất orientation không?**  
7. **Pattern này có đang yêu cầu nhiều hơn giá trị mà người dùng cảm nhận được không?**  
8. **Pattern này có đang vô tình che giấu việc product truth chưa rõ hoặc flow chưa rõ không?**

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing strategies và default views theo persona.  
2. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Web Admin.  
3. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
4. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, errors và recovery messaging.  
5. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance cơ chế.  
6. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules cho mobile execution patterns.  
7. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – patterns riêng cho form và decision input trên web admin.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho data entry và evidence capture:

1. Nextflow OS phải thiết kế input patterns theo **outcome và execution moment**, không theo tư duy form chung chung.  
2. Có sáu families chính thức cho input moments: quick status, structured notes, evidence capture, exception reporting, decision reasoning, correction/recovery.  
3. Quick status updates phải cực nhẹ và luôn có feedback outcome rõ.  
4. Notes phải có cấu trúc vừa đủ, không trở thành nơi thay thế state truth.  
5. Evidence chỉ nên được yêu cầu khi có giá trị flow, trust, approval hoặc traceability thật.  
6. Exception reporting phải nhẹ hơn hoặc ít nhất cạnh tranh được với cám dỗ chat ngoài hệ thống.  
7. Validation và retry behavior phải bảo vệ công sức nhập liệu của người dùng.  
8. Mọi pattern nhập liệu phải giữ item context, action context và outcome context rõ ràng.

## 21. Điều kiện hoàn thành của tài liệu

Data Entry and Evidence Capture Patterns được xem là đạt yêu cầu khi:
- team Product, UX, Frontend và QA có cùng một grammar cho các khoảnh khắc nhập liệu chính của Pack 03;  
- các flows launch-critical đã có pattern input đủ rõ để đi xuống wireframes, components và test scenarios;  
- mobile execution input đã được bảo vệ khỏi form-heavy drift;  
- và web decision/correction input đã có baseline đủ rõ để không phát triển ngẫu hứng.

## AG Execution Prompt

You are acting as a senior UX systems designer, mobile input-pattern architect, and operational data-entry strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops is the execution surface, Web Admin is the control surface, first-wedge user flows and state grammar are already defined.
- This document defines the official data entry, note capture, evidence capture, exception input, and correction input patterns for downstream design and implementation.

### Objective
Refine this Data Entry and Evidence Capture Patterns document into a production-grade input-pattern baseline that can guide mobile execution UX, web decision-input UX, component behavior, validation behavior, error recovery, and QA scenario design.

### Inputs
- Use this document plus Mobile Ops Experience Strategy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, and Mobile Ops Screen Taxonomy as the primary source of truth.
- Preserve the wedge-first launch scope and the distinction between execution inputs and decision inputs.
- Keep the output concrete enough for real screen, component, and frontend planning.

### Tasks
1. Rewrite the data-entry thesis into a sharper executive form.
2. Produce an input-pattern register with moment type, primary persona, required context, input burden, and expected outcome.
3. Add a pattern grammar for quick updates, structured notes, evidence capture, exception reporting, decision reasoning, and correction/recovery.
4. Define launch-phase rules for validation, retry behavior, draft preservation, and outcome feedback.
5. Identify the top five data-entry failures that would destroy adoption or truth quality.
6. Recommend the next documents that should operationalize these patterns into wireframes, components, and QA scenarios.
7. Add governance rules to prevent form-heavy drift, note-overuse, and evidence overload.

### Constraints
- Do not turn every interaction into a form.  
- Do not use notes as a substitute for structured product truth.  
- Do not require evidence without clear operational value.  
- Do not let validation destroy user-entered work.  
- Keep the output concrete enough for downstream implementation.

### Output Format
Return a revised markdown document with these sections:
1. Executive Data-Entry Thesis
2. Input-Pattern Register
3. Pattern Grammar
4. Validation and Recovery Rules
5. Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make data entry and evidence capture patterns explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design input moments that are fast, structured, and adoption-friendly.
- The output must reduce ambiguity around notes, evidence, exception reporting, and correction flows.
