# Nextflow OS – Mobile Ops Wireframe Blueprints

**Document ID:** 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Mobile UX / Product Management  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Deployment & Support  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **wireframe blueprints cấp chiến lược cho Mobile Ops / PWA** của Nextflow OS. Nếu Mobile Ops Experience Strategy đã chốt Mobile Ops là execution surface, Mobile Ops Screen Taxonomy đã chốt các screen families chính thức, Data Entry and Evidence Capture Patterns đã chốt grammar nhập liệu, Persona-Based Landing đã chốt điểm vào mặc định cho execution personas, còn User Flows và State Rules đã chốt nhịp thao tác cùng logic trạng thái, thì tài liệu này hạ xuống cấp cấu trúc cụ thể hơn:

> **Mỗi loại màn hình Mobile Ops nên được tổ chức theo bố cục nào, vùng nào phải nổi đầu tiên, action nào phải nằm ở đâu, context nào là đủ, feedback nào phải lộ ra ngay và các wireframes chi tiết sau này phải bám execution spine ra sao để mobile thực sự usable ngoài hiện trường?**

Tài liệu này không nhằm đóng visual design cuối cùng. Nó nhằm đóng **cấu trúc hành vi và cấu trúc nhận thức** của mobile wireframes: người dùng mở app thấy gì trước, action nằm ở đâu, note/evidence/exception đi vào flow ở chỗ nào, trạng thái nào phải hiện trong vùng scan đầu, và sau khi submit thì outcome phải xuất hiện ở vùng nào để tạo cảm giác completion thật.

Mobile wireframe blueprints đặc biệt quan trọng vì execution surface rất dễ gãy theo ba hướng: bị kéo thành mini web admin, bị kéo thành app tác vụ quá mỏng không đủ context, hoặc bị kéo thành form-heavy workflow nơi mỗi bước đều đòi nhiều input hơn mức người dùng ngoài hiện trường sẵn sàng chịu. Blueprint tồn tại để chặn ba hướng gãy đó ngay từ tầng cấu trúc.

Tài liệu này phải khóa mười một thứ:
1. Vai trò của Mobile Ops wireframe blueprints trong Pack 03.  
2. Những screen families nào cần blueprint sâu ngay ở phase đầu.  
3. Cấu trúc blueprint cho Workload Overview screens.  
4. Cấu trúc blueprint cho Task Action screens.  
5. Cấu trúc blueprint cho Quick Update screens.  
6. Cấu trúc blueprint cho Evidence and Note Capture screens.  
7. Cấu trúc blueprint cho Exception and Help screens.  
8. Cấu trúc blueprint cho Light Status / Progress screens và Session / Utility screens ở mức cần thiết.  
9. Nguyên tắc bố trí state, dominant action, context summary, bottom actions, sheets, feedback zones và return-to-work cues.  
10. Những anti-pattern layout phải tránh trên mobile.  
11. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vai trò của wireframe blueprints trong Mobile Ops

Trong Nextflow OS, Mobile Ops wireframe blueprints không phải là mockup nháp. Chúng là **khung cấu trúc để bảo vệ execution usability** khi đội UX, frontend và product bắt đầu đi vào màn hình thật. Nếu Web Admin blueprints bảo vệ control clarity, thì Mobile Ops blueprints bảo vệ bốn thứ khác:
- **Action immediacy** – người dùng thấy việc và làm được nhanh.  
- **Minimum sufficient context** – người dùng có đủ thông tin để làm đúng nhưng không bị ngợp.  
- **State-led orientation** – người dùng luôn biết item đang ở đâu và bước tiếp theo là gì.  
- **Completion confidence** – sau thao tác, người dùng biết hệ thống đã ghi nhận và item đã đi tiếp.

Mobile wireframes càng cần blueprint rõ vì mobile dễ bị “component-led design”, tức là wireframe hình thành do bottom sheet, tabs, cards hay form blocks có sẵn chứ không đi từ execution moment. Khi đó app có thể nhìn hiện đại nhưng không còn phục vụ nhịp công việc thật.

## 3. Blueprint thesis cho Mobile Ops

Blueprint thesis của tài liệu này có thể phát biểu như sau:

> **Mọi wireframe của Mobile Ops phải đưa người dùng từ seeing work đến doing work với số bước ngắn nhất, context vừa đủ nhất, trạng thái rõ nhất và outcome dễ tin nhất; nếu một layout làm tăng do dự, tăng gõ phím, tăng mất định hướng hoặc làm completion kém rõ, layout đó không phù hợp cho execution surface.**

Từ thesis này, chín nguyên lý blueprint được suy ra:

1. Layout phải được dẫn dắt bởi **execution moment**, không bởi screen furniture.  
2. Mỗi mobile screen nên có **một mục tiêu chính** và thường chỉ nên có **một dominant action**.  
3. Vùng scan đầu phải trả lời item là gì, state gì và tôi nên làm gì tiếp.  
4. Context phải đủ để hành động an toàn, không đủ để biến thành detail dump.  
5. Input, evidence và exception paths phải là nhánh gần của action flow, không phải hành trình xa.  
6. Outcome feedback phải nằm đủ gần vùng action để tạo completion confidence.  
7. Return-to-work cues phải rõ để người dùng không rơi vào dead-end sau update.  
8. Sheets, modals và overlays chỉ hợp lệ khi giúp rút ngắn flow chứ không được làm mất orientation.  
9. Mobile blueprints phải bám execution spine: **Workload → Item Action → Quick Update / Note / Exception → Status Outcome → Return to Workload**.

## 4. Scope blueprint cho phase đầu

Không phải mọi Mobile Ops screen family cần đào sâu ngang nhau trong giai đoạn đầu. Tài liệu này ưu tiên theo logic launch slice.

### Tier A – Blueprint bắt buộc sâu
- Workload Overview Screens.  
- Task Action Screens.  
- Quick Update Screens.  
- Exception and Help Screens.

### Tier B – Blueprint quan trọng ở mức support
- Evidence and Note Capture Screens.  
- Light Status and Progress Screens.  
- Return / confirmation states sau submit.

### Tier C – Blueprint mỏng hơn ở phase đầu
- Session, Access and Utility Screens.  
- Một số subflows ít tần suất hoặc ít trọng số vận hành.

## 5. Blueprint grammar dùng chung cho mọi Mobile Ops screens

Trước khi đi vào từng screen family, tài liệu này khóa một grammar bố cục dùng chung để mọi wireframe mobile nói cùng một ngôn ngữ.

## 5.1 Top orientation zone

Mỗi screen nên có một top orientation zone đủ gọn nhưng rõ, thường gồm:
- item title hoặc workload view title;  
- dominant state hoặc queue identity;  
- context cue ngắn như branch, owner hoặc urgency;  
- back/navigation behavior rõ ràng.

Top zone không nên thành header lớn tốn chỗ. Nó phải phục vụ orientation nhanh trong vài giây đầu.

## 5.2 Primary action body

Đây là vùng chính nơi người dùng đọc đủ để hành động hoặc thực hiện luôn hành động chính. Vùng này phải luôn được ưu tiên hơn metadata phụ.

## 5.3 Supporting context block

Đây là vùng chứa context ngắn cần thiết như short facts, note snippets, approval/waiting cue, recent relevant event hoặc evidence preview. Nó chỉ nên đủ để hành động đúng, không nhằm tái tạo web detail view.

## 5.4 Input / selection zone

Khi một screen đòi update, note, evidence hoặc exception input, vùng nhập liệu phải nằm sát ngữ cảnh hành động đang diễn ra. Không nên bắt người dùng chuyển quá xa sang page khác nếu một sheet hoặc inline step rõ ràng là đủ.

## 5.5 Bottom action zone

Trên mobile, action zone thường nằm gần đáy màn hình hoặc dạng sticky action area. Đây là nơi chứa dominant action và nếu cần thì một secondary action có vai trò rõ ràng. Không nên biến bottom zone thành thanh chứa quá nhiều lựa chọn ngang hàng.

## 5.6 Outcome / return cue zone

Sau submit hoặc sau một update quan trọng, layout phải chừa vùng để hiển thị outcome: trạng thái mới, item đã đi đâu, có cần chờ ai hay quay về queue nào. Đây là vùng cực quan trọng để completion feel trở nên thật.

## 6. Workload Overview Screen blueprints

Workload Overview là default landing của execution personas và là điểm vào cốt lõi của Mobile Ops.

## 6.1 Operational question chính

- Tôi cần làm gì ngay bây giờ?  
- Việc nào là quan trọng nhất?  
- Tôi nên chạm item nào trước?

## 6.2 Blueprint cấu trúc cấp cao

### Zone A – Workload header
- View title: My Work hoặc biến thể phù hợp.  
- Shift/day cue nhẹ nếu cần.  
- Count summary ở mức ngắn: total needing action, in progress, blocked/waiting nếu phù hợp.

### Zone B – Priority segment / tab strip gọn
- Needs Action Now.  
- In Progress.  
- Waiting / Blocked nếu cần.  
- Không nên có quá nhiều segments trong phase đầu.

### Zone C – Primary workload list
- Item cards hoặc rows scanable.  
- Mỗi item nên cho thấy: identity ngắn, dominant state, urgency cue, branch/site cue khi cần, next-step hint ngắn.  
- Tap area phải rõ để vào Task Action screen.

### Zone D – Lightweight workload helpers
- Overdue banner nhỏ.  
- Blocked count cue.  
- Empty-state explanation phù hợp cho từng segment.

### Zone E – Optional quick filters hoặc saved slices rất nhẹ
- Chỉ nên có nếu thực sự giúp user thường xuyên.  
- Không được làm landing rối hơn.

## 6.3 Layout rules

- Danh sách công việc phải chiếm phần lớn màn hình đầu tiên.  
- Urgency và next-step cues phải scan được mà không cần mở item.  
- Navigation tới item action phải một chạm, không vòng qua hub screen.

## 6.4 Không được làm gì

- Không dùng workload screen như dashboard đầy biểu đồ.  
- Không nhồi nhiều tabs hoặc filters như web.  
- Không bắt người dùng đọc quá nhiều text trước khi tìm thấy item cần làm.  
- Không làm item cards quá nặng khiến mỗi card thành một detail page thu nhỏ.

## 7. Task Action Screen blueprints

Task Action Screen là lõi của execution surface. Đây là nơi người dùng hiểu item đủ để làm bước tiếp theo và thực hiện action chính.

## 7.1 Operational question chính

- Item này là gì?  
- Tôi đang cần làm gì với nó?  
- Tôi có đủ thông tin để làm bước tiếp theo chưa?

## 7.2 Blueprint cấu trúc cấp cao

### Zone A – Item identity and state header
- Item title / ID ngắn.  
- Dominant work state hoặc record state phù hợp.  
- Urgency / blocked / waiting / approval cue nếu ảnh hưởng hành động.  
- Back behavior rõ.

### Zone B – Action-oriented summary
- 3–6 facts chính nhất để hành động an toàn.  
- Ví dụ: branch/site, task type, timing cue, short instructions, assignee relevance.  
- Không liệt kê metadata thừa.

### Zone C – Primary action card hoặc action block
- Dominant action phải nổi bật, ví dụ Start, Continue, Complete, Confirm, Mark Done.  
- Nếu action cần một lựa chọn ngắn, lựa chọn đó phải nằm ngay trong block hoặc mở ra một quick step rất gần.

### Zone D – Supporting paths row
- Add note.  
- Add evidence.  
- Mark blocked / Need help.  
- View more status.  
- Các paths này nên là hỗ trợ cho action chính, không cạnh tranh ngang sức với nó.

### Zone E – Short context / recent signals
- Note gần nhất nếu thật hữu ích.  
- Waiting reason, approval-needed reason hoặc blocked explanation.  
- Evidence snapshot nhẹ nếu cần trust cue.

### Zone F – Sticky bottom action area
- Primary action.  
- Secondary safe action nếu cần.  
- Outcome should appear very near after submit.

## 7.3 Layout rules

- Dominant action phải nhìn thấy trong vùng đầu hoặc sau một cuộn rất ngắn.  
- Context block phải ngắn hơn action block về trọng lượng.  
- Paths như note/evidence/exception phải gần action chứ không giấu trong overflow menu nếu chúng là nhu cầu thường gặp.

## 7.4 Không được làm gì

- Không biến Task Action thành record detail dài.  
- Không đẩy action chính xuống đáy sau một khối metadata lớn.  
- Không làm quá nhiều actions ngang hàng khiến người dùng chần chừ.  
- Không giấu state blocker khỏi vùng đầu màn hình.

## 8. Quick Update Screen blueprints

Quick Update là nơi tạo ra phần lớn structured updates trong execution flows. Layout phải cực nhẹ và cực rõ.

## 8.1 Operational question chính

- Tôi đang ghi nhận thay đổi gì?  
- Hệ thống sẽ hiểu update này như thế nào?  
- Sau khi bấm xong item sẽ đi đâu?

## 8.2 Blueprint cấu trúc cấp cao

### Pattern A – Inline quick update block
- Dùng khi update rất đơn giản.  
- Nằm ngay trong Task Action screen.  
- Một selection ngắn hoặc một confirm action là đủ.

### Pattern B – Bottom-sheet quick update
- Dùng khi cần 1–3 input ngắn như reason, status selection hoặc tiny note.  
- Sheet header phải nói rõ action đang xảy ra.  
- Primary confirm ở cuối sheet.

### Pattern C – Lightweight full-screen update
- Dùng khi cần focus cao hơn hoặc keyboard xuất hiện.  
- Vẫn phải giữ header ngắn, item context rõ và bottom action mạnh.

## 8.3 Layout rules

- Mọi quick update pattern phải giữ item identity đủ rõ.  
- Nếu cần note ngắn, note phải xuất hiện sau lựa chọn trạng thái chính, không trước.  
- Confirm copy phải nói outcome thực hơn là chỉ “Save”.

## 8.4 Không được làm gì

- Không để quick update biến thành mini-form.  
- Không xếp nhiều field không liên quan trong cùng một step.  
- Không để người dùng submit xong mà không biết update đã có hiệu lực chưa.

## 9. Evidence and Note Capture Screen blueprints

Family này hỗ trợ trust, trace và exception recovery nhưng phải không phá nhịp execution.

## 9.1 Operational question chính

- Tôi đang thêm note hoặc bằng chứng cho item nào?  
- Tôi cần ghi gì ở mức tối thiểu?  
- Sau khi lưu, thứ này sẽ gắn vào flow ra sao?

## 9.2 Blueprint cấu trúc cấp cao

### Zone A – Context header
- Item identity.  
- Action context, ví dụ Add Note before Completion hoặc Add Evidence for Issue Resolution.  
- Optional requirement cue nếu bằng chứng là bắt buộc.

### Zone B – Input or capture area
- Note field ngắn hoặc structured prompt.  
- Capture/upload trigger.  
- Reason presets nếu thích hợp.

### Zone C – Preview / attached proof region
- Thumbnail hoặc filename cue.  
- Remove / retake / edit nhẹ nếu cần.  
- Không nên biến thành media-management interface lớn.

### Zone D – Bottom confirm area
- Save Note, Attach Evidence hoặc Complete with Proof.  
- Confirmation behavior nên làm rõ thứ gì đã được lưu.

## 9.3 Layout rules

- Capture trigger phải rất rõ và gần vùng confirm.  
- Nếu evidence là required, requirement cue phải nằm trước khi người dùng submit.  
- Note/evidence screens phải dễ quay về Task Action mà không mất orientation.

## 9.4 Không được làm gì

- Không tách note/evidence khỏi item context.  
- Không yêu cầu nhiều trường text dài.  
- Không chôn upload error hoặc success outcome trong vùng khó thấy.  
- Không tạo nhiều step hơn mức hành động chính đáng.

## 10. Exception and Help Screen blueprints

Đây là family cực quan trọng vì nó quyết định liệu ngoại lệ có được đưa vào hệ thống hay bị đẩy ra chat.

## 10.1 Operational question chính

- Tôi không thể đi tiếp vì sao?  
- Tôi nên báo vấn đề này như thế nào nhanh nhất?  
- Sau khi báo, item sẽ chờ ai hoặc sang đâu?

## 10.2 Blueprint cấu trúc cấp cao

### Zone A – Problem header
- Item identity.  
- Exception title như Blocked, Need Help, Need Info, Need Approval.  
- Short explanation of consequence.

### Zone B – Reason selection area
- Reason presets ưu tiên trước.  
- Free text bổ sung nếu cần.  
- Không nên buộc người dùng viết dài ngay từ đầu.

### Zone C – Recovery / routing cue
- Waiting for manager.  
- Sent to branch queue.  
- Needs info from back office.  
- Cue này phải đủ rõ trước hoặc ngay sau confirm.

### Zone D – Optional supporting input
- Short note.  
- Attach evidence nếu thực sự cần.  
- Không nên trở thành compliance form.

### Zone E – Bottom confirm action
- Mark Blocked.  
- Request Help.  
- Send for Approval.  
- Request Info.

## 10.3 Layout rules

- Problem statement và reason selection phải hiện rất sớm.  
- Routing / next-owner cue phải đủ gần confirm action.  
- Nếu exception là common pattern, wireframe phải tối ưu cho vài chạm, không nhiều bước.

## 10.4 Không được làm gì

- Không bắt báo ngoại lệ khó hơn gửi chat.  
- Không dùng wording trừu tượng hoặc enterprise-heavy.  
- Không để người dùng không biết sau confirm item đi đâu.  
- Không biến mọi exception thành full-screen wizard nhiều bước.

## 11. Light Status and Progress Screen blueprints

Family này giúp tạo confidence và orientation trước hoặc sau action.

## 11.1 Operational question chính

- Item đang ở đâu bây giờ?  
- Nó đang chờ gì hoặc chờ ai?  
- Tôi còn phải làm gì nữa không?

## 11.2 Blueprint cấu trúc cấp cao

### Pattern A – Embedded status card
- Dùng trong Task Action screen.  
- Hiển thị current state, short waiting reason và next-step cue.

### Pattern B – Post-action outcome screen
- Dùng khi hành động vừa hoàn tất và user cần confirmation mạnh.  
- Hiển thị success/state change/next destination rõ.

### Pattern C – Lightweight progress step view
- Dùng khi cần hiểu flow stage đơn giản.  
- Không nên thành timeline dài như web.

## 11.3 Layout rules

- Status wording phải rõ hơn visual flourish.  
- Next-step cue phải được viết như chỉ dẫn thực, không mơ hồ.  
- Nếu user không cần ở lâu trên screen này, return-to-work action phải rất gần.

## 11.4 Không được làm gì

- Không biến mobile thành status explorer nặng.  
- Không hiển thị quá nhiều metadata lịch sử.  
- Không làm post-action screen dài hơn bản thân action.

## 12. Session, Access and Utility Screen blueprints

Family này không phải trọng tâm identity của mobile nhưng phải đủ tốt để không phá adoption.

## 12.1 Operational question chính

- Tôi có vào lại được app không?  
- Vì sao tôi chưa thấy việc?  
- Tôi cần làm gì để tiếp tục?

## 12.2 Blueprint cấu trúc cấp cao

### Pattern A – Sign-in / resume view
- Logo/identity vừa đủ.  
- Clear sign-in or resume action.  
- Minimal friction.

### Pattern B – No work / empty assignment view
- Rõ đây là không có việc hay do filter/context.  
- Có refresh hoặc guidance phù hợp.

### Pattern C – Access / retry / session issue view
- Problem statement rõ.  
- Retry or support action rõ.  
- Không dùng technical jargon nặng.

## 12.3 Layout rules

- Utility screens phải ngắn và task-return oriented.  
- Không nên kéo user vào dead-end settings paths.  
- Copy phải trấn an và chỉ hướng tiếp theo rõ.

## 13. Placement policy cho mobile action areas, sheets và overlays

## 13.1 Sticky bottom action policy

- Dùng cho actions tần suất cao hoặc outcomes quan trọng.  
- Chỉ nên có một primary action nổi bật nhất.  
- Secondary actions phải an toàn và rõ vai phụ.

## 13.2 Bottom sheet policy

- Dùng khi mục tiêu là giữ user gần item context mà vẫn nhập được nhanh.  
- Sheet phải có title hành động rõ, entry/exit rõ, và không xếp chồng nhiều lớp nếu không thật cần.  
- Nếu nội dung dài hoặc keyboard chiếm chỗ nhiều, chuyển sang full screen hợp lý hơn.

## 13.3 Full-screen input policy

- Dùng cho evidence/note/correction actions có focus cao hơn.  
- Vẫn phải giữ item context ở top.  
- Return path phải rõ và không làm mất dữ liệu đã nhập.

## 13.4 Overlay restraint policy

- Mỗi overlay thêm vào là một rủi ro orientation.  
- Nếu một flow cần nhiều hơn một lớp overlay để hoàn thành, blueprint nên bị xem xét lại.

## 14. State, context và feedback rules cho mobile wireframes

## 14.1 Dominant state phải luôn nằm trong vùng scan đầu

Item state quan trọng nhất trong context hiện tại phải nhìn thấy trong phần đầu của screen hoặc ngay trên action block.

## 14.2 Blocked / waiting / approval-needed cues phải được nói bằng chữ

Không được dựa hoàn toàn vào icon hoặc màu để diễn đạt các tình huống làm thay đổi hành động.

## 14.3 Outcome feedback phải ở gần nơi người dùng vừa hành động

Sau confirm, update hoặc completion, feedback không nên xuất hiện xa khỏi vùng hành động hoặc biến mất quá nhanh. Người dùng phải hiểu update đã được ghi nhận và item đã dịch chuyển thế nào.

## 14.4 Return-to-work cue là bắt buộc với flows high-frequency

Sau nhiều action trên mobile, điều quan trọng nhất là user quay lại nhịp công việc tiếp theo. Wireframe phải làm lộ điều đó bằng nút quay về queue, tự động điều hướng hợp lý hoặc next-task cue phù hợp.

## 15. Context-preserving navigation rules

## 15.1 Người dùng không nên quên mình đến từ đâu

Khi đi từ Workload vào Item Action, rồi sang Note, Exception hoặc Status Outcome, system phải giữ đường quay lại đủ tự nhiên.

## 15.2 Segment / filter context nên được bảo toàn hợp lý

Nếu user mở item từ Needs Action Now, khi quay lại họ không nên bị rơi về một landing state hoàn toàn khác nếu không có lý do rõ.

## 15.3 Post-action transitions phải giảm suy nghĩ

Sau action, nếu item rời queue hiện tại, UX nên nói rõ điều đó thay vì để user tự suy ra vì sao item biến mất.

## 16. Anti-patterns layout nghiêm trọng phải tránh

## 16.1 Mini web admin syndrome

Màn hình mobile mang quá nhiều blocks, filters, tabs và detail sections theo kiểu web sẽ làm execution surface chậm và nặng.

## 16.2 Form gravity everywhere

Mọi action nhỏ đều mở ra form dài hoặc nhiều field khiến user ngại cập nhật trong đời thực.

## 16.3 Action below the fold by default

Nếu action chính thường xuyên nằm quá sâu dưới màn hình đầu, blueprint đã sai trọng tâm.

## 16.4 Sheet / modal stacking chaos

Nhiều lớp bottom sheet, picker, confirm và note modal chồng nhau sẽ phá orientation rất nhanh.

## 16.5 Weak outcome visibility

Nếu submit xong mà user không thấy trạng thái mới, queue mới hoặc next step mới, mobile sẽ không tạo được trust.

## 16.6 Support paths competing with primary action

Nếu Add Note, Mark Blocked, Attach Evidence, More Info và Complete đều trông mạnh ngang nhau, user sẽ mất nhịp chọn hành động.

## 17. Governance rules cho mọi wireframe Mobile Ops mới

Mọi wireframe mới của Mobile Ops nên đi qua các câu hỏi sau:

1. **Execution moment chính của screen này là gì?**  
2. **Người dùng có thấy dominant action trong vùng đầu không?**  
3. **Context ở đây là minimum sufficient hay đang trượt thành detail dump?**  
4. **State, urgency và blocker cues có đủ rõ bằng text không?**  
5. **Note/evidence/exception paths có đủ gần action chính không?**  
6. **Sau action, outcome và return-to-work có đủ rõ không?**  
7. **Wireframe này có đang cố làm việc của Web Admin không?**  
8. **Nó có đòi typing, scrolling hoặc overlay depth quá mức không?**

## 18. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, errors và recovery messaging xuyên Web Admin và Mobile Ops.  
2. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – checklist review và governance mechanism cho toàn Pack 03.  
3. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules cho mobile execution patterns.  
4. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – form và decision-input patterns cho Web Admin.  
5. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona.  
6. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules về density và responsive states cho Web Admin.  
7. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho interruption-heavy mobile usage nếu phase sau cần sâu hơn.

## 19. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Mobile Ops wireframe blueprints:

1. Mobile Ops wireframes phải được thiết kế theo **execution moment** và **dominant action**, không theo component convenience.  
2. Workload Overview, Task Action, Quick Update và Exception / Help là các blueprints **Tier A bắt buộc sâu**.  
3. Mỗi mobile screen phải có **top orientation zone, primary action body, supporting context block và bottom action logic** rõ vai trò.  
4. Dominant state, urgency và blockers phải xuất hiện trong vùng scan đầu của các screens cốt lõi.  
5. Note, evidence và exception paths phải ở gần action flow, không bị đẩy ra quá xa.  
6. Outcome feedback và return-to-work cues là phần bắt buộc của execution UX, không phải phần phụ.  
7. Blueprints phase đầu phải bảo vệ Mobile Ops khỏi mini-web-admin drift, form-heavy drift và weak-completion-feedback drift.

## 20. Điều kiện hoàn thành của tài liệu

Mobile Ops Wireframe Blueprints được xem là đạt yêu cầu khi:
- team UX và Frontend có cùng cấu trúc nền để triển khai wireframes chi tiết cho Mobile Ops;  
- execution spine đã được chuyển hóa thành blueprint logic đủ rõ cho các màn hình cốt lõi;  
- hierarchy giữa action, state, context, exception và outcome đã được chốt ở mức cấu trúc;  
- và downstream wireframes / UI comps có thể được review dựa trên baseline này thay vì preference cá nhân hoặc component availability.

## AG Execution Prompt

You are acting as a senior mobile UX architect, execution-flow wireframe strategist, and field-operations screen-structure designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops / PWA is the launch-critical execution surface, with taxonomy, user flows, state grammar, data-entry patterns, landing rules, and UX guardrails already defined.
- This document defines the wireframe blueprint baseline for Mobile Ops.

### Objective
Refine this Mobile Ops Wireframe Blueprints document into a production-grade blueprint baseline that can guide detailed mobile wireframes, route layouts, component placement, action hierarchy, post-action transitions, frontend implementation planning, and UX review consistency.

### Inputs
- Use this document plus Mobile Ops Experience Strategy, IA/Navigation Model, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Mobile Ops Screen Taxonomy, Data Entry and Evidence Capture Patterns, and Persona-Based Landing Strategy as the primary source of truth.
- Preserve the execution-surface logic and the wedge-first launch focus.
- Keep the output concrete enough for real downstream wireframing and implementation planning.

### Tasks
1. Rewrite the blueprint thesis into a sharper executive form.
2. Produce a screen-family blueprint register with purpose, layout zones, dominant state emphasis, and primary actions.
3. Add a placement policy for headers, workload lists, action blocks, input zones, bottom actions, sheets, and post-action confirmation areas.
4. Define blueprint rules for outcome feedback, state visibility, context-preserving navigation, and return-to-work behavior.
5. Identify the top five layout failures that would weaken Mobile Ops as an execution surface.
6. Recommend the next documents that should operationalize these blueprints into messaging rules, component behaviors, and review checklists.
7. Add governance rules to prevent mini-web-admin drift, form-heavy drift, and overlay-chaos drift.

### Constraints
- Do not design Mobile Ops as a mobile clone of Web Admin.  
- Do not let forms dominate execution interactions.  
- Do not hide primary actions below excessive detail.  
- Do not separate outcome feedback from the action that triggered it.  
- Keep the output concrete enough for implementation-oriented UX work.

### Output Format
Return a revised markdown document with these sections:
1. Executive Blueprint Thesis
2. Screen-Family Blueprint Register
3. Placement Policy
4. State and Outcome Rules
5. Layout Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Mobile Ops wireframe structure explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams create detailed mobile wireframes without drifting away from execution-surface priorities.
- The output must reduce ambiguity around action placement, context sufficiency, feedback visibility, and return-to-work behavior.
