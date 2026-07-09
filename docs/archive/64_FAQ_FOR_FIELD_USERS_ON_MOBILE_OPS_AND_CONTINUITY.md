# Nextflow OS – FAQ for Field Users on Mobile Ops and Continuity

**Document ID:** 64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Customer Success / Field Enablement / Pilot Delivery / Product Management  
**Dependent Packs:** Mobile Platform, Frontend Delivery, Backend Workflow, QA & Support, Program Delivery  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE

## 1. Mục tiêu tài liệu

Tài liệu này là **FAQ (câu hỏi thường gặp) dành cho người dùng hiện trường và supervisor** khi sử dụng Mobile Ops của Nextflow OS trong Pack 03, tập trung vào các chủ đề: offline, mạng yếu, đồng bộ, tải lên, trạng thái nhiệm vụ, và khi nào cần liên hệ hỗ trợ. FAQ này được viết dựa trên Mobile Resilience Playbook (59), Training Deck Outline (63), Support Guide (61) và các semantics/copy chuẩn của Pack 03.

Tài liệu nhằm:
- trả lời các câu hỏi mà field users hay hỏi nhất khi đi hiện trường;  
- dùng ngôn ngữ đơn giản, sát với app;  
- thống nhất cách giải thích của supervisor và đội triển khai;  
- giảm số lượng ticket và hiểu lầm do không nắm rõ trạng thái.

Cấu trúc: trước hết là FAQ chung cho field users, sau đó là phần riêng cho supervisor/tổ trưởng.

---

## 2. FAQ chung cho field users

### 2.1 Trạng thái và lưu/đồng bộ

**Q1. "Đã lưu trên thiết bị" nghĩa là gì?**  
**A1.** Điều đó nghĩa là thông tin bạn đã nhập **đã được lưu an toàn trong máy của bạn**, kể cả khi lúc đó mạng yếu hoặc mất. Dữ liệu **chưa chắc đã được gửi lên hệ thống trung tâm**. Khi thấy trạng thái này, bạn có thể yên tâm là không bị mất những gì vừa nhập, và app sẽ cố gắng gửi khi có mạng tốt hơn.

**Q2. "Đang chờ đồng bộ" nghĩa là gì?**  
**A2.** App đang nói rằng: “Tôi đã giữ thông tin của bạn trong máy, và **đang đợi có mạng ổn** để gửi lên trung tâm.” Trong thời gian này, supervisor trên Web có thể chưa thấy cập nhật của bạn. Khi có Wifi/4G tốt, hãy mở app và để máy online một lúc để app gửi hết.

**Q3. "Đang tải lên" khác gì với "Đang chờ đồng bộ"?**  
**A3.** "Đang tải lên" nghĩa là app **đang thực sự gửi** dữ liệu (đặc biệt là ảnh/file) lên hệ thống trung tâm. "Đang chờ đồng bộ" là giai đoạn chờ có mạng tốt. Bạn có thể hình dung:
- Đã lưu trên thiết bị → Đang chờ đồng bộ → Đang tải lên → Đã xác nhận từ máy chủ.

**Q4. "Đã xác nhận từ máy chủ" nghĩa là gì?**  
**A4.** Nghĩa là hệ thống trung tâm **đã nhận và chấp nhận dữ liệu của bạn**. Ở bước này, supervisor trên Web về nguyên tắc có thể xem được nhiệm vụ/báo cáo mà bạn đã gửi. Nếu supervisor nói chưa thấy, hãy ghi lại mã nhiệm vụ và thời gian rồi báo lại cho người phụ trách hoặc hỗ trợ.

**Q5. App có tự gửi dữ liệu khi có mạng không, hay tôi phải mở app?**  
**A5.** App **cố gắng gửi tự động** khi có mạng, nhưng để chắc ăn, bạn nên **mở app khi có Wifi/4G tốt** (ví dụ cuối ca, về văn phòng) và để máy online vài phút. Điều này giúp app có cơ hội gửi hết dữ liệu đang chờ.

### 2.2 Mất mạng, mạng yếu và offline

**Q6. Nếu đang làm việc thì mất mạng giữa chừng, dữ liệu có bị mất không?**  
**A6.** App được thiết kế để **không làm mất dữ liệu bạn đã nhập** nếu có thể. Khi mạng mất, app sẽ cố lưu cục bộ. Nếu bạn thấy "Đã lưu trên thiết bị" hoặc "Đang chờ đồng bộ", dữ liệu của bạn vẫn nằm trong máy chờ gửi. Bạn nên hoàn thành nhiệm vụ trong khả năng và sau đó, khi có mạng, mở lại app để đồng bộ.

**Q7. Khi mất mạng, tôi có nên dừng làm việc không?**  
**A7.** Không nhất thiết. Nếu nhiệm vụ cho phép làm offline (ví dụ nhập số liệu, chụp hình), bạn có thể **tiếp tục làm và lưu trên thiết bị**. Chỉ những bước cần kết nối trực tiếp (ví dụ trả kết quả ngay cho hệ thống khác) mới có thể phải chờ mạng. Nếu không rõ, hãy hỏi supervisor xem nhiệm vụ đó có thể làm offline không.

**Q8. Làm sao tôi biết nhiệm vụ nào có thể làm offline?**  
**A8.** Điều này tuỳ cấu hình của từng khách hàng. Thông thường, trong buổi training và tài liệu nội bộ, supervisor hoặc đội triển khai sẽ nói rõ **loại nhiệm vụ nào nên làm khi có mạng tốt** và **loại nào có thể làm offline rồi đồng bộ sau**.

### 2.3 "Thử lại" và lỗi khi gửi

**Q9. Khi nào thì tôi thấy nút hoặc thông báo "Thử lại"?**  
**A9.** Bạn sẽ thấy "Thử lại" khi **lần gửi gần nhất lên trung tâm không thành công** – có thể do mạng, do server tạm thời bận, hoặc lỗi khác. Dữ liệu của bạn vẫn còn trong máy (trừ khi có thông báo khác nói ngược lại), và app đề nghị thử gửi lại.

**Q10. Tôi nên bấm "Thử lại" bao nhiêu lần?**  
**A10.** Thông thường bạn nên:
- kiểm tra lại kết nối (Wifi/4G),  
- di chuyển tới chỗ sóng tốt hơn nếu có thể,  
- sau đó bấm "Thử lại" 1–2 lần.  
Nếu sau vài lần ở nơi có mạng tốt mà vẫn lỗi, hãy ghi lại mã nhiệm vụ, thời gian, chụp màn hình nếu có thể và báo supervisor hoặc hỗ trợ.

**Q11. Bấm "Thử lại" liên tục có làm mọi thứ nhanh hơn không?**  
**A11.** Không. Bấm liên tục trong vài giây thường **không giúp được gì**, đôi khi còn làm hệ thống khó xử lý hơn. Tốt nhất là đảm bảo kết nối ổn trước, rồi thử lại có khoảng cách.

### 2.4 Nhiệm vụ "Hoàn tất" nhưng supervisor bảo chưa thấy

**Q12. Tôi đã bấm "Hoàn tất" nhưng supervisor nói chưa thấy nhiệm vụ, tại sao?**  
**A12.** Có vài khả năng:
- App đã đánh dấu nhiệm vụ là "hoàn tất" trên máy bạn nhưng **vẫn đang chờ gửi** (pending sync).  
- Dữ liệu đã gửi lên nhưng hệ thống trung tâm xử lý chậm, chưa cập nhật view cho Web.  
- Có lỗi tại bước đồng bộ hoặc xử lý.

Bạn nên:
- kiểm tra lại trên app xem trạng thái là gì (ví dụ vẫn "đang chờ đồng bộ" hay đã "đã xác nhận từ máy chủ");  
- nếu vẫn chờ, hãy đưa máy vào vùng sóng tốt và giữ app mở;  
- nếu app báo "đã xác nhận từ máy chủ" nhưng Web vẫn chưa thấy, báo lại cho supervisor/hỗ trợ với mã nhiệm vụ và thời gian.

### 2.5 Ảnh, file đính kèm và lỗi tải lên

**Q13. Nếu ảnh không tải lên được nhưng nhiệm vụ đã được ghi nhận thì sao?**  
**A13.** Thường nghĩa là **bản ghi nhiệm vụ của bạn đã lên hệ thống**, nhưng một hoặc vài ảnh gặp lỗi khi tải lên. App thường sẽ báo ảnh nào bị lỗi. Khi có mạng tốt, bạn nên thử lại việc tải ảnh. Nếu thử lại nhiều lần vẫn lỗi, đừng xoá ảnh gốc khỏi máy – hãy báo supervisor/hỗ trợ và chờ hướng dẫn.

**Q14. Tôi có nên xoá ảnh trong máy sau khi app báo đã tải lên không?**  
**A14.** Chính sách này phụ thuộc vào quy định nội bộ. Về mặt kỹ thuật, khi app báo "đã xác nhận từ máy chủ" cho ảnh, nghĩa là ảnh đã tới hệ thống. Tuy vậy, tốt nhất là **không xoá ảnh gốc ngay lập tức** mà nên đợi ít nhất tới cuối ca, hoặc theo hướng dẫn của công ty.

### 2.6 Quyền, nút bị khoá và thông báo lỗi

**Q15. Vì sao tôi không thấy hoặc không bấm được một số nút (ví dụ Duyệt, Gửi, Hoàn tất)?**  
**A15.** Có vài lý do phổ biến:
- **Vai trò (role)** của bạn không có quyền làm hành động đó.  
- Nhiệm vụ đang ở **trạng thái không phù hợp** (ví dụ chưa đủ thông tin).  
- **Thiếu điều kiện/policy** (chưa chụp đủ ảnh, chưa điền đủ trường bắt buộc).  
Nếu có message đi kèm, hãy đọc kỹ: đôi khi thông báo sẽ nói “Thiếu thông tin…” chứ không phải “Bạn không có quyền…”. Nếu không rõ, hỏi supervisor để xác nhận.

**Q16. Nếu tôi nghĩ mình "đáng ra phải có quyền" làm gì đó thì sao?**  
**A16.** Hãy:
- ghi lại màn hình message,  
- note nhiệm vụ và thời gian,  
- báo supervisor hoặc người phụ trách.  
Có thể việc hạn chế quyền là có chủ ý (theo policy), hoặc có thể role của bạn cần được điều chỉnh. Đừng tự dùng chung tài khoản của người khác để "lách" – điều này gây khó cho truy vết và governance.

### 2.7 Checklist cá nhân trước và sau ca

**Q17. Trước ca làm, tôi nên kiểm tra những gì trong app?**  
**A17.** Gợi ý:
- đảm bảo máy đủ pin;  
- kiểm tra kết nối (Wifi/4G) nơi xuất phát;  
- mở app, đăng nhập, kiểm tra xem có nhiệm vụ nào vẫn "đang chờ đồng bộ" từ ca trước không;  
- nếu có, cố gắng gửi chúng trước khi đi;  
- đảm bảo bạn nhớ ý nghĩa các trạng thái chính.

**Q18. Sau ca làm, tôi nên làm gì với app?**  
**A18.** Trước khi tắt máy:
- mở app và kiểm tra xem có nhiệm vụ nào "đang chờ đồng bộ" không;  
- nếu có, để máy trong vùng có Wifi/4G tốt và giữ app mở vài phút;  
- nếu vẫn còn nhiệm vụ chờ đồng bộ, note lại và báo supervisor;  
- tránh tắt nguồn ngay khi biết còn dữ liệu chưa gửi.

### 2.8 Khi nào cần gọi supervisor hoặc hỗ trợ

**Q19. Tôi nên gọi supervisor/hỗ trợ khi nào?**  
**A19.** Một số trường hợp nên gọi ngay:
- app báo "đã xác nhận từ máy chủ" nhưng supervisor bảo không thấy gì;  
- nhiệm vụ xuất hiện trùng hoặc nội dung khác với những gì bạn nhập;  
- ảnh hoặc file liên tục lỗi dù bạn đang ở nơi sóng tốt;  
- app thường xuyên bị treo hoặc "đá ra" khi gửi;  
- bạn cảm thấy message/trạng thái trong app không rõ hoặc không đúng.

**Q20. Khi gọi hỗ trợ, tôi nên chuẩn bị thông tin gì?**  
**A20.** Gợi ý chuẩn:
- mã nhiệm vụ/case (nếu có);  
- thời gian bạn thực hiện và gửi;  
- trạng thái hiển thị trên app (ghi lại hoặc chụp màn hình);  
- loại kết nối (Wifi/4G, hay offline) và vị trí tương đối;  
- tần suất (một lần hay nhiều lần).

---

## 3. FAQ bổ sung cho supervisor / tổ trưởng

### 3.1 Kiểm tra trên Web Admin

**Q21. Tôi có thể kiểm tra nhiệm vụ của đội trên Web Admin như thế nào?**  
**A21.** Tuỳ cấu hình, bạn có thể:
- vào màn hình danh sách nhiệm vụ/case, dùng bộ lọc theo trạng thái, người thực hiện, thời gian;  
- tìm theo mã nhiệm vụ nếu field user cung cấp;  
- mở chi tiết để xem lịch sử, ảnh, ghi chú.

**Q22. Nếu field user nói đã gửi mà tôi không thấy trên Web thì sao?**  
**A22.** Hãy:
- yêu cầu họ cho mã nhiệm vụ và trạng thái họ thấy (ví dụ "đang chờ đồng bộ" hay "đã xác nhận từ máy chủ");  
- kiểm tra lại trên Web với filter thời gian rộng hơn;  
- nếu họ vẫn ở mức "đang chờ đồng bộ", hướng dẫn theo playbook (đem máy vào vùng sóng tốt, mở app);  
- nếu app đã báo "đã xác nhận từ máy chủ" nhưng bạn vẫn không thấy, escalates theo kênh hỗ trợ, cung cấp đầy đủ thông tin (theo guide 61).

### 3.2 Hỗ trợ đội khi gặp vấn đề

**Q23. Tôi nên hỏi gì khi đội báo vấn đề với app?**  
**A23.** Một checklist nhanh:
- bạn dùng Web hay Mobile?  
- vai trò của bạn là gì?  
- nhiệm vụ/case nào (mã, loại)?  
- trên màn hình bạn thấy trạng thái/message gì?  
- lúc đó bạn dùng Wifi, 4G hay đang mất mạng?  
- bạn đã thử lại chưa, kết quả thế nào?  
Những câu hỏi này trùng với checklist intake trong Support Guide 61.

**Q24. Tôi nên dùng Playbook và FAQ như thế nào?**  
**A24.** Playbook 59 là tài liệu giải thích chi tiết các tình huống và cách xử lý; FAQ này là bản tóm tắt nhanh. Khi đội hỏi, bạn có thể:
- tra nhanh trong FAQ;  
- nếu cần nhiều chi tiết hơn, mở Playbook;  
- nếu vẫn không chắc, liên hệ kênh hỗ trợ nội bộ hoặc Nextflow.

### 3.3 Escalation và liên hệ hỗ trợ

**Q25. Khi nào tôi nên escalates lên hỗ trợ cấp cao hoặc Nextflow?**  
**A25.** Một số dấu hiệu cần escalates:
- nghi ngờ mất dữ liệu thực sự (user nhập mà cả app lẫn Web đều không tìm thấy);  
- mismatch rõ ràng và lặp lại giữa app báo "đã xác nhận" và Web không có record;  
- nhiều người trong đội gặp cùng một lỗi trong thời gian ngắn;  
- lỗi liên quan tới quyền/authority (người đúng role mà không làm được việc).  
Khi escalates, hãy gửi đủ thông tin như Q20.

### 3.4 Training lại và nhắc nhở đội

**Q26. Tôi có thể dùng training deck và scenario library như thế nào để training lại đội?**  
**A26.** Bạn có thể:
- dùng deck theo outline 63 để làm buổi refresh training;  
- chọn vài scenario từ Scenario Library (58) để minh hoạ;  
- tập trung vào các tình huống mà đội đã gặp nhiều nhất trong pilot;  
- khuyến khích đội chia sẻ tips thực tế, sau đó gửi feedback về cho CS/Product.

---

## 4. Cập nhật FAQ này

FAQ này nên được cập nhật khi:
- app thay đổi cách hiển thị hoặc wording các trạng thái chính;  
- Playbook 59 hoặc Support Guide 61 được cập nhật với tình huống mới;  
- feedback từ field users và supervisor cho thấy có câu hỏi lặp lại chưa được trả lời rõ;  
- có pilot mới với bối cảnh khác (ngành khác, quy trình khác).

Việc cập nhật nên do Customer Success / Field Enablement phối hợp với Product Management và Mobile Platform thực hiện.

## 5. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho FAQ for Field Users on Mobile Ops and Continuity của Pack 03:

1. Field users và supervisor cần một FAQ đơn giản, nhất quán với Playbook 59, để hiểu các trạng thái và tình huống thường gặp mà không cần đọc toàn bộ tài liệu kỹ thuật.  
2. FAQ này phải tập trung vào các chủ đề: lưu/đồng bộ, mất mạng, thử lại, mismatch Web–Mobile, đính kèm, quyền và checklist trước/sau ca.  
3. Supervisor có phần FAQ riêng bổ sung cách kiểm tra trên Web, hỗ trợ đội và escalates.  
4. FAQ này phải sống cùng Playbook, Training Deck, Support Guide và Scenario Library, và được cập nhật khi có học mới từ pilot.  
5. Tài liệu này là một trong những tài sản enablement chính để giảm nhầm lẫn, tăng niềm tin của người dùng hiện trường và làm nhẹ tải cho đội hỗ trợ.

## 6. Điều kiện hoàn thành của tài liệu

FAQ for Field Users on Mobile Ops and Continuity được xem là đạt yêu cầu khi:
- phần lớn câu hỏi thường gặp của field users về trạng thái/lưu/đồng bộ có thể trả lời bằng tài liệu này;  
- supervisor sử dụng được FAQ như công cụ hỗ trợ nhanh cho đội;  
- số lượng ticket liên quan đến hiểu lầm về “đã lưu/đã gửi/đang chờ đồng bộ/không đủ quyền” giảm dần qua các pilot;  
- và nội dung FAQ được giữ nhất quán với Playbook 59 và các tài liệu Pack 03 khác.

## AG Execution Prompt

You are acting as a field-facing content refiner, clarity editor, and enablement copy lead.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops UX, continuity semantics, reconciliation patterns, field playbook, training deck outline, and support guide are already defined.
- This document defines a FAQ for field users and supervisors about Mobile Ops and continuity.

### Objective
Refine this FAQ into a crisp, field-friendly document that can be shared directly with field users and supervisors to answer their most common questions about saving, syncing, uploading, and troubleshooting.

### Inputs
- Use this document plus Playbook 59, Training Deck 63, and Support Guide 61 as primary references.
- Preserve the distinction between field-user content and supervisor-specific content.  
- Keep the language simple, consistent with in-app copy and training.

### Tasks
1. Tighten and simplify the wording of all Q&A while preserving meaning.  
2. Ensure terminology and message families match the copy system and playbook.  
3. Add or reorder questions based on what is most common/critical in pilots.  
4. Flag any parts that may need localization or customer-specific customization.  
5. Identify the top misunderstandings this FAQ should help reduce.

### Constraints
- Do not introduce technical jargon not already present in training/playbook.  
- Do not contradict the underlying semantics of continuity and reconciliation.  
- Do not assume stable connectivity or identical device policies across customers.  
- Keep answers short enough to be readable on mobile.

### Output Format
Return a revised markdown document with these sections:
1. Purpose
2. Field User FAQ
3. Supervisor FAQ
4. Updating This FAQ
5. Misunderstandings to Reduce

### Acceptance Criteria
- The output must be ready to share with field users and supervisors with minimal editing.  
- The result must be consistent with Playbook 59 and Training Deck 63.  
- The FAQ must address the most frequent and impactful questions about Mobile Ops and continuity.  
- The document must help reduce confusion and unnecessary support tickets.
