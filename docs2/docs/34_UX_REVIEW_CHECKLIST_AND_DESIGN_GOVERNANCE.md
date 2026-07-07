# Nextflow OS – UX Review Checklist and Design Governance

**Document ID:** 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Product Management / UX Systems  
**Dependent Packs:** Engineering Implementation, Frontend Delivery, Design System, QA & Support, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES

## 1. Mục tiêu tài liệu

Tài liệu này xác định **hệ checklist review UX và cơ chế design governance chính thức** cho toàn Pack 03 của Nextflow OS. Nếu các tài liệu trước đã lần lượt khóa strategy, IA/navigation, taxonomy, user flows, state grammar, interaction guardrails, input patterns, landing logic, wireframe blueprints và messaging grammar, thì tài liệu này trả lời câu hỏi tiếp theo ở level tổ chức thực thi:

> **Làm thế nào để toàn bộ hệ thống trải nghiệm của Pack 03 tiếp tục nhất quán khi đi từ tài liệu chiến lược xuống wireframe chi tiết, component behavior, frontend implementation, QA review, pilot feedback và các vòng refine sau đó?**

Nói ngắn gọn, đây là tài liệu biến toàn bộ Pack 03 từ một tập document tốt thành một **hệ kỷ luật review có thể vận hành được**. Nếu không có cơ chế governance rõ, mọi baseline đã chốt trước đó sẽ bị bào mòn rất nhanh bởi sprint pressure, custom requests, local optimizations, visual taste cá nhân hoặc các “temporary exceptions” không bao giờ bị thu hồi. Khi đó product vẫn có tài liệu, nhưng không còn coherence.

Tài liệu này phải khóa mười ba thứ:
1. Design governance là gì trong ngữ cảnh Nextflow OS.  
2. Mục tiêu và phạm vi của UX review trong Pack 03.  
3. Các loại review chính thức cần tồn tại.  
4. Checklist review chung cho mọi UX deliverables.  
5. Checklist riêng cho Web Admin.  
6. Checklist riêng cho Mobile Ops.  
7. Checklist riêng cho states, messaging và recovery behavior.  
8. Checklist riêng cho forms, inputs và evidence capture.  
9. Cách phân loại severity khi phát hiện UX issues.  
10. Cách xử lý exception, variance và waiver requests.  
11. Vai trò của Product, Design, Frontend và QA trong governance loop.  
12. Nhịp review tối thiểu xuyên discovery, delivery và pilot.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Design governance trong ngữ cảnh Nextflow OS là gì

Trong Nextflow OS, design governance không phải là tầng kiểm soát quan liêu để làm chậm delivery. Nó là **cơ chế bảo vệ tính nhất quán của product identity và experience logic** khi nhiều người, nhiều sprint và nhiều quyết định nhỏ cùng tác động lên cùng một hệ thống.

Design governance đặc biệt quan trọng với Pack 03 vì đây là pack chạm trực tiếp tới:
- cách người dùng hiểu hệ thống;  
- cách người dùng vào việc;  
- cách họ nhìn state;  
- cách họ thực hiện action;  
- cách họ báo ngoại lệ;  
- và cách họ hồi phục khi flow gãy.

Nếu governance yếu, những drift sau sẽ xảy ra gần như chắc chắn:
- Web Admin dần thành dashboard nặng hoặc table dump.  
- Mobile Ops dần thành mini web admin hoặc form-heavy tool.  
- Status semantics bị rò rỉ thành nhiều cách gọi khác nhau.  
- Error/recovery messaging trở nên generic và thiếu trust.  
- Persona-based landing bị thay bằng homepage chung hoặc random-last-page logic.  
- Teams thêm patterns mới mà không đối chiếu với grammar hiện có.

## 3. Governance thesis cho Pack 03

Governance thesis của tài liệu này có thể phát biểu như sau:

> **Mọi thay đổi UX trong Pack 03 phải được review như một thay đổi hệ thống chứ không chỉ là thay đổi màn hình; nếu một quyết định cục bộ làm suy yếu clarity, role-fit, state truth, execution momentum hoặc cross-surface coherence, nó phải bị chặn hoặc được tái thiết kế trước khi đi vào build.**

Từ thesis này, mười nguyên lý governance được suy ra:

1. Review phải ưu tiên **system integrity** hơn là local polish.  
2. Mọi UX deliverable quan trọng phải được đối chiếu với baseline documents của Pack 03.  
3. Không có màn hình nào được xem là “nhỏ quá nên khỏi review”.  
4. Web và Mobile phải được review vừa như hai surfaces riêng, vừa như một hệ thống chung.  
5. States, actions, messages và recovery paths phải được review như first-class concerns.  
6. UX review không chỉ là việc của Design; Product, Frontend và QA đều có vai trò bắt buộc.  
7. Exception requests phải có lý do rõ và có thời hạn, không được trở thành drift vĩnh viễn.  
8. Severity của UX issues phải được phân loại đủ rõ để ưu tiên đúng.  
9. Pilot feedback phải đi qua governance loop, không được nhảy thẳng vào patchwork design.  
10. Governance phải đủ nhẹ để đi cùng delivery, nhưng đủ mạnh để chặn erosion của product logic.

## 4. Mục tiêu chính của UX review trong Pack 03

UX review trong Pack 03 không chỉ nhằm “bắt lỗi UI”. Nó nhằm bảo vệ sáu mục tiêu lớn:

1. **Operational clarity** – người dùng hiểu điều gì đang xảy ra và nên làm gì tiếp.  
2. **Role-fit usability** – mỗi surface và mỗi screen đúng với persona và context.  
3. **State integrity** – record/work/approval/exception states được biểu đạt đúng và nhất quán.  
4. **Flow momentum** – người dùng không bị chậm đi vô cớ bởi interaction nặng, wording mơ hồ hoặc recovery yếu.  
5. **Recovery quality** – khi có ngoại lệ hoặc lỗi, hệ thống vẫn dẫn người dùng quay lại quỹ đạo.  
6. **Cross-surface coherence** – Web Admin và Mobile Ops khác nhau đúng cách, nhưng không mâu thuẫn semantics.

## 5. Các loại review chính thức cần tồn tại

Pack 03 nên có ít nhất bảy loại review chính thức. Chúng không nhất thiết là bảy cuộc họp khác nhau, nhưng phải tồn tại như bảy góc nhìn bắt buộc.

1. **Strategy alignment review** – kiểm tra feature/screen mới có còn đúng với Pack 03 baseline không.  
2. **Information architecture review** – kiểm tra vị trí của screen/flow trong hệ cấu trúc.  
3. **Wireframe structure review** – kiểm tra layout, hierarchy, dominant action, state placement.  
4. **Interaction and state review** – kiểm tra actions, transitions, state semantics, blocked/approval/recovery logic.  
5. **Copy and message review** – kiểm tra microcopy, labels, errors, empty states, recovery guidance.  
6. **Implementation fidelity review** – kiểm tra frontend build có lệch blueprint / behavior / wording không.  
7. **Pilot feedback review** – kiểm tra các phản hồi thực tế trước khi biến thành thay đổi thiết kế.

## 6. Review artifacts bắt buộc trước khi vào build

Để governance có hiệu lực thật, một UX change hoặc feature slice không nên đi vào build nếu thiếu các artifacts tối thiểu sau ở mức phù hợp scope:

- screen purpose / operational question;  
- persona and surface mapping;  
- flow entry and exit logic;  
- state and status mapping;  
- primary actions và expected outcomes;  
- error / empty / recovery behavior;  
- wireframe hoặc structured layout spec;  
- notes về deviations khỏi baseline nếu có.

Không phải scope nào cũng cần artifact dày như nhau, nhưng thiếu các điểm nền trên sẽ khiến review mất chất lượng và dễ hợp thức hóa thiết kế mơ hồ.

## 7. Checklist review chung cho mọi UX deliverables

Đây là checklist lõi áp dụng cho mọi screen, flow, component hoặc pattern mới trong Pack 03.

## 7.1 Product-fit questions

1. Deliverable này phục vụ persona nào?  
2. Nó thuộc surface nào và có đúng vai trò surface đó không?  
3. Nó hỗ trợ flow launch-critical nào hoặc support flow nào?  
4. Nó có bám wedge đầu tiên hay đang kéo scope sang future slice?

## 7.2 Clarity questions

1. Operational question chính của screen/flow có rõ không?  
2. Người dùng có biết mình đang ở đâu và nên làm gì tiếp không?  
3. State quan trọng nhất có hiện đủ rõ không?  
4. Outcome sau action có được làm rõ không?

## 7.3 Interaction questions

1. Dominant action có rõ không?  
2. Có quá nhiều actions ngang hàng không?  
3. Có bước nào thừa hoặc ma sát không cần thiết không?  
4. Recovery path khi lỗi / blocked / waiting có gần enough không?

## 7.4 Coherence questions

1. Pattern này có trùng hay mâu thuẫn với pattern đã có không?  
2. Wording có nhất quán với status và message grammar không?  
3. Nó có làm lệch distinction giữa Web Admin và Mobile Ops không?  
4. Nó có dùng UI để che product logic chưa rõ không?

## 8. Checklist riêng cho Web Admin

Web Admin phải được review qua các câu hỏi riêng vì đây là control surface và rất dễ bị drift theo dashboard/table/admin gravity.

## 8.1 Control-surface checklist

1. Screen này có giúp triage, decision hoặc coordination tốt hơn không?  
2. Priority signals có nằm đủ cao trong hierarchy không?  
3. Approval / blocked / overdue cues có bị chìm không?  
4. Filters và grouping có hỗ trợ điều phối thật hay chỉ thêm complexity?

## 8.2 Layout checklist

1. Primary workspace có thật sự là vùng nổi bật nhất không?  
2. Actions quan trọng có nằm gần decision context không?  
3. History/trace có đủ gần để tạo trust nhưng không lấn primary task không?  
4. Screen có đang trở thành detail dump hoặc table dump không?

## 8.3 Decision-quality checklist

1. Người dùng có đủ context để approve / reject / reassign / recover đúng không?  
2. Outcome của quyết định có được giải thích rõ không?  
3. Reasoning input có vừa đủ, không quá ít cũng không quá nặng không?  
4. Có đang bắt người dùng nhớ quá nhiều giữa các vùng màn hình không?

## 9. Checklist riêng cho Mobile Ops

Mobile Ops phải được review qua một lăng kính khác vì mục tiêu chính là execution momentum ngoài hiện trường.

## 9.1 Execution-surface checklist

1. Screen này có giúp user đi từ thấy việc đến làm việc nhanh hơn không?  
2. Dominant action có thấy ngay hoặc rất sớm không?  
3. Context có đủ để hành động an toàn mà không thành detail dump không?  
4. Return-to-work path có rõ không?

## 9.2 Input-burden checklist

1. Có đang yêu cầu typing quá nhiều không?  
2. Có thể thay bằng selections, presets hoặc defaults không?  
3. Note/evidence/exception paths có đủ gần action chính không?  
4. Quick updates có đang trượt thành mini-forms không?

## 9.3 Orientation checklist

1. User có biết item nào mình đang thao tác không?  
2. State blocker như blocked / waiting / approval-needed có hiện bằng text đủ rõ không?  
3. Outcome sau submit có đủ gần vùng hành động không?  
4. Overlay / sheet / modal depth có đang quá nhiều không?

## 10. Checklist riêng cho state, messaging và recovery

Đây là vùng mà nhiều team thường review thiếu sâu, dù nó ảnh hưởng mạnh tới trust và comprehension.

## 10.1 State integrity checklist

1. Record / work / approval / exception state có bị lẫn nhau không?  
2. Dominant state trong context này có hợp lý không?  
3. Blocked, Waiting, Pending Approval và Overdue có được phân biệt đúng không?  
4. Web và Mobile có đang giữ cùng semantics không?

## 10.2 Messaging checklist

1. Message này giải thích empty, validation, error, stale hay permission moment nào?  
2. Nó có nói impact hiện tại không?  
3. Nó có nói next step gần nhất không?  
4. Placement có đúng với độ nghiêm trọng và context không?

## 10.3 Recovery checklist

1. Người dùng có con đường quay lại flow đủ rõ không?  
2. Recovery có gần nguồn vấn đề không?  
3. User có mất dữ liệu / mất orientation không?  
4. Có đang dùng generic toast cho một vấn đề recovery nặng không?

## 11. Checklist riêng cho forms, inputs và evidence capture

## 11.1 Input necessity checklist

1. Mỗi field có thật sự cần cho outcome, routing, decision hoặc traceability không?  
2. Có field nào đang tồn tại chỉ vì “biết đâu sau này cần” không?  
3. Có đang dùng note/free text để vá thiếu structure không?  
4. Evidence requirement có giá trị vận hành thật không?

## 11.2 Input usability checklist

1. Validation có gần nguồn lỗi không?  
2. Người dùng có giữ được dữ liệu khi lỗi xảy ra không?  
3. Confirm / submit copy có nói outcome không?  
4. Correction/retry flow có dễ hiểu không?

## 11.3 Mobile-heavy risk checklist

1. Keyboard có xuất hiện quá sớm hoặc quá thường xuyên không?  
2. Bottom sheet / modal có đang chồng nhiều lớp không?  
3. Người dùng có thể hoàn thành tác vụ trong vài bước không?  
4. Pattern này có cạnh tranh được với cám dỗ chat ngoài hệ thống không?

## 12. Severity model cho UX issues

Để review không rơi vào tranh luận cảm tính, Pack 03 nên dùng severity model rõ ràng cho UX issues.

## 12.1 Severity 1 – System-breaking UX issue

Đây là lỗi làm gãy bản chất của surface hoặc flow. Ví dụ:
- Mobile action flow nặng đến mức người dùng hợp lý hơn khi quay ra chat.  
- Web approval screen thiếu context khiến quyết định sai có khả năng cao.  
- State semantics bị hiển thị sai meaning.  
- Recovery path chính bị vắng mặt.

Severity 1 không nên đi vào build hoặc release nếu chưa được xử lý.

## 12.2 Severity 2 – High-risk usability issue

Đây là lỗi chưa gãy hoàn toàn nhưng có thể gây hiểu sai lớn, làm chậm mạnh hoặc làm trust giảm đáng kể. Ví dụ actions quá ngang hàng, error feedback quá mơ hồ, outcome không rõ hoặc filters làm triage rối.

Severity 2 phải có plan sửa rõ trước release hoặc phải có waiver được phê duyệt có thời hạn.

## 12.3 Severity 3 – Moderate friction issue

Đây là lỗi tạo ma sát, tăng số bước, tăng scanning effort hoặc làm copy kém rõ nhưng chưa phá logic nền. Severity 3 vẫn nên được theo dõi có hệ thống, không nên bỏ mặc tích lũy.

## 12.4 Severity 4 – Low-impact polish issue

Đây là lỗi chủ yếu về tinh chỉnh trình bày, wording nhẹ hoặc alignment nhỏ. Chúng quan trọng sau này nhưng không nên được dùng để che khuất các vấn đề severity cao hơn.

## 13. Exception, variance và waiver rules

Governance thực tế phải cho phép variance, nhưng variance phải bị kiểm soát.

## 13.1 Khi nào variance là hợp lệ

- Khi có ràng buộc kỹ thuật tạm thời nhưng logic UX lõi vẫn được bảo vệ.  
- Khi pilot feedback cho thấy baseline hiện tại chưa đủ cho một bối cảnh thật.  
- Khi một tenant/use-case trong wedge đầu có nhu cầu khác đáng kể và được đánh giá là có giá trị chiến lược.

## 13.2 Exception request phải nêu rõ gì

Mỗi exception request nên nêu:
- baseline nào đang bị lệch;  
- vì sao lệch là cần thiết;  
- tác động tới semantics, flows hoặc surfaces;  
- risk nếu chấp nhận;  
- plan quay lại baseline hoặc plan update baseline nếu exception chứng minh đúng.

## 13.3 Waiver không được là “vĩnh viễn mặc định”

Mọi waiver nên có thời hạn review lại. Nếu không, product sẽ tích lũy “temporary deviations” thành hệ thống mới nhưng không ai chủ động thiết kế nó.

## 14. Vai trò của từng function trong governance loop

## 14.1 Product Management

Product chịu trách nhiệm:
- giữ scope bám wedge;  
- nêu operational intent rõ;  
- tránh biến mọi yêu cầu pilot thành feature/screen mới;  
- và bảo đảm trade-offs được quyết định ở level hệ thống, không chỉ sprint local.

## 14.2 Product Design / UX Systems

Design chịu trách nhiệm:
- giữ coherence giữa các tài liệu và output thiết kế;  
- chủ trì reviews về structure, interaction, state, messaging và pattern fit;  
- duy trì grammar xuyên surfaces;  
- và đề xuất khi nào baseline cần cập nhật chính thức.

## 14.3 Frontend Engineering

Frontend chịu trách nhiệm:
- phát hiện deviations giữa blueprint và implementation;  
- báo sớm khi component hoặc technical constraints làm đổi behavior;  
- không tự ý phát minh interaction semantics chỉ để tiện build;  
- và tham gia review fidelity trước QA.

## 14.4 QA

QA chịu trách nhiệm:
- test không chỉ feature chạy hay không mà còn user có hiểu đúng không;  
- kiểm tra messaging, state semantics và recovery quality;  
- phát hiện cross-surface inconsistencies;  
- và ghi nhận UX regressions như một loại defect thật sự.

## 14.5 Leadership / Program layer

Khi có trade-off lớn, leadership hoặc program owner cần quyết định dựa trên product coherence, không chỉ dựa trên deadline pressure hoặc demo optics.

## 15. Review cadence tối thiểu

Pack 03 nên có nhịp review tối thiểu đủ nhẹ nhưng đều.

## 15.1 Discovery / concept stage

- Review strategy-fit và IA-fit sớm.  
- Không để ý tưởng đi quá xa rồi mới kiểm tra baseline.

## 15.2 Wireframe stage

- Review structure, hierarchy, state placement, action placement và recovery paths.  
- Đây là thời điểm rẻ nhất để sửa drift lớn.

## 15.3 Pre-build handoff stage

- Review artifacts đầy đủ chưa.  
- Review messaging, empty/error states, validation và edge recovery.  
- Review deviations khỏi baseline nếu có.

## 15.4 Implementation stage

- Review frontend fidelity ở các checkpoints chứ không đợi xong hết.  
- Đặc biệt kiểm tra interactions, bottom actions, filters, side panels, toasts/banners và state transitions.

## 15.5 Pre-release / pilot stage

- Run UX QA checklist.  
- Chạy walkthrough theo persona và launch-critical flows.  
- Chốt issue severities và waivers còn mở.

## 15.6 Post-pilot learning loop

- Feedback phải được gom theo pattern và severity.  
- Chỉ update baseline khi đã thấy tín hiệu lặp đủ mạnh, không vá ngẫu hứng từng trường hợp.

## 16. Review package tối thiểu cho mỗi screen/flow

Để các buổi review hiệu quả, mỗi screen hoặc flow nên đi kèm một package ngắn nhưng đủ nghĩa.

1. Screen/flow name.  
2. Persona và surface.  
3. Operational question.  
4. Primary state(s).  
5. Primary action(s).  
6. Entry and exit paths.  
7. Error/recovery moments.  
8. Deviations from Pack 03 baseline.  
9. Open questions needing governance decision.

Package này giúp review tập trung vào logic thật thay vì tranh cãi mơ hồ dựa trên screenshots đơn thuần.

## 17. Governance anti-patterns nghiêm trọng phải tránh

## 17.1 Review như taste discussion

Nếu review chủ yếu xoay quanh thích/không thích visual thay vì operational clarity và system fit, governance đã lệch mục tiêu.

## 17.2 Review quá muộn

Chỉ review ở cuối sprint hoặc sát release khiến chi phí sửa cao và ai cũng có xu hướng “cho qua”.

## 17.3 Không có severity model

Khi mọi issue đều nghe như nhau, team dễ sửa thứ ít quan trọng và bỏ sót thứ phá hệ thống.

## 17.4 Exception không có hạn sử dụng

Temporary deviations nếu không được theo dõi sẽ trở thành baseline ngầm.

## 17.5 Governance chỉ là việc của Design

Nếu Product, Frontend và QA đứng ngoài, rất nhiều drift sẽ chỉ bị phát hiện khi đã quá muộn.

## 17.6 Pilot feedback patchwork

Nghe phản hồi nào cũng sửa ngay mà không gom thành pattern sẽ làm product mất shape rất nhanh.

## 18. Governance scoreboard tối giản cho Pack 03

Để giữ governance thực dụng, Pack 03 nên theo dõi một scoreboard rút gọn theo từng release hoặc sprint lớn.

### Chỉ số gợi ý
- Số issue Severity 1 mở.  
- Số issue Severity 2 mở.  
- Số waivers đang active.  
- Số deviations chưa có plan quay lại baseline.  
- Số cross-surface inconsistencies đã biết.  
- Số message/state regressions tìm thấy trong QA.  
- Số pilot findings đã được gom thành pattern review chính thức.

Scoreboard này không thay thế judgment chuyên môn, nhưng giúp governance không biến mất giữa delivery pressure.

## 19. Governance rules cho mọi thay đổi UX mới

Mọi thay đổi UX mới trong Pack 03 nên đi qua các câu hỏi sau:

1. **Thay đổi này chạm baseline nào của Pack 03?**  
2. **Nó giúp operational clarity hay chỉ thêm mới lạ / đẹp mắt?**  
3. **Nó có đúng với role của surface không?**  
4. **Nó có làm state, action hoặc recovery rõ hơn hay mờ hơn?**  
5. **Nó có tạo pattern mới không, và nếu có thì có thực sự cần không?**  
6. **Nếu là variance, thời hạn review lại là khi nào?**  
7. **Nếu build khác thiết kế vì constraint kỹ thuật, semantics có bị đổi không?**  
8. **Nếu pilot thích một shortcut mới, shortcut đó có làm product kém coherent hơn không?**

## 20. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES.md** – rules chi tiết cho component behavior trên Mobile Ops.  
2. **36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS.md** – patterns riêng cho forms và decision inputs trên Web Admin.  
3. **37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS.md** – demo paths theo persona cho sales, pilot và onboarding.  
4. **38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES.md** – rules cho density, breakpoints và responsive clarity của Web Admin.  
5. **39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS.md** – patterns cho interruption-heavy và connectivity-weak mobile use.  
6. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03.  
7. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness scenarios cho UX QA theo flow và persona.

## 21. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho UX review và design governance:

1. Pack 03 phải có **UX review checklist và governance loop chính thức**, không dựa vào review ngẫu hứng theo sprint.  
2. Mọi thay đổi UX quan trọng phải được review như **thay đổi hệ thống**, không chỉ là thay đổi màn hình cục bộ.  
3. Review phải bao trùm strategy-fit, IA-fit, layout, interaction, state semantics, messaging, recovery và implementation fidelity.  
4. Web Admin và Mobile Ops phải được review như hai surfaces riêng nhưng cùng một ngôn ngữ nền.  
5. Severity model 1–4 phải được dùng để ưu tiên UX issues thay vì tranh luận cảm tính.  
6. Waivers và variances phải có lý do, risk và thời hạn review lại.  
7. Product, Design, Frontend và QA đều là owner của governance loop theo vai trò riêng.  
8. Pilot feedback phải đi qua pattern review, không được biến thành patchwork drift.

## 22. Điều kiện hoàn thành của tài liệu

UX Review Checklist and Design Governance được xem là đạt yêu cầu khi:
- team Product, Design, Frontend và QA có cùng cách review Pack 03 outputs;  
- các issues UX có thể được phân loại theo severity rõ ràng;  
- variance và baseline deviations có cơ chế quản trị rõ;  
- và các tài liệu cùng implementation về sau có một vòng kỷ luật đủ mạnh để giữ product coherence xuyên delivery và pilot learning.

## AG Execution Prompt

You are acting as a senior UX governance architect, design-review systems lead, and cross-functional delivery quality strategist.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: experience strategy, screen taxonomy, user flows, state grammar, input patterns, wireframe blueprints, and messaging rules are already defined.
- This document defines the official UX review checklist and design governance mechanism for Pack 03.

### Objective
Refine this UX Review Checklist and Design Governance document into a production-grade governance baseline that can guide design reviews, product reviews, implementation reviews, QA heuristics, pilot-feedback triage, and baseline-drift prevention across Pack 03.

### Inputs
- Use this document plus all major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between control and execution surfaces and the wedge-first launch focus.
- Keep the output concrete enough for real governance operations during delivery.

### Tasks
1. Rewrite the governance thesis into a sharper executive form.
2. Produce a review-framework register covering review types, required artifacts, and decision responsibilities.
3. Add practical checklists for general UX review, Web Admin review, Mobile Ops review, messaging/state review, and form/input review.
4. Define the severity model, waiver process, and variance-handling rules.
5. Identify the top five governance failures that would cause Pack 03 drift.
6. Recommend the next documents that should operationalize this baseline into component rules, QA scenarios, and copy systems.
7. Add a practical cadence and scoreboard model for ongoing governance.

### Constraints
- Do not reduce governance to visual-taste review.  
- Do not allow “temporary exceptions” to become permanent drift without review.  
- Do not let implementation constraints silently rewrite UX semantics.  
- Do not let pilot feedback bypass the governance loop.  
- Keep the output concrete enough for actual delivery use.

### Output Format
Return a revised markdown document with these sections:
1. Executive Governance Thesis
2. Review Framework Register
3. Practical Review Checklists
4. Severity and Waiver Model
5. Governance Failure Risks
6. Cadence and Scoreboard
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make UX review and design governance explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams prevent drift across design, implementation, QA, and pilot learning.
- The output must reduce ambiguity around review scope, decision roles, issue severity, and exception handling.
