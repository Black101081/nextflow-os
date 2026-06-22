# Nextflow OS – Pack 08: Intelligence Operations and Maturity Model

**Document ID:** 126_PACK08_INTELLIGENCE_OPERATIONS_AND_MATURITY_MODEL  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence / Ops  
**Related docs:** 120 Overview, 124 Governance, 127 Summary

---

## 1. Mục tiêu

Tài liệu này định nghĩa cách **vận hành Intelligence layer** sau khi deploy:
- Monitoring model/rule health.
- Feedback loop và model improvement.
- Maturity model để track tiến độ AI adoption.

## 2. Monitoring Framework

### 2.1 Metrics cần monitor

| Metric | Mô tả | Alert threshold |
|--------|-------|-----------------|
| Prediction coverage | % records có prediction | < 90% → investigate |
| Score distribution shift | KL divergence vs baseline | > 0.1 → review |
| Acceptance rate | % recommendations được user accept | < 20% → model review |
| False positive rate | % alert không đúng (theo user feedback) | > 30% → threshold tuning |
| Latency p95 | Thời gian tính toán prediction | > 2s → performance review |
| Feature freshness | % features đúng SLA refresh | < 95% → data pipeline alert |

### 2.2 Dashboard
- Mỗi use case có 1 monitoring tile trong Intelligence Ops Dashboard.
- Dashboard được review hàng tuần bởi Data/Intelligence team.
- Alert tự động qua Slack/email khi vượt threshold.

## 3. Feedback Loop

### 3.1 Thu thập feedback
- User action tracking: Accept / Dismiss / Modify recommendation.
- Explicit feedback: "Gợi ý này sai" button.
- Outcome tracking: sau N ngày, check outcome thực tế vs prediction (ví dụ: account có churn score High → có churn không?).

### 3.2 Sử dụng feedback
- Feedback data được aggregate hàng tuần.
- Threshold adjustment: nếu false positive rate cao → raise threshold.
- Model retrain: nếu accuracy drift đáng kể → trigger retrain pipeline.
- Rule review: nếu rule có acceptance rate thấp liên tục → deprecate hoặc sửa.

## 4. Intelligence Maturity Model

| Level | Tên | Mô tả | Điều kiện đạt |
|-------|-----|-------|---------------|
| L1 | **Reactive** | Chỉ có alerts và basic KPIs | Pack 07 ổn định, ≥2 alert rules live |
| L2 | **Assisted** | Có recommendations và priority scores | ≥3 use case P0/P1 live, acceptance rate > 30% |
| L3 | **Proactive** | Có churn score, forecasting, QBR draft | ≥6 use cases, feedback loop active |
| L4 | **Autonomous** | Có automation suggestions được user trust và activate | Acceptance rate > 60%, kill switch tested |
| L5 | **Adaptive** | Models tự retrain, continuous improvement | MLOps pipeline, A/B testing framework |

## 5. Runbook: Khi model bị nghi ngờ sai

1. **Phát hiện:** Acceptance rate giảm đột ngột hoặc user feedback tăng.
2. **Triage (trong 24h):** Data team kiểm tra feature freshness, score distribution, recent changes.
3. **Quyết định:**
   - Nếu data pipeline lỗi → fix pipeline, không cần retrain.
   - Nếu distribution shift → trigger retrain.
   - Nếu threshold sai → adjust threshold, không cần retrain.
4. **Escalation:** Nếu không resolve trong 48h → activate kill switch, notify Head of Data.
5. **Post-mortem:** Bắt buộc trong vòng 72h.
