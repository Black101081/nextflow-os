# Nextflow OS – Pack 08 AI Use Case Record Template

**Document ID:** 129_PACK08_AI_USE_CASE_RECORD_TEMPLATE  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence / Product / Governance & Risk  
**Dependent Packs:** 08 Use Cases (121), 08 Feature Layer (122), 08 Model & Logic (123), 08 AI Governance (124), 08 UX Guidelines (125), 08 Operations & Maturity (126)  

## 1. Mục tiêu tài liệu

Template này chuẩn hoá cách mô tả, review và quản trị một **AI / Intelligence Use Case** trong Nextflow OS.

Use case record nên được tạo cho:
- recommendation use cases;  
- scoring/ranking models;  
- assistants/RAG workflows;  
- AI skills được đóng gói cho marketplace;  
- bất kỳ logic intelligence nào có business impact rõ hoặc cần governance.

## 2. Cách dùng template

- Product và Data điền bản nháp đầu tiên.  
- Governance & Risk dùng bản ghi này để gán risk level và controls.  
- UX, Engineering và Ops dùng nó để align implementation, rollout và monitoring.  
- Mỗi use case nên có một record riêng, versioned theo thời gian.

## 3. Template

### A. Identity

- **Use Case ID:**  
- **Use Case Name:**  
- **Pack / Domain:**  
- **Primary Owner:**  
- **Contributors:**  
- **Status:** Proposed / In Review / Pilot / Active / Deprecated  
- **Current Version:**  
- **Last Updated:**

### B. Business context

- **Problem statement:**  
- **Users / roles served:**  
- **Wedge / functional domain:**  
- **Why this matters now:**  
- **Decision or action this use case influences:**

### C. Value hypothesis

- **Primary value hypothesis:**  
- **Expected business outcomes:**  
- **Expected user outcomes:**  
- **What gets better if this works:**  
- **What happens if this does not exist:**

### D. Inputs and data sources

- **Primary source tables/views:**  
- **Feature tables/views used:**  
- **Corpus / documents used (if assistant/RAG):**  
- **Data classes involved:** Operational / PII / Financial / Other  
- **Cross-tenant data involved?:** Yes / No  
- **Data freshness requirements:**  
- **Known data quality risks:**

### E. Logic pattern

- **Use case type:** Recommendation / Scoring / Forecasting / Pattern mining / Assistant / Hybrid  
- **Logic pattern chosen:** Rules / Scoring model / Similarity / RAG / LLM / Other  
- **Why this pattern was chosen:**  
- **Alternative simpler pattern considered:**  
- **Outputs produced:** Score / label / explanation / summary / checklist / ranking / recommended action

### F. UX surface

- **Primary UX surface:** Queue view / dashboard tile / side panel / chat / admin tool / other  
- **When does the user see it:**  
- **Required explanation in UI:**  
- **User controls:** dismiss / override / feedback / undo / regenerate  
- **Copy disclaimers required:**

### G. Risk and governance

- **Risk level:** Low / Medium / High  
- **Why this risk level applies:**  
- **Impacted workflows or tiers:**  
- **Human-in-the-loop required?:** Yes / No  
- **Auto-action allowed?:** Yes / No  
- **Approval needed before rollout?:** Product / Governance / Security / Exec / Other  
- **Applicable guardrails:**  
- **Relevant policies or docs:**

### H. Evaluation plan

- **Offline metrics:**  
- **Business what-if evaluation:**  
- **Pilot success metrics:**  
- **Online metrics / A/B test metrics:**  
- **Failure indicators / stop conditions:**  
- **Bias / fairness checks needed?:**

### I. Rollout plan

- **Pilot scope:**  
- **Pilot start/end dates:**  
- **Rollout phases:**  
- **Target user groups / tenants:**  
- **Fallback behavior:**  
- **Kill switch available?:** Yes / No  
- **Rollback owner:**

### J. Monitoring and operations

- **Primary owner after launch:**  
- **Dashboards / monitoring views:**  
- **User feedback channels:**  
- **Incident response path:**  
- **Retraining or refresh cadence:**  
- **Versioning approach:**

### K. Limitations and assumptions

- **Known limitations:**  
- **Assumptions about users or workflows:**  
- **Scenarios where the output should not be trusted:**  
- **Open risks / unresolved questions:**

### L. Decision log

- **Approval date:**  
- **Approved by:**  
- **Conditions attached to approval:**  
- **Next review date:**  
- **Change history:**

## 4. Review checklist

Một AI Use Case Record được xem là sẵn sàng review khi:
- problem statement và value hypothesis rõ;  
- data sources và feature inputs đã xác định;  
- logic pattern được giải thích và không phức tạp quá mức cần thiết;  
- risk level, guardrails, UX controls và rollout plan đã được điền;  
- có metrics để đo thành công và stop conditions nếu thất bại.

## 5. Điều kiện hoàn thành của tài liệu

Template được xem là đạt yêu cầu khi:
- Product, Data, Governance và Ops đều có thể dùng chung một biểu mẫu;  
- use case AI mới không cần "tự nghĩ" format mô tả từ đầu;  
- các records có thể liên kết trực tiếp với docs 121–126 và với marketplace assets nếu cần.
