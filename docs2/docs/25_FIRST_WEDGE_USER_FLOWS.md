# Nextflow OS – First Wedge User Flows

**Document ID:** 25_FIRST_WEDGE_USER_FLOWS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Strategy / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Sales & Enablement, Deployment & Support  
**Prerequisite Documents:** 13_FIRST_WEDGE_CAPABILITY_SLICE, 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY

## 1. Mục tiêu tài liệu

Tài liệu này xác định **các user flows launch-critical của wedge đầu tiên** cho Nextflow OS. Nếu các tài liệu trước trong Pack 03 đã chốt chiến lược trải nghiệm tổng thể, chiến lược riêng cho Web Admin và Mobile Ops, mô hình IA/navigation và taxonomy màn hình, thì tài liệu này đi vào lớp gần hành vi người dùng nhất:

> **Cụ thể người dùng nào sẽ đi qua hệ thống theo những luồng nào, các bước chính trong từng luồng là gì, điểm ra quyết định nằm ở đâu, ngoại lệ xuất hiện ở đâu, surface nào tham gia ở bước nào, và điều gì phải xảy ra để các luồng đó thật sự usable trong launch slice đầu tiên?**

User flow ở đây không phải flowchart kỹ thuật của hệ thống backend. Nó là mô hình hành vi có cấu trúc để các team Product, UX, Frontend, Backend, QA, Sales Demo và Delivery cùng nhìn một “kịch bản sống” của sản phẩm. Nếu không có tài liệu này, mỗi team có thể cùng dùng một cụm từ như “approval flow” hay “branch ops flow” nhưng lại hình dung những bước rất khác nhau.

Tài liệu này phải khóa mười thứ:
1. First wedge user flows là gì trong ngữ cảnh Nextflow OS.  
2. Những flows nào là launch-critical, flows nào là supporting.  
3. Persona nào khởi động flow, persona nào tiếp nhận flow, persona nào quyết định flow.  
4. Surface nào tham gia ở từng bước.  
5. Điểm nào là business-step, điểm nào là UX-step.  
6. State transitions nào cần được người dùng nhìn thấy rõ.  
7. Những ngoại lệ nào phải được mô hình hóa như first-class branches.  
8. Những touchpoints nào cần traceability rõ ràng.  
9. Những flows không nên ôm quá sớm trong launch slice.  
10. Các tài liệu UX tiếp theo phải đào sâu từ các flows này như thế nào.

## 2. User flow trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, user flow không chỉ là chuỗi click màn hình. Nó là **sự giao cắt giữa operating model, decision logic và experience delivery**. Một flow tốt phải trả lời đồng thời ba câu hỏi:
- người dùng đang cố hoàn thành outcome gì;  
- hệ thống đang yêu cầu người dùng đi qua những trạng thái nào;  
- và trải nghiệm phải giúp flow đó rõ, nhanh, an toàn ra sao.

Vì Nextflow OS là SME Business OS, user flows không nên chỉ xoay quanh “form submit” hoặc “page navigation”. Chúng phải làm lộ đúng bản chất của hệ thống:
- flow luôn gắn với record truth;  
- flow thường sinh ra work/queue movement;  
- flow có thể chạm approval hoặc exception branches;  
- flow phải hỗ trợ visibility cho người điều phối;  
- và flow phải có narrative đủ rõ để tạo trust.

## 3. User-flow thesis cho first wedge

User-flow thesis của wedge đầu tiên có thể phát biểu như sau:

> **Các user flows đầu tiên của Nextflow OS phải làm cho một order/request-like operational flow đi từ tạo mới đến xử lý, gặp ngoại lệ, được duyệt, quay lại tiến trình và hoàn tất theo cách rõ ràng hơn, có kiểm soát hơn và ít hỗn loạn hơn cách làm cũ.**

Từ thesis này, sáu nguyên lý flow được suy ra:

1. Flow phải được thiết kế quanh **operational outcomes**, không quanh menu traversal.  
2. Flow phải đi qua đúng distinction giữa **record truth**, **work handling** và **decision handling**.  
3. Approval và exception branches phải được xem là **các nhánh chính thức của flow**, không phải edge cases phụ.  
4. Flow phải cho decision personas nhìn được impact, cho coordination personas điều phối được, và cho execution personas thao tác được.  
5. Flow phải có điểm chạm traceability đủ rõ ở các bước quan trọng.  
6. Launch slice chỉ nên ôm các flows giúp retail/light-distribution wedge thắng rõ hơn; không nên dàn trải sang mọi future scenario.

## 4. Phạm vi flows của wedge đầu tiên

Launch slice của Nextflow OS đã chốt business scenario trung tâm là **order/request processing with branch-aware control, exceptions, and approvals**. Từ đó, phạm vi flows của tài liệu này được chia làm hai lớp.

## 4.1 Launch-critical flows

Đây là các flows nếu thiếu sẽ làm launch slice mất bản chất hoặc rất khó demo/pilot:
- Flow A – Create and intake operational record.  
- Flow B – Queue intake and work assignment.  
- Flow C – Operator execution and status update.  
- Flow D – Manager review and approval decision.  
- Flow E – Exception / blocked / missing-info handling.  
- Flow F – Completion, confirmation and trace review.  
- Flow G – Data import and onboarding assist flow.

## 4.2 High-supporting flows

Đây là các flows có thể bắt đầu mỏng hơn nhưng rất quan trọng cho chất lượng vận hành:
- Flow H – Reassignment / queue balancing.  
- Flow I – Branch hotspot drill-down.  
- Flow J – Overdue review and escalation follow-up.  
- Flow K – Approval audit and dispute check.

## 5. Persona-flow map

User flows chỉ hữu ích khi map rõ ai là người khởi tạo, ai là người tiếp sức và ai là người ra quyết định trong từng flow.

## 5.1 Decision personas

- Founder / Owner.  
- COO / Head of Operations.  
- Branch director hoặc area manager trong context phù hợp.

Họ thường không khởi tạo record hằng ngày, nhưng chạm mạnh vào:
- approval flows;  
- branch hotspot review;  
- blocked/overdue investigations;  
- trust/trace review ở các case quan trọng.

## 5.2 Coordination personas

- Operations manager.  
- Back office lead.  
- Branch supervisor ở chế độ điều phối.

Họ là trung tâm của hầu hết flows vì họ:
- intake backlog;  
- triage queues;  
- điều phối work;  
- đẩy approvals lên;  
- xử lý ngoại lệ;  
- và theo dõi completion.

## 5.3 Execution personas

- Frontline operator.  
- Branch staff.  
- Floor/warehouse-like staff trong use case phù hợp.

Họ chạm mạnh vào:
- nhận việc;  
- cập nhật trạng thái;  
- bổ sung note/evidence;  
- báo blocked/needs-help/needs-approval.

## 5.4 Admin / onboarding personas

- Tenant admin.  
- Internal setup user.  
- Người hỗ trợ pilot onboarding.

Họ chạm mạnh vào:
- import;  
- validation review;  
- basic setup cho launch slice.

## 6. Surface-flow map

Các flows trong wedge đầu tiên nên được trải ra trên surfaces như sau:

| Flow cluster | Primary surface | Secondary surface | Ghi chú |
|---|---|---|---|
| Intake / overview / triage | Web Admin | Mobile Ops rất hạn chế | Coordination-heavy flow. |
| Task execution / quick updates | Mobile Ops | Web Admin | Execution-first, web hỗ trợ khi cần. |
| Approval / exception decision | Web Admin | Mobile Ops rất chọn lọc | Cần decision context giàu hơn. |
| Completion / review / trace | Web Admin | Mobile Ops một phần | Web là nơi trust narrative rõ hơn. |
| Import / onboarding | Web Admin | Không ưu tiên mobile | Admin/support-oriented. |

## 7. Flow A – Create and intake operational record

## 7.1 Mục đích

Flow này đưa một operational record đầu tiên vào hệ thống theo cách đủ có cấu trúc để toàn bộ operating flow sau đó có thể chạy. Đây là điểm mở đầu của business truth trong launch slice.

## 7.2 Persona chính

- Coordination persona là chính.  
- Trong một số use case, admin/onboarding persona có thể tạo record khởi đầu hoặc batch records.

## 7.3 Surface chính

- Web Admin.

## 7.4 Trigger

Một order/request-like item mới xuất hiện và cần được ghi nhận vào hệ thống kèm branch/site context, một số details chính và ownership ban đầu.

## 7.5 Luồng chính

1. Người dùng đi vào entry point tạo record hoặc intake zone.  
2. Người dùng chọn hoặc xác nhận branch/site context.  
3. Người dùng nhập các details cốt lõi của record.  
4. Hệ thống xác nhận record đã được tạo và gắn trạng thái khởi đầu.  
5. Record xuất hiện trong queue hoặc intake list phù hợp.  
6. Người điều phối có thể chuyển sang bước giao việc hoặc triage tiếp.

## 7.6 State / context phải hiển thị rõ

- Record đã được tạo hay chưa.  
- Branch/site nào đang gắn với record.  
- Trạng thái khởi đầu là gì.  
- Ai đang là owner/assignee đầu tiên nếu có.  
- Có thiếu dữ liệu bắt buộc không.

## 7.7 Nhánh ngoại lệ cần tính tới

- Thiếu thông tin đầu vào.  
- Branch/site không hợp lệ hoặc chưa xác định.  
- Duplicate-like suspicion.  
- Intake cần review thay vì vào thẳng work queue.

## 7.8 Outcome thành công

Record được tạo với đủ truth nền để các flows tiếp theo có thể chạy mà không dựa vào ghi nhớ ngoài hệ thống.

## 8. Flow B – Queue intake and work assignment

## 8.1 Mục đích

Flow này biến record truth thành work truth bằng cách đưa item vào queue phù hợp và xác định ai hoặc team nào sẽ tiếp nhận xử lý.

## 8.2 Persona chính

- Coordination persona.  
- Branch supervisor trong một số context.

## 8.3 Surface chính

- Web Admin là chính.  
- Mobile Ops có thể nhìn team workload ở mức nhẹ nhưng không nên là nơi triage sâu.

## 8.4 Trigger

Một record mới được tạo hoặc một record đã chuyển sang trạng thái cần xử lý tiếp theo.

## 8.5 Luồng chính

1. Người điều phối mở queue/worklist phù hợp.  
2. Hệ thống hiển thị item mới hoặc item needs-action trong danh sách có context rõ.  
3. Người điều phối xem branch, trạng thái, loại item và priority cues.  
4. Người điều phối gán item cho owner/team hoặc xác nhận queue routing mặc định.  
5. Hệ thống cập nhật work state và item đi vào danh sách của người xử lý.  
6. Nếu có vấn đề, người điều phối có thể reassign hoặc giữ item ở queue cần review.

## 8.6 State / context phải hiển thị rõ

- Queue nào đang chứa item.  
- Item đang unassigned, assigned hay waiting.  
- Branch/team context.  
- Priority / blocked / approval-needed cues nếu có.

## 8.7 Nhánh ngoại lệ cần tính tới

- Không có owner phù hợp.  
- Queue quá tải hoặc branch-specific issue.  
- Item thiếu thông tin nên chưa thể giao việc.  
- Assignment cần approval hoặc supervisory confirmation trong một số policy.

## 8.8 Outcome thành công

Item có đường đi rõ từ record sang workload thực tế và không bị chìm trong backlog vô chủ.

## 9. Flow C – Operator execution and status update

## 9.1 Mục đích

Flow này là nơi operating model được dùng thật: execution persona nhận việc, thực hiện bước cần thiết và cập nhật hệ thống theo cách nhanh nhưng có cấu trúc.

## 9.2 Persona chính

- Execution persona.  
- Branch supervisor ở chế độ tác nghiệp nhanh.

## 9.3 Surface chính

- Mobile Ops / PWA.

## 9.4 Trigger

Người xử lý mở app và thấy item mới, item đang active hoặc item cần follow-up.

## 9.5 Luồng chính

1. Người dùng mở My Work hoặc Team Work.  
2. Hệ thống hiển thị item cần làm với urgency/state cues rõ.  
3. Người dùng mở item action view.  
4. Người dùng xem context tối thiểu: item là gì, cần làm gì tiếp theo, trạng thái hiện tại là gì.  
5. Người dùng thực hiện action chính: bắt đầu xử lý, cập nhật tiến độ, thêm note hoặc đánh dấu hoàn tất bước.  
6. Hệ thống phản hồi trạng thái mới rõ ràng và item chuyển đúng queue/trạng thái tiếp theo.

## 9.6 State / context phải hiển thị rõ

- Việc này đang ở trạng thái gì.  
- Hành động chính tiếp theo là gì.  
- Có urgency hay overdue không.  
- Có blocked signal hoặc needs-approval signal không.  
- Sau khi update thì item đi đâu.

## 9.7 Nhánh ngoại lệ cần tính tới

- Người dùng không thể hoàn tất vì thiếu thông tin.  
- Cần ghi evidence mới được tiếp tục.  
- Cần xin duyệt cho action không chuẩn.  
- Item phải chuyển sang blocked/waiting.

## 9.8 Outcome thành công

Execution xảy ra trong hệ thống với ma sát thấp và tạo ra update có ý nghĩa cho toàn bộ operating flow.

## 10. Flow D – Manager review and approval decision

## 10.1 Mục đích

Flow này xử lý các tình huống cần decision bởi manager hoặc người có thẩm quyền, nhằm kéo approvals vào trong hệ thống thay vì ngoài chat/call.

## 10.2 Persona chính

- Decision persona.  
- Coordination persona có quyền duyệt ở một số tầng.

## 10.3 Surface chính

- Web Admin.

## 10.4 Trigger

Một item rơi vào trạng thái pending approval hoặc out-of-policy action cần được quyết định.

## 10.5 Luồng chính

1. Người duyệt mở approval inbox hoặc đi từ overview signal vào approval queue.  
2. Hệ thống hiển thị những item đang chờ quyết định, kèm priority/context cues.  
3. Người dùng mở approval detail.  
4. Người dùng xem record summary, branch context, trạng thái hiện tại, lý do cần duyệt, history gần và policy cues liên quan.  
5. Người dùng chọn approve, reject, request more info hoặc override theo quyền.  
6. Nếu cần, người dùng thêm reasoning.  
7. Hệ thống cập nhật decision outcome, ghi trace và đẩy item trở lại flow phù hợp.

## 10.6 State / context phải hiển thị rõ

- Item đang chờ duyệt vì lý do gì.  
- Chờ ai và ở mức ưu tiên nào.  
- Nếu duyệt thì chuyện gì xảy ra tiếp.  
- Nếu từ chối thì item quay về đâu hoặc bị chặn thế nào.  
- Ai đã chạm vào flow trước đó.

## 10.7 Nhánh ngoại lệ cần tính tới

- Approval thiếu thông tin để quyết định.  
- Approval bị stale hoặc item đã đổi context.  
- Cần escalate lên cấp cao hơn.  
- Manager muốn override và phải để lại lý do.

## 10.8 Outcome thành công

Decision được đưa ra có ngữ cảnh, được ghi lại có trace, và flow được đẩy tiếp hoặc chặn lại một cách có kỷ luật.

## 11. Flow E – Exception / blocked / missing-info handling

## 11.1 Mục đích

Flow này xử lý những trường hợp không đi theo happy path và là nơi Nextflow OS tạo control value rất rõ trong wedge đầu tiên.

## 11.2 Persona chính

- Execution persona báo ngoại lệ.  
- Coordination persona điều tra và điều phối recovery.  
- Decision persona tham gia nếu ngoại lệ cần approval hoặc escalation.

## 11.3 Surfaces chính

- Mobile Ops để báo ngoại lệ hoặc blocked state ban đầu.  
- Web Admin để điều tra, điều phối recovery và ra quyết định nếu cần.

## 11.4 Trigger

Item bị thiếu thông tin, blocked, out-of-policy, chậm quá ngưỡng hoặc không thể tiếp tục theo luồng chuẩn.

## 11.5 Luồng chính

1. Execution persona đánh dấu blocked / needs help / missing info / needs approval trong Mobile Ops hoặc coordination persona phát hiện ngoại lệ trong Web Admin.  
2. Hệ thống ghi state ngoại lệ và đưa item vào queue hoặc view cần attention.  
3. Coordination persona mở exception/recovery view.  
4. Người điều phối xem nguyên nhân, branch context, current owner, related history và recommended recovery path nếu có.  
5. Người điều phối chọn hành động: reassign, request more info, send for approval, unblock, escalate hoặc return-to-work.  
6. Hệ thống cập nhật state mới, ghi trace và phản ánh item về đúng worklist tiếp theo.

## 11.6 State / context phải hiển thị rõ

- Ngoại lệ là loại gì.  
- Ai báo hoặc ai phát hiện.  
- Item đang bị chặn ở bước nào.  
- Bước nào cần để recovery.  
- Có decision authority nào liên quan không.

## 11.7 Nhánh ngoại lệ cần tính tới

- Ngoại lệ kéo dài thành overdue.  
- Ngoại lệ cần nhiều vòng qua lại.  
- Ngoại lệ dẫn tới hủy item.  
- Ngoại lệ hóa ra do dữ liệu intake sai và cần correction flow.

## 11.8 Outcome thành công

Ngoại lệ được kéo vào trong hệ thống như một nhánh flow có cấu trúc thay vì bị đẩy ra ngoài bằng tin nhắn và trí nhớ con người.

## 12. Flow F – Completion, confirmation and trace review

## 12.1 Mục đích

Flow này đóng vòng đời của item theo cách có xác nhận, có trạng thái cuối và có khả năng review lại nếu cần.

## 12.2 Persona chính

- Execution persona hoàn tất bước cuối hoặc trạng thái xử lý.  
- Coordination persona xác nhận closure ở một số use case.  
- Decision persona có thể review lại một case quan trọng sau completion.

## 12.3 Surfaces chính

- Mobile Ops cho completion action nhanh.  
- Web Admin cho confirmation, final review và traceability.

## 12.4 Trigger

Item đã đi qua các bước cần thiết và đủ điều kiện được coi là done/closed/resolved theo launch slice.

## 12.5 Luồng chính

1. Người xử lý đánh dấu completion hoặc final update.  
2. Hệ thống chuyển state sang completed/resolved hoặc chờ xác nhận cuối nếu flow yêu cầu.  
3. Coordination persona có thể mở record detail để review kết quả, notes, evidence và outcome.  
4. Hệ thống phản ánh item ra khỏi active queues và cập nhật overview/control views.  
5. Nếu cần, decision/coordinator persona có thể xem history để kiểm tra toàn bộ narrative xử lý.

## 12.6 State / context phải hiển thị rõ

- Item đã hoàn tất thật hay chỉ chờ xác nhận cuối.  
- Bằng chứng hoặc notes cuối có đầy đủ không.  
- Closure diễn ra khi nào, bởi ai.  
- Item có thể reopened không trong scope phase đầu hay không.

## 12.7 Nhánh ngoại lệ cần tính tới

- Completion bị từ chối vì thiếu evidence.  
- Completion xong nhưng phát hiện sai và cần reopen/review.  
- Item đã closed nhưng có dispute cần trace review.

## 12.8 Outcome thành công

Item rời flow active một cách rõ ràng, có trace narrative đủ để tin tưởng và kiểm tra lại khi cần.

## 13. Flow G – Data import and onboarding assist flow

## 13.1 Mục đích

Flow này giúp launch slice đi từ demo sang pilot/go-live bằng cách hỗ trợ nhập dữ liệu khởi đầu và review lỗi dữ liệu cơ bản.

## 13.2 Persona chính

- Admin/onboarding persona.  
- Coordination persona hỗ trợ rà dữ liệu trong một số tình huống.

## 13.3 Surface chính

- Web Admin.

## 13.4 Trigger

Tenant mới cần đưa batch records hoặc dữ liệu khởi đầu vào hệ thống.

## 13.5 Luồng chính

1. Người dùng vào import entrypoint.  
2. Người dùng chọn template hoặc file input phù hợp.  
3. Hệ thống map fields cơ bản và hiển thị validation issues nếu có.  
4. Người dùng sửa, xác nhận hoặc chấp nhận import ở mức phù hợp.  
5. Hệ thống tạo records hoặc staging results.  
6. Người dùng xem import result summary và các lỗi còn lại.  
7. Các records hợp lệ xuất hiện trong queues/views liên quan.

## 13.6 State / context phải hiển thị rõ

- Import đang ở bước nào.  
- Bao nhiêu records hợp lệ / lỗi.  
- Lỗi liên quan field nào hoặc branch context nào.  
- Sau import, dữ liệu sẽ đi vào đâu.

## 13.7 Nhánh ngoại lệ cần tính tới

- Mapping sai field quan trọng.  
- Branch/site context không khớp.  
- Validation lỗi hàng loạt.  
- Người dùng cần retry hoặc staged import thay vì full acceptance.

## 13.8 Outcome thành công

Onboarding data đi vào hệ thống đủ sạch để launch slice bắt đầu chạy thật, không cần quá nhiều thao tác ngoài hệ thống.

## 14. Flow H – Reassignment / queue balancing

## 14.1 Vai trò

Đây là high-supporting flow giúp coordination personas phản ứng khi workload lệch, owner nghỉ, branch quá tải hoặc một item cần đổi người xử lý.

## 14.2 Tại sao flow này quan trọng

Retail/light-distribution thực tế luôn có biến động người và việc. Nếu không có reassignment rõ, queue sẽ tắc và người dùng quay về gọi nhau ngoài hệ thống.

## 14.3 Mức đầu tư phase đầu

Cần có ở mức practical basics: nhìn thấy ai đang giữ item, đổi owner/team với trace, và phản ánh trạng thái mới rõ ràng. Không cần engine cân bằng tải quá phức tạp ở ngày đầu.

## 15. Flow I – Branch hotspot drill-down

## 15.1 Vai trò

Đây là flow giúp decision/coordinator personas đi từ overview signal sang branch-specific investigation.

## 15.2 Mục tiêu

- Nhìn branch nào đang nóng.  
- Đi từ hotspot signal sang queue cụ thể của branch đó.  
- Hiểu vấn đề là backlog, approvals, blocked items hay overdue concentration.

## 15.3 Mức đầu tư phase đầu

Nên đủ mạnh để demo và điều hành cơ bản, vì branch-aware control là điểm định vị lớn của wedge đầu tiên.

## 16. Flow J – Overdue review and escalation follow-up

## 16.1 Vai trò

Flow này giúp coordination và decision personas xử lý các item đã chậm quá ngưỡng hoặc đang có nguy cơ chệch SLA-style expectations.

## 16.2 Mục tiêu

- Nhìn được items overdue.  
- Biết đang chậm ở bước nào.  
- Xác định ai đang giữ.  
- Đưa ra next action như nhắc, reassign, escalate hoặc quyết định unblock.

## 16.3 Mức đầu tư phase đầu

Cần ở mức high-supporting, vì overdue visibility là thành phần quan trọng của control value.

## 17. Flow K – Approval audit and dispute check

## 17.1 Vai trò

Flow này hỗ trợ trust và review lại các cases có tranh cãi, rejection bất ngờ hoặc override cần giải thích.

## 17.2 Mục tiêu

- Xem ai đã approve/reject.  
- Vì sao quyết định đó được đưa ra.  
- Quyết định đó xảy ra khi nào trong narrative tổng thể.  
- Có evidence hoặc note gì liên quan.

## 17.3 Mức đầu tư phase đầu

Không cần quá sâu như compliance system enterprise, nhưng phải đủ để người dùng không cần hỏi lại bằng miệng trong các case quan trọng.

## 18. Flow states và visibility rules xuyên các flows

Tài liệu flow phải khóa rõ một số visibility rules xuyên suốt, để tài liệu state presentation sau này không đi lệch.

## 18.1 Người dùng phải luôn biết item đang ở đâu

Dù ở web hay mobile, item phải có current state đủ rõ và người dùng phải hiểu nó là record state, work state, approval state hay exception state ở mức phù hợp.

## 18.2 Người dùng phải biết ai đang giữ bước tiếp theo

Đây là logic cực quan trọng của operating systems. Nếu không rõ owner/assignee/decision-holder tiếp theo là ai, flow sẽ gãy về thực tế.

## 18.3 Người dùng phải thấy khi nào flow rơi ra khỏi happy path

Blocked, waiting, missing info, pending approval, overdue hoặc escalated phải được nhìn như tình trạng khác thường, không bị pha loãng vào list bình thường.

## 18.4 Người dùng phải thấy outcome của hành động vừa làm

Sau mỗi update, approve, reject, reassign hoặc recovery action, hệ thống phải phản hồi item đã chuyển đâu, ai thấy tiếp theo, và bây giờ nó đang thuộc trạng thái nào.

## 19. Các trace points bắt buộc trong launch slice

Không phải mọi click đều cần trace narrative sâu, nhưng một số touchpoints phải được xem là bắt buộc.

### Touchpoint 1 – Record created
Phải biết record được tạo khi nào, bởi ai và với context khởi đầu nào.

### Touchpoint 2 – Assignment / reassignment
Phải biết item được giao ai, đổi từ ai sang ai và khi nào.

### Touchpoint 3 – Approval / reject / override
Phải biết quyết định nào đã được đưa ra, bởi ai, với reasoning nào nếu flow yêu cầu.

### Touchpoint 4 – Exception marked
Phải biết ngoại lệ nào đã được đánh dấu, bởi ai, tại bước nào.

### Touchpoint 5 – Completion / closure
Phải biết item được đóng khi nào, bởi ai và có evidence cuối nào liên quan.

## 20. Những flows không nên ôm quá sớm

Để bảo vệ launch slice, các flows sau không nên bị kéo sâu quá sớm trừ khi có lý do thương mại rất rõ:
- customer self-service creation flows rộng;  
- advanced partner rollout journeys;  
- generic workflow-builder end-user flows;  
- deep multi-step dispute/compliance flows;  
- inventory-heavy or finance-heavy process families.

Không phải vì chúng vô ích, mà vì chúng không nên dẫn dắt UX của wedge đầu tiên.

## 21. Mapping flows với screen families

| Flow | Screen families chính | Surface chính |
|---|---|---|
| Flow A – Create and intake record | Operational Support, Record Detail, Queue/Worklist | Web Admin |
| Flow B – Queue intake and assignment | Queue/Worklist, Record Detail | Web Admin |
| Flow C – Operator execution and update | Mobile action views, light status views | Mobile Ops |
| Flow D – Approval decision | Approval/Decision, Record Detail, Traceability/History | Web Admin |
| Flow E – Exception and recovery | Exception/Recovery, Queue/Worklist, Record Detail | Web + Mobile |
| Flow F – Completion and trace review | Record Detail, Traceability/History, Overview refresh | Web + Mobile |
| Flow G – Import and onboarding | Operational Support, Configuration/Setup | Web Admin |

## 22. Governance rules cho mọi user flow mới

Mọi flow mới được đề xuất trong wedge đầu nên đi qua các câu hỏi sau:

1. **Flow này có phục vụ launch slice thật không?**  
2. **Flow này thuộc happy path, approval path hay exception path?**  
3. **Flow này bắt đầu ở surface nào và kết thúc ở surface nào?**  
4. **Điểm nào trong flow đòi decision context giàu hơn?**  
5. **Điểm nào cần traceability bắt buộc?**  
6. **Flow này có đang đòi product build quá nhiều capability ngoài phase hiện tại không?**  
7. **Flow này có giúp giảm chat/spreadsheet/manual coordination không?**  
8. **Flow này có đang vô tình biến Web Admin hay Mobile Ops thành thứ chúng không nên là không?**

## 23. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên tiếp tục theo chuỗi logic sau:

1. **26_STATE_AND_STATUS_PRESENTATION_RULES.md** – luật biểu đạt trạng thái, blocked, overdue, waiting, approval-required.  
2. **27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES.md** – guardrails và interaction laws cho Pack 03.  
3. **28_MOBILE_OPS_SCREEN_TAXONOMY.md** – taxonomy màn hình Mobile Ops.  
4. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – pattern nhập liệu, note, proof và exception capture.  
5. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – default landing theo persona.  
6. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Web Admin.  
7. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.

## 24. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho first wedge user flows:

1. Launch slice của Nextflow OS được vận hành qua một bộ **launch-critical user flows** chứ không chỉ qua screen lists.  
2. Các flows launch-critical gồm: Create/Intake, Queue/Assignment, Operator Execution, Manager Approval, Exception/Recovery, Completion/Trace Review và Import/Onboarding.  
3. Approval và exception branches là **first-class flows**, không phải edge cases phụ.  
4. Web Admin là surface chính cho intake, triage, approval, exception investigation và onboarding.  
5. Mobile Ops là surface chính cho execution và quick structured updates.  
6. Các touchpoints như create, assign, approve, mark exception và close phải có trace narrative đủ rõ.  
7. Các flows tương lai ngoài wedge đầu không được kéo scope của Pack 03 lệch quá sớm.

## 25. Điều kiện hoàn thành của tài liệu

First Wedge User Flows được xem là đạt yêu cầu khi:
- Product, UX, Engineering và QA có cùng cách hiểu về các luồng launch-critical;  
- Web Admin và Mobile Ops được nối với nhau bằng operational journeys rõ ràng;  
- happy path, approval path và exception path đều đã có mô tả ở mức đủ dùng;  
- và các tài liệu state rules, wireframes và screen blueprints có thể kế thừa trực tiếp từ đây mà không phải phát minh lại user journeys.

## AG Execution Prompt

You are acting as a senior UX flow strategist, operational journey designer, and cross-surface product-behavior architect.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- First wedge: retail / light distribution.
- Pack 03 baseline: Web Admin as control surface, Mobile Ops as execution surface, IA/navigation model and screen taxonomy already defined.
- This document defines the launch-critical user flows for the first wedge.

### Objective
Refine this First Wedge User Flows document into a production-grade flow baseline that can guide UX flow design, wireframing, frontend route behavior, QA scenario planning, demo scripting, and pilot readiness.

### Inputs
- Use this document plus First Wedge Capability Slice, Experience Strategy Overview, Web Admin Experience Strategy, Mobile Ops Experience Strategy, IA/Navigation Model, and Web Admin Screen Taxonomy as the primary source of truth.
- Preserve the wedge-first launch logic and the distinction between control, execution, approval, and exception flows.
- Keep the output highly actionable for downstream design and implementation.

### Tasks
1. Rewrite the flow thesis into a sharper executive form.
2. Produce a user-flow register with persona, trigger, primary surface, downstream state changes, and success outcome.
3. Add a cross-surface journey map for the launch-critical flows.
4. Identify the minimum flow branches that must be explicitly designed for launch versus what can be deferred.
5. Mark the traceability-critical moments across flows.
6. Identify the top five flow failures that would cause adoption or control breakdown.
7. Recommend the next documents that should operationalize these flows into state rules, wireframes, and test scenarios.

### Constraints
- Do not reduce flows to simple click paths without operational meaning.  
- Do not treat approvals or exceptions as minor side branches.  
- Do not design flows that assume future-scope capabilities not yet prioritized.  
- Do not blur the distinction between Web Admin and Mobile Ops roles.  
- Keep the output concrete enough for real product delivery work.

### Output Format
Return a revised markdown document with these sections:
1. Executive Flow Thesis
2. User-Flow Register
3. Cross-Surface Journey Map
4. Launch-Minimum Branching Model
5. Traceability-Critical Moments
6. Failure Risks
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make first-wedge user flows explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design and ship coherent cross-surface journeys.
- The output must reduce ambiguity around who does what, where, and when in the launch slice.
