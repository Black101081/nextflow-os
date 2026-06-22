# Nextflow OS – Pack 08: Intelligence Summary and Usage Guide

**Document ID:** 127_PACK08_INTELLIGENCE_SUMMARY_AND_USAGE_GUIDE  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Data & Intelligence  
**Related docs:** 120–126, 128–129 Pack08, 107 Pack07 Summary

---

## 1. Pack 08 là gì?

Pack 08 định nghĩa **Intelligence Layer** của Nextflow OS: lớp biến data thành actionable recommendations, alerts, scores, và AI-powered summaries giúp CSM, Ops, Finance và Leadership ra quyết định nhanh hơn, chính xác hơn.

## 2. Bản đồ tài liệu Pack 08

| File | Nội dung chính | Đọc khi nào |
|------|----------------|-------------|
| 120 Overview | Tổng quan, nguyên tắc, lộ trình | Onboard, planning |
| 121 Use Cases | 15 use cases nhóm A–E với đặc tả | Chọn use case ưu tiên |
| 122 Feature Layer | Schema feat_* tables, naming, freshness | Implement data pipeline |
| 123 Model Architecture | Rules vs Score vs LLM, selection guide | Thiết kế model/logic |
| 124 Governance | Risk levels, AI Review Board, kill switch | Deploy mới, audit |
| 125 UX Guidelines | UI patterns, copy, alert fatigue | Design, frontend |
| 126 Ops & Maturity | Monitoring, feedback loop, maturity model | Vận hành sau launch |
| 127 Summary (file này) | Tổng hợp & hướng dẫn sử dụng | Mọi lúc |
| 128 Prompt Library | Prompts thực thi cho từng use case | Execution, AI prompting |
| 129 AI Use Case Record | Template record cho từng use case | Governance, review |

## 3. Reading guide theo role

### Product Manager
120 → 121 → 124 → 127 → 128

### Data Engineer / ML Engineer
122 → 123 → 126 → 124 → 129

### Designer / Frontend
125 → 120 → 121

### CSM / Ops (end user)
127 → 121 (chỉ đọc nhóm liên quan) → 128

### Governance / Legal
124 → 129 → 120

## 4. Scenario: B2B SaaS CS team dùng Pack 08

**Tình huống:** Company A có 200 CSMs quản lý 5,000 accounts. Họ muốn giảm churn và tăng renewal rate.

**Bước 1 – Foundation:** Pack 07 đã có fact_ticket_day, fact_customer_month, dim_customer.

**Bước 2 – Feature layer:** Build feat_cs_health_signals (122) từ các bảng trên. Refresh daily.

**Bước 3 – Churn Score (A1):** Deploy churn risk model với output Low/Medium/High/Critical. CSM thấy badge trên Account 360.

**Bước 4 – Priority Score (B1):** CSM Dashboard hiển thị "Today's Top 10 accounts" dựa trên priority score.

**Bước 5 – QBR Draft (D1):** Trước mỗi QBR, CSM click "Generate QBR Draft" → review và chỉnh sửa → gửi.

**Kết quả kỳ vọng:** CSM tập trung đúng accounts cần attention, renewal rate tăng, QBR prep time giảm 60%.

## 5. Checklist Pack 08 sẵn sàng production

- [ ] Feature layer (122) đã có đủ signals cho use case ưu tiên
- [ ] Ít nhất 2 use case P0 đã deploy và monitor
- [ ] AI Use Case Record (129) đã complete cho mọi use case live
- [ ] Governance checklist (124) đã pass
- [ ] UX labels và feedback mechanism đã có trong UI
- [ ] Kill switch đã test
- [ ] Intelligence Ops Dashboard live
