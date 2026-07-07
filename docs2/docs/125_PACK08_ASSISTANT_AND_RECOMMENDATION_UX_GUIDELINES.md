# Nextflow OS – Pack 08 Assistant and Recommendation UX Guidelines

**Document ID:** 125_PACK08_ASSISTANT_AND_RECOMMENDATION_UX_GUIDELINES  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / UX / Data & Intelligence  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Overview (120), 08 Use Cases (121), 08 Model & Logic (123), 08 AI Governance (124)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Assistant and Recommendation UX Guidelines** cho Pack 08 – cách hiển thị, tương tác và giải thích các gợi ý, scores, assistants trong Nextflow OS để người dùng SMEs và nội bộ hiểu, tin và sử dụng được.

Mục tiêu:
- đảm bảo **phân biệt rõ** giữa facts (số liệu Pack 07) và opinions/suggestions (Pack 08); [code_file:480][code_file:506]  
- thiết kế các **patterns UX chuẩn** cho recommendations inline, banners, tiles, side panel assistants, chat assistants;  
- định nghĩa **nguyên tắc explainability & user control** trong UI; [code_file:510]  
- hỗ trợ self-service & AI governance: user thấy "AI đang làm gì" và có quyền phản hồi.

## 2. Nguyên tắc UX tổng thể

1. **Facts trước, opinions sau** – luôn hiển thị số liệu (KPIs, counts, trends) rõ ràng trước, rồi mới gợi ý/interpretation dựa trên số đó.  
2. **Rõ context** – recommendation/assistant phải xuất hiện đúng nơi, đúng lúc: trong queue view, case view, integration health, CSM workspace…, không "bắn" gợi ý chung chung.  
3. **Low friction, high control** – gợi ý dễ áp dụng (one-click/short flow) nhưng luôn cho phép xem chi tiết, undo và bỏ qua.  
4. **Explainable by design** – mỗi gợi ý/suggestion quan trọng phải có cách giải thích ngắn gọn, dễ hiểu.  
5. **Non-intrusive** – assistant không che mất nội dung chính, không pop-up quá nhiều, không gây cảm giác "bị ép" dùng AI.  
6. **Feedback-friendly** – dễ cho user gửi feedback về gợi ý (hữu ích/không, lý do).  
7. **Respect risk & governance** – không hiển thị gợi ý kiểu "auto hành động" trong flows Tier 3–4 nếu chưa qua approve; thể hiện rõ boundaries. [code_file:451][code_file:510]

## 3. Pattern 1 – Inline Recommendations trong danh sách & chi tiết

### 3.1 Inline trong queue/list views (Work & SLA – A1)

**Use case:** SLA Risk & Work Prioritization Assistant.

- Trong queue view:  
  - thêm cột **SLA Risk** hoặc **Priority by Nextflow** hiển thị score/label đơn giản (High/Medium/Low);  
  - default sort có thể theo SLA Risk + due time, nhưng user có thể đổi sort. [code_file:507]  
- Hover/click vào icon info hiển thị:  
  - "Tại sao?" – ví dụ: "Gần SLA trong 30 phút, loại X thường mất ~45 phút";  
  - link tới view chi tiết SLA hoặc doc.

**Visual cues:**
- dùng màu/badge nhẹ (vd chấm màu bên cạnh) để tránh "đỏ chói" khắp nơi;  
- avoid: tô cả row đỏ đậm gây panic.

**User control:**
- cho phép tắt/tạm ẩn sorting theo SLA Risk ở mức user preference;  
- cho phép filter theo risk (vd chỉ xem High).

### 3.2 Inline trong detail view (Exception, Integration – A3, B1)

**Use case:** Exception Pattern & Runbook Assistant; Integration Health & Risk.

- Trong exception detail:  
  - box bên cạnh "Assistant" với list gợi ý:  
    - "Các bước thường dùng để fix";  
    - "Các incident tương tự gần đây";  
  - mỗi gợi ý có nút "View details" dẫn đến runbook hoặc case tương tự. [code_file:507]

- Trong integration detail:  
  - tile "Risk level" (Low/Med/High) với reason: error_rate trend, latency spikes;  
  - suggestions: "Xem lại mapping Y", "Tăng timeout cho endpoint Z".

**User control:**
- không để "Apply" làm primary; dùng "Review" hoặc "Open" để xem trước;  
- actions thay đổi config luôn đi qua flow change (Pack 06–93).

## 4. Pattern 2 – Tiles & banners trên dashboards

### 4.1 Tiles trên Ops/CS dashboards

**Use cases:** A2 Queue Load & Staffing, B1 Integration Risk, C1 Customer Health.

- Trên dashboards Pack 07, thêm **Intelligence tiles**: [code_file:480][code_file:507]  
  - vd "Today’s Risk" – list 3 queues có SLA risk cao;  
  - "Integrations to watch" – 3 integrations với error spikes;  
  - "Customers at risk" – 3 tenants health low.

**Design:**
- mỗi tile có: title, short description, 3 items top, nút "View all";  
- click vào item dẫn tới view chi tiết đã filter.

**Explainability:**
- icon info trên tile mô tả logic high-level: "Dựa trên SLA breaches 7 ngày + backlog hiện tại".

### 4.2 Banners không xâm lấn

- Khi có event đáng chú ý (vd queue load forecast vượt threshold), hiển thị banner nhỏ:  
  - "Dự báo queue A sẽ quá tải 11–13h hôm nay. Xem đề xuất staffing";  
- Banner đặt phía trên content, dễ tắt, không che nội dung chính.

## 5. Pattern 3 – Side Panel Assistant

### 5.1 Assistant cho Ops/Support (D1, A3)

**Use cases:** SOP & Runbook Assistant, Exception Assistant.

- Side panel mở từ nút "Ask Assistant" hoặc icon chuyên biệt trên trang Ops/Exception. [code_file:507]  
- Panel hiển thị:  
  - ô input (câu hỏi);  
  - list câu hỏi gợi ý ("How do I handle X?", "What causes Y?"…);  
  - câu trả lời với bullet steps, links docs;  
  - citations vào doc/số mục cụ thể.

**Context-aware:**
- assistant tự lấy context: loại exception, queue, role user → dùng để refine retrieval RAG. [code_file:509]

**Transparency:**
- label rõ: "Assistant powered by Nextflow (beta) – kiểm tra lại trước khi hành động";  
- show nguồn data: "Trích từ runbook: Incident Playbook 92". [code_file:452]

### 5.2 Assistant cho CSM (C2)

**Use case:** QBR Assistant.

- Trong CSM workspace, side panel "Prepare QBR":  
  - hiển thị draft outline (sections) + copy;  
  - highlight metrics được dùng (SLA, adoption, incidents); [code_file:480]  
  - cho phép edit text inline trước khi export.

**Controls:**
- nút "Regenerate" với tùy chọn emphasize (vd focus vào incidents vs adoption);  
- rõ label "Draft – hãy kiểm tra trước khi gửi cho khách".

## 6. Pattern 4 – Chat-style Assistant (internal first)

### 6.1 Scope ban đầu

- Start với **internal chat assistant** cho Ops/Support/CSM/Integrations:  
  - hỏi về SOPs, docs, metrics;  
  - không thao tác trực tiếp trên workflows;  
  - grounded qua RAG trên doc & engines queries metrics. [code_file:509]

### 6.2 UX guidelines

- Chat window không chiếm toàn màn hình – side dock hoặc modal;  
- support multi-turn: user follow-up questions;  
- show citations cho phần trả lời;  
- tích hợp quick actions: "Open dashboard X" hoặc "Filter queue Y".

### 6.3 Guardrails trong UX

- Hiển thị disclaimer: "Kết quả có thể không hoàn hảo. Dựa trên docs & dữ liệu hiện có";  
- tránh text suggest "tự động xử lý X" – luôn nói "Bạn có thể…";  
- log interactions nhưng tôn trọng privacy nội bộ.

## 7. Explainability trong UI

### 7.1 "Why am I seeing this?" pattern

- Mọi recommendation/score quan trọng nên có:  
  - icon info/clickable;  
  - short explanation:  
    - vd: "Được ưu tiên vì gần SLA, queue đang có >100 items, và loại X lịch sử hay chậm". [code_file:508][code_file:507]

- Tránh giải thích dài dòng; link tới docs cho người quan tâm sâu.

### 7.2 Hiển thị scores & labels

- Với scores liên tục (0–1, 0–100):  
  - dùng labels (Low/Medium/High) + optional numeric;  
  - legend đơn giản: High ≈ top 20% risk;  
- Không show quá nhiều chữ số thập phân;  
- Với health score: sử dụng màu & label, tránh tạo ảo giác "chính xác tuyệt đối".

## 8. User control, feedback & preferences

- Cho phép user:  
  - tắt bớt tiles/banners không hữu ích (per user preferences);  
  - chọn mức độ AI assist (vd basic vs advanced suggestions) nếu hợp lý;  
  - gửi feedback trên từng suggestion (👍/👎 + optional comment).

- Aggregated feedback gửi về Data/Product để cải thiện models & rules; [code_file:509]  
- Không cản user sử dụng hệ thống nếu họ bỏ qua recommendations.

## 9. Copy guidelines cho AI trong sản phẩm

Ngôn ngữ cho assistants & recommendations nên:
- **Khiêm tốn, không tuyệt đối** – dùng "có thể", "có vẻ", "gợi ý" hơn là "chắc chắn", "luôn";  
- **Trung lập & hỗ trợ** – không đổ lỗi cho user, không dọa nạt;  
- **Rõ nguồn gốc** – "Dựa trên dữ liệu 7 ngày qua", "Dựa trên SLA config hiện tại";  
- **Tránh jargon ML** – không nói "model scoring", "confidence interval" với user SME;  
- **Không hứa hão** – không gợi ý những việc hệ thống thực tế không làm được.

## 10. Liên kết với AI Governance (124) & Packs khác

- Guardrails UX thực thi:  
  - transparency & explainability (mục 7) hỗ trợ nguyên tắc 124; [code_file:510]  
  - user control & feedback hỗ trợ monitoring & continuous improvement; [code_file:509][code_file:510]  
  - không show options auto-act high-risk nếu chưa được approve theo 124 & Pack 06 (risk tiers). [code_file:451][code_file:453]

- UX patterns phải sử dụng surfaces & components Pack 03 (dashboards, side panels, banners). [code_file:480][code_file:506]

## 11. Điều kiện hoàn thành của tài liệu

Assistant and Recommendation UX Guidelines được xem là đạt yêu cầu khi:
- các team UX/PM có thể dùng nó để thiết kế màn hình có AI mà không gây nhầm lẫn giữa "số liệu" và "gợi ý";  
- người dùng SMEs & nội bộ hiểu rõ AI đang giúp ở đâu, có thể hỏi "vì sao" và từ chối/góp ý;  
- AI governance (124) và logic architecture (123) có thể được surface rõ ràng trong UI mà không làm phức tạp trải nghiệm.
