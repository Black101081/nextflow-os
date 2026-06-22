# Nextflow OS – Pack 08: Model and Logic Architecture

**Document ID:** 123_PACK08_MODEL_AND_LOGIC_ARCHITECTURE  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence  
**Related docs:** 122 Feature Layer, 124 Governance, 125 UX Guidelines

---

## 1. Tổng quan

Pack 08 dùng ba loại logic để biến features thành intelligence:

| Loại | Khi nào dùng | Ví dụ |
|------|-------------|-------|
| **Rules** | Logic đơn giản, deterministic, cần explainability cao | SLA breach alert, priority badge |
| **Scores/Models** | Cần ranking/probability, nhiều biến | Churn score, renewal likelihood |
| **LLM/RAG** | Cần ngôn ngữ tự nhiên, tóm tắt, Q&A | QBR draft, incident summary |

## 2. Rules Engine

### 2.1 Cấu trúc rule
```
IF <condition trên features>
THEN <action/output>
WITH <priority> và <expiry>
```

### 2.2 Ví dụ rule
```
IF feat_ops_sla_risk_signals.time_to_breach_minutes < 30
   AND ticket_priority IN ('P0', 'P1')
THEN alert(assignee, "SLA breach imminent", eta=time_to_breach_minutes)
WITH priority=CRITICAL, expiry=ticket_resolved
```

### 2.3 Nguyên tắc
- Rules phải được version-controlled.
- Mỗi rule có owner và review cycle (quarterly).
- Conflict resolution: rule có priority cao hơn thắng; nếu bằng nhau, rule mới hơn thắng.

## 3. Scoring Models

### 3.1 Churn Risk Model
- **Loại:** Logistic regression / gradient boosting (chọn theo accuracy vs explainability trade-off)
- **Input:** feat_cs_health_signals (12 features)
- **Output:** score 0–1, label Low(<0.3)/Medium(0.3–0.6)/High(0.6–0.8)/Critical(>0.8)
- **Retrain:** Monthly hoặc khi distribution shift > threshold
- **Explainability:** SHAP values cho top 3 factors per prediction

### 3.2 SLA Risk Score
- **Loại:** Rule-based score (weighted sum)
- **Formula:**
  `score = w1*(1 - time_remaining_ratio) + w2*assignee_load_ratio + w3*queue_depth_ratio`
- **Threshold:** score > 0.7 → alert
- **Ưu điểm:** Fully explainable, không cần training data

### 3.3 Priority Score (CSM/Ops)
- **Input:** Churn score + renewal_days_remaining + last_touchpoint_days
- **Output:** Composite score → ranked list
- **Loại:** Weighted scoring, weights configurable per tenant

## 4. LLM/RAG Layer

### 4.1 Kiến trúc
```
User query / trigger
      │
      ▼
 Context Builder ← pulls từ: account data, ticket history, KPIs, feature signals
      │
      ▼
 LLM (with system prompt + retrieved context)
      │
      ▼
 Output (draft text / structured JSON)
      │
      ▼
 Human review gate (nếu risk level ≥ Medium)
```

### 4.2 Use cases phù hợp LLM/RAG
- QBR draft generation (D1)
- Account health summary (D2)
- Incident root cause summary (D3)
- Natural language Q&A trên account data

### 4.3 Guardrails LLM
- Không expose raw PII trong prompt nếu không cần thiết.
- Output phải được flagged là "AI-generated draft" trong UI.
- User luôn có nút "Edit" và "Discard" trước khi gửi ra ngoài.
- Hallucination mitigation: chỉ dùng retrieved context, không dùng LLM general knowledge cho số liệu cụ thể.

## 5. Model Selection Guide

| Criteria | Dùng Rules | Dùng Score/Model | Dùng LLM/RAG |
|----------|-----------|-----------------|-------------|
| Cần explainability tuyệt đối | ✅ | Partial (SHAP) | ❌ |
| Output là số/label | ✅ | ✅ | ❌ |
| Output là text tự nhiên | ❌ | ❌ | ✅ |
| Cần real-time (<1s) | ✅ | ✅ (nếu pre-computed) | ❌ |
| Dữ liệu training ít | ✅ | ❌ | ✅ |
| Độ chính xác quan trọng nhất | Depends | ✅ | Không phù hợp |
