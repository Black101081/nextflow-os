# Nextflow OS – Pack 08: Intelligence, Recommendations & Assistants
## Overview and Strategy

**Document ID:** 120_PACK08_INTELLIGENCE_OVERVIEW_AND_STRATEGY  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Data & Intelligence  
**Related docs:** 000 Glossary, 001 Master Index, 100–109 Pack07, 121–129 Pack08

---

## 1. Mục tiêu của Pack 08

Pack 08 định nghĩa **lớp Intelligence** của Nextflow OS: cách hệ thống dùng dữ liệu, rules, models và AI assistants để:
- Gợi ý hành động cụ thể cho từng role (CSM, Ops, Finance, Leadership).
- Tự động hoá các quyết định lặp lại, ít rủi ro.
- Cung cấp các assistant/copilot giúp user hiểu tình huống và ra quyết định nhanh hơn.

## 2. Vị trí trong kiến trúc Nextflow OS

```
Data Platform (Pack 07)
      │
      ▼
 Feature Layer (feat_*) ◄── Pack 08: Intelligence Layer
      │
      ▼
 Rules / Scores / Models
      │
      ▼
 Recommendations / Alerts / Assistant
      │
      ▼
 User (CSM, Ops, Finance, Leadership)
```

- Pack 07 cung cấp raw metrics, KPIs, facts, dims.
- Pack 08 biến chúng thành **actionable intelligence**: gợi ý, cảnh báo, tóm tắt, dự báo.
- Pack 09 (Ecosystem) cho phép partner build thêm intelligence assets lên trên nền này.

## 3. Nguyên tắc thiết kế Intelligence Layer

1. **Explainability first** – mọi recommendation đều có lý do rõ ràng, user hiểu được tại sao.
2. **Guardrails by default** – AI không tự hành động trên dữ liệu nhạy cảm hoặc hành động không thể hoàn tác mà không có confirmation.
3. **Progressive automation** – bắt đầu từ suggest → confirm → auto với mức độ tin tưởng tăng dần.
4. **Role-aware** – cùng một tín hiệu nhưng gợi ý khác nhau cho CSM vs Ops vs Finance.
5. **Feedback loop** – user accept/reject/modify recommendation → cải thiện model theo thời gian.
6. **Reuse feature layer** – tránh tính toán lại, mọi use case chia sẻ chung feature tables (feat_*).

## 4. Các nhóm use case chính

| Nhóm | Mô tả ngắn | Ví dụ |
|------|------------|-------|
| A – Risk & Early Warning | Phát hiện sớm rủi ro churn, SLA breach, escalation | Churn score, SLA risk alert |
| B – Prioritization | Sắp xếp thứ tự ưu tiên cho CSM/Ops | Queue priority score, next best action |
| C – Automation Suggestions | Gợi ý tạo automation rule | "Tạo auto-escalate cho queue X" |
| D – Insight Summarization | Tóm tắt tình trạng customer/account | QBR draft, account health summary |
| E – Forecasting | Dự báo khối lượng, revenue, risk | Volume forecast, renewal likelihood |

## 5. Các thành phần kỹ thuật

- **Feature Layer** (feat_*): bảng tổng hợp features tái sử dụng – xem 122.
- **Rules Engine**: if-then logic, deterministic, dễ kiểm soát.
- **Scoring Models**: ML/heuristic models sinh score 0–1.
- **LLM/RAG Layer**: tóm tắt, giải thích, Q&A tự nhiên trên dữ liệu.
- **Recommendation Surface**: in-app cards, alerts, assistant panel, QBR copilot.
- **Feedback Store**: lưu accept/reject/modify để cải thiện model.

## 6. Governance và Risk

- Mọi use case AI phải có **AI Use Case Record** (template 129).
- Risk level phân loại: Low / Medium / High / Critical (định nghĩa trong 124).
- Các use case High/Critical phải qua **AI Review Board** trước khi deploy production.
- Kill switch phải được định nghĩa cho mọi use case từ Medium trở lên.

## 7. Lộ trình triển khai gợi ý

| Giai đoạn | Nội dung | Điều kiện |
|-----------|----------|----------|
| Phase 1 – Foundation | Feature layer, rules cơ bản, SLA risk alert | Data Platform Pack 07 ổn định |
| Phase 2 – Scoring | Churn score, priority score, automation suggestions | Feature layer đủ signals |
| Phase 3 – Assistant | QBR copilot, account health summary, Q&A | LLM integration, RAG pipeline |
| Phase 4 – Forecasting | Volume forecast, renewal likelihood | Đủ historical data (≥6 tháng) |

## 8. Acceptance criteria của Pack 08

Pack 08 được coi là hoàn chỉnh khi:
- Có đủ 10 tài liệu (120–129).
- Feature layer schema được định nghĩa rõ (122).
- Ít nhất 5 use case có AI Use Case Record đầy đủ (129).
- Governance framework (124) được Product + Legal + Engineering sign-off.
- UX guidelines (125) được Design team review.
