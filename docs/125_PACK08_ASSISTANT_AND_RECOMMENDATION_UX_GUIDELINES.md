# Nextflow OS – Pack 08: Assistant and Recommendation UX Guidelines

**Document ID:** 125_PACK08_ASSISTANT_AND_RECOMMENDATION_UX_GUIDELINES  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Design  
**Related docs:** 120 Overview, 121 Use Cases, 124 Governance

---

## 1. Nguyên tắc UX cho AI features

1. **Transparent** – Luôn chỉ rõ output nào do AI tạo ra. Dùng label "AI-suggested", "AI-generated draft", hoặc icon AI rõ ràng.
2. **Controllable** – User luôn có thể dismiss, override, edit, hoặc report sai.
3. **Contextual** – Recommendation xuất hiện đúng lúc, đúng nơi trong workflow, không làm interrupt không cần thiết.
4. **Explainable** – Mỗi recommendation đi kèm lý do ngắn gọn ("vì churn score tăng 20% tuần này").
5. **Non-blocking** – AI features không được block workflow chính nếu unavailable.

## 2. UI Patterns

### 2.1 Recommendation Card
- Dùng cho: Next Best Action, Priority suggestion, Automation suggestion.
- Cấu trúc:
  - Icon AI + label "AI-suggested"
  - Tiêu đề ngắn (≤10 từ)
  - Lý do 1–2 câu
  - Actions: [Accept] [Dismiss] [Learn more]
- Vị trí: Side panel hoặc inline trong workflow, không popup modal.

### 2.2 Risk/Alert Badge
- Dùng cho: Churn risk label, SLA breach alert, Escalation warning.
- Cấu trúc: Colored badge (Low=green, Medium=yellow, High=orange, Critical=red) + tooltip với lý do.
- Không dùng màu đỏ cho Medium, tránh alert fatigue.

### 2.3 AI Assistant Panel
- Dùng cho: QBR copilot, Account health Q&A.
- Cấu trúc: Chat-like interface, side panel, có "Sources" dropdown để user xem data nào được dùng.
- Luôn có disclaimer: "Bản nháp này được tạo bởi AI. Vui lòng review trước khi gửi."

### 2.4 Score Display
- Dùng cho: Churn score, Priority score, Renewal likelihood.
- Hiển thị: Progress bar + label (không chỉ số thô) + top 3 factors.
- Ví dụ: `Churn Risk: HIGH (0.78) ▲ vì: ticket_volume tăng 3x, NPS giảm, chưa login 14 ngày`.

## 3. Alert Fatigue Prevention

- Không hiển thị quá 3 AI recommendations cùng lúc trên một màn hình.
- Prioritize recommendations theo impact score.
- Cho phép user snooze một loại recommendation trong N ngày.
- Track acceptance rate – nếu < 20% trong 30 ngày, review lại model/threshold.

## 4. Accessibility

- AI labels và badges phải có aria-label rõ ràng.
- Không dùng màu sắc là tín hiệu duy nhất (kèm icon hoặc text).
- Keyboard navigable cho mọi AI action (Accept, Dismiss, Learn more).

## 5. Copy Guidelines

| Tình huống | Nên dùng | Không nên dùng |
|------------|----------|----------------|
| Label AI output | "AI-suggested", "AI-generated draft" | "Smart", "Auto", không label gì |
| Lý do recommendation | "Vì ticket volume tăng 3x tuần này" | "Theo thuật toán" |
| Khi AI không chắc | "Dữ liệu chưa đủ để đưa ra gợi ý" | Đưa ra gợi ý với confidence thấp không thông báo |
| Khi AI error | "Không thể tải gợi ý lúc này. Thử lại sau." | Để trống hoặc crash |
