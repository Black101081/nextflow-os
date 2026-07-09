# Nextflow OS – Pack 08 Intelligence Execution Prompts Library

**Document ID:** 128_PACK08_INTELLIGENCE_EXECUTION_PROMPTS_LIBRARY  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence / Product / CS / Ops  
**Dependent Packs:** 07 Analytics Prompts (109), 08 Use Cases (121), 08 Feature Layer (122), 08 Model & Logic (123), 08 AI Governance (124), 08 UX Guidelines (125), 08 Ops & Maturity (126), 08 Summary (127)  

## 1. Mục tiêu tài liệu

Tài liệu này cung cấp **prompt library thực thi** cho Pack 08 – các câu hỏi, gợi ý và lệnh hành động để CS/Ops/Product/Data sử dụng lớp intelligence (scores, recommendations, assistants) hiệu quả trong công việc hàng ngày.

Mục tiêu:
- giúp users biết **hỏi gì** và **sử dụng outputs intelligence thế nào** cho từng use case chính A–E trong 121; [code_file:507]  
- giúp Product/Data thu thập feedback có cấu trúc để cải thiện models/rules; [code_file:512]  
- giúp align cách dùng assistants với AI governance & UX guidelines (124, 125). [code_file:510][code_file:511]

## 2. Nguyên tắc dùng prompts trong Nextflow OS

1. **Grounded in data** – mọi prompt nên gắn với dashboards, KPIs, feature layer hoặc records thật, tránh câu hỏi quá chung chung. [code_file:480][code_file:508]  
2. **Context-first** – luôn nêu rõ queue/tenant/wedge/time range để assistant và models hiểu đúng ngữ cảnh. [code_file:507]  
3. **Action-oriented** – ưu tiên prompts dẫn tới action: sắp xếp, ưu tiên, điều tra, chuẩn bị cuộc họp… hơn là chỉ "cho tôi xem".  
4. **Review & judgement** – đối với outputs medium/high-risk, luôn xem prompt như gợi ý để review, không như lệnh auto-act. [code_file:510][code_file:512]  
5. **Feedback loop** – kết hợp prompts với cơ chế feedback (👍/👎, comments) để Data/Product cải thiện logic. [code_file:511][code_file:512]

## 3. Prompts cho nhóm A – Work & SLA Intelligence (A1, A2, A3)

### 3.1 A1 – SLA Risk & Work Prioritization

**Mục tiêu:** ưu tiên xử lý work items có rủi ro SLA cao, với context rõ ràng.

**Prompts gợi ý:**

- "Trong queue [QUEUE_NAME] hôm nay, hãy sắp xếp work theo rủi ro SLA và đề xuất top 20 việc cần xử lý trong 2 giờ tới."  
- "Cho tôi danh sách các work items có nguy cơ breach SLA trong 1 giờ tới tại wedge [WEDGE] và giải thích ngắn vì sao từng item được coi là high risk."  
- "So sánh thứ tự ưu tiên hiện tại của tôi với thứ tự ưu tiên theo SLA risk – những work nào tôi đang bỏ lỡ?"  
- "Trong tuần này, loại công việc nào thường xuyên breach SLA nhất và vì sao? Gợi ý 3 hành động để giảm breaches."  
- "Nếu tôi xử lý top 10 công việc này trước, ước tính tỷ lệ SLA hit sẽ cải thiện bao nhiêu trong ngày hôm nay?"

### 3.2 A2 – Queue Load & Staffing Advisor

**Mục tiêu:** dự báo tải queue và gợi ý staffing/routing.

**Prompts gợi ý:**

- "Dự báo load cho queues [Q1, Q2] trong 8 giờ tới, và đề xuất phân bổ nhân sự để giữ SLA ổn định."  
- "Queue nào có nguy cơ bị quá tải trong 2 ngày tới dựa trên trend 2 tuần qua, và vì sao?"  
- "Nếu tôi thêm 1 người vào queue [QUEUE_NAME] trong ca chiều, SLA breach rate dự kiến sẽ thay đổi thế nào?"  
- "Hãy chỉ ra 3 khoảng thời gian cao điểm của queue [QUEUE_NAME] trong tuần trước và gợi ý cách đổi ca hoặc routing."  
- "Danh sách user nào đang consistently overloaded theo workload index, và có đề xuất chuyển bớt loại work nào cho nhóm khác?"

### 3.3 A3 – Exception Pattern & Runbook Assistant

**Mục tiêu:** điều tra exceptions nhanh hơn, tái dùng kinh nghiệm.

**Prompts gợi ý:**

- "Lỗi [EXCEPTION_TYPE] đã xảy ra bao nhiêu lần trong 7 ngày qua và tần suất tăng giảm thế nào?"  
- "Cho tôi các incidents tương tự với exception [EXCEPTION_ID] trong 30 ngày qua và cách họ đã được xử lý."  
- "Trích runbook liên quan đến lỗi [EXCEPTION_TYPE] và tóm tắt các bước quan trọng nhất."  
- "Từ patterns exceptions gần đây, gợi ý 3 automation đơn giản có thể giảm volume manual handling."  
- "Khi lỗi [EXCEPTION_TYPE] xảy ra trong context [SYSTEM/INTEGRATION], root cause thường là gì?"

## 4. Prompts cho nhóm B – Integrations & Data Quality (B1, B2)

### 4.1 B1 – Integration Health & Risk Assistant

**Mục tiêu:** giám sát và điều tra sức khỏe integrations.

**Prompts gợi ý:**

- "Liệt kê top 5 integrations có error rate cao nhất tuần này và tóm tắt pattern lỗi chính."  
- "Integration [INTEGRATION_NAME] có health thay đổi thế nào trong 30 ngày qua – error, latency, timeouts?"  
- "Có bất kỳ integration nào liên tục gây ra incidents severity cao trong 3 tháng qua không? Gợi ý hành động giảm rủi ro."  
- "Khi integration [INTEGRATION_NAME] có latency spike, queue/flows nào bị ảnh hưởng nhiều nhất?"  
- "Đề xuất 3 integrations cần review sớm dựa trên health trend và risk tier." 

### 4.2 B2 – Mapping & Field Suggestion Assistant

**Mục tiêu:** hỗ trợ mapping fields và phát hiện lỗi mapping.

**Prompts gợi ý:**

- "Dựa trên những tenants tương tự, mapping phổ biến cho field [FIELD_NAME] là gì?"  
- "Có lỗi mapping hoặc missing fields nào thường xuyên xuất hiện trong integration [INTEGRATION_NAME]?"  
- "Gợi ý mapping cho các field mới phát hiện trong payload từ hệ thống [SYSTEM]."  
- "Cho tôi ví dụ mapping thành công và thất bại liên quan đến [OBJECT_TYPE] để tôi học theo."  
- "Field nào trong integration [INTEGRATION_NAME] ít được sử dụng hoặc thường gây lỗi, có nên deprecate hoặc rename?"

## 5. Prompts cho nhóm C – Customer Health & CS (C1, C2)

### 5.1 C1 – Customer Health Score & Driver Insights

**Mục tiêu:** theo dõi health và hiểu driver.

**Prompts gợi ý:**

- "Danh sách top 20 customers có health score giảm nhiều nhất trong 30 ngày qua và driver chính là gì?"  
- "Customer [ACCOUNT_NAME] có health score hiện tại là bao nhiêu, thay đổi thế nào trong 6 tháng, và driver chính là gì?"  
- "Gợi ý 5 khách hàng risk cao nhưng có tiềm năng giữ nếu can thiệp đúng tuần này."  
- "Những hành vi nào (logins, feature usage, incidents, invoices) đang tương quan mạnh nhất với health giảm?"  
- "Nếu tăng adoption của [FEATURE] cho nhóm tenants giống [ACCOUNT_NAME], health score dự kiến cải thiện thế nào?"

### 5.2 C2 – CS Assistant for QBR Preparation

**Mục tiêu:** chuẩn bị QBR nhanh và sâu.

**Prompts gợi ý:**

- "Chuẩn bị bản nháp QBR cho customer [ACCOUNT_NAME] cho kỳ [TIME_RANGE], tập trung vào value delivered và risks."  
- "Tóm tắt các KPI chính, incident lớn và improvements 6 tháng qua cho [ACCOUNT_NAME]."  
- "Gợi ý 3 điểm nên tập trung trong QBR tới với [ACCOUNT_NAME] dựa trên health, usage và feedback."  
- "So sánh performance của [ACCOUNT_NAME] với nhóm customers tương tự và nêu 3 insight chính."  
- "Viết bản nháp email follow-up sau QBR cho [ACCOUNT_NAME], dựa trên những actions đã agree." 

## 6. Prompts cho nhóm D – Knowledge & SOP Assistants (D1)

**Mục tiêu:** giúp Ops/Support nhanh chóng truy cập SOPs/runbooks/policies.

**Prompts gợi ý:**

- "Quy trình chuẩn để xử lý incident loại [INCIDENT_TYPE] là gì? Tóm tắt trong 5 bước."  
- "Khi có khách yêu cầu [REQUEST_TYPE], chính sách hiện tại nói gì về quyền hạn và thời gian phản hồi?"  
- "Tôi mới tham gia team [TEAM_NAME], cho tôi checklist các việc cần làm khi bắt đầu ca trực."  
- "Tóm tắt runbook cho việc bật/tắt integration [INTEGRATION_NAME] an toàn."  
- "Có best practice nào cho việc giao tiếp với khách trong tình huống [SCENARIO]?" 

## 7. Prompts cho nhóm E – Automation & Process Improvement (E1)

**Mục tiêu:** tìm cơ hội automation và cải tiến quy trình.

**Prompts gợi ý:**

- "Dựa trên 90 ngày lịch sử, những step nào trong quy trình [PROCESS_NAME] tốn nhiều thời gian manual nhất?"  
- "Gợi ý 5 candidates cho automation mà có ROI cao nhất trong wedge [WEDGE] hiện tại."  
- "Những exceptions nào thường xuyên được resolve theo cùng một pattern và có thể được tự động hóa?"  
- "Đề xuất cải tiến quy trình cho việc xử lý [WORK_TYPE] để giảm rework và SLA breaches."  
- "Cho tôi ví dụ tenants đã áp dụng automation tương tự và kết quả là gì (nếu có)."

## 8. Prompts để thu thập feedback và cải thiện models

**Prompts internal cho CS/Ops/Product:**

- "Cho tôi danh sách các gợi ý intelligence mà người dùng hay bỏ qua hoặc đánh dấu không hữu ích nhất trong 30 ngày qua."  
- "Trong use case [USE_CASE_ID], những yếu tố nào thường được users phản hồi là thiếu hoặc chưa đúng?"  
- "Tổng hợp feedback từ người dùng về SLA risk assistant trong tháng này và đề xuất 3 cải tiến rule/model."  
- "Trong marketplace, AI skills nào đang có rating thấp nhưng adoption cao, cần ưu tiên cải thiện?"  
- "Những flows nào có tỉ lệ override cao đối với recommendations – điều này nói gì về model?"

## 9. Điều kiện hoàn thành của tài liệu

Prompt Library được xem là đạt yêu cầu khi:
- CS/Ops/CSM có thể dùng prompts này trong công việc hàng ngày để kích hoạt intelligence;  
- Product/Data thấy rõ patterns để thu thập feedback và cải thiện models/rules;  
- prompts align với AI governance & UX guidelines, không thúc đẩy auto-action mù quáng.
