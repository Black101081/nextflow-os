# Nextflow OS – Mobile Resilience Playbook for Field Operations

**Document ID:** 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Management / Mobile Platform / Customer Success / Field Enablement  
**Dependent Packs:** Mobile Platform, Backend Workflow, Analytics & Data, QA & Support, Pilot Delivery, GTM Enablement  
**Prerequisite Documents:** 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 27_UX_GUARDRAILS_AND_INTERACTION_PRINCIPLES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 32_MOBILE_OPS_WIREFRAME_BLUEPRINTS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 35_MOBILE_OPS_COMPONENT_BEHAVIOR_RULES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 41_PACK03_RELEASE_READINESS_UX_QA_SCENARIOS, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 55_PILOT_SIGNAL_REVIEW_DASHBOARD_REQUIREMENTS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK

## 1. Mục tiêu tài liệu

Tài liệu này là **playbook dành cho người dùng hiện trường (field operations) sử dụng Mobile Ops** của Nextflow OS trong Pack 03. Nếu các tài liệu 39, 46 và 53 đã định nghĩa offline resilience, continuity handshake và eventual consistency ở level thiết kế và kỹ thuật, thì tài liệu này chuyển chúng thành **ngôn ngữ, ví dụ và hướng dẫn thực tế** cho người đang ở ngoài hiện trường:

> **Khi mạng yếu, mất mạng, chập chờn; khi app nói "đã lưu", "đang chờ đồng bộ", "đang tải lên", "thử lại", "không khớp"; khi bạn phải vừa làm việc, vừa chụp hình, vừa di chuyển… thì bạn nên hiểu thế nào, làm gì, không nên làm gì, và khi nào cần báo lại cho quản lý hoặc hỗ trợ?**

Tài liệu này không đi sâu vào nội thất kỹ thuật, mà trả lời cho field users và đội triển khai các câu hỏi:
- “Khi nào tôi có thể yên tâm là hệ thống đã nhận?”  
- “Nếu tôi nghi ngờ thì tôi kiểm tra ở đâu?”  
- “Lúc mất mạng tôi nên tiếp tục hay dừng?”  
- “Nếu app bảo ‘thử lại’ thì tôi nên thử thế nào, bao nhiêu lần?”  
- “Đã từng xảy ra việc app hiển thị một kiểu, trung tâm thấy một kiểu chưa, và chúng ta xử lý thế nào?”

## 2. Vì sao Pack 03 cần Mobile Resilience Playbook cho field operations

Field operations là nơi **mọi lý thuyết về UX, offline và reconciliation gặp thực tế**: trời mưa, mạng yếu, thiết bị cũ, nhiều app chạy cùng lúc, nhiều nhiệm vụ trong ngày. Nếu chỉ có thiết kế đẹp và event taxonomy tốt mà người dùng hiện trường không hiểu và không được hướng dẫn rõ, kết quả sẽ là:
- họ mất niềm tin (“không biết app có lưu chưa, thôi ghi lại ra giấy cho chắc”);  
- họ duplicate effort (làm lại cùng một task nhiều lần);  
- họ blame sai (đổ lỗi cho app trong khi thực ra là policy hoặc state);  
- họ không tận dụng được resilience mà product đã thiết kế.

Tài liệu này tồn tại để:**
- giải thích các trạng thái quan trọng trên Mobile Ops theo ngôn ngữ đời thường;  
- đưa các **tình huống mẫu** (scenario) và cách xử lý;  
- đưa các **do/don't** đơn giản;  
- làm cầu nối giữa quyết định của product và thực tế hiện trường.

## 3. Đối tượng sử dụng playbook

Playbook này hướng tới:
- Người dùng Mobile Ops trực tiếp ở hiện trường (frontline).  
- Team giám sát hiện trường hoặc tổ trưởng, supervisor.  
- Đội triển khai, onboarding, training của khách hàng.  
- Customer Success và Pilot Delivery khi hướng dẫn pilot site.

## 4. Những khái niệm cơ bản cần nắm

### 4.1 Ba lớp trạng thái

Khi làm việc với Mobile Ops, bạn luôn có thể nghĩ đến **ba lớp trạng thái**:
- **Trên thiết bị của bạn** – những gì bạn vừa nhập, vừa chụp, vừa nhấn.  
- **Trên máy chủ** – những gì hệ thống trung tâm đã nhận và xử lý.  
- **Trong luồng công việc** – trạng thái nghiệp vụ của nhiệm vụ (chưa làm, đang làm, đã xong, chờ duyệt, bị trả lại…).

Playbook này giúp bạn hiểu **khi nào ba thứ đó trùng nhau, khi nào tạm thời lệch nhau**, và phải làm gì.

### 4.2 Một số từ quan trọng

Tùy ngôn ngữ cấu hình, app có thể dùng các cụm như:
- “Đã lưu trên thiết bị” – thông tin đã được giữ lại trong máy bạn, chưa chắc đã gửi lên.  
- “Đang chờ đồng bộ” – app đang chờ có kết nối tốt để gửi dữ liệu lên trung tâm.  
- “Đang tải lên” – app đang gửi dữ liệu (đặc biệt là ảnh/đính kèm).  
- “Đã xác nhận từ máy chủ” – trung tâm đã nhận và chấp nhận thông tin.  
- “Thử lại” – lần gửi trước chưa thành công, bạn có thể cho app gửi lại.

## 5. Các tình huống thường gặp và cách xử lý

Trong phần này, ta đi qua các tình huống điển hình theo ngôn ngữ thực tế.

### 5.1 Bạn đang làm việc và mất mạng giữa chừng

**Tình huống:** Bạn đang mở một nhiệm vụ, nhập thông tin hoặc chụp hình. Mạng đang yếu hoặc mất.

**Điều hệ thống cố gắng làm:**
- Lưu thông tin bạn đã nhập **cục bộ trên thiết bị**.  
- Đánh dấu nhiệm vụ ở trạng thái “đang chờ gửi đi” khi có mạng trở lại.

**Bạn nên:**
- Hoàn tất việc nhập/chụp trong phạm vi nhiệm vụ đó nếu có thể.  
- Để ý tin nhắn hoặc biểu tượng “đã lưu trên thiết bị” / “đang chờ đồng bộ”.  
- Khi có lại kết nối, mở lại danh sách hoặc nhiệm vụ để app có cơ hội gửi dữ liệu đi.

**Bạn không nên:**
- Đóng app hoàn toàn rồi mở lại liên tục chỉ vì lo lắng – điều này thường không giúp được gì hơn.  
- Tạo một nhiệm vụ khác với cùng nội dung chỉ vì chưa thấy cập nhật trên web – hãy chờ đồng bộ hoặc kiểm tra phần “hoạt động gần đây” trước.

### 5.2 Bạn thấy “Đã lưu trên thiết bị, đang chờ đồng bộ”

**Ý nghĩa:**
- Thông tin bạn nhập không bị mất; nó đang nằm trên máy bạn.  
- App chưa chắc đã gửi dữ liệu lên trung tâm (server) – có thể đang chờ mạng tốt hơn.

**Khuyến nghị:**
- Khi có mạng Wifi/4G ổn định hơn, mở lại app và đảm bảo bạn đã đăng nhập.  
- Kiểm tra trong danh sách nhiệm vụ xem có biểu tượng hoặc filter “đang chờ đồng bộ” không; cố gắng để thiết bị online đủ lâu để app gửi.

Nếu sau một khoảng thời gian hợp lý (ví dụ >30 phút ở nơi có mạng ổn) mà trạng thái chưa thay đổi, bạn nên:
- Báo cho supervisor hoặc contact hỗ trợ, nêu rõ mã nhiệm vụ và thời gian.  
- Tránh cố gắng xóa nhiệm vụ và làm lại từ đầu trừ khi được hướng dẫn.

### 5.3 Bạn thấy “Thử lại” sau khi gửi

**Ý nghĩa:**
- Lần gửi gần nhất lên trung tâm không thành công (do mạng hoặc lỗi khác).  
- Dữ liệu của bạn vẫn còn, app đề nghị thử gửi lại.

**Bạn nên:**
- Kiểm tra kết nối mạng (Wifi/4G), tốt nhất là di chuyển tới vị trí có sóng tốt hơn.  
- Bấm “Thử lại” 1–2 lần khi chắc chắn đã có mạng.  
- Nếu vẫn không thành công, ghi chú thời gian/địa điểm và báo cho supervisor/hỗ trợ.

**Bạn không nên:**
- Bấm “Thử lại” liên tục trong vài giây nhiều lần – điều này hiếm khi cải thiện, đôi khi còn làm khó xử lý.  
- Sửa nội dung liên tục trong khi đang thử lại, trừ khi app yêu cầu.

### 5.4 Nhiệm vụ bạn đã “hoàn tất” nhưng trên Web Admin chưa thấy

**Tình huống:** Bạn đánh dấu nhiệm vụ “Hoàn tất” trên Mobile. Sau đó, giám sát trên Web nói là họ chưa thấy kết quả.

**Khả năng:**
- Nhiệm vụ của bạn vẫn đang ở trạng thái “đã lưu cục bộ / chờ đồng bộ”.  
- Dữ liệu đã gửi lên nhưng backend hoặc Web Admin chưa cập nhật view.  
- Có lỗi tại bước đồng bộ hoặc bước xử lý trên server.

**Bạn nên:**
- Kiểm tra lại trên thiết bị xem nhiệm vụ đó đang ở trạng thái gì.  
- Nếu vẫn ghi “Đang chờ đồng bộ”, hãy cố gắng đưa thiết bị vào vùng có mạng tốt và giữ app mở một khoảng thời gian.  
- Nếu app ghi “Đã xác nhận từ máy chủ” nhưng Web vẫn không thấy, báo cho hỗ trợ: cung cấp mã nhiệm vụ, thời gian hoàn tất và, nếu có, ảnh chụp màn hình.

### 5.5 Đính kèm (ảnh/file) bị lỗi nhưng nhiệm vụ vẫn ghi nhận

**Tình huống:** Bạn hoàn tất nhiệm vụ và app ghi nhận kết quả, nhưng một hoặc vài ảnh không tải lên được.

**Ý nghĩa:**
- Bản ghi chính (nhiệm vụ) đã đến máy chủ.  
- Những ảnh bị lỗi đang được đánh dấu riêng, có thể thử tải lại.

**Bạn nên:**
- Kiểm tra nhiệm vụ xem ảnh nào bị lỗi; thường app sẽ hiển thị biểu tượng hoặc thông báo.  
- Khi có mạng ổn định, thử lại phần tải ảnh theo hướng dẫn.  
- Nếu nhiều lần vẫn lỗi, báo cho supervisor và lưu ý không xóa ảnh gốc khỏi thiết bị cho đến khi có hướng dẫn.

## 6. Nguyên tắc chung cho người dùng hiện trường

1. **Bảo vệ nỗ lực của bạn là ưu tiên số một** – app được thiết kế để không xóa dữ liệu bạn đã nhập mà không báo.  
2. **Đừng vội làm lại một nhiệm vụ từ đầu** trừ khi bạn chắc chắn nhiệm vụ cũ không thể gửi hoặc được yêu cầu cụ thể.  
3. **Mạng tốt là bạn của bạn** – khi có cơ hội, cho thiết bị ở trong vùng sóng tốt để app gửi hết dữ liệu.  
4. **Ghi lại mã nhiệm vụ và thời gian** cho những trường hợp bạn nghi ngờ; điều này giúp hỗ trợ và product tra cứu nhanh hơn.  
5. **Đừng tự nâng quyền hoặc chia sẻ tài khoản** để “lách” giới hạn; thay vào đó hãy báo lại nếu bạn nghĩ quy trình đang không phù hợp.

## 7. Checklist nhanh trước khi ra hiện trường

Trước khi bắt đầu ca làm, bạn nên:
- Đảm bảo thiết bị đã được sạc đủ pin.  
- Kiểm tra kết nối (Wifi/4G) tại điểm xuất phát.  
- Mở app, đăng nhập và kiểm tra xem có nhiệm vụ “đang chờ đồng bộ” nào từ ca trước không; nếu có, cố gắng gửi chúng trước khi đi.  
- Đảm bảo bạn nhớ hoặc nắm được ý nghĩa các trạng thái chính (đã lưu, chờ đồng bộ, đã gửi…).  
- Biết rõ kênh liên lạc với supervisor hoặc hỗ trợ khi gặp trường hợp lạ.

## 8. Checklist nhanh khi kết thúc ca

- Kiểm tra danh sách nhiệm vụ xem có nhiệm vụ nào vẫn “đang chờ đồng bộ” không.  
- Nếu có, cố gắng để thiết bị ở nơi có Wifi/4G tốt và mở app trong vài phút.  
- Nếu sau đó vẫn còn nhiệm vụ chưa đồng bộ, note lại và báo cho supervisor/hỗ trợ.  
- Không tắt nguồn thiết bị ngay sau ca nếu biết còn dữ liệu chưa gửi.

## 9. Khi nào cần escalate hoặc gọi hỗ trợ

Bạn nên escalate khi:
- nhiệm vụ đã ở trạng thái “đã xác nhận từ máy chủ” trên app nhưng Web Admin vẫn báo không có dữ liệu;  
- nhiệm vụ mã A xuất hiện trùng hoặc có nội dung không trùng với những gì bạn nhập;  
- ảnh hoặc file nhiều lần báo lỗi dù bạn đang có mạng tốt;  
- app thường xuyên bị “đá ra” hoặc treo khi đang gửi;  
- bạn cảm thấy cách app diễn tả trạng thái không rõ hoặc không đúng với điều đang xảy ra.

Khi liên hệ hỗ trợ, luôn cung cấp:
- mã nhiệm vụ;  
- thời gian bạn thực hiện và gửi;  
- trạng thái trên app (ghi lại hoặc chụp màn hình nếu có thể);  
- loại kết nối bạn đang dùng (Wifi, 4G) và vị trí tương đối (nếu có).  

## 10. Dành cho supervisor và đội triển khai

Supervisor và đội triển khai nên:
- dùng scenario library (58) để tập trước các tình huống offline/continuity với field users;  
- giải thích rõ ràng rằng “đã lưu trên thiết bị” khác “đã xác nhận từ máy chủ”;  
- có quy ước nội bộ: ca nào cũng phải check nhiệm vụ “đang chờ đồng bộ” ở cuối ca;  
- khi nhận phản hồi “app làm mất dữ liệu”, luôn kèm theo bước tra cứu event/timeline nếu có (thông qua team support/product);  
- phối hợp với Product/CS để cập nhật playbook khi có thay đổi UX hoặc copy.

## 11. Liên kết với metrics, dashboards và triage

- Những gì field users trải nghiệm được phản ánh qua các signals như local_persist_success, sync_confirmed, retry_exhausted, attachment_upload_failed… (tài liệu 53, 55).  
- Khi pilot triage (48), team nên mang cả anecdotes từ hiện trường và signals từ dashboards để đối chiếu.  
- Khi nhiều user báo cùng một vấn đề (ví dụ hay phải “thử lại”), đó là tín hiệu quan trọng cho product và engineering xem lại.

## 12. Anti-pattern sử dụng Mobile Ops cần tránh

1. Luôn chờ “mạng thật tốt” mới dám dùng app, dẫn tới việc không bao giờ tận dụng offline.  
2. Tự ghi lại mọi thứ ra giấy vì không tin app lưu – thay vì học cách kiểm tra trạng thái.  
3. Tạo nhiều nhiệm vụ trùng nhau để “chắc chắn có cái lên được”.  
4. Chia sẻ tài khoản cho nhau để “lách quyền”.  
5. Không bao giờ báo lại khi thấy lỗi – chỉ chửi app và bỏ qua.  
6. Tắt máy ngay khi xong ca mà không kiểm tra nhiệm vụ chờ đồng bộ.

## 13. Cách cập nhật playbook này

Playbook nên được cập nhật khi:
- UX Mobile Ops đổi các trạng thái/label chính;  
- continuity và reconciliation patterns có thay đổi;  
- pilot hoặc production phát hiện kiểu tình huống mới chưa được đề cập;  
- có feedback từ field users rằng giải thích hiện tại khó hiểu.

Cập nhật nên được làm bởi Product Management, Mobile Platform và Customer Success phối hợp.

## 14. Các tài liệu UX tiếp theo nên sinh ra từ đây

1. **60_POST_PILOT_LEARNING_SYNTHESIS_AND_DECISION_LOG_TEMPLATE.md** – template tổng hợp học từ pilot, gắn với feedback và signals.  
2. **61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS.md** – guide chi tiết cho support khi xử lý ticket liên quan tới Mobile Ops.  
3. **62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY.md** – checklist cho team nội bộ khi bắt đầu dùng scenario library và playbook.  
4. **63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE.md** – outline bộ slide training dựa trên playbook này.  
5. **64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY.md** – FAQ cho người dùng hiện trường.

## 15. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Mobile Resilience Playbook for Field Operations của Pack 03:

1. Mobile Ops được thiết kế để bảo vệ nỗ lực của người dùng hiện trường, ngay cả khi mạng không ổn định.  
2. Các trạng thái “đã lưu trên thiết bị”, “đang chờ đồng bộ”, “đang tải lên”, “đã xác nhận từ máy chủ”, “thử lại” phải được giải thích rõ và dùng nhất quán.  
3. Field users cần được hướng dẫn rõ ràng về do/don't trong các tình huống mạng yếu, mất mạng, retry, mismatch.  
4. Supervisor và đội triển khai cần dùng scenario library và playbook để đào tạo và hỗ trợ hiện trường.  
5. Metrics và dashboards về continuity và resilience phải được đọc cùng với phản hồi từ hiện trường.  
6. Playbook này là cầu nối giữa thiết kế continuity của Pack 03 và công việc thực tế của người dùng ngoài hiện trường.

## 16. Điều kiện hoàn thành của tài liệu

Mobile Resilience Playbook for Field Operations được xem là đạt yêu cầu khi:
- field users hiểu được các trạng thái chính và biết phải làm gì trong các tình huống thường gặp;  
- supervisor và đội triển khai dùng được playbook để training và xử lý case thực;  
- feedback từ hiện trường giảm dần về việc “app làm mất dữ liệu” hoặc “không biết đã gửi chưa”;  
- và metrics về retry_exhausted, attachment_failures và conflicts có thể được diễn giải cùng với trải nghiệm người dùng ngoài hiện trường.

## AG Execution Prompt

You are acting as a field-operations enablement lead, mobile resilience storyteller, and UX-to-reality translator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops UX, offline patterns, continuity semantics, reconciliation patterns, metrics, and scenario library are already defined.
- This document defines the Mobile Resilience Playbook for field users.

### Objective
Refine this Mobile Resilience Playbook into a clear, practical guide that field users, supervisors, and enablement teams can use to work confidently with Mobile Ops in real-world conditions.

### Inputs
- Use this document plus the relevant Pack 03 baseline documents as the primary source of truth.
- Preserve the distinction between local device state, server state, and workflow state, but explain them in simple language.  
- Keep the output concrete, example-driven, and suitable for training.

### Tasks
1. Rewrite the playbook thesis into a sharper, field-friendly executive form.
2. Simplify and structure the key concepts (states, messages, do/don't) for non-technical users.  
3. Add more real-world scenarios and responses where helpful.  
4. Ensure alignment with copy system and messaging guidelines.  
5. Identify the top five misunderstandings this playbook must help prevent.  
6. Recommend the next enablement documents (training deck, FAQ, support scripts) and how they should use this playbook.

### Constraints
- Do not overload field users with technical detail.  
- Do not contradict the underlying semantics in the technical documents.  
- Do not assume stable connectivity or perfect devices.  
- Keep the output immediately usable in training sessions.

### Output Format
Return a revised markdown document with these sections:
1. Field-Friendly Thesis
2. Key Concepts and Messages
3. Common Scenarios and What To Do
4. For Supervisors and Trainers
5. Misunderstandings to Avoid
6. Next Enablement Assets

### Acceptance Criteria
- The output must make Mobile Ops behavior under weak/offline network conditions understandable to field users.  
- The result must remain consistent with Pack 03 continuity and reconciliation semantics.  
- The document must be suitable as a basis for training decks, FAQs, and support scripts.  
- The output must reduce confusion around “saved”, “synced”, “uploaded”, and “complete” for field users.
