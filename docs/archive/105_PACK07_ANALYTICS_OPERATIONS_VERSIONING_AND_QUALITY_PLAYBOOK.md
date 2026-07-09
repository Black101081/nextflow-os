# Nextflow OS – Pack 07 Analytics Operations, Versioning and Quality Playbook

**Document ID:** 105_PACK07_ANALYTICS_OPERATIONS_VERSIONING_AND_QUALITY_PLAYBOOK  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Product Ops / Governance & Risk  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Overview (100), 07 Data Model (101), 07 KPIs & Dashboards (102), 07 Self-Service (103), 07 Governance & Policies (104)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Analytics Operations, Versioning and Quality Playbook** cho Pack 07 – tức là cách Nextflow vận hành layer analytics như một sản phẩm sống: metrics được định nghĩa, version, test, review, phát hành, theo dõi chất lượng và cải tiến theo thời gian.

Nếu các tài liệu 100–104 trả lời:
- Pack 07 là gì;  
- dữ liệu analytics có hình dạng ra sao;  
- KPIs & dashboards chuẩn là gì;  
- self-service vận hành trong guardrails nào;  
- policies dữ liệu analytics là gì;  

…thì tài liệu này trả lời câu hỏi:

> **Ai đảm bảo rằng con số trên dashboard hôm nay vẫn có cùng ý nghĩa như tháng trước? Khi một metric thay đổi định nghĩa, chúng ta xử lý thế nào? Làm sao biết một dashboard đang sai, stale, duplicate hay gây hiểu lầm? Bao lâu review lại một KPI, và khi nào nên nâng analytics maturity từ descriptive BI lên diagnostic/predictive?**

Mục tiêu cụ thể:
- định nghĩa mô hình **versioning** cho metrics, datasets, dashboards;  
- mô tả **testing & validation** cho analytics artifacts;  
- mô tả **review cadences** vận hành analytics;  
- định nghĩa **quality dimensions** cho dữ liệu, metrics và dashboards;  
- đặt một **maturity path** để Pack 07 phát triển từ chuẩn BI sang analytics nâng cao.

## 2. Thesis về analytics operations

Thesis có thể phát biểu như sau:

> **Analytics không chỉ là “xây dashboard xong là xong”. Nếu không có operations, versioning và quality discipline, dashboards sẽ già đi, metrics bị trôi nghĩa, self-service thành hỗn loạn, và niềm tin vào dữ liệu mất rất nhanh. Trong SME OS, niềm tin vào con số quan trọng gần như niềm tin vào chính workflow.**

Nguyên lý:

1. **Metrics are products** – mỗi KPI quan trọng là một sản phẩm nhỏ: có owner, definition, version, consumers và lifecycle.  
2. **Definitions before visualizations** – phải ổn định metric definitions trước khi tối ưu chart/UX.  
3. **Quality is layered** – chất lượng analytics không chỉ là data đúng; còn là freshness, lineage, hiểu đúng, visual clarity và governance fit.  
4. **Change must be explicit** – mọi thay đổi định nghĩa metric hoặc logic dashboard quan trọng phải visible, versioned và communicated.  
5. **Trust beats novelty** – dashboard ít nhưng đáng tin tốt hơn dashboard đẹp nhưng số không ổn định.  
6. **Maturity is phased** – descriptive → diagnostic → comparative → predictive/recommendation, không nhảy cóc.

## 3. Analytics artifacts cần được vận hành

Pack 07 coi các đối tượng sau là **analytics artifacts** cần lifecycle rõ:

1. **Metric definitions**  
   - ví dụ: SLA hit %, backlog age, automation coverage, incident MTTR, change failure rate.  

2. **Datasets / semantic views**  
   - subject-area datasets dùng cho BI & self-service, xây từ schema 101.  

3. **Dashboards / reports**  
   - dashboards chuẩn theo role (102), dashboards Certified theo tenant/team, reports định kỳ.  

4. **Exports / scheduled deliveries**  
   - CSV exports, emailed reports, data pushes sang hệ khác.  

5. **Derived scores / health indices**  
   - ví dụ: customer health score, automation maturity index, risk exposure score.

Mỗi artifact nên có owner, audience, version và review cadence.

## 4. Versioning model

### 4.1 Versioning cho metric definitions

Mỗi metric quan trọng cần một **Metric Definition Record** với các trường tối thiểu:
- `metric_code`  
- `metric_name`  
- `business_definition`  
- `formula_logic`  
- `grain`  
- `filters/exclusions`  
- `source tables/views`  
- `owner_role`  
- `version`  
- `effective_from`  
- `change_reason`

#### Loại thay đổi cho metric definitions

Áp dụng một mô hình semantic versioning đơn giản:

- **Major** – thay đổi ý nghĩa hoặc logic cốt lõi của metric.  
  - Ví dụ: đổi cách tính SLA hit từ “không breach final state” sang “mọi intermediate breach đều tính”.  
  - Tác động: dashboards/reports lịch sử có thể không so sánh trực tiếp được.  

- **Minor** – giữ ý nghĩa cốt lõi nhưng tinh chỉnh logic/filters hoặc mở rộng dimension hỗ trợ.  
  - Ví dụ: loại trừ thêm một queue đặc biệt khỏi backlog KPI.  

- **Patch** – sửa lỗi kỹ thuật hoặc formatting mà không đổi logic business.  
  - Ví dụ: sửa timezone bug, rounding inconsistency.

#### Quy tắc versioning metrics

- Major change phải:  
  - qua review Product + Data + Governance;  
  - ghi change note rõ;  
  - cân nhắc dual-run metric cũ/mới trong một thời gian.  
- Minor change phải có peer review và update docs.  
- Patch change vẫn cần log & traceability.

### 4.2 Versioning cho datasets / semantic views

Datasets self-service và views semantic cần version khi:
- đổi grain;  
- đổi field definitions;  
- thêm/bỏ fields quan trọng;  
- đổi masking/sensitivity behavior.

Nguyên tắc:
- Ưu tiên **backward compatibility**;  
- Nếu breaking change, tạo `v2` view/dataset song song với `v1`, deprecate dần;  
- Dashboards Certified không nên tự động bị “gãy” vì dataset thay đổi.

### 4.3 Versioning cho dashboards & reports

Dashboards cũng cần version nhẹ:
- content version – thay đổi KPI/cards/logic;  
- layout version – thay đổi cách trình bày;  
- audience version – thay đổi ai có thể xem / tenant scope.

Không phải mọi thay đổi layout đều cần communicate rộng, nhưng các thay đổi content logic quan trọng thì có.

## 5. Testing & validation model

Chất lượng analytics cần test ở nhiều tầng.

### 5.1 Tầng dữ liệu (data layer tests)

Áp dụng cho facts/dims trong schema 101:
- **Completeness** – có missing rows bất thường không?  
- **Freshness** – data có cập nhật đúng nhịp không?  
- **Uniqueness** – keys có duplicate không?  
- **Referential integrity** – foreign keys có map được tới dimensions không?  
- **Range/format checks** – latency không âm, severity thuộc tập hợp hợp lệ, timestamps không vượt tương lai bất hợp lý.

### 5.2 Tầng metric (metric validation)

Áp dụng cho KPIs chuẩn (102):
- kiểm tra công thức bằng test fixtures hoặc sample scenarios;  
- so sánh metric mới với baseline cũ khi rollout major/minor changes;  
- sanity checks:  
  - SLA hit % phải nằm trong 0–100;  
  - automation coverage không vượt 100;  
  - MTTR không âm;  
  - incident count không giảm bất thường về 0 khi hệ thống vẫn có alert traffic.

### 5.3 Tầng dashboard/report (presentation validation)

- đúng filters tenant/wedge/region;  
- labels rõ ràng;  
- date ranges mặc định hợp lý;  
- màu sắc / warning states không gây hiểu nhầm;  
- không có chart “đẹp nhưng vô nghĩa”;  
- dashboards customer-facing không lộ fields nhạy cảm.

### 5.4 Tầng workflow & permissions

- self-service permissions đúng với roles trong doc 103;  
- dashboards Certified chỉ hiển thị đúng audience;  
- exports obey policies doc 104;  
- lineage records tạo đầy đủ khi publish/modify.

## 6. Quality dimensions và quality scorecards

Để đánh giá analytics health một cách hệ thống, Pack 07 dùng 6 quality dimensions:

1. **Accuracy** – số có đúng không?  
2. **Freshness** – dữ liệu & dashboards có mới đủ để dùng không?  
3. **Consistency** – cùng một metric có ra cùng kết quả trên các views liên quan không?  
4. **Interpretability** – người dùng có hiểu metric và chart đúng không?  
5. **Governance Fit** – có đúng permissions, masking, audit, retention không?  
6. **Actionability** – dashboard có giúp ra quyết định không, hay chỉ “trang trí”?  

Có thể áp dụng một **Analytics Quality Scorecard** cho dashboards Certified, ví dụ chấm 1–5 cho từng chiều hoặc pass/fail theo checklist.

## 7. Review cadences

### 7.1 Daily / operational checks

Phù hợp cho Data/Ops khi analytics được dùng trong BAU:
- freshness checks cho pipelines chính;  
- failures trong scheduled refreshes;  
- dashboard outages hoặc query failures;  
- anomalies đơn giản trong metrics core (spikes, zeros, blanks).

### 7.2 Weekly reviews

Participants: Data & Analytics, Ops, Product Ops.

Review:
- stale hoặc failing dashboards;  
- data quality alerts;  
- requests mới cho dashboards/datasets;  
- any metric confusion từ SMEs/CS/Ops;  
- duplicate dashboards đáng gom lại.

### 7.3 Monthly metric & dashboard review

Participants: Data, Product, Ops, Governance khi cần.

Review:
- metrics nào đang được dùng nhiều/ít;  
- dashboards nào ít dùng, gây hiểu nhầm, hoặc không còn gắn hành động;  
- candidate dashboards để certify/deprecate;  
- metric definitions cần chỉnh minor;  
- customer-facing report quality.

### 7.4 Quarterly analytics governance review

Participants: Data leadership, Product leadership, Governance & Risk, CS/Ops leads.

Review:
- maturity của Pack 07;  
- số lượng dashboards personal/team/certified;  
- incidents liên quan analytics data;  
- policy exceptions;  
- đề xuất thêm semantic datasets / advanced analytics roadmap.

## 8. Lifecycle của metric và dashboard

### 8.1 Metric lifecycle

1. **Proposed** – có nhu cầu business mới.  
2. **Defined** – business definition & formula được mô tả rõ.  
3. **Validated** – test xong với sample/baseline.  
4. **Published** – dùng trong dashboards/reports.  
5. **Observed** – theo dõi usage, confusion, anomalies.  
6. **Revised** – minor/major update khi cần.  
7. **Deprecated** – không còn dùng hoặc được thay metric khác.

### 8.2 Dashboard lifecycle

1. **Draft / Personal**  
2. **Team Use**  
3. **Submitted for Certification**  
4. **Certified / Standard**  
5. **Monitored**  
6. **Refreshed / Reworked**  
7. **Deprecated / Archived**

Lifecycle này phải align với self-service model trong doc 103.

## 9. Change management cho analytics artifacts

Analytics changes là một loại change riêng, nhưng nên align với Pack 06 doc 93.

### 9.1 Gợi ý phân loại

- **Low-risk analytics changes**  
  - sửa nhãn chart, layout, description, typo;  
  - patch timezone/formatting.  

- **Medium-risk analytics changes**  
  - thêm filter mới;  
  - thêm KPI phụ;  
  - tinh chỉnh chart logic không ảnh hưởng metric definition cốt lõi.  

- **High-risk analytics changes**  
  - đổi metric definition cốt lõi;  
  - đổi dataset grain hoặc joins ảnh hưởng dashboards Certified;  
  - đổi masking/access trên data nhạy cảm;  
  - đổi customer-facing SLA reports.

### 9.2 Controls gợi ý

- Low-risk: peer review + changelog.  
- Medium-risk: review Data + Product/Ops owner; quick validation.  
- High-risk: versioned rollout, side-by-side validation, communication tới consumers, có rollback/deprecation plan.

## 10. Monitoring & alerting cho analytics layer

Analytics layer cũng cần observability riêng:
- pipeline success/failure;  
- refresh duration;  
- stale dashboard detection;  
- spikes in null/duplicate counts;  
- query performance của dashboards phổ biến;  
- unusual export activity.

Các alerts này nên route tới Data/Ops hoặc Governance tuỳ loại.

## 11. Maturity path cho Pack 07

### 11.1 Level 1 – Foundational BI

Đặc điểm:
- schema 101 ổn định cơ bản;  
- dashboards chuẩn 102 cho roles chính;  
- self-service giới hạn, có guardrails đơn giản;  
- metric definitions & owners bắt đầu rõ.

Điều kiện để lên Level 2:
- dashboards chuẩn được dùng thực tế trong BAU & customer reviews;  
- data quality incidents ở mức thấp;  
- metric confusion giảm dần.

### 11.2 Level 2 – Governed Self-Service BI

Đặc điểm:
- subject-area datasets rõ;  
- Explorer/Publisher model hoạt động;  
- Certified dashboards có lineage, scorecards, review cadence;  
- exports & access policies ổn định.

Điều kiện để lên Level 3:
- self-service usage meaningful nhưng không tạo “metric chaos”;  
- governance reviews ổn định;  
- data team không bị drown bởi requests cơ bản.

### 11.3 Level 3 – Diagnostic & Comparative Analytics

Đặc điểm:
- cohort, segmentation, funnel/flow diagnostics;  
- benchmarking giữa tenants/segments/wedges (trong guardrails phù hợp);  
- richer derived scores: health, maturity, risk exposure.

Điều kiện để lên Level 4:
- dữ liệu history đủ dài & ổn định;  
- metric definitions mature;  
- consumers hiểu descriptive/diagnostic metrics đủ tốt.

### 11.4 Level 4 – Early Predictive / Recommendation

Đặc điểm:
- forecasting backlog, SLA risk, incident likelihood;  
- recommendations cho routing, staffing, automation candidates;  
- human-in-the-loop trước khi tự động hoá decisions lớn.

Lưu ý: Level 4 chỉ nên bắt đầu khi Levels 1–3 đủ vững; nếu không, predictive analytics sẽ xây trên nền trust yếu.

## 12. Vai trò và trách nhiệm

- **Data & Analytics**  
  - owner schema, datasets, metrics definitions, testing, quality scorecards.  
- **Product Owner / Product Ops**  
  - owner business meaning & consumers của metrics quan trọng.  
- **Ops / CS**  
  - phản hồi metrics nào hữu ích/gây hiểu nhầm; dùng dashboards trong BAU & customer reviews.  
- **Governance & Risk**  
  - review changes liên quan access, masking, customer-facing metrics, risk dashboards.  
- **Engineering / Platform Data**  
  - hỗ trợ reliability, pipelines, lineage & permissions infrastructure.

## 13. Anti-patterns cần tránh

1. Mỗi team tự định nghĩa cùng một KPI theo cách khác nhau.  
2. Đổi logic metric ngầm mà không version hoặc thông báo.  
3. Dashboard được chứng nhận nhưng không ai review lại trong nhiều tháng.  
4. Quá nhiều dashboards trùng lặp, không rõ dashboard nào là “official”.  
5. Chỉ test pipelines kỹ thuật mà không test nghĩa business của metrics.  
6. Nhảy sang predictive/ML khi descriptive BI còn thiếu trust.

## 14. Điều kiện hoàn thành của tài liệu

Analytics Operations, Versioning and Quality Playbook được xem là đạt yêu cầu khi:
- metrics, datasets, dashboards quan trọng đều có owner, version và review cadence;  
- có testing & validation ở các tầng data/metric/dashboard/permissions;  
- dashboards Certified và customer-facing reports được quản như sản phẩm có lifecycle;  
- Pack 07 có con đường rõ ràng để tăng maturity mà không đánh mất trust vào dữ liệu.

## AG Execution Prompt

You are acting as an analytics operations architect, data trust builder and BI quality disciplinarian.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Pack 07 defines data, analytics and insights, with BI and governed self-service as first priorities.
- This document defines operations, versioning and quality playbook for analytics artifacts.

### Objective
Refine this document into an actionable operating model for metrics, datasets and dashboards so that analytics remains trustworthy as it scales.

### Inputs
- Use this document plus Pack 07 docs 100–104.
- Align with Pack 06 change, incident and governance concepts.
- Assume a small but growing Data team and multiple cross-functional consumers.

### Tasks
1. Sharpen the versioning model for metrics, datasets and dashboards.
2. Define practical test layers and review cadences.
3. Clarify quality dimensions and scorecards for certified dashboards.
4. Propose a realistic maturity roadmap from BI to early predictive analytics.
5. Highlight anti-patterns and operating signals.

### Constraints
- Do not require heavyweight enterprise data governance to operate basic BI.
- Do not let self-service create metric chaos.
- Keep the model understandable to Product, Ops, CS and Governance, not just Data engineers.

### Output Format
Return a revised markdown guide with sections:
1. Versioning Model
2. Testing and Validation Layers
3. Review Cadences and Lifecycle
4. Quality Scorecards and Governance
5. Maturity Path and Anti-Patterns

### Acceptance Criteria
- The output must make analytics operations feel concrete and adoptable.
- It must preserve trust in metrics while allowing Pack 07 to evolve.
- It must align with BI/self-service priorities before advanced ML.
