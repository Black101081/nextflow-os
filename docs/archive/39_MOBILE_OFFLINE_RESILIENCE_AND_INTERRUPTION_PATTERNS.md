# Nextflow OS – Mobile Offline Resilience and Interruption Patterns

**Document ID:** 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / Mobile UX Systems / Frontend Engineering  
**Dependent Packs:** Frontend Delivery, Engineering Implementation, QA & Support, Deployment & Support, Reliability & Observability  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **bộ pattern chính thức cho offline resilience, interruption handling và recovery continuity của Mobile Ops / PWA** trong Pack 03 của Nextflow OS. Nếu Mobile Ops Experience Strategy đã chốt Mobile Ops là execution surface, Screen Taxonomy đã chốt các screen families, Data Entry and Evidence Capture Patterns đã chốt grammar nhập liệu, Component Behavior Rules đã chốt micro-interaction semantics, còn Empty States / Errors / Recovery Messages đã chốt messaging grammar, thì tài liệu này đi vào một lớp rủi ro sống còn của trải nghiệm dùng thật ngoài hiện trường:

> **Khi người dùng Mobile Ops gặp mạng yếu, mất kết nối, app bị background, thao tác bị gián đoạn, submit đang pending, evidence upload chưa xong, hoặc người dùng phải chuyển ngữ cảnh giữa nhiều việc đang dở, hệ thống phải hành xử thế nào để công việc không gãy, người dùng không mất niềm tin và execution momentum vẫn được bảo toàn đủ tốt?**

Một execution surface chỉ trông tốt trong điều kiện mạng ổn định và thao tác liên tục là một execution surface chưa đủ trưởng thành. Trong môi trường dùng thật, đặc biệt ở các bối cảnh vận hành ngoài hiện trường, người dùng thường xuyên gặp các tình huống sau:
- kết nối chập chờn hoặc rớt mạng cục bộ;  
- app bị chuyển nền vì cuộc gọi, chat, camera hoặc app khác;  
- người dùng phải tạm dừng giữa note, evidence hoặc quick update;  
- submit được bấm nhưng phản hồi hệ thống đến chậm;  
- người dùng quay lại sau vài phút mà không còn chắc thao tác trước đó đã đi hay chưa;  
- một item bị gián đoạn giữa chừng trong khi công việc tiếp theo vẫn đang chờ.

Nếu product không có patterns rõ cho những khoảnh khắc này, user sẽ rất nhanh quay về các fallback behaviors như chụp ảnh ngoài app, nhắn chat riêng, ghi chú nhớ tạm hoặc delay việc cập nhật tới lúc “mạng ổn hơn”. Khi đó hệ thống mất không chỉ elegance UX mà mất luôn operational truth.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của offline resilience và interruption patterns trong Pack 03.  
2. Các loại gián đoạn chính thức cần được thiết kế.  
3. Thesis cho continuity của Mobile Ops.  
4. Rules cho network awareness và connection-state communication.  
5. Rules cho pending actions, retry và confirmation timing.  
6. Rules cho draft preservation và partial-progress safety.  
7. Rules cho evidence capture, upload queue và attachment resilience.  
8. Rules cho backgrounding, app return và context restoration.  
9. Rules cho stale data, sync conflicts và trust-preserving messaging.  
10. Rules cho offline-capable vs online-required actions.  
11. Những anti-pattern interruption/offline nghiêm trọng phải tránh.  
12. Cách review các patterns này trong governance loop và QA.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vì sao offline resilience quan trọng với Mobile Ops

Trong Nextflow OS, Mobile Ops không được thiết kế như một app “xem cho biết”. Nó là execution surface nơi người dùng vào để làm việc, cập nhật trạng thái, báo ngoại lệ, thêm evidence và xác nhận outcome. Điều đó có nghĩa là mọi mất mát về continuity đều trực tiếp làm giảm adoption và độ tin cậy của hệ thống.

Offline resilience ở đây không nên được hiểu hẹp là “app có chạy full offline hay không”. Trong ngữ cảnh Pack 03, nó rộng hơn nhiều. Nó bao gồm:
- cách app nói cho người dùng biết trạng thái kết nối;  
- cách app giữ dữ liệu nhập dở;  
- cách app xử lý hành động đang pending;  
- cách app giúp người dùng quay lại đúng item sau gián đoạn;  
- cách app làm rõ điều gì đã sync, chưa sync hoặc cần retry;  
- và cách app bảo vệ trust khi system truth có độ trễ.

Nói cách khác, offline resilience là một phần của **execution integrity** chứ không phải chỉ là một năng lực kỹ thuật backend/front-end thuần túy.

## 3. Continuity thesis cho Mobile Ops

Continuity thesis của tài liệu này có thể phát biểu như sau:

> **Mobile Ops phải giả định rằng người dùng sẽ bị gián đoạn, kết nối sẽ không luôn ổn định và một phần thao tác sẽ diễn ra trong điều kiện không hoàn hảo; vì vậy hệ thống phải ưu tiên giữ tiến độ công việc, giữ ngữ cảnh, giữ công nhập liệu và giữ niềm tin về outcome hơn là ép mọi thứ phải đồng bộ hoàn hảo ngay tức thì.**

Từ thesis này, mười nguyên lý được suy ra:

1. Execution surface phải ưu tiên **continuity over brittle immediacy**.  
2. Người dùng phải luôn biết action nào đã được ghi nhận, action nào đang chờ và action nào thất bại.  
3. System không được xóa công nhập liệu của user chỉ vì interruption hoặc network hiccup nếu có thể tránh.  
4. Kết nối yếu không được làm app trở nên im lặng và khó hiểu.  
5. Outcome messaging phải phân biệt rõ local capture, pending sync và server-confirmed success khi cần.  
6. Offline resilience phải giữ item identity và return-to-work orientation đủ mạnh.  
7. Evidence capture là trust-critical; ambiguity ở đây đặc biệt nguy hiểm.  
8. Retry phải gần, rõ và gắn đúng hành động thất bại.  
9. Không phải action nào cũng cần chờ online tuyệt đối trước khi cho phép user tiếp tục nghĩ rằng mình đã tiến được việc.  
10. Interruption handling phải được coi là baseline design concern, không phải edge-case polish.

## 4. Phân loại các loại gián đoạn chính thức

Để tránh thiết kế ứng biến theo từng bug nhỏ, Pack 03 nên phân loại các interruption types chính thức như sau:

1. **Weak or unstable connection** – mạng chập chờn nhưng chưa mất hẳn.  
2. **Hard offline** – mất kết nối rõ ràng trong lúc đang dùng app.  
3. **Background interruption** – app bị đẩy nền bởi cuộc gọi, camera, chat, share flow hoặc app switch.  
4. **Pending-submit interruption** – người dùng vừa submit xong nhưng chưa nhận được xác nhận rõ.  
5. **Partial-entry interruption** – note, form ngắn, selection hoặc evidence đang làm dở.  
6. **Upload interruption** – ảnh/file bằng chứng đang upload thì fail, treo hoặc bị app background.  
7. **Return-after-delay interruption** – user quay lại sau vài phút hoặc lâu hơn và không còn chắc trạng thái trước đó.  
8. **Sync-lag or stale-data interruption** – dữ liệu trên màn chưa phản ánh thay đổi mới nhất.  
9. **Conflict or server-rejection interruption** – local intent có nhưng server không thể chấp nhận nguyên trạng.

Mỗi loại gián đoạn này cần semantics khác nhau. Sai lầm thường gặp là dùng một kiểu generic message kiểu “Something went wrong” cho tất cả, khiến user không biết mình vừa mất gì và nên làm gì tiếp.

## 5. Network awareness và connection-state communication

## 5.1 Vai trò

Network awareness không phải để “nhắc user rằng có internet hay không” một cách hiển nhiên. Vai trò của nó là giúp user hiểu **mức độ tin cậy hiện tại của hành động sắp làm hoặc vừa làm**.

## 5.2 Rules

1. App nên phân biệt tối thiểu ba mức: ổn định, yếu/không ổn định, và offline rõ ràng.  
2. Connection-state communication phải đủ gần action context khi risk tăng, không nhất thiết luôn chiếm diện tích cố định lớn.  
3. Khi offline rõ, user phải hiểu action nào còn làm được, action nào sẽ chờ sync, action nào không thể hoàn tất.  
4. Khi mạng yếu nhưng chưa offline hẳn, messaging nên cẩn trọng hơn kiểu “updates may take longer” thay vì gây hoảng loạn như mọi thứ đã fail.  
5. Trạng thái kết nối không nên được truyền đạt chỉ bằng icon mơ hồ.

## 5.3 Placement rules

- Với risk thấp, connection hint có thể gọn và không chiếm spotlight.  
- Với submit-heavy moments hoặc evidence upload moments, network state nên nổi rõ hơn gần action zone hoặc outcome region.  
- Với offline kéo dài, app nên có persistent state cue đủ rõ nhưng không đập vào mắt đến mức phá mọi tác vụ khác.

## 6. Rules cho offline-capable và online-required actions

Không phải action nào trên Mobile Ops cũng nên bị đối xử như nhau khi mất mạng.

## 6.1 Phân loại hành động

Pack 03 nên phân tối thiểu thành ba nhóm:
1. **Locally capturable actions** – có thể ghi nhận local trước rồi sync sau, ví dụ note ngắn, lựa chọn state nhẹ, evidence capture metadata hoặc draft text.  
2. **Queueable actions** – user có thể bấm hoàn tất local intent và hệ thống xếp chờ sync, ví dụ một số quick updates hoặc completion intents phù hợp domain.  
3. **Online-required actions** – actions mà outcome không nên bị ngộ nhận nếu server chưa xác nhận, ví dụ một số authority-sensitive transitions hoặc logic có nguy cơ conflict cao.

## 6.2 Rules

1. Hệ thống phải nói rõ action hiện tại thuộc loại nào nếu điều đó ảnh hưởng trust.  
2. Locally capturable actions nên được ưu tiên thiết kế tốt vì chúng giúp app cạnh tranh với chat/note ngoài hệ thống.  
3. Online-required actions phải giải thích rõ vì sao chưa thể hoàn tất nếu mất mạng.  
4. Queueable actions phải có trạng thái chờ sync cực rõ để tránh user tưởng xong hoàn toàn rồi rời đi.

## 7. Pending actions, retry và confirmation timing

## 7.1 Pending-state rules

1. Sau khi user kích hoạt một action, app phải phản hồi ngay rằng intent đã được ghi nhận ở mức nào.  
2. Pending state phải gắn với item cụ thể và action cụ thể.  
3. Pending không nên trông giống success hoàn toàn.  
4. Nếu pending kéo dài bất thường, app phải nâng cấp feedback thay vì im lặng.

## 7.2 Confirmation timing rules

- Nếu local capture diễn ra ngay nhưng sync server chậm, app nên phân biệt confirmation local với confirmation server khi cần.  
- Không nên dùng cùng một success wording cho “đã lưu trên máy” và “đã cập nhật hoàn toàn trong hệ thống” nếu khác biệt đó quan trọng với hành vi tiếp theo.  
- Nếu action có hậu quả lớn, outcome wording phải cẩn trọng hơn generic success toast.

## 7.3 Retry rules

1. Retry phải gần đúng hành động thất bại.  
2. User phải biết retry sẽ gửi lại gì.  
3. Retry không nên xóa dữ liệu đã nhập hoặc reset cả flow nếu chỉ một submit fail.  
4. Nếu nhiều actions đang pending, app nên giúp user phân biệt action nào cần attention nhất.

## 8. Draft preservation và partial-progress safety

## 8.1 Vì sao quan trọng

Ở Mobile Ops, nhập liệu thường ngắn nhưng diễn ra rất thường xuyên. Chính vì ngắn và thường xuyên, user cực kỳ nhạy cảm với việc mất công nhập liệu. Mỗi lần mất note, mất reason chọn dở hoặc mất attachment draft đều làm trust sụt mạnh.

## 8.2 Rules

1. Note đang gõ dở không nên mất chỉ vì app background ngắn hoặc network fail.  
2. Reason đã chọn, selections đã tick và evidence đã chụp nên được giữ trong phạm vi hợp lý nếu flow chưa kết thúc.  
3. Nếu draft được giữ tạm, user nên được nhắc đủ nhẹ để hiểu tại sao màn hình vẫn còn dữ liệu cũ khi quay lại.  
4. Nếu vì lý do bảo mật hoặc logic nghiệp vụ không thể giữ toàn bộ draft, system phải làm rõ giới hạn đó ở những flow quan trọng.

## 8.3 Draft-clearing rules

- Draft chỉ nên bị xóa khi action đã hoàn tất rõ hoặc user chủ động bỏ.  
- Không xóa draft một cách âm thầm khi user dismiss sheet hoặc quay ra nếu nội dung đã đáng kể.  
- Nếu cần confirm discard, confirmation phải tương xứng với lượng công sức có nguy cơ mất.

## 9. Evidence capture và attachment resilience

Evidence là vùng có risk trust cao nhất trong Mobile Ops vì người dùng thường xem nó như proof rằng công việc đã thực sự được thực hiện.

## 9.1 Capture rules

1. Chụp hoặc chọn evidence phải tạo cảm giác đã “giữ lại được bằng chứng” càng sớm càng tốt.  
2. Nếu file/ảnh mới chỉ được lưu local chứ chưa upload, trạng thái đó phải được nói rõ.  
3. Attachment preview phải cho user phân biệt giữa captured, pending upload, uploaded và failed.  
4. Evidence requirement không nên được phát hiện quá muộn ngay trước submit nếu có thể tránh.

## 9.2 Upload-queue rules

1. Nếu evidence upload có thể queue được, queue semantics phải rõ.  
2. Mỗi attachment nên có trạng thái riêng thay vì một thông báo chung cho cả nhóm.  
3. Retry, remove hoặc replace phải gắn đúng attachment liên quan.  
4. User không được bị buộc chụp lại toàn bộ chỉ vì một upload fail nếu local asset vẫn còn.

## 9.3 Trust rules

- Không bao giờ hiển thị evidence như đã hoàn tất hoàn toàn nếu nó mới chỉ captured local và chưa có dấu hiệu sync phù hợp trong những flow mà sự khác biệt này quan trọng.  
- Nếu submit phụ thuộc vào evidence uploaded thành công, điều đó phải cực rõ trước lúc commit.  
- Nếu submit vẫn được phép tiếp tục với evidence pending, outcome message phải giải thích điều gì còn đang chờ.

## 10. Backgrounding, app return và context restoration

## 10.1 Background interruption rules

1. App phải giả định người dùng sẽ chuyển sang camera, cuộc gọi hoặc chat giữa chừng.  
2. Khi quay lại nhanh, user nên được đưa về đúng item và đúng step gần nhất trong phạm vi hợp lý.  
3. Nếu trạng thái dữ liệu đã đổi trong lúc app background, app phải nói rõ thay đổi relevant thay vì lặng lẽ render khác đi.

## 10.2 Return-to-context rules

- Item identity phải luôn đủ rõ sau khi app quay lại.  
- Nếu user đang ở giữa một quick update, note, evidence hoặc exception flow, app nên khôi phục tiến trình đó nếu an toàn.  
- Nếu không thể khôi phục nguyên trạng, app phải ít nhất khôi phục điểm vào và cho biết cái gì cần làm lại.

## 10.3 Time-gap sensitivity

Khi người dùng quay lại sau vài giây, restoration có thể gần như nguyên trạng. Khi quay lại sau lâu hơn, app có thể cần revalidate nhiều hơn nhưng vẫn nên bảo vệ orientation và draft trong mức có thể.

## 11. Stale data, sync lag và conflict handling

## 11.1 Stale-data rules

1. Nếu screen có nguy cơ stale đáng kể, app nên có cue đủ rõ rằng dữ liệu có thể cũ.  
2. Refresh hoặc re-sync action phải dễ thấy khi stale ảnh hưởng quyết định.  
3. Không được để người dùng tưởng đang nhìn truth mới nhất nếu app biết có nguy cơ khác.

## 11.2 Sync-lag rules

- Với một số flows, item có thể đã được user cập nhật local nhưng queue hoặc counts chưa phản ánh ngay. App nên thiết kế expectation này cẩn thận để user không tưởng update bị mất.  
- Nếu queue tạm giữ item ở local pending state, representation của nó phải khác item bình thường.

## 11.3 Conflict or rejection rules

1. Nếu server từ chối action hoặc phát hiện conflict, app phải nói rõ mức nào đã được giữ và mức nào chưa được chấp nhận.  
2. Recovery path phải cụ thể: retry, review latest state, edit input hoặc escalate.  
3. Generic error mà không nói item đã thay đổi gì rồi là không chấp nhận được trong các flows quan trọng.

## 12. Messaging grammar cho continuity moments

## 12.1 Những distinction tối thiểu phải có

Pack 03 nên phân biệt rõ ít nhất các loại message sau:
- captured locally;  
- waiting to sync;  
- upload in progress;  
- sync failed;  
- action needs connection;  
- latest data may be outdated;  
- draft restored;  
- draft discarded;  
- server confirmed.

## 12.2 Wording rules

1. Message phải nói người dùng đang ở trạng thái nào, không chỉ nói hệ thống “có vấn đề”.  
2. Nếu có next step gần nhất, message phải nói bước đó.  
3. Wording phải tránh gây hiểu sai giữa “xong trên máy” và “xong trong hệ thống”.  
4. Tone phải bình tĩnh và định hướng, không hoảng loạn hoặc quá kỹ thuật.

## 13. Screen-family rules dưới điều kiện gián đoạn

## 13.1 Workload list screens

- Queue/list nên phản ánh đủ rằng item nào đã local-updated, item nào đang pending sync hoặc item nào cần attention do fail.  
- User quay lại list không nên mất hẳn dấu vết của item vừa thao tác nếu việc đó quan trọng với confidence.

## 13.2 Task action screens

- Đây là nơi continuity rules nghiêm ngặt nhất vì phần lớn action commits xảy ra ở đây.  
- State cues, pending cues, retry cues và evidence statuses phải cực rõ và gần action zone.

## 13.3 Note / exception / evidence flows

- Các flow này phải bảo vệ draft, partial completion và per-attachment status tốt hơn mức trung bình.  
- Đặc biệt tránh mọi ambiguity khiến user không biết hệ thống đã giữ lại điều gì.

## 14. QA heuristics và governance checks cho continuity

## 14.1 QA heuristics

QA nên kiểm thử tối thiểu các tình huống sau:
1. Mất mạng trước khi submit.  
2. Mất mạng ngay sau submit.  
3. App background giữa note nhập dở.  
4. App background trong lúc upload ảnh.  
5. Quay lại sau delay ngắn.  
6. Quay lại sau delay dài hơn.  
7. Retry một action fail.  
8. Nhiều actions pending đồng thời.  
9. Item state đổi trong lúc app background.  
10. Server reject sau local intent.

## 14.2 Governance review questions

1. User có biết chính xác điều gì đã được ghi nhận chưa?  
2. Người dùng có mất công nhập liệu hoặc evidence không?  
3. Pending và success có bị lẫn nhau không?  
4. Retry có gần và đủ rõ không?  
5. Return-to-context có còn giữ orientation không?  
6. Mạng yếu có làm app im lặng quá mức không?  
7. Flow này có vô tình khuyến khích user quay lại chat ngoài hệ thống không?

## 15. Anti-pattern interruption/offline nghiêm trọng phải tránh

## 15.1 Silent failure after tap

User bấm rồi không biết hệ thống đã nhận hay chưa là một trong những lỗi trust nặng nhất của execution UX.

## 15.2 Fake success

Hiển thị thành công hoàn toàn khi action mới chỉ pending local hoặc pending sync là một anti-pattern cực nguy hiểm.

## 15.3 Draft loss on routine interruption

Mất note, mất selections hoặc mất evidence vì app background ngắn là không chấp nhận được cho flows tần suất cao.

## 15.4 Generic offline banner without action meaning

Chỉ nói “No connection” mà không nói điều gì còn làm được hoặc điều gì đang chờ sẽ không giúp user tiếp tục công việc.

## 15.5 Retry by full re-entry

Buộc user nhập lại từ đầu chỉ vì một sync fail nhỏ sẽ phá adoption rất nhanh.

## 15.6 Attachment ambiguity

Nếu user không biết ảnh đã được giữ local, đang upload hay đã fail, product đang đánh vào vùng trust-sensitive nhất.

## 15.7 Context reset after interruption

Quay lại app mà bị ném về home chung hoặc mất item dở giữa chừng sẽ làm execution momentum gãy mạnh.

## 16. Governance rules cho mọi offline/interruption pattern mới

Mọi pattern mới nên đi qua các câu hỏi sau:

1. **Nếu mạng yếu hoặc mất hẳn ở khoảnh khắc này, user sẽ hiểu điều gì xảy ra?**  
2. **Intent của user có được ghi nhận ở mức nào và đã được truyền đạt đủ rõ chưa?**  
3. **Dữ liệu nhập dở hoặc evidence có được giữ lại không?**  
4. **Pending, success và fail có bị lẫn nhau không?**  
5. **Nếu app bị background, user có quay lại đúng context không?**  
6. **Nếu server reject, recovery path có cụ thể không?**  
7. **Pattern này có giữ được cạnh tranh với chat, note ngoài app hoặc trì hoãn cập nhật không?**  
8. **Nó có làm Mobile Ops vẫn đúng vai trò execution surface dưới điều kiện không hoàn hảo không?**

## 17. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES.md** – copy system và UX writing guidelines xuyên Pack 03, bao gồm continuity messaging.  
2. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness UX QA scenarios theo persona, flow, interruption type và state transition.  
3. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo pending friction, retry rates, abandonment after interruption, evidence completion quality và trust signals.  
4. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – rules cho authority boundaries trên Web Admin khi action outcomes cần phân biệt mạnh với mobile continuity states.  
5. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – thư viện demo scripts có nhánh interruption/recovery cho pilot realism.  
6. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa component behaviors, screen families, interruption cases và UX QA coverage.  
7. **46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES.md** – ghi chú handshake giữa UX semantics và implementation semantics cho offline/sync states.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Mobile Offline Resilience và Interruption Patterns:

1. Mobile Ops cần một **bộ pattern continuity chính thức**, không được xem offline/interruption là edge-case phụ.  
2. Weak connection, hard offline, background interruption, pending-submit, partial-entry interruption, upload interruption, return-after-delay, stale-data và conflict moments đều là các trạng thái phải được thiết kế có chủ đích.  
3. Hệ thống phải phân biệt rõ local capture, pending sync, upload progress, server confirmation và failure/retry moments.  
4. Draft preservation, evidence resilience, context restoration và retry clarity là các năng lực trust-critical của Mobile Ops.  
5. Không phải action nào cũng cần cùng một semantics online/offline; Pack 03 phải phân biệt locally capturable, queueable và online-required actions.  
6. Continuity messaging là một phần của execution truth, không phải copy phụ trợ.  
7. Tài liệu này là baseline để design, frontend, QA và product review cùng một ngôn ngữ khi xử lý interruption-heavy mobile usage.

## 19. Điều kiện hoàn thành của tài liệu

Mobile Offline Resilience and Interruption Patterns được xem là đạt yêu cầu khi:
- các launch-critical Mobile Ops flows có semantics rõ dưới điều kiện mạng yếu, offline và interruption;  
- người dùng không dễ mất công nhập liệu hoặc mất orientation sau các gián đoạn thường gặp;  
- hệ thống truyền đạt đủ rõ điều gì đã được giữ local, điều gì đang chờ sync và điều gì cần retry;  
- và QA / governance có thể kiểm tra continuity như một lớp chất lượng cốt lõi thay vì một tập edge cases rời rạc.

## AG Execution Prompt

You are acting as a senior mobile UX systems designer, offline-resilience architect, interruption-recovery strategist, and trust-critical workflow reviewer.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops is the execution surface, with user flows, state grammar, input patterns, wireframe blueprints, messaging rules, governance baseline, and component behavior rules already defined.
- This document defines the offline resilience and interruption patterns for Mobile Ops.

### Objective
Refine this Mobile Offline Resilience and Interruption Patterns document into a production-grade continuity baseline that can guide Mobile Ops design, frontend implementation, QA heuristics, pilot hardening, and trust-preserving recovery behaviors under weak connectivity and real-world interruptions.

### Inputs
- Use this document plus Mobile Ops Experience Strategy, First Wedge User Flows, State and Status Presentation Rules, UX Guardrails, Mobile Ops Screen Taxonomy, Data Entry and Evidence Capture Patterns, Mobile Ops Wireframe Blueprints, Empty States / Errors / Recovery Messages, UX Governance, Component Behavior Rules, and Storyboards as the primary source of truth.
- Preserve the execution-surface role and wedge-first launch focus.
- Keep the output concrete enough for real implementation and QA usage.

### Tasks
1. Rewrite the continuity thesis into a sharper executive form.
2. Produce an interruption-type framework covering weak connection, offline, backgrounding, pending submit, upload interruption, stale data, sync lag, and conflict moments.
3. Add usage rules for network awareness, offline-capable vs online-required actions, pending states, retries, draft preservation, evidence resilience, and context restoration.
4. Define messaging expectations for local capture, pending sync, server-confirmed success, failure, stale state, and draft restoration.
5. Identify the top five continuity failures that would weaken trust or push users back to chat/off-system workarounds.
6. Recommend the next documents that should operationalize this baseline into copy systems, QA scenarios, metrics frameworks, and UX-to-engineering handshake notes.
7. Add governance rules to prevent fake success, silent failure, draft loss, attachment ambiguity, and context-reset failures.

### Constraints
- Do not assume stable connectivity.  
- Do not present pending actions as fully completed success.  
- Do not let routine interruptions wipe user effort.  
- Do not treat evidence upload ambiguity as acceptable.  
- Keep the output concrete enough for downstream implementation and QA.

### Output Format
Return a revised markdown document with these sections:
1. Executive Continuity Thesis
2. Interruption Framework
3. Usage Rules by Continuity Pattern
4. Messaging, Retry, and Recovery Rules
5. Continuity Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Mobile Ops continuity behavior explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams implement interruption-heavy mobile usage with better trust, stronger recovery, and safer sync semantics.
- The output must reduce ambiguity around pending actions, offline capture, retries, draft safety, evidence handling, and return-to-context behavior.
