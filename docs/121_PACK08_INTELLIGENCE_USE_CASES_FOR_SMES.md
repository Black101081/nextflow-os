# Nextflow OS – Pack 08: Intelligence Use Cases for SMEs

**Document ID:** 121_PACK08_INTELLIGENCE_USE_CASES_FOR_SMES  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Data & Intelligence  
**Related docs:** 120 Overview, 122 Feature Layer, 124 Governance, 129 Template

---

## 1. Mục tiêu

Tài liệu này liệt kê các use case AI/Intelligence ưu tiên cho **SME customers** (B2B SaaS, CS-heavy) trên Nextflow OS, phân theo 5 nhóm A–E.

---

## 2. Nhóm A – Risk & Early Warning

### A1. Churn Risk Score
- **Mô tả:** Tính điểm nguy cơ churn cho từng account dựa trên engagement, support volume, NPS, billing signals.
- **Input features:** `feat_cs_health_signals` – logged_in_last_30d, ticket_volume_30d, nps_score, overdue_invoice_count.
- **Output:** Score 0–1, label Low/Medium/High/Critical, top 3 factors.
- **UX surface:** Account health card, CSM alert feed.
- **Risk level:** Medium – không auto-action, chỉ suggest.

### A2. SLA Breach Risk Alert
- **Mô tả:** Cảnh báo sớm khi ticket có khả năng vi phạm SLA trước khi breach xảy ra.
- **Input features:** `feat_ops_sla_risk_signals` – time_to_breach_minutes, ticket_priority, assignee_load, queue_depth.
- **Output:** Alert với ETA breach, suggested action.
- **UX surface:** Ops queue, real-time alert.
- **Risk level:** Low – alert only.

### A3. Escalation Predictor
- **Mô tả:** Dự đoán ticket nào có khả năng bị escalate lên C-level dựa trên sentiment, account tier, history.
- **Input features:** Ticket sentiment score, account ARR tier, previous_escalations_12m.
- **Output:** Escalation probability, recommended pre-emption action.
- **Risk level:** Medium.

---

## 3. Nhóm B – Prioritization

### B1. CSM Workload Priority Score
- **Mô tả:** Giúp CSM biết account nào cần attention ngay hôm nay.
- **Input features:** Churn score (A1), renewal_days_remaining, last_touchpoint_days, open_action_items.
- **Output:** Ranked list with priority label và suggested next action.
- **UX surface:** CSM dashboard "Today's focus" panel.
- **Risk level:** Low.

### B2. Support Queue Priority
- **Mô tả:** Tự động re-rank queue dựa trên SLA risk, account tier, complexity.
- **Input features:** `feat_ops_sla_risk_signals`, account_tier, ticket_complexity_score.
- **Output:** Queue rank, priority badge (P0–P3).
- **Risk level:** Low – suggest, human confirms.

### B3. Next Best Action
- **Mô tả:** Gợi ý hành động tiếp theo cho CSM/Ops tùy context (renewal sắp tới, churn risk cao, ticket pending).
- **Output:** 1–3 suggested actions với lý do.
- **Risk level:** Low.

---

## 4. Nhóm C – Automation Suggestions

### C1. Auto-Escalation Rule Suggestion
- **Mô tả:** Phân tích pattern escalation trong 90 ngày → gợi ý tạo automation rule.
- **Output:** Rule draft (if/then) với preview impact.
- **UX surface:** Automation builder với "AI suggested" badge.
- **Risk level:** Medium – user phải confirm trước khi rule được activate.

### C2. Auto-Assignment Optimization
- **Mô tả:** Gợi ý điều chỉnh routing rules dựa trên workload imbalance và resolution time by assignee.
- **Output:** Suggested routing change + impact estimate.
- **Risk level:** Medium.

### C3. SLA Policy Recommendation
- **Mô tả:** Khi detect SLA breach rate tăng bất thường → gợi ý điều chỉnh SLA targets hoặc thêm buffer.
- **Risk level:** High – cần sign-off từ Ops Lead trước khi thay đổi SLA policy.

---

## 5. Nhóm D – Insight Summarization

### D1. QBR Draft Generator
- **Mô tả:** Tự động tạo bản nháp QBR (Quarterly Business Review) cho một account dựa trên data 90 ngày.
- **Input:** Account ID, date range → pull từ `fact_ticket_day`, `fact_customer_month`, NPS, billing.
- **Output:** Structured markdown draft: Executive Summary, KPIs, Highlights, Risks, Recommendations.
- **UX surface:** QBR assistant panel trong Account 360.
- **Risk level:** Low – output là draft, CSM review trước khi gửi.

### D2. Account Health Summary
- **Mô tả:** Tóm tắt tình trạng sức khoẻ tổng thể của account trong 1 paragraph.
- **Output:** 3–5 câu tóm tắt, highlight risk và positive signals.
- **Risk level:** Low.

### D3. Incident Root Cause Summary
- **Mô tả:** Sau khi incident close, tự động tóm tắt root cause, timeline, impact, và lessons learned.
- **Risk level:** Low.

---

## 6. Nhóm E – Forecasting

### E1. Support Volume Forecast
- **Mô tả:** Dự báo số ticket 2–4 tuần tới để Ops planning headcount và SLA budget.
- **Input:** `fact_ticket_day` – 90 ngày lịch sử, seasonality, product release calendar.
- **Output:** Weekly volume forecast với confidence interval.
- **UX surface:** Ops planning dashboard.
- **Risk level:** Low – forecast only, không tự động quyết định.

### E2. Renewal Likelihood Score
- **Mô tả:** Dự báo xác suất gia hạn contract cho từng account trước renewal date 90 ngày.
- **Input:** Churn score, product adoption metrics, billing history, NPS trend.
- **Output:** Score 0–1, renewal probability category, top risk factors.
- **Risk level:** Medium – dùng để prioritize CSM outreach.

### E3. Revenue at Risk Forecast
- **Mô tả:** Tổng hợp ARR có nguy cơ mất dựa trên renewal likelihood và churn score.
- **Output:** $ ARR at risk by segment, by CSM, by renewal cohort.
- **UX surface:** Finance / Leadership dashboard.
- **Risk level:** Medium.

---

## 7. Ưu tiên triển khai gợi ý

| Priority | Use Case | Phase |
|----------|----------|-------|
| P0 | A2 SLA Breach Alert, B1 CSM Priority | Phase 1 |
| P1 | A1 Churn Score, B2 Queue Priority, D1 QBR Draft | Phase 2 |
| P2 | A3 Escalation, C1 Auto-Escalation Suggest, E1 Volume Forecast | Phase 2–3 |
| P3 | C2 Assignment Opt, E2 Renewal Score, E3 Revenue at Risk | Phase 3 |
| Backlog | C3 SLA Policy Rec, D3 Incident Summary | Phase 4 |
