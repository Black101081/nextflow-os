# Nextflow OS – Field Enablement Training Deck Outline

**Document ID:** 63_FIELD_ENABLEMENT_TRAINING_DECK_OUTLINE  
**Pack:** 03 — Experience & UX  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Customer Success / Field Enablement / Pilot Delivery / Product Management  
**Dependent Packs:** Mobile Platform, Frontend Delivery, Backend Workflow, Analytics & Data, Sales Enablement, Program Delivery  
**Prerequisite Documents:** 20_EXPERIENCE_STRATEGY_OVERVIEW, 21_WEB_ADMIN_EXPERIENCE_STRATEGY, 22_MOBILE_OPS_EXPERIENCE_STRATEGY, 25_FIRST_WEDGE_USER_FLOWS, 26_STATE_AND_STATUS_PRESENTATION_RULES, 29_DATA_ENTRY_AND_EVIDENCE_CAPTURE_PATTERNS, 33_EMPTY_STATES_ERRORS_AND_RECOVERY_MESSAGES, 39_MOBILE_OFFLINE_RESILIENCE_AND_INTERRUPTION_PATTERNS, 40_PACK03_COPY_SYSTEM_AND_UX_WRITING_GUIDELINES, 42_EXECUTION_METRICS_AND_USABILITY_SIGNAL_FRAMEWORK, 46_OFFLINE_AND_SYNC_STATUS_TECHNICAL_HANDSHAKE_NOTES, 47_PACK03_TERMINOLOGY_REGISTER_AND_MICROCOPY_INVENTORY, 51_PACK03_DEMO_ENVIRONMENT_DATA_AND_SCENARIO_SETUP_GUIDE, 53_MOBILE_EVENTUAL_CONSISTENCY_AND_RECONCILIATION_PATTERNS, 58_PACK03_SCENARIO_LIBRARY_INDEX_AND_ENVIRONMENT_OPERATIONS_RUNBOOK, 59_MOBILE_RESILIENCE_PLAYBOOK_FOR_FIELD_OPERATIONS, 61_SUPPORT_AND_TROUBLESHOOTING_GUIDE_FOR_NEXTFLOW_PILOTS, 62_ONBOARDING_CHECKLIST_FOR_INTERNAL_TEAMS_USING_SCENARIO_LIBRARY

## 1. Mục tiêu tài liệu

Tài liệu này cung cấp **outline cho bộ slide training (Field Enablement Training Deck)** dùng để đào tạo người dùng hiện trường (field users), supervisor và các nhóm triển khai về cách sử dụng Mobile Ops của Nextflow OS trong Pack 03. Nếu Playbook 59 giải thích bằng văn bản cách hệ thống hoạt động khi mạng yếu/mất mạng và người dùng nên làm gì, thì tài liệu này trả lời câu hỏi:

> **Buổi đào tạo 60–90 phút cho field users và supervisor nên được cấu trúc như thế nào, gồm những phần nào, mỗi phần cần truyền đạt thông điệp gì, minh hoạ bằng scenario nào, và gắn với playbook/FAQ/support guide ra sao?**

Tài liệu này không phải là slide hoàn chỉnh, mà là **khung nội dung (outline)** để các team CS/Enablement chuẩn hoá training cho mọi pilot và rollout liên quan đến Pack 03.

Tài liệu này phải khóa mười ba thứ:
1. Vai trò của training deck trong hệ sinh thái enablement Pack 03.  
2. Training-deck thesis của tài liệu.  
3. Đối tượng và mục tiêu học cho từng nhóm tham dự (field user, supervisor, triển khai).  
4. Cấu trúc tổng thể của buổi training và các module chính.  
5. Nội dung chi tiết đề xuất cho từng module (key messages, visual, demo, exercise).  
6. Cách tích hợp Mobile Resilience Playbook (59) và FAQ (64, tương lai) vào training.  
7. Cách sử dụng Scenario Library (58) để minh hoạ flows và tình huống khó.  
8. Cách đưa support & troubleshooting guide (61) vào training cho supervisor và lead.  
9. Gợi ý dạng bài tập thực hành, Q&A và kiểm tra hiểu.  
10. Rules về thời lượng, độ sâu và mức technical phù hợp cho field users.  
11. Những anti-pattern training cần tránh.  
12. Cách đo độ hiệu quả của training bằng signals và feedback.  
13. Các tài liệu enablement tiếp theo nên đi tiếp từ outline này như thế nào.

## 2. Training-deck thesis cho Pack 03

Thesis có thể phát biểu như sau:

> **Một buổi training tốt không cố dạy hết mọi chi tiết kỹ thuật, mà giúp field users “nhìn thấy” hệ thống hoạt động như thế nào trong những tình huống họ thực sự gặp: khi mạng yếu, khi bị chặn quyền, khi cần gửi bằng chứng, khi Web và Mobile có vẻ không giống nhau – và cho họ một bộ phản xạ đơn giản: hiểu trạng thái, biết phải làm gì, biết khi nào cần gọi ai.**

Từ thesis này, mười nguyên lý được suy ra:

1. Training phải xoay quanh **tình huống thực tế**, không chỉ slide lý thuyết.  
2. Field users không cần biết chi tiết events và dashboards, nhưng cần hiểu vài khái niệm nền để tin hệ thống.  
3. Supervisor và lead cần biết thêm về signals, support path và escalation.  
4. Ngôn ngữ training phải đơn giản, nhất quán với copy trong app (40, 47, 59).  
5. Training nên dùng chung scenarios (58) với Product, QA, Support để mọi người nói cùng một câu chuyện.  
6. Module offline/continuity là trọng tâm, không phải phần “phụ”.  
7. Mỗi concept quan trọng nên đi kèm: định nghĩa ngắn → ví dụ → luyện tập.  
8. Training nên cho người học thời gian “tự bấm” trong app, không chỉ xem demo.  
9. Kết thúc training phải rõ: khi gặp trường hợp X, bạn làm Y; khi gặp trường hợp Y, bạn gọi Z.  
10. Training deck phải dễ update khi UX/copy/patterns thay đổi.

## 3. Đối tượng tham dự và mục tiêu học

### 3.1 Field users (frontline)

- Hiểu các trạng thái chính trên Mobile (đã lưu, chờ đồng bộ, đang tải lên, đã gửi, thử lại).  
- Biết cách xử lý các tình huống thường gặp (mất mạng, retry, mismatch).  
- Biết do/don't quan trọng và khi nào cần báo supervisor/hỗ trợ.

### 3.2 Supervisor / tổ trưởng / quản lý tại site

- Nắm những gì field users học + thêm: cách giám sát, cách kiểm tra trên Web, cách đọc một số signals đơn giản.  
- Biết cách dùng playbook & FAQ để hướng dẫn lại đội.  
- Biết cách mô tả vấn đề và escalates theo support guide (61).

### 3.3 Đội triển khai / CS / Pilot champions tại khách hàng

- Hiểu các module training để có thể tự chạy lại.  
- Biết dùng Scenario Library (58) để chọn scenario phù hợp cho training.  
- Biết cách thu feedback training đưa về post-pilot synthesis (60).

## 4. Cấu trúc tổng thể buổi training (60–90 phút)

Một buổi training tiêu chuẩn có thể gồm:

1. Mở đầu: Tại sao chúng ta dùng Nextflow OS (5–10’).  
2. Nhìn nhanh vào Mobile Ops trong ngày làm việc (10–15’).  
3. Ba lớp trạng thái: trên máy, trên server, trong luồng công việc (10’).  
4. Các trạng thái và message quan trọng trong app (15–20’).  
5. Tình huống thường gặp và cách xử lý (20–25’).  
6. Dành cho supervisor/lead: hỗ trợ đội và khi nào escalates (10–15’).  
7. Q&A, tóm tắt và resource tiếp theo (5–10’).

## 5. Outline chi tiết cho từng module

### Module 1 – Mở đầu: Tại sao dùng Nextflow OS

**Mục tiêu:** Đặt bối cảnh, nhấn mạnh lợi ích và vai trò của Mobile Ops đối với công việc hằng ngày.

**Nội dung:**
- Một slide về bức tranh trước khi có hệ thống: giấy tờ, chụp hình rời, gọi điện, Zalo rời rạc.  
- Một slide về Nextflow OS cho SME và vai trò của Mobile Ops.  
- Một slide “những gì chúng ta muốn đạt được trong pilot”: giảm ghi tay, dữ liệu chuẩn hơn, ít phải gọi hỏi lại.

**Gợi ý visual:** timeline trong ngày của một field user trước và sau khi có app.

### Module 2 – Một ngày với Mobile Ops

**Mục tiêu:** Cho người học thấy họ sẽ gặp app ở những khoảnh khắc nào trong ngày.

**Nội dung:**
- Các bước: nhận nhiệm vụ, xem chi tiết, đi hiện trường, nhập thông tin, chụp hình, gửi lại, theo dõi kết quả.  
- Liên kết mỗi bước với 1–2 màn hình chính trong app.  
- Nhấn mạnh điểm chạm với supervisor/Web (assign, review, trả lại).

**Gợi ý demo:** chạy 1 scenario “happy path” đơn giản từ library (58).

### Module 3 – Ba lớp trạng thái

**Mục tiêu:** Giúp field users hiểu một cách trực quan về “trên máy – trên server – trong luồng công việc”.

**Nội dung:**
- Slide 1: minh hoạ 3 lớp: device, server, workflow.  
- Slide 2: ví dụ đơn giản: bạn nhập dữ liệu, máy lưu; khi có mạng, máy gửi lên server; khi server xử lý xong, nhiệm vụ được đánh dấu “đã hoàn tất/đang chờ duyệt”.  
- Slide 3: giải thích nhanh vì sao đôi khi chúng “lệch nhau” trong chốc lát.

**Gợi ý exercise:** hỏi lớp “theo bạn, khi mất mạng nhưng app báo ‘đã lưu trên thiết bị’, điều gì đã xảy ra ở 3 lớp?” – rồi cùng trả lời.

### Module 4 – Các trạng thái và message quan trọng

**Mục tiêu:** Làm rõ ý nghĩa của các từ khoá trong app (theo playbook 59).

**Nội dung:**
- Slide cho từng cụm chính:  
  - “Đã lưu trên thiết bị” – nghĩa là gì, không nghĩa là gì.  
  - “Đang chờ đồng bộ”.  
  - “Đang tải lên”.  
  - “Đã xác nhận từ máy chủ”.  
  - “Thử lại”.  
- Mỗi slide có:  
  - một ảnh màn hình,  
  - 1–2 câu giải thích đơn giản,  
  - 1–2 gạch đầu dòng “Bạn nên…” và “Bạn không nên…”.

**Gợi ý:** dùng nguyên phrasing từ copy system và playbook 59 để giữ nhất quán.

### Module 5 – Tình huống thường gặp và cách xử lý

**Mục tiêu:** Cho người học thực hành suy nghĩ và phản ứng trong các tình huống cụ thể.

**Nội dung:** 4–6 tình huống chính, ví dụ:
- Đang làm việc và mất mạng giữa chừng.  
- Thấy “Đã lưu trên thiết bị, đang chờ đồng bộ” lâu.  
- Thấy “Thử lại” sau khi gửi.  
- Đã “Hoàn tất” nhưng supervisor bảo chưa thấy.  
- Ảnh/file bị lỗi nhưng nhiệm vụ vẫn ghi nhận.  
- Bị báo “Không đủ quyền” hoặc “Thiếu thông tin”.

Mỗi tình huống có:
- Slide mô tả bằng lời + hình minh hoạ.  
- Slide “Bạn nên làm gì” (do/don't).  
- (Tuỳ khả năng) một demo hoặc role-play ngắn.

### Module 6 – Dành cho supervisor/lead: hỗ trợ đội và escalates

**Mục tiêu:** Equip supervisor/lead để họ trở thành “tầng hỗ trợ đầu tiên”.

**Nội dung:**
- Cách check nhiệm vụ trên Web Admin.  
- Cách đọc một vài view đơn giản trên dashboard (vd số nhiệm vụ pending sync, retry nhiều).  
- Cách dùng field playbook và FAQ để trả lời câu hỏi thường gặp.  
- Khi nào nên escalates lên support/CS và phải cung cấp thông tin gì (theo guide 61).

**Gợi ý:** slide “Checklist khi đội báo vấn đề” – gần giống intake checklist trong 61 nhưng đơn giản hơn.

### Module 7 – Q&A, tóm tắt và resource

**Mục tiêu:** Củng cố và chỉ đường cho bước tiếp theo.

**Nội dung:**
- Slide tóm tắt 3–5 ý chính:  
  - app bảo vệ nỗ lực của bạn;  
  - hiểu đúng các trạng thái;  
  - do/don't quan trọng;  
  - liên hệ ai khi có vấn đề.  
- Slide danh sách tài liệu: playbook 59 (phiên bản field-friendly), FAQ 64 (khi có), người liên hệ nội bộ, kênh support.

## 6. Gợi ý bài tập thực hành và kiểm tra hiểu

- Mini-quiz: hiển thị message và hỏi “Điều này nghĩa là gì?” – “Bạn nên làm gì tiếp theo?”.  
- Role-play: một người đóng field user gặp vấn đề, một người đóng supervisor; dùng playbook để giải quyết.  
- Bài tập nhóm: mỗi nhóm chọn 1 tình huống và chuẩn bị “script gọi supervisor/hỗ trợ” chuẩn.

## 7. Rules về thời lượng, độ sâu và mức technical

- Tổng thời gian: 60–90 phút, ưu tiên thời gian cho phần scenario & thực hành.  
- Tránh đi sâu vào chi tiết events, logs, metric definitions với field users.  
- Với supervisor, có thể thêm 10–15 phút về dashboards và escalation.  
- Ngôn ngữ phải đơn giản, không dùng thuật ngữ kỹ thuật khi không cần.

## 8. Anti-pattern training cần tránh

1. Slide chữ quá nhiều, ít ví dụ.  
2. Chỉ demo “happy path”, không đụng đến case mất mạng, retry, mismatch.  
3. Không cho field users tự bấm app trong training.  
4. Dùng thuật ngữ khác với app (copy không khớp).  
5. Trả lời câu hỏi bằng workaround không đúng với playbook.  
6. Không nhắc lại kênh hỗ trợ và cách mô tả vấn đề.  
7. Không thu lại feedback sau training.

## 9. Đo hiệu quả training

- Khảo sát nhanh sau buổi: 3–5 câu hỏi về mức rõ ràng, tự tin.  
- Theo dõi patterns ticket trong những tuần đầu pilot: tần suất misunderstanding về “đã lưu/đã gửi”, số lần hỏi câu hỏi giống nhau.  
- Trong post-pilot synthesis (60), ghi nhận training effectiveness như một phần của learning.

## 10. Các tài liệu enablement tiếp theo nên đi tiếp từ outline này

1. **64_FAQ_FOR_FIELD_USERS_ON_MOBILE_OPS_AND_CONTINUITY.md** – FAQ chi tiết dựa trên câu hỏi trong training và pilot.  
2. **67_PACK03_ENABLEMENT_PORTAL_INFORMATION_ARCHITECTURE.md** – IA cho portal nơi training deck, playbook, FAQ, support guide cùng sống.  
3. Các version localized của training deck cho ngôn ngữ/khu vực khác nhau.  
4. Video training ngắn dựa trên modules chính.  
5. Checklists dạng in được hoặc card nhỏ cho field users.

## 11. Quyết định chốt của tài liệu

Tài liệu này chốt các quyết định nền sau cho Field Enablement Training Deck Outline của Pack 03:

1. Training cho field users và supervisor phải xoay quanh tình huống thực tế, đặc biệt là offline/continuity, authority và trạng thái.  
2. Deck phải dựa trên copy và semantics chuẩn từ Playbook 59, không “tự chế” thuật ngữ.  
3. Scenario Library phải được dùng để minh hoạ flows, tránh tạo case ad-hoc.  
4. Module dành cho supervisor cần đưa vào support path và escalation theo guide 61.  
5. Hiệu quả training nên được đo bằng survey + patterns ticket trong pilot.  
6. Outline này là khung để các đội CS/Enablement tạo deck cụ thể cho từng khách hàng và pilot.

## 12. Điều kiện hoàn thành của tài liệu

Field Enablement Training Deck Outline được xem là đạt yêu cầu khi:
- CS/Enablement có thể dựa trên outline này để tạo deck training cụ thể trong thời gian ngắn;  
- training được triển khai nhất quán giữa các pilot và site;  
- field users sau training hiểu rõ các trạng thái chính và phản ứng đúng trong các tình huống thường gặp;  
- và feedback về “không biết app có lưu chưa/đã gửi chưa” giảm rõ rệt trong các pilot sau.

## AG Execution Prompt

You are acting as a field training experience designer, enablement content architect, and real-world scenario curator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 03 baseline: Mobile Ops UX, continuity semantics, reconciliation patterns, scenario library, support guide, and playbook are already defined.
- This document defines the training deck outline for field enablement.

### Objective
Refine this Field Enablement Training Deck Outline into a production-ready structure that CS and Enablement teams can use to build consistent, effective training sessions for field users and supervisors.

### Inputs
- Use this document plus the main Pack 03 enablement and UX documents as the primary source of truth.
- Preserve the scenario-based, message-consistent approach with Playbook 59 and Support Guide 61.  
- Keep the structure flexible enough for different pilot contexts while maintaining a common spine.

### Tasks
1. Sharpen the training thesis and module objectives.  
2. Add more concrete examples, flows, and scripts for key modules.  
3. Clarify timing and variations for different audiences (field-only vs. field+supervisor).  
4. Suggest ways to integrate scenarios, dashboards, and playbooks into live sessions.  
5. Identify the top training pitfalls to avoid and how to mitigate them.  
6. Recommend follow-on enablement materials (FAQ, videos, job aids) and how they link back to the deck.

### Constraints
- Do not overload the deck with technical details beyond what field users need.  
- Do not diverge from the established semantics and copy.  
- Do not assume perfect connectivity or homogeneous device landscapes.  
- Keep the outline directly actionable for content creators.

### Output Format
Return a revised markdown document with these sections:
1. Training Thesis and Objectives
2. Audience and Session Variants
3. Module-by-Module Outline
4. Practice and Assessment Approach
5. Pitfalls and Mitigations
6. Recommended Follow-On Materials

### Acceptance Criteria
- The output must make it straightforward to build and run effective field training sessions.  
- The result must remain consistent with Pack 03 continuity and authority semantics.  
- The document must support reuse of scenarios and playbooks across pilots.  
- The output must reduce confusion and inconsistent messaging in field enablement.
