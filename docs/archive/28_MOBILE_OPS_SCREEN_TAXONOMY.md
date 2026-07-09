# Nextflow OS – Mobile Ops Screen Taxonomy

**Document ID:** 28_MOBILE_OPS_SCREEN_TAXONOMY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Architecture / Product Management  
**Dependent Packs:** Architecture & Core Design, Engineering Implementation, Frontend Delivery, Design System, QA & Support  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES

## 1. Mục tiêu tài liệu

Tài liệu này xác định **taxonomy chính thức của các loại màn hình trong Mobile Ops / PWA** cho Nextflow OS. Nếu Mobile Ops Experience Strategy đã chốt Mobile Ops là execution surface trung tâm, Information Architecture and Navigation Model đã chốt các zones lớn như My Work, Item Action, Update/Evidence/Exception và Light Status Context, còn First Wedge User Flows đã chốt các operational journeys launch-critical của wedge đầu tiên, thì tài liệu này trả lời câu hỏi tiếp theo ở cấp cấu trúc màn hình:

> **Cụ thể Mobile Ops sẽ bao gồm những loại màn hình nào, mỗi loại tồn tại để phục vụ khoảnh khắc công việc nào, mức ưu tiên của từng loại ra sao, và chúng phải nối với nhau như thế nào để tạo thành một execution surface thật sự usable ngoài hiện trường?**

Taxonomy màn hình cho Mobile Ops đặc biệt quan trọng vì execution surfaces rất dễ bị trượt theo hai hướng sai: hoặc bị làm như một **web admin thu nhỏ** với quá nhiều views và chi tiết, hoặc bị làm như một **task app quá mỏng** không đủ state, context và exception handling để vận hành thật. Taxonomy tồn tại כדי khóa lại đúng loại bề mặt UX mà mobile cần có, đúng mức độ sâu và đúng vai trò trong operating model.

Tài liệu này phải khóa chín thứ:
1. Screen taxonomy là gì trong ngữ cảnh Mobile Ops.  
2. Các screen families chính thức của Mobile Ops.  
3. Vai trò, job-to-be-done và interaction style của từng family.  
4. Mối quan hệ giữa các screen families và launch-critical flows.  
5. Mức ưu tiên của từng family trong phase đầu.  
6. Cách các màn hình nối thành execution journeys ngắn, rõ và ít ma sát.  
7. Quy tắc phân biệt workload screens, action screens, input screens, exception screens và support screens.  
8. Những anti-pattern về mobile screen sprawl phải tránh.  
9. Các tài liệu UX tiếp theo nên đào sâu từ taxonomy này.

## 2. Screen taxonomy trong ngữ cảnh Mobile Ops là gì

Trong Nextflow OS, screen taxonomy của Mobile Ops không phải là danh sách routes hay tab names đơn giản. Nó là **hệ phân loại các loại màn hình theo khoảnh khắc thực thi công việc**. Một taxonomy tốt cho mobile phải trả lời:
- người dùng mở loại màn hình này khi nào;  
- họ đang cần hành động hay cần hiểu điều gì;  
- màn hình này có bao nhiêu context là đủ;  
- nó dẫn tới action gì tiếp theo;  
- và nó tuyệt đối không được cố gánh thêm những trách nhiệm nào.

Điều này đặc biệt quan trọng trên mobile vì diện tích hiển thị nhỏ, attention span ngắn, bối cảnh thao tác bị chia cắt và người dùng thường không có kiên nhẫn cho các screen mơ hồ. Nếu taxonomy không rõ, mobile sẽ nhanh chóng thành tập màn hình vá víu, mỗi feature sinh thêm một view, mỗi error sinh thêm một step, và trải nghiệm execution sẽ mất nhịp.

## 3. Taxonomy thesis cho Mobile Ops

Taxonomy thesis của Mobile Ops có thể phát biểu như sau:

> **Mỗi màn hình trong Mobile Ops phải tồn tại để phục vụ một khoảnh khắc thực thi rất cụ thể: thấy việc, hiểu đủ, hành động nhanh, báo ngoại lệ, ghi bằng chứng, hoặc xác nhận kết quả; nếu một màn hình không phục vụ rõ một khoảnh khắc như vậy, nó không nên tồn tại trên mobile.**

Từ thesis này, bảy nguyên lý được suy ra:

1. Screen types trên mobile phải được định nghĩa theo **execution moment**, không theo module tree.  
2. Mobile nên có **ít screen families nhưng rõ vai trò**, thay vì nhiều page types na ná nhau.  
3. Mỗi family phải gắn với một **next-step expectation** rõ.  
4. High-frequency actions phải xảy ra trên những screens có **đường vào ngắn nhất**.  
5. Exception, evidence và status feedback không được bị xem là phần phụ.  
6. Mobile screens phải tối ưu cho **minimum sufficient context**, không phải maximum information density.  
7. Taxonomy launch slice phải bám các flows thực của retail/light-distribution wedge, không dàn trải sang future complexity.

## 4. Các screen families chính thức của Mobile Ops

Mobile Ops của Nextflow OS nên được tổ chức quanh bảy screen families chính thức. Bảy families này là hệ khung của execution surface.

1. **Workload Overview Screens**  
2. **Task Action Screens**  
3. **Quick Update Screens**  
4. **Evidence and Note Capture Screens**  
5. **Exception and Help Screens**  
6. **Light Status and Progress Screens**  
7. **Session, Access and Utility Screens**

Các families này map chặt với strategy, IA và user flows đã chốt trước đó, nhưng đưa logic xuống cấp hành vi màn hình cụ thể hơn.

## 5. Family 1 – Workload Overview Screens

## 5.1 Vai trò

Workload Overview Screens là điểm vào chính của Mobile Ops. Đây là nơi execution persona hoặc branch supervisor ở ngữ cảnh nhanh trả lời câu hỏi: **Tôi hoặc đội tôi đang phải làm gì ngay bây giờ?**

## 5.2 Jobs-to-be-done chính

- Xem my tasks.  
- Xem team tasks ở role phù hợp.  
- Nhận ra việc nào urgent, overdue, blocked hoặc needs attention.  
- Chọn item để đi vào action screen.

## 5.3 Đặc điểm nhận diện

- Scan-first.  
- Tối ưu cho thứ tự ưu tiên hơn là density thông tin.  
- Thể hiện workload theo nhóm đủ trực quan.  
- Cho đường vào item action rất nhanh.

## 5.4 Những gì không nên xảy ra ở đây

- Không biến workload screen thành dashboard dày biểu đồ.  
- Không biến nó thành list phẳng vô tận không có cues.  
- Không nhồi quá nhiều filters hoặc settings.  
- Không bắt người dùng suy luận xem việc nào quan trọng hơn.

## 5.5 Ví dụ màn hình cùng family

- My Work landing screen.  
- Team Work quick board.  
- Urgent items list.  
- Needs Action grouped task list.

## 5.6 Ưu tiên roadmap

**Launch-critical.** Nếu family này yếu, Mobile Ops sẽ không có điểm vào đủ mạnh để được dùng thật hàng ngày.

## 6. Family 2 – Task Action Screens

## 6.1 Vai trò

Task Action Screens là lõi của execution surface. Đây là nơi người dùng mở một item cụ thể và thực hiện hành động chính.

## 6.2 Jobs-to-be-done chính

- Hiểu item là gì ở mức tối thiểu cần thiết.  
- Biết bước tiếp theo là gì.  
- Thực hiện action chính như start, update, complete, confirm hoặc handoff.  
- Điều hướng tiếp sang note/evidence/exception nếu cần.

## 6.3 Đặc điểm nhận diện

- Action-centric.  
- Có một dominant action rõ.  
- Context ngắn gọn nhưng đủ an toàn.  
- Feedback gần action zone.

## 6.4 Những gì không nên xảy ra ở đây

- Không biến thành record detail web thu nhỏ.  
- Không bắt người dùng cuộn dài để thấy action chính.  
- Không bày quá nhiều hành động ngang hàng.  
- Không ẩn status quan trọng khỏi vùng nhìn đầu tiên.

## 6.5 Ví dụ màn hình cùng family

- Item action screen.  
- Start / continue work screen.  
- Final step action view.  
- Team task quick action screen cho supervisor.

## 6.6 Ưu tiên roadmap

**Launch-critical.** Đây là family quyết định liệu mobile có thực sự là execution surface hay không.

## 7. Family 3 – Quick Update Screens

## 7.1 Vai trò

Quick Update Screens là các bề mặt tối ưu cho việc cập nhật trạng thái hoặc xác nhận bước xử lý với ma sát thấp nhất có thể.

## 7.2 Jobs-to-be-done chính

- Mark in progress.  
- Mark complete.  
- Confirm step done.  
- Change a lightweight work status.  
- Trigger next step rõ ràng.

## 7.3 Đặc điểm nhận diện

- Ít trường nhập.  
- Ít bước.  
- Feedback gần như tức thì.  
- Dễ quay lại workload flow.

## 7.4 Những gì không nên xảy ra ở đây

- Không biến quick update thành mini-form.  
- Không bắt xác nhận thừa cho mọi cập nhật nhỏ.  
- Không làm outcome feedback mơ hồ.  
- Không để người dùng rơi vào dead-end sau khi submit.

## 7.5 Ví dụ màn hình cùng family

- Status update sheet.  
- Complete task confirmation view.  
- Lightweight step-confirm screen.  
- Quick reassignment confirmation ở scope rất hẹp nếu phase cho phép.

## 7.6 Ưu tiên roadmap

**Launch-critical.** Vì phần lớn giá trị của mobile nằm ở structured updates diễn ra thật.

## 8. Family 4 – Evidence and Note Capture Screens

## 8.1 Vai trò

Evidence and Note Capture Screens hỗ trợ ghi nhận những thông tin bổ sung cần thiết để flow tin cậy hơn, approval nhanh hơn hoặc trace rõ hơn.

## 8.2 Jobs-to-be-done chính

- Thêm note ngắn.  
- Ghi chú structured prompt nếu cần.  
- Chụp hoặc đính bằng chứng phù hợp.  
- Gắn note/evidence vào đúng item đúng thời điểm.

## 8.3 Đặc điểm nhận diện

- Input-light.  
- Gần action context.  
- Không phá nhịp xử lý chính.  
- Có confirmation đủ rõ sau khi ghi nhận.

## 8.4 Những gì không nên xảy ra ở đây

- Không bắt nhập quá nhiều text tự do.  
- Không tách note/evidence khỏi item context.  
- Không để upload flow phức tạp hơn bản thân việc thực thi.  
- Không yêu cầu proof cho mọi hành động nếu không có giá trị rõ.

## 8.5 Ví dụ màn hình cùng family

- Add note sheet.  
- Evidence capture screen.  
- Completion proof attachment step.  
- Short structured note prompt.

## 8.6 Ưu tiên roadmap

**High-supporting / launch-important.** Không phải action nào cũng cần, nhưng khi cần thì family này phải đủ nhẹ để được dùng thật.

## 9. Family 5 – Exception and Help Screens

## 9.1 Vai trò

Exception and Help Screens xử lý những khoảnh khắc item không đi tiếp được bình thường: blocked, missing info, need help, need approval hoặc other recovery-trigger moments.

## 9.2 Jobs-to-be-done chính

- Đánh dấu item bị blocked hoặc needs help.  
- Chỉ ra lý do ngắn gọn.  
- Gửi request đúng hướng như request info hoặc request approval.  
- Quay item vào recovery flow mà không rời hệ thống.

## 9.3 Đặc điểm nhận diện

- Problem-first.  
- Action-to-recovery rõ.  
- Ngôn ngữ ngắn và thực tế.  
- Không đòi người dùng đọc policy phức tạp.

## 9.4 Những gì không nên xảy ra ở đây

- Không bắt người dùng đi nhiều bước hơn chat để báo ngoại lệ.  
- Không đẩy exception ra ngoài app.  
- Không dùng labels quá enterprise hoặc khó hiểu.  
- Không biến exception screen thành form compliance nặng.

## 9.5 Ví dụ màn hình cùng family

- Mark blocked screen.  
- Needs info prompt.  
- Request help / escalate light screen.  
- Request approval trigger view.

## 9.6 Ưu tiên roadmap

**Launch-critical đến high-supporting.** Với wedge đầu tiên, ít nhất các exception moments cốt lõi phải được thiết kế đàng hoàng vì đây là chỗ operating model hay gãy nhất.

## 10. Family 6 – Light Status and Progress Screens

## 10.1 Vai trò

Light Status and Progress Screens giúp người dùng hiểu item đang ở đâu trong flow ở mức vừa đủ để yên tâm trước và sau action.

## 10.2 Jobs-to-be-done chính

- Xem current state.  
- Hiểu item đang chờ gì hoặc chờ ai ở mức tối thiểu.  
- Thấy tiến triển sau action.  
- Kiểm tra nhanh kết quả vừa cập nhật.

## 10.3 Đặc điểm nhận diện

- Context-light.  
- Signal-oriented.  
- Ít hơn history-heavy web views.  
- Có thể xuất hiện như subview hoặc section rõ nghĩa, không luôn cần page độc lập.

## 10.4 Những gì không nên xảy ra ở đây

- Không biến mobile thành audit timeline explorer.  
- Không đưa quá nhiều metadata thời gian và system fields.  
- Không làm người dùng phải giải mã nhiều labels để hiểu item đang ở đâu.

## 10.5 Ví dụ màn hình cùng family

- Current status snapshot.  
- Simple progress step view.  
- Post-action status confirmation view.  
- Waiting / blocked context card.

## 10.6 Ưu tiên roadmap

**Launch-supporting nhưng rất quan trọng cho confidence.** Family này có thể mảnh hơn web history views, nhưng không thể vắng mặt.

## 11. Family 7 – Session, Access and Utility Screens

## 11.1 Vai trò

Session, Access and Utility Screens hỗ trợ người dùng vào app, giữ được phiên thao tác, xử lý một số tình huống tiện ích nền và bảo vệ nhịp sử dụng hằng ngày.

## 11.2 Jobs-to-be-done chính

- Đăng nhập và quay lại app nhanh.  
- Chọn context cơ bản nếu flow phase đầu cần.  
- Xử lý empty / offline-like / retry / access-denied situations ở mức phù hợp.  
- Giữ user không bị rơi khỏi flow vì utility friction.

## 11.3 Đặc điểm nhận diện

- Supportive.  
- Không nên chiếm spotlight của execution flows.  
- Focus vào continuity và reliability hơn là feature depth.

## 11.4 Những gì không nên xảy ra ở đây

- Không biến utility screens thành mini settings area lớn.  
- Không kéo người dùng ra khỏi work context quá nhiều.  
- Không để những screens này định nghĩa bản sắc của Mobile Ops.

## 11.5 Ví dụ màn hình cùng family

- Sign-in / resume session screen.  
- Access issue screen.  
- Retry / sync-later message view.  
- No-work-assigned empty utility view.

## 11.6 Ưu tiên roadmap

**Launch-supporting.** Cần đủ tốt để không phá adoption, nhưng không nên nuốt trọng tâm execution.

## 12. Mối quan hệ giữa các screen families

Taxonomy mobile chỉ hữu ích khi các families nối với nhau theo nhịp thao tác thật.

## 12.1 Từ Workload sang Action

Workload Overview Screens giúp người dùng thấy việc cần làm; Task Action Screens giúp họ vào đúng item và chuẩn bị thực thi hành động chính.

## 12.2 Từ Action sang Quick Update

Khi người dùng hiểu item đủ rồi, họ nên đi sang hoặc kích hoạt Quick Update pattern rất ngắn để ghi nhận tiến độ hoặc completion.

## 12.3 Từ Action sang Evidence / Exception

Nếu cần note, bằng chứng hoặc báo vấn đề, Task Action Screen phải dẫn tự nhiên sang Evidence and Note Capture hoặc Exception and Help Screens mà không làm mất item context.

## 12.4 Từ Update về Workload hoặc Status Confidence

Sau khi cập nhật, người dùng nên được đưa về workload phù hợp hoặc nhìn thấy Light Status / Progress cue đủ rõ để biết item đã đi đâu.

## 12.5 Utility như nền, không phải xương sống

Session, Access and Utility Screens hỗ trợ continuity nhưng không nên trở thành xương sống điều hướng của mobile. Xương sống thật phải là Workload → Action → Update / Exception / Evidence → Status Outcome.

## 13. Mobile execution spine

Nếu Web Admin có control spine là Overview → Work → Record → Decision/Recovery, thì Mobile Ops cần một execution spine tương ứng.

### Execution spine chính thức
**Workload → Item Action → Quick Update / Note / Exception → Status Outcome → Return to Workload**

Spine này là nguyên tắc rất quan trọng vì nó giữ mobile luôn bám hành vi thao tác thật. Nếu một screen mới không map được vào spine này hoặc một nhánh hợp lệ của nó, team nên xem lại vì rất có thể screen đó không thuộc mobile execution surface.

## 14. Screen priority model cho launch slice

Không phải mọi screen family cần đầu tư ngang nhau ở phase đầu.

## 14.1 Tier A – Launch-critical families

- Workload Overview Screens  
- Task Action Screens  
- Quick Update Screens

Ba families này tạo ra lõi adoption của Mobile Ops. Nếu yếu, mobile mất lý do tồn tại.

## 14.2 Tier B – High-supporting families

- Evidence and Note Capture Screens  
- Exception and Help Screens  
- Light Status and Progress Screens

Đây là các families tạo safety, trust và khả năng xử lý tình huống thật. Không nên bỏ, nhưng có thể bắt đầu ở phạm vi tối giản có kỷ luật.

## 14.3 Tier C – Utility-supporting family

- Session, Access and Utility Screens

Cần đủ tốt để không gây gãy flow, nhưng không nên chiếm phần lớn effort thiết kế sâu trong launch slice.

## 15. Screen-type rules để tránh trùng lặp và phình mobile

## 15.1 Workload screens không nên cố làm action screens

Nếu một list screen cần quá nhiều thao tác inline để hoàn thành công việc, mobile sẽ rối. Workload screen nên ưu tiên scan và entry into action hơn là ôm mọi interaction.

## 15.2 Action screens không nên cố làm detail screens đầy đủ

Task Action Screen phải đủ context để làm đúng, không phải chứa toàn bộ metadata, history và object detail như web.

## 15.3 Quick update screens không nên cố làm exception workflows đầy đủ

Nếu một update bị chặn bởi ngoại lệ thực sự, người dùng nên đi sang Exception and Help flow rõ ràng thay vì nhồi mọi trường hợp vào cùng một update sheet.

## 15.4 Evidence screens không nên tồn tại tách rời item context

Ghi nhận bằng chứng hoặc note mà người dùng không thấy rõ đang gắn với item nào là nguồn gây lỗi và distrust rất lớn.

## 15.5 Utility screens không nên thành nơi trú ẩn cho logic chưa rõ

Khi product hoặc flow chưa rõ, team rất dễ đẩy một bước mới vào utility/support screens. Đây là anti-pattern vì nó phá taxonomy và che giấu vấn đề gốc.

## 16. Anti-patterns về mobile screen sprawl phải tránh

## 16.1 Mỗi status một màn hình riêng

Nếu mọi biến thể nhỏ của status đều sinh thêm page, mobile sẽ phân mảnh và khó học rất nhanh.

## 16.2 Mini web admin syndrome

Khi mobile bắt đầu có quá nhiều tabs, filters, summaries, detail blocks và settings giống web, execution surface sẽ mất nhịp.

## 16.3 Modal / bottom-sheet proliferation without grammar

Dùng quá nhiều sheet, modal và overlay mà không có quy luật sẽ làm người dùng mất orientation và không hiểu mình đang ở bước nào.

## 16.4 Form gravity

Mọi action dần bị kéo thành form có nhiều trường vì team muốn “thu thêm dữ liệu”. Đây là con đường nhanh nhất giết adoption của mobile.

## 16.5 Utility-first mobile

Khi sign-in, settings, access handling hoặc sync/retry screens được đầu tư logic nhiều hơn execution moments, bản sắc của mobile bị đảo ngược.

## 17. Mapping taxonomy với launch-critical flows

Taxonomy mobile phải map trực tiếp vào các flows đã chốt trong First Wedge User Flows.

### Flow C – Operator execution and status update
- Workload Overview → Task Action → Quick Update → Status Outcome.

### Flow E – Exception / blocked / missing-info handling
- Task Action → Exception and Help → Return to queue/recovery state.

### Flow F – Completion, confirmation and trace confidence
- Task Action → Quick Update / Evidence Capture → Light Status and Progress → Return to Workload.

### Hỗ trợ cho Flow B và D
- Mobile có thể đóng vai trò phụ ở một số coordination moments rất nhẹ, nhưng không thay Web Admin trong triage sâu hoặc decision context nặng.

## 18. Governance rules cho mọi màn hình Mobile Ops mới

Mọi đề xuất màn hình mới trên mobile nên đi qua các câu hỏi sau:

1. **Màn hình này thuộc family nào?**  
2. **Nó phục vụ execution moment nào?**  
3. **Nó có đường vào và đường ra rõ trong execution spine không?**  
4. **Nó có giúp action nhanh hơn, an toàn hơn hoặc recovery rõ hơn không?**  
5. **Nó có đang cố mang logic của Web Admin sang mobile không?**  
6. **Nó có đòi quá nhiều typing, scrolling hoặc context switching không?**  
7. **Nó có thể là sub-state của family hiện có thay vì một screen mới không?**  
8. **Nó có vô tình đẩy mobile sang form-heavy hoặc utility-heavy direction không?**

Nếu không trả lời được rõ, màn hình đó chưa nên tồn tại trong taxonomy.

## 19. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS.md** – patterns cho nhập liệu nhanh, note, proof và exception capture.  
2. **30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS.md** – landing strategies và default views theo persona.  
3. **31_WEB_ADMIN_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Web Admin.  
4. **32_MOBILE_OPS_WIREFRAME_BLUEPRINTS.md** – wireframe blueprints cho Mobile Ops.  
5. **33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES.md** – patterns cho empty states, error states và recovery messaging.  
6. **34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE.md** – review checklist và governance cơ chế.  
7. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – component behavior rules riêng cho mobile execution patterns.

## 20. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Mobile Ops taxonomy:

1. Mobile Ops được tổ chức thành **7 screen families chính thức**.  
2. Taxonomy mobile phải phản ánh **execution moments**, không phản ánh module tree hay web routes.  
3. Execution spine chính thức của Mobile Ops là **Workload → Item Action → Quick Update / Note / Exception → Status Outcome → Return to Workload**.  
4. Workload Overview, Task Action và Quick Update là các families **launch-critical**.  
5. Evidence/Note Capture, Exception/Help và Light Status/Progress là **high-supporting** cho adoption và operational trust.  
6. Session/Access/Utility screens phải hiện diện nhưng không được lái bản sắc của execution surface.  
7. Mọi màn hình mobile mới phải map vào taxonomy này trước khi đi vào wireframe sâu hoặc build.

## 21. Điều kiện hoàn thành của tài liệu

Mobile Ops Screen Taxonomy được xem là đạt yêu cầu khi:
- team UX, Product, Frontend và QA có cùng từ điển về các loại màn hình của Mobile Ops;  
- execution spine đã rõ đủ để đi tiếp sang wireframes và component behavior;  
- mọi mobile screen mới có thể được map vào family phù hợp thay vì sinh ngẫu hứng;  
- và nguy cơ trượt thành mini web admin hoặc form-heavy mobile đã được kiểm soát ở level cấu trúc.

## AG Execution Prompt

You are acting as a senior mobile UX architect, execution-surface systematizer, and field-operations interaction designer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops / PWA is the launch-critical execution surface.
- This document defines the official screen taxonomy for Mobile Ops.

### Objective
Refine this Mobile Ops Screen Taxonomy into a production-grade screen-system baseline that can guide UX decomposition, mobile route planning, wireframe planning, component behavior planning, and launch-scope prioritization.

### Inputs
- Use this document plus Mobile Ops Experience Strategy, IA/Navigation Model, First Wedge User Flows, State and Status Presentation Rules, and UX Guardrails as the primary source of truth.
- Preserve the execution-surface logic and the wedge-first launch focus.
- Keep the output useful for downstream UX, frontend, and QA planning.

### Tasks
1. Rewrite the taxonomy thesis into a sharper executive form.
2. Produce a screen-family register with purpose, primary persona, key jobs-to-be-done, and priority tier.
3. Add a screen-relationship map showing how families connect through execution journeys.
4. Define rules for when a new mobile screen deserves its own screen versus belonging inside an existing family.
5. Identify the top five mobile screen-sprawl risks that would weaken adoption.
6. Recommend the next documents that should operationalize this taxonomy into patterns, wireframes, and component rules.
7. Add governance rules to prevent mobile from becoming a mini web admin or a form-heavy tool.

### Constraints
- Do not turn Mobile Ops into a mobile clone of Web Admin.  
- Do not let utility or settings screens dominate the taxonomy.  
- Do not blur the distinction between workload, action, update, exception, and status screens.  
- Do not create screen families that reflect engineering structure instead of execution moments.  
- Keep the output concrete enough for implementation planning.

### Output Format
Return a revised markdown document with these sections:
1. Executive Taxonomy Thesis
2. Screen Family Register
3. Screen Relationship Map
4. New-Screen Decision Rules
5. Screen-Sprawl Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make the Mobile Ops screen system explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams design and build Mobile Ops without ad hoc screen sprawl.
- The output must reduce ambiguity between workload views, action views, input views, exception flows, and utility screens.
