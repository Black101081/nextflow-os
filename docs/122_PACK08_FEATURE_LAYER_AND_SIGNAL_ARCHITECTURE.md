# Nextflow OS – Pack 08: Feature Layer and Signal Architecture

**Document ID:** 122_PACK08_FEATURE_LAYER_AND_SIGNAL_ARCHITECTURE  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence  
**Related docs:** 101 Data Domain Model, 120 Overview, 123 Model Architecture

---

## 1. Mục tiêu

Feature layer là **lớp trung gian** giữa raw data (fact/dim tables từ Pack 07) và các rules/models/assistants (Pack 08). Mục tiêu:
- Tái sử dụng features across multiple use cases, tránh tính toán lại.
- Chuẩn hoá naming, grain, và freshness.
- Là nguồn truth duy nhất cho mọi signal đầu vào của Intelligence layer.

## 2. Nguyên tắc thiết kế

1. **One feature, one definition** – mỗi feature chỉ có một nơi tính toán.
2. **Grain rõ ràng** – mỗi feature table có grain xác định (per customer per day, per ticket, v.v.).
3. **Freshness SLA** – mỗi feature table có SLA refresh rõ ràng (real-time, hourly, daily, weekly).
4. **Backward compatibility** – thêm feature mới không được phá vỡ queries cũ.
5. **Naming convention** – `feat_<domain>_<purpose>`, ví dụ: `feat_cs_health_signals`.

## 3. Danh sách Feature Tables

### 3.1 feat_cs_health_signals
- **Grain:** 1 row per customer per day
- **Freshness:** Daily (T+1)
- **Nguồn:** fact_ticket_day, fact_customer_month, fact_interaction, dim_customer

| Feature | Type | Mô tả |
|---------|------|-------|
| logged_in_last_7d | bool | Đăng nhập trong 7 ngày qua |
| logged_in_last_30d | bool | Đăng nhập trong 30 ngày qua |
| ticket_volume_30d | int | Số ticket tạo trong 30 ngày |
| ticket_volume_trend | float | % thay đổi so với 30 ngày trước |
| nps_score | float | NPS score gần nhất |
| nps_trend | str | up/flat/down so với survey trước |
| overdue_invoice_count | int | Số invoice quá hạn |
| days_since_last_csm_touch | int | Ngày từ lần cuối CSM liên hệ |
| open_action_items | int | Số action items chưa done |
| product_adoption_score | float | 0–1, tỉ lệ features đang dùng |
| renewal_days_remaining | int | Ngày còn lại đến renewal date |
| previous_escalations_12m | int | Số escalation trong 12 tháng |

### 3.2 feat_ops_sla_risk_signals
- **Grain:** 1 row per ticket (live/near-real-time)
- **Freshness:** Real-time / every 5 minutes
- **Nguồn:** fact_ticket_day, dim_ticket, dim_agent, fact_queue

| Feature | Type | Mô tả |
|---------|------|-------|
| time_to_breach_minutes | int | Thời gian còn lại trước SLA breach |
| ticket_priority | str | P0/P1/P2/P3 |
| assignee_load | int | Số ticket đang handle của assignee |
| queue_depth | int | Tổng ticket trong queue hiện tại |
| ticket_complexity_score | float | 0–1 ước tính độ phức tạp |
| sentiment_score | float | -1 đến 1, từ ticket content |
| account_tier | str | Enterprise/Mid-Market/SMB |
| is_repeat_issue | bool | Cùng customer cùng topic trong 30 ngày |

### 3.3 feat_finance_ar_signals
- **Grain:** 1 row per account per billing period
- **Freshness:** Daily
- **Nguồn:** fact_invoice, dim_customer, fact_payment

| Feature | Type | Mô tả |
|---------|------|-------|
| overdue_days_max | int | Số ngày quá hạn lâu nhất |
| overdue_amount | float | Tổng tiền quá hạn |
| payment_delay_trend | str | improving/stable/worsening |
| dispute_count_90d | int | Số dispute trong 90 ngày |
| credit_risk_score | float | 0–1 |

### 3.4 feat_leadership_signals
- **Grain:** 1 row per wedge per day
- **Freshness:** Daily
- **Nguồn:** Aggregation từ feat_cs_health, feat_ops_sla_risk, fact_revenue

| Feature | Type | Mô tả |
|---------|------|-------|
| arr_at_risk | float | $ ARR có nguy cơ churn |
| sla_hit_rate_7d | float | % SLA đạt trong 7 ngày |
| churn_risk_accounts_count | int | Số accounts ở mức High/Critical churn risk |
| renewal_cohort_health | float | 0–1, sức khoẻ cohort renewal sắp tới |

## 4. Cập nhật và quản lý Feature Layer

- Mọi feature mới phải được **peer review** bởi ít nhất 1 Data Engineer + 1 Product/Data Scientist.
- Feature deprecated phải có **deprecation notice** ≥ 30 ngày, không xoá đột ngột.
- Feature table schema thay đổi phải update doc này và notify các team dùng downstream.
