# Nextflow OS – Pack 08: AI Use Case Record Template

**Document ID:** 129_PACK08_AI_USE_CASE_RECORD_TEMPLATE  
**Version:** 1.0  
**Status:** Template  
**Primary Owner:** Data & Intelligence / Product  
**Related docs:** 124 Governance, 120 Overview, 121 Use Cases

---

## Hướng dẫn

Mỗi use case AI/Intelligence trên Nextflow OS **bắt buộc** có một bản AI Use Case Record hoàn chỉnh trước khi deploy production. File này là template – copy và điền vào cho từng use case.

---

## AI USE CASE RECORD

### 1. Thông tin cơ bản

| Field | Giá trị |
|-------|---------|
| Use Case ID | UC-08-[số thứ tự, ví dụ: 001] |
| Tên | |
| Nhóm | A – Risk / B – Prioritization / C – Automation / D – Summarization / E – Forecasting |
| Owner | |
| Ngày tạo | |
| Ngày review gần nhất | |
| Status | Draft / Review / Approved / Live / Deprecated |

### 2. Mô tả use case

**Vấn đề cần giải quyết:**
> (Mô tả rõ pain point, tại sao cần AI cho use case này)

**User/Persona thụ hưởng:**
> (CSM / Ops Manager / Finance / Leadership / ...)

**Output của AI:**
> (Score / Alert / Recommendation card / Draft text / Ranked list / ...)

**UX Surface:**
> (Dashboard / Side panel / Alert feed / Email notification / ...)

### 3. Dữ liệu và Model

**Input features:**
| Feature | Table nguồn | Mô tả ngắn |
|---------|------------|------------|
| | | |

**Loại logic/model:**
- [ ] Rule-based
- [ ] Weighted scoring
- [ ] ML model (specify): ___
- [ ] LLM/RAG

**Output schema:**
```
{
  "score": float,          // 0-1
  "label": string,         // Low/Medium/High/Critical
  "top_factors": [string], // tối đa 3 lý do
  "recommended_action": string
}
```

**Freshness / Latency:**
> (Real-time / Hourly / Daily / On-demand)

### 4. Risk & Governance

**Risk Level:** Low / Medium / High / Critical

**Lý do phân loại risk:**
> (Giải thích tại sao chọn mức này)

**Guardrails đã áp dụng:**
- [ ] UI label "AI-suggested" / "AI-generated draft"
- [ ] User có thể dismiss/override
- [ ] Không auto-action không có confirmation
- [ ] Kill switch được định nghĩa
- [ ] Monitoring dashboard setup
- [ ] Feedback mechanism
- [ ] Legal review (Medium+)
- [ ] AI Review Board sign-off (High/Critical)

**Kill switch:**
> (Mô tả cách tắt: feature flag / config key / người có quyền)

**Privacy / PII:**
> (Use case có dùng PII không? Nếu có, consent mechanism là gì?)

### 5. Monitoring

| Metric | Target | Alert threshold |
|--------|--------|-----------------|
| Prediction coverage | ≥ 90% | < 85% |
| Acceptance rate | ≥ 30% | < 20% |
| False positive rate | ≤ 20% | > 30% |
| Latency p95 | ≤ 1s | > 2s |

### 6. Review History

| Ngày | Reviewer | Kết quả | Ghi chú |
|------|----------|---------|--------|
| | | Approved / Approved with conditions / Rejected | |

### 7. Liên kết

- Feature table: [feat_table_name]
- Model/rule code: [link to repo]
- Dashboard: [link]
- Runbook: [link]
