# Nextflow OS – Pack 03 Copy System and UX Writing Guidelines

**Document ID:** 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Design / UX Writing / Product Management  
**Dependent Packs:** Frontend Delivery, Design System, QA & Support, GTM Enablement, Onboarding & Pilot Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 23_INFORMATION_ARCHITECTURE_AND_NAVIGATION_MODEL, 24_WEB_ADMIN_SCREEN_TAXONOMY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 28_MOBILE_OPS_SCREEN_TAXONOMY, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 30_PERSONA_BASED_LANDING_AND_DEFAULT_VIEWS, 31_WEB_ADMIN_WIREFRAME_BLUEPRINTS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 34_UX_REVIEW_CHECKLIST_AND_DESIGN_GOVERNANCE, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 36_WEB_ADMIN_FORM_AND_DECISION_INPUT_PATTERNS, 37_PERSONA_SPECIFIC_DEMO_PATHS_AND_STORYBOARDS, 38_WEB_ADMIN_INFORMATION_DENSITY_AND_RESPONSIVE_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS

## 1. Mục tiêu tài liệu

Tài liệu này xác định **copy system và bộ UX writing guidelines chính thức** cho toàn Pack 03 của Nextflow OS. Nếu các tài liệu trước đã lần lượt khóa experience strategy, navigation, screen taxonomy, flow spine, state grammar, input patterns, wireframe blueprints, empty/error/recovery logic, governance, component behaviors, decision-input patterns, demo narratives, density rules và continuity patterns, thì tài liệu này xử lý lớp ngôn ngữ xuyên suốt giúp tất cả những thứ đó nói cùng một giọng và cùng một logic:

> **Hệ thống nên dùng từ gì, tránh từ gì, viết action thế nào, gọi state ra sao, trình bày errors/recovery thế nào, phân biệt pending với completed ra sao, và giữ consistency ngôn ngữ thế nào giữa Web Admin, Mobile Ops, QA, demo, onboarding và pilot feedback?**

Trong một SME Business OS, copy không phải là lớp trang trí sau cùng. Copy là một phần của product semantics. Nếu state grammar đúng mà wording sai, người dùng vẫn hiểu sai. Nếu action model đúng mà button labels mơ hồ, người dùng vẫn bấm sai. Nếu recovery path tốt mà messaging generic, người dùng vẫn mất trust. Vì vậy Pack 03 cần một **copy system có kỷ luật**, không chỉ một tập lẻ tẻ các câu microcopy tốt.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của copy system trong Pack 03.  
2. Writing thesis và voice principles cho Nextflow OS.  
3. Rules cho naming của surfaces, screens, tasks và work objects.  
4. Rules cho action labels, button copy và menu verbs.  
5. Rules cho state/status wording và semantic distinction.  
6. Rules cho validation, error, empty, warning, stale và recovery messages.  
7. Rules cho approval / rejection / override / routing wording trên Web Admin.  
8. Rules cho execution, confirmation, pending-sync và interruption wording trên Mobile Ops.  
9. Rules cho field labels, helper text, placeholders và evidence prompts.  
10. Rules cho tone theo mức độ nghiêm trọng và theo surface.  
11. Những anti-pattern UX writing nghiêm trọng phải tránh.  
12. Cách review, govern và update copy system theo thời gian.  
13. Các tài liệu UX tiếp theo nên đi tiếp từ baseline này như thế nào.

## 2. Vai trò của copy system trong Pack 03

Trong Nextflow OS, copy system không nên bị xem là tập hợp những câu chữ riêng lẻ. Nó là **hệ ngôn ngữ vận hành** của product. Nó giúp người dùng hiểu họ đang nhìn gì, đang làm gì, điều gì đã xảy ra, điều gì sẽ xảy ra tiếp theo và vì sao điều đó quan trọng.

Copy system đặc biệt quan trọng với Pack 03 vì Pack này chạm vào toàn bộ các lớp dễ gây hiểu sai nhất:
- states và status semantics;  
- actions và outcomes;  
- blocked / waiting / approval / overdue distinctions;  
- errors, retries và recovery logic;  
- exception handling;  
- decision accountability;  
- continuity states như pending sync, locally saved hoặc upload failed.

Nếu không có copy system rõ, product sẽ nhanh chóng drift theo ba hướng rất nguy hiểm:
- cùng một meaning nhưng mỗi màn hình gọi một kiểu;  
- cùng một từ nhưng mang nhiều meanings khác nhau;  
- hoặc copy nghe “hay” nhưng không đủ operational clarity.

## 3. Writing thesis cho Nextflow OS

Writing thesis của tài liệu này có thể phát biểu như sau:

> **Mọi câu chữ trong Pack 03 phải giúp người dùng hiểu đúng trạng thái hiện tại, hành động gần nhất và bước tiếp theo với mức nỗ lực thấp nhất; nếu một câu nghe đẹp nhưng làm mờ meaning, che giấu hậu quả hoặc tăng suy diễn, câu đó là sai.**

Từ thesis này, mười nguyên lý viết được suy ra:

1. Writing phải ưu tiên **clarity over cleverness**.  
2. Từ ngữ phải phản ánh operational reality, không phản ánh marketing tone chung chung.  
3. Cùng semantics phải dùng cùng wording family xuyên Pack 03.  
4. Button labels và action copy phải nói hậu quả tốt hơn là mô tả động tác UI.  
5. Message tốt phải nói điều gì xảy ra, tại sao quan trọng và bước gần nhất nếu cần.  
6. Web Admin có thể giàu context hơn, nhưng không được quan liêu hóa bằng ngôn ngữ dài dòng.  
7. Mobile Ops phải ngắn hơn, nhưng không được hy sinh truth để lấy tốc độ đọc giả tạo.  
8. Error và recovery copy phải giúp user quay lại flow, không chỉ báo rằng hệ thống không vui.  
9. Pending, saved locally, synced và completed phải được phân biệt rõ khi khác biệt đó ảnh hưởng hành vi tiếp theo.  
10. Copy system phải sống như một baseline vận hành, không phải tài liệu tham khảo bị bỏ quên.

## 4. Voice principles cho Nextflow OS

Voice của Nextflow OS nên được mô tả bằng năm đặc tính cốt lõi:

1. **Rõ** – nói chính xác điều đang xảy ra.  
2. **Điềm tĩnh** – không gây hoảng loạn hoặc drama hóa lỗi.  
3. **Thực dụng** – ưu tiên câu giúp người dùng quyết định hoặc hành động.  
4. **Nhất quán** – một nghĩa, một gia đình từ vựng.  
5. **Tôn trọng năng lực người dùng** – không nói kiểu dạy đời, không quá xuề xòa.

Voice này không có nghĩa là khô cứng. Nó có nghĩa là hệ thống nói giống một công cụ điều hành đáng tin: không kêu gọi cảm xúc dư thừa, không trốn tránh sự thật, không màu mè, nhưng cũng không cộc lốc hoặc máy móc quá mức.

## 5. Rules cho naming của surfaces, screens, tasks và work objects

## 5.1 Surface naming rules

- Dùng tên **Web Admin** cho control surface và **Mobile Ops** cho execution surface một cách nhất quán.  
- Không đổi luân phiên sang những tên như Portal, Console, Admin App, Field App, Mobile Portal nếu không có lý do sản phẩm chính thức.  
- Trong copy nội bộ hoặc demo scripts, có thể thêm giải thích vai trò, nhưng không thay tên nền.

## 5.2 Screen naming rules

- Tên screen nên phản ánh câu hỏi công việc hoặc work mode, không chỉ phản ánh dạng component.  
- Ví dụ ưu tiên các tên như Review Queue, Approval Detail, Import Review, Task Action, Workload, hơn là Generic List, Details Page hoặc Update Screen.  
- Nếu screen name xuất hiện cho user, nó phải giúp orientation, không chỉ phục vụ file naming nội bộ.

## 5.3 Work-object naming rules

- Chọn một vocabulary nền cho item/work object và giữ nhất quán trong từng domain.  
- Không luân phiên vô cớ giữa task, case, request, job, ticket, record nếu chúng thực chất chỉ cùng một object.  
- Nếu có nhiều object types thật, copy phải giúp phân biệt relationship của chúng rõ ràng.

## 6. Rules cho action labels, button copy và menu verbs

## 6.1 Action-label thesis

Action labels phải giúp người dùng hiểu **hệ quả** của hành động tốt hơn là hiểu “nút này làm UI di chuyển ra sao”.

## 6.2 Rules

1. Ưu tiên động từ + outcome rõ, ví dụ Approve, Request Info, Reassign, Retry Upload, Complete Task.  
2. Tránh các labels quá generic như Submit, Save, Confirm, Proceed nếu hệ quả cụ thể có thể nói rõ hơn.  
3. Cùng một action semantics phải dùng cùng một verb family, trừ khi có lý do mạnh về context.  
4. Các actions có hậu quả khác nhau không được dùng cùng label chung nếu điều đó làm giảm learnability.  
5. Menu verbs phải phản ánh mức độ nghiêm trọng và tần suất sử dụng của action.

## 6.3 Safe vs high-impact wording

- Actions an toàn, tần suất cao có thể dùng wording rất gọn nếu meaning rõ.  
- Actions authority-heavy hoặc destructive nên nói outcome rõ hơn, ví dụ Reject Request hoặc Remove Attachment, thay vì chỉ Done hay OK.  
- Nếu confirmation tồn tại, label trong confirmation vẫn nên giữ hậu quả cụ thể thay vì quay về Confirm chung chung.

## 7. Rules cho state và status wording

## 7.1 State wording phải trung thành với state grammar

Copy không được tự phát minh semantics mới trái với tài liệu state grammar. Nếu Pack 03 đã phân biệt Blocked, Waiting, Pending Approval, Overdue, In Progress hoặc tương đương, thì wording phải giữ distinction đó thật chặt.

## 7.2 Rules

1. Một meaning chính chỉ nên có một label chuẩn trong cùng một ngữ cảnh sản phẩm.  
2. Không dùng từ mơ hồ như Active hoặc Open để bao trùm nhiều state có ý nghĩa khác nhau.  
3. Urgency cues không nên thay thế state chính nếu urgency và state là hai lớp nghĩa khác nhau.  
4. Nếu cùng state xuất hiện trên Web và Mobile, wording nên cùng family trừ khi có lý do mạnh về độ dài hoặc context.

## 7.3 Distinction rules bắt buộc

Copy system phải giữ rõ các khác biệt kiểu sau:
- blocked khác waiting;  
- pending approval khác in review;  
- overdue khác urgent nói chung;  
- saved locally khác synced;  
- upload failed khác submit failed;  
- rejected khác returned for more info.

## 8. Rules cho validation, error, warning, stale và recovery messages

## 8.1 Message structure mặc định

Một message tốt trong Pack 03 thường nên cố gắng trả lời tối đa ba câu hỏi ngắn:
1. Chuyện gì đang xảy ra.  
2. Điều đó ảnh hưởng gì lúc này.  
3. Bước gần nhất nên làm là gì.

Không phải message nào cũng cần đủ ba câu, nhưng nếu thiếu hoàn toàn cả impact lẫn next step ở những khoảnh khắc quan trọng thì message sẽ yếu.

## 8.2 Validation rules

- Validation nên chỉ đúng field hoặc nhóm field có vấn đề.  
- Tránh message kiểu Invalid input nếu có thể nói rõ hơn như Missing approval reason hoặc Add evidence before completing.  
- Validation copy không nên đổ lỗi cho user một cách cảm tính.

## 8.3 Error rules

- Error messages phải phân biệt lỗi gì: network, permission, stale state, failed upload, failed submit, unavailable action, conflict hoặc system error.  
- Tránh generic Something went wrong ở những flows cốt lõi nếu có thể nói cụ thể hơn.  
- Nếu user effort còn được giữ, message nên nói rõ điều đó.

## 8.4 Warning rules

- Warnings dùng khi user vẫn còn agency nhưng cần hiểu risk hoặc consequence.  
- Warning không nên nghe như error đã xảy ra.  
- Nếu warning có CTA, CTA phải nói action làm giảm risk là gì.

## 8.5 Stale and recovery rules

- Nếu dữ liệu có thể cũ, copy phải nói rõ điều đó mà không gây hoảng loạn.  
- Recovery copy nên đưa user về quỹ đạo gần nhất, ví dụ Retry Upload, Refresh and Review, Reopen Draft hoặc Request Updated Info.  
- Không dùng toast ngắn cho các recovery moments phức tạp nếu user cần hiểu nhiều hơn.

## 9. Rules cho Web Admin decision wording

## 9.1 Approval wording

Approval copy nên làm rõ ba thứ: đang approve cái gì, vì sao bước này tồn tại và item sẽ đi đâu tiếp theo nếu phù hợp context. Approval text không nên dài dòng, nhưng cũng không nên giảm xuống mức quá ngắn như OK nếu hậu quả thật sự có ý nghĩa vận hành.

## 9.2 Reject / override / request-more-info wording

- Reject phải nghe dứt khoát và rõ hậu quả.  
- Override phải phản ánh gravity cao hơn approval thường.  
- Request More Info phải làm rõ đang chờ ai và item sẽ ở trạng thái gì trong lúc chờ.

## 9.3 Routing và reassignment wording

- Dùng verbs giúp người dùng thấy ownership move, ví dụ Assign to, Reassign to, Move to Queue.  
- Tránh các verbs mơ hồ như Update hoặc Change nếu người dùng cần hiểu đích đến.  
- Outcome messaging nên lặp lại owner hoặc queue mới nếu đó là điều quan trọng nhất sau action.

## 10. Rules cho Mobile Ops execution wording

## 10.1 Action wording trên Mobile

Mobile action labels phải ngắn, mạnh và gần hành động thực tế. Tuy nhiên chúng không được hy sinh distinction quan trọng chỉ để tiết kiệm ký tự.

## 10.2 Confirmation wording

- Với actions thường xuyên, confirmation có thể ngắn nhưng phải đủ outcome-specific.  
- Nếu action mới chỉ captured local hoặc waiting to sync, wording phải phản ánh đúng mức đó.  
- Không dùng Success chung chung cho các outcomes cần trust cao.

## 10.3 Continuity wording

Copy trên Mobile Ops phải phân biệt rõ các trạng thái như:
- saved on this device;  
- waiting to sync;  
- upload in progress;  
- retry needed;  
- latest data may be outdated;  
- draft restored.

Các distinctions này đặc biệt quan trọng vì chúng quyết định user có tiếp tục tin vào app hay quay về chat/note ngoài hệ thống.

## 11. Rules cho field labels, helper text, placeholders và evidence prompts

## 11.1 Field labels

- Label phải nói dữ liệu là gì, không phải nói cách nhập.  
- Nếu field là required cho outcome quan trọng, label và validation nên cùng logic, không mâu thuẫn nhau.  
- Không dùng label quá nội bộ hoặc mang mã hệ thống nếu user không sống trong ngôn ngữ đó.

## 11.2 Helper text

- Dùng helper text khi user cần biết vì sao field tồn tại hoặc loại thông tin nào hữu ích nhất.  
- Helper text không nên lặp lại y nguyên label.  
- Helper text nên ngắn, nhưng phải đủ để giảm guessing.

## 11.3 Placeholders

- Placeholder không thay thế label.  
- Placeholder chỉ nên gợi ví dụ format hoặc kiểu nội dung.  
- Không dùng placeholder quá dài như một đoạn hướng dẫn chính.

## 11.4 Evidence prompts

- Evidence prompts phải nói rõ cần bằng chứng gì và khi nào cần.  
- Tránh Add file nếu thực chất người dùng cần Add Photo, Attach Proof hoặc Upload Receipt.  
- Nếu evidence là bắt buộc trước submit, copy nên cho user biết điều đó trước khoảnh khắc commit.

## 12. Tone theo mức độ nghiêm trọng và theo surface

## 12.1 Tone by severity

- **Info**: ngắn, định hướng, không kịch tính.  
- **Warning**: bình tĩnh nhưng rõ risk hoặc consequence.  
- **Error**: cụ thể, không đổ lỗi, luôn ưu tiên recovery nếu có.  
- **Success/confirmation**: rõ outcome, không ăn mừng quá đà.

## 12.2 Tone by surface

- **Web Admin** có thể dùng câu giàu context hơn vì user đang điều phối hoặc ra quyết định.  
- **Mobile Ops** nên ưu tiên câu ngắn hơn vì bối cảnh thao tác nhanh, nhưng vẫn phải giữ truth và distinction.  
- Cùng một meaning cốt lõi nên giữ cùng wording family giữa hai surfaces nếu không có lý do mạnh để rút gọn hoặc diễn giải khác.

## 13. Naming and wording register nên có trong triển khai

Để copy system vận hành thật, Pack 03 nên có hoặc sinh ra một register song hành ghi ít nhất các mục sau:

1. Preferred term.  
2. Avoided variants.  
3. Meaning definition.  
4. Where used.  
5. Related states or actions.  
6. Example UI usage.  
7. Notes about constraints or exceptions.

Register này đặc biệt cần cho status terms, action verbs, approval language, exception reasons và continuity messages.

## 14. Review workflow cho copy system

## 14.1 Khi nào copy phải được review chính thức

Copy phải được review chính thức khi:
- tạo screen mới;  
- thêm state mới hoặc distinction mới;  
- thêm action có hậu quả mới;  
- sửa recovery logic;  
- pilot feedback cho thấy user hiểu sai wording;  
- implementation rút gọn wording đến mức có nguy cơ đổi semantics.

## 14.2 Review questions

1. Câu này có phản ánh state/action thật không?  
2. Nó có dùng từ đang được chuẩn hóa ở nơi khác chưa?  
3. Nó có làm rõ impact hoặc next step khi cần không?  
4. Nó có quá generic không?  
5. Nó có làm Web và Mobile drift khỏi nhau về semantics không?  
6. Nó có nghe giống system truth hay giống marketing filler?

## 15. Anti-pattern UX writing nghiêm trọng phải tránh

## 15.1 Clever copy over operational clarity

Những câu nghe có vẻ hay nhưng làm người dùng dừng lại để giải mã là anti-pattern trực tiếp với Pack 03.

## 15.2 Same word, many meanings

Dùng cùng một từ như Update, Active hoặc Complete cho nhiều semantics khác nhau sẽ làm learnability sụt rất nhanh.

## 15.3 Many words, little guidance

Một đoạn dài chưa chắc giúp hơn một câu ngắn đúng. Copy dài mà không tăng hiểu biết hoặc recovery value là noise.

## 15.4 False certainty

Nói Completed khi thực chất mới waiting to sync hoặc server chưa xác nhận là anti-pattern trust rất nặng.

## 15.5 Generic failure language

Các câu như Something went wrong, Failed to process, Error occurred chỉ nên là fallback cuối cùng, không nên là mặc định cho những flows quan trọng.

## 15.6 Bureaucratic admin language

Web Admin không nên nói như một biểu mẫu hành chính khô cứng nếu có thể nói cùng meaning bằng ngôn ngữ công việc tự nhiên hơn.

## 15.7 Under-specified mobile wording

Mobile copy quá ngắn đến mức mất distinction giữa blocked, waiting, pending sync hoặc retry needed cũng là anti-pattern nghiêm trọng.

## 16. Governance rules cho mọi quyết định copy mới

Mọi quyết định copy mới nên đi qua các câu hỏi sau:

1. **Câu này đang giúp user hiểu điều gì?**  
2. **Meaning có trùng với term đã chuẩn hóa ở nơi khác không?**  
3. **Nếu là action label, hậu quả đã đủ rõ chưa?**  
4. **Nếu là message, user có biết điều gì xảy ra và nên làm gì tiếp không?**  
5. **Nếu là continuity wording, nó có phân biệt local, pending và confirmed không?**  
6. **Câu này có quá dài, quá generic hoặc quá marketing không?**  
7. **Nó có làm Pack 03 nói nhất quán hơn hay rời rạc hơn?**  
8. **Nếu implementation cần rút gọn, semantics nào tuyệt đối không được mất?**

## 17. Các tài liệu UX tiếp theo nên sinh ra từ đây

Sau tài liệu này, Pack 03 nên đi tiếp theo chuỗi logic sau:

1. **41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS.md** – release-readiness UX QA scenarios theo persona, flow, state transitions, copy checks và recovery moments.  
2. **42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK.md** – framework đo friction, adoption quality, retry behavior, approval clarity và trust signals.  
3. **43_ADMIN_CONSOLE_PERMISSION_AND_AUTHORITY_EXPERIENCE_RULES.md** – authority-language rules cho permission boundaries, escalation và control-surface accountability.  
4. **44_PILOT_ENABLEMENT_DEMO_SCRIPT_LIBRARY.md** – script library cho sales, pilot và onboarding dùng wording bám đúng copy system.  
5. **45_PACK03_COMPONENT_TO_SCREEN_TRACEABILITY_MATRIX.md** – ma trận traceability giữa components, screen families, states, copy semantics và QA coverage.  
6. **46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES.md** – handshake notes giữa copy semantics và implementation semantics cho pending/sync/retry states.  
7. **47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY.md** – register chi tiết cho terms, labels, messages, avoided variants và example usage.

## 18. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho copy system và UX writing của Pack 03:

1. Pack 03 cần một **copy system chính thức**, không để wording phát sinh ngẫu hứng theo từng màn hình hoặc từng sprint.  
2. Copy là một phần của product semantics, không chỉ là lớp polish sau cùng.  
3. Action labels, state labels, decision wording, validation/error/recovery messages và continuity messages phải được chuẩn hóa theo một grammar chung.  
4. Web Admin và Mobile Ops có thể khác độ dài và mức context, nhưng không được mâu thuẫn về meaning.  
5. Pending, locally saved, synced, failed và recovered là các distinctions bắt buộc phải được diễn đạt nhất quán.  
6. Anti-patterns như generic copy, false certainty, bureaucratic wording hoặc clever-but-vague language phải bị chặn trong governance loop.  
7. Tài liệu này là baseline để Product, Design, UX Writing, Frontend, QA, Sales và Onboarding nói cùng một ngôn ngữ xuyên Pack 03.

## 19. Điều kiện hoàn thành của tài liệu

Pack 03 Copy System and UX Writing Guidelines được xem là đạt yêu cầu khi:
- các launch-critical flows có ngôn ngữ nhất quán cho states, actions, outcomes và recovery;  
- team Product, Design, Frontend, QA và GTM có cùng từ điển nền để dùng trong UI, demo, onboarding và pilot;  
- implementation không còn tự phát sinh synonyms hoặc generic messages làm đổi semantics;  
- và Pack 03 có thể mở rộng thêm screens, patterns và scenarios mà vẫn giữ được coherence ngôn ngữ.

## AG Execution Prompt

You are acting as a senior UX writer, product language systems architect, and operational-copy governance lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: strategy, IA, screen taxonomy, state grammar, input patterns, wireframes, governance, component rules, decision-input rules, density rules, and continuity patterns are already defined.
- This document defines the official copy system and UX writing guidelines for Pack 03.

### Objective
Refine this Copy System and UX Writing Guidelines document into a production-grade language baseline that can guide UI copy, state terminology, action labels, errors, recoveries, continuity messages, demo scripts, onboarding language, QA copy review, and future microcopy inventory work across Pack 03.

### Inputs
- Use this document plus the major Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between Web Admin and Mobile Ops while keeping shared semantics aligned.
- Keep the output concrete enough for real product writing and review.

### Tasks
1. Rewrite the writing thesis into a sharper executive form.
2. Produce a terminology and message framework for actions, states, outcomes, errors, recovery, and continuity moments.
3. Add practical rules for surface naming, screen naming, work-object naming, action labels, status wording, field labels, helper text, placeholders, and evidence prompts.
4. Define tone guidance by severity and by surface.
5. Identify the top five writing failures that would weaken clarity, trust, or product coherence.
6. Recommend the next documents that should operationalize this baseline into QA scenarios, metrics frameworks, permission-language rules, and terminology registers.
7. Add governance rules to prevent generic copy, false certainty, semantic drift, and clever-but-vague wording.

### Constraints
- Do not let wording create new semantics that conflict with the state model.  
- Do not use generic verbs when specific outcomes matter.  
- Do not let pending or local-save states sound like full completion.  
- Do not let Web Admin drift into bureaucratic language or Mobile Ops drift into oversimplified ambiguity.  
- Keep the output concrete enough for downstream writing and implementation.

### Output Format
Return a revised markdown document with these sections:
1. Executive Writing Thesis
2. Terminology and Message Framework
3. Usage Rules by Copy Area
4. Tone and Severity Guidance
5. Writing Failure Risks
6. Governance Rules
7. Recommended Next Documents
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The output must make Pack 03 product language explicit and actionable.
- The result must remain consistent with Nextflow OS as an SME Business OS.
- The document must help teams write clearer actions, states, outcomes, recoveries, and continuity messages.
- The output must reduce ambiguity around terminology, microcopy scope, tone, and copy-review expectations.
