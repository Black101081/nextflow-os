# Nextflow OS – Pack 08: Intelligence Execution Prompts Library

**Document ID:** 128_PACK08_INTELLIGENCE_EXECUTION_PROMPTS_LIBRARY  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Data & Intelligence  
**Related docs:** 121 Use Cases, 127 Summary

---

## Hướng dẫn dùng

Các prompts dưới đây dùng để:
- **Thiết kế** feature, model, rule cho từng use case.
- **Thực thi** nhanh khi cần prototype hoặc spec nhanh một use case mới.
- **Review** logic hiện tại với AI assistant.

---

## Prompt 1: Thiết kế Feature Layer cho use case mới

```
Tôi cần thiết kế feature table cho use case [TÊN USE CASE] trong Nextflow OS.

Thông tin:
- Domain: [CS / Ops / Finance / Leadership]
- Grain: [per customer per day / per ticket / per account per period]
- Nguồn data: [liệt kê fact/dim tables từ Pack 07]
- Use case cần dự đoán/detect: [mô tả ngắn]

Hãy đề xuất:
1. Tên feature table theo convention feat_<domain>_<purpose>
2. Danh sách 8–15 features với: tên, type, mô tả ngắn
3. Freshness SLA phù hợp
4. Các nguồn data cần join
```

---

## Prompt 2: Thiết kế Rule cho alert/recommendation

```
Tôi cần viết một rule cho Nextflow OS Intelligence Layer.

Use case: [TÊN USE CASE]
Input features có sẵn: [liệt kê features từ feat_* table]
Output mong muốn: [alert / recommendation / badge]
Ngưỡng gợi ý (nếu có): [ví dụ: time_to_breach < 30 phút]

Hãy viết rule theo format:
IF <conditions>
THEN <output>
WITH <priority> và <expiry/duration>

Và giải thích lý do chọn ngưỡng đó.
```

---

## Prompt 3: Thiết kế Scoring Model

```
Tôi cần thiết kế scoring model cho [TÊN USE CASE] trên Nextflow OS.

Input: features từ [feat_table_name] – [liệt kê features]
Output: score 0–1, label [Low/Medium/High/Critical]
Data sẵn có: [mô tả: bao nhiêu tháng lịch sử, bao nhiêu accounts, class imbalance]

Hãy đề xuất:
1. Loại model phù hợp (rule-based weighted / logistic regression / GBM) và lý do
2. Feature engineering cần làm nếu có
3. Threshold cho từng label
4. Cách giải thích output cho user (SHAP / rule breakdown)
5. Retrain trigger và cadence
```

---

## Prompt 4: Viết System Prompt cho QBR Copilot

```
Tôi cần viết system prompt cho QBR Draft Generator của Nextflow OS.

Context:
- Account: {account_name}, ARR: {arr}, Tier: {tier}
- Period: {quarter} {year}
- KPIs: {kpi_summary}
- Top issues: {top_tickets_summary}
- NPS: {nps_score} (trend: {nps_trend})
- Renewal date: {renewal_date}

Yêu cầu output:
- Ngôn ngữ: [Tiếng Việt / English]
- Cấu trúc: Executive Summary, KPIs, Highlights, Risks, Recommendations
- Tone: Professional, data-driven, constructive
- Độ dài: ~400–600 words
- Luôn kết thúc bằng 2–3 recommended actions cụ thể

Lưu ý: Chỉ dùng data được cung cấp trong context, không bịa số liệu.
```

---

## Prompt 5: Review AI Use Case Record

```
Hãy review AI Use Case Record sau đây cho Nextflow OS.

[Dán nội dung AI Use Case Record vào đây]

Kiểm tra:
1. Risk level có được phân loại đúng không? (Low/Medium/High/Critical theo framework 124)
2. Kill switch có được định nghĩa rõ không?
3. Guardrails có đủ theo checklist 124 không?
4. Feature inputs có match với feat_* tables trong 122 không?
5. UX surface có tuân thủ guidelines 125 không?

Đưa ra: danh sách gaps cần fix trước khi submit cho AI Review Board.
```

---

## Prompt 6: Tóm tắt Account Health

```
Dựa trên dữ liệu sau về account [ACCOUNT_NAME], hãy viết một đoạn tóm tắt account health ngắn gọn (3–5 câu) cho CSM.

Dữ liệu:
- Churn score: {score} ({label})
- Logged in last 30d: {yes/no}
- Ticket volume 30d: {n} tickets (trend: {trend})
- NPS: {score} (trend: {trend})
- Open action items: {n}
- Days since last CSM touch: {n} ngày
- Renewal in: {n} ngày

Tone: Direct, actionable. Kết thúc bằng 1 suggested next action.
```
