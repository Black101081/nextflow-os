# Nextflow OS – Pack 08 Intelligence Operations, Evaluation and Maturity Playbook

**Document ID:** 126_PACK08_INTELLIGENCE_OPERATIONS_EVALUATION_AND_MATURITY_PLAYBOOK  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Intelligence / Product Ops / Governance & Risk  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights (105), 08 Overview (120), 08 Use Cases (121), 08 Feature Layer (122), 08 Model & Logic (123), 08 AI Governance (124), 08 UX Guidelines (125)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Intelligence Operations, Evaluation and Maturity Playbook** cho Pack 08 – cách Nextflow vận hành các capabilities intelligence/AI như một sản phẩm sống: versioning models & logic, evaluation offline/online, monitoring & drift detection, rollout & rollback, maturity path.

Nếu 105 (Pack 07) đã định nghĩa playbook operations cho **BI & analytics**, thì 126 là bản mở rộng cho **intelligence layer** (scores, recommendations, assistants). [code_file:494]

Mục tiêu cụ thể:
- định nghĩa **lifecycle** cho models, rules & assistants;  
- mô tả **evaluation frameworks** (offline/online, A/B thử nghiệm) cho AI use cases;  
- thiết kế **monitoring & drift detection** cho models & patterns;  
- đặt **maturity path** để Pack 08 phát triển từ rules-based intelligence tới advanced AI một cách an toàn.

## 2. Nguyên lý vận hành intelligence

1. **No silent changes** – mọi change quan trọng trong logic AI (model/rules ảnh hưởng behaviors) phải traceable & có changelog.  
2. **Measure before & after** – không rollout AI features lớn mà không có baseline metrics và kế hoạch đo lường.  
3. **Safe defaults & fallbacks** – luôn có behavior baseline (rules hoặc hành vi hiện tại) để fallback nếu AI degrade.  
4. **Pilots first, then scale** – mọi AI use case medium/high risk đều phải qua pilot limited trước khi GA. [code_file:507][code_file:510]  
5. **Joint ownership** – Data & Intelligence chịu trách nhiệm technical quality, Product/Ops chịu trách nhiệm business impact, Governance & Risk chịu trách nhiệm risk & compliance. [code_file:451][code_file:510]

## 3. Entities cần được vận hành

### 3.1 Logic & models

- **Rule sets** (config cho rules engine). [code_file:509]  
- **Scoring models** (risk, health, prioritization). [code_file:509]  
- **Pattern mining jobs & outputs** (association rules, clusters). [code_file:509]  
- **RAG/LLM configurations** (corpus, retrieval, prompts, safety filters). [code_file:509][code_file:510]

### 3.2 Serving & UX

- Intelligence APIs (scoring, recommendations, assistant endpoints). [code_file:509]  
- UX entry points: inline recommendations, tiles, side panels, chat surfaces. [code_file:511]

### 3.3 Governance artifacts

- AI Use Case Records (từ 124). [code_file:510]  
- Monitoring dashboards & reports.  
- Incident records & post-incident reviews (liên kết Pack 06–92). [code_file:452]

## 4. Lifecycle của rule sets & models

### 4.1 Rule sets

Stages đề xuất:

1. **Proposed** – Product/Ops/Data đề xuất rules mới hoặc chỉnh sửa rules cũ.  
2. **Reviewed** – Governance/Owners xem xét rules, risk & alignment với Pack 06. [code_file:451][code_file:453]  
3. **Tested** – rules được chạy trong môi trường staging hoặc shadow mode (không ảnh hưởng decisions).  
4. **Deployed (Active)** – rules được dùng cho suggestions/decisions.  
5. **Observed** – monitoring & feedback; chỉnh nhỏ nếu cần.  
6. **Deprecated** – không còn dùng, nhưng history vẫn giữ.

### 4.2 Models (scoring & ranking)

Stages tương tự nhưng thêm emphasize evaluation:

1. **Idea & Scoping** – mapping từ use case (121) sang model; define target & features (122); chọn pattern (123). [code_file:507][code_file:508][code_file:509]  
2. **Data Preparation & Training** – chuẩn bị training/validation sets; train models; kiểm tra chất lượng offline.  
3. **Offline Evaluation** – metrics (AUC, accuracy, calibration) + business metrics (VD: uplift giả định).  
4. **Pilot / Shadow Mode** – model chạy song song nhưng chỉ log outputs, không ảnh hưởng UI/decisions hoặc chỉ hiển thị cho internal users.  
5. **Limited Rollout / A/B Testing** – model ảnh hưởng một subset users/tenants hoặc flows; đo lường online.  
6. **General Availability (GA)** – mở rộng rollout nếu metrics & risk acceptable.  
7. **Monitoring & Maintenance** – watch performance, drift, feedback.  
8. **Retirement / Replacement** – khi model obsolete hoặc có model mới hơn.

## 5. Evaluation frameworks

### 5.1 Offline evaluation

Áp dụng trước khi model nào đó được expose tới user.

- **Prediction quality metrics:** tuỳ use case – AUC, logloss, recall/precision cho high-risk class, calibration plots.  
- **Business-oriented metrics:**  
  - giả lập "what if" – nếu top X items theo model được xử lý trước, SLA breach rate sẽ giảm bao nhiêu?  
  - phân tích segments: model hoạt động thế nào cho tenants/queues khác nhau?  
- **Robustness checks:**  
  - sensitivity khi một số features không có;  
  - stability qua windows thời gian khác nhau.

### 5.2 Online evaluation & A/B testing

Khi đã qua offline evaluation và được phép pilot.

#### A/B & multi-cell tests

- **Design:**  
  - Control: behavior hiện tại (vd sort theo due time).  
  - Treatment A: sort theo SLA risk scores.  
  - Treatment B (optional): risk + business priority weighting.  

- **Randomization:**  
  - per user, per queue, hoặc per tenant, tuỳ use case & fairness concerns.  

- **Metrics:**  
  - primary: SLA breach rate, average queue times, incident counts;  
  - secondary: user actions (clicks, task completion), override rates;  
  - tertiary: user satisfaction (survey/feedback).  

- **Duration:**  
  - đủ dài để qua các pattern daily/weekly;  
  - avoid decisions dựa trên noise.

#### Interleaving & incremental rollout

- Với ranking use cases, có thể dùng **interleaving** (mix recommendations từ model mới & cũ) để so sánh preference.  
- Rollout incremental:  
  - 5–10% traffic → 25% → 50% → 100% nếu metrics stable;  
  - dừng & rollback khi metrics tệ đi vượt ngưỡng.

## 6. Monitoring & drift detection

### 6.1 Monitoring operational

- Latency & error rates cho intelligence APIs. [code_file:509]  
- Volume & coverage: bao nhiêu requests intelligence/ngày, bao nhiêu entities được scoring.  
- UX: click-through & engagement với tiles/banners/assistant. [code_file:511]

### 6.2 Monitoring quality

- **Outcome-based metrics:**  
  - SLA breach trends cho A1; [code_file:507]  
  - queue overload occurrences cho A2;  
  - incidents related to integrations cho B1;  
  - customer health/outcomes cho C1–C2;  
- **User behavior:**  
  - override/ignoring rate: tỷ lệ người dùng bỏ qua/bỏ sort theo recommendations;  
  - thumbs up/down cho suggestions; [code_file:511]  
- **Calibration & stability:**  
  - periodic check correlation score ↔ outcomes;  
  - stability across segments/tenants.

### 6.3 Drift detection

- **Data drift:**  
  - thay đổi distribution features (vd time_to_sla, queue_load) so với training; [code_file:508]  
- **Label drift:**  
  - thay đổi relationship giữa inputs & outcomes (vd SLA policies đổi).  
- **Concept drift:**  
  - business logic underlying thay đổi (vd khác ngành, khác wedge).  

Actions khi drift:
- cảnh báo Data & Product;  
- xem xét retraining;  
- nếu quality drop nghiêm trọng, dùng fallback rules hoặc model cũ.

## 7. Rollout, rollback & kill switches

### 7.1 Rollout plan template

Mỗi AI use case medium/high risk (theo 124) phải có **rollout plan** trong AI Use Case Record: [code_file:510]

- scope pilot (tenants/queues/users);  
- thời gian & milestones;  
- metrics success & guardrails;  
- rollout steps (pilot → expand → GA).  

### 7.2 Kill switches

- Mỗi model/assistant/logic quan trọng phải có kill switch:  
  - tắt endpoints model;  
  - disable tiles/banners/assistant entry points;  
  - revert UI để không rely vào scores.  
- Kill switch nên được manage bởi Ops/Data với khả năng kích hoạt nhanh khi incident.

### 7.3 Rollback strategies

- Rollback logic:  
  - chuyển lại sang version model cũ;  
  - tạm thời dùng rules thay vì model;  
- Document rollback trong AI Use Case Record, sync với change records Pack 06–93. [code_file:453]

## 8. Maturity path cho Intelligence Layer (Pack 08)

### 8.1 Level 1 – Rules-based & basic signals

Đặc điểm:
- chủ yếu rules & heuristics; [code_file:509]  
- scoring đơn giản nếu có, dùng ít features;  
- assistant chủ yếu RAG trên SOPs nội bộ (D1); [code_file:507][code_file:509]  
- monitoring cơ bản (adoption, basic outcome metrics).

Điều kiện để bước lên Level 2:
- use cases A1, B1, D1 hoạt động ổn định; [code_file:507]  
- không có incidents AI nghiêm trọng;  
- team quen với process review & rollout.

### 8.2 Level 2 – Governed scoring & CS intelligence

Đặc điểm:
- models scoring cho A1, B1, C1; [code_file:507]  
- QBR Assistant (C2) hoạt động với grounding tốt; [code_file:507][code_file:509]  
- A/B tests & incremental rollouts được thực hành thường xuyên;  
- governance 124 được áp dụng chuẩn: risk levels, AI Use Case Records, kill switches. [code_file:510]

Điều kiện lên Level 3:
- scoring models được refresh/retrained định kỳ;  
- monitoring & drift detection ổn định;  
- users tin & sử dụng recommendations thường xuyên.

### 8.3 Level 3 – Pattern-driven automation recommendations

Đặc điểm:
- pattern mining & automation opportunity finder (E1) hoạt động; [code_file:507]  
- exception & mapping assistants dùng similarity & patterns (A3, B2); [code_file:507][code_file:509]  
- vẫn giữ human-in-the-loop cho changes lớn;  
- khuôn AI governance chín chắn.

### 8.4 Level 4 – Advanced predictive & recommenders

Đặc điểm:
- models phức tạp hơn cho forecasting, recommender systems;  
- potential partial automation trong flows low-risk;  
- heavy use of A/B, drift detection, fairness & bias checks khi applicable.  

Lưu ý: chỉ nên lên Level 4 khi Levels 1–3 vững, để tránh "ML trên nền governance yếu".

## 9. Vai trò & trách nhiệm

- **Data & Intelligence**  
  - implement & maintain models/rules;  
  - thiết kế & chạy evaluation;  
  - monitor data/model drift;  
  - own technical quality & documentation.  

- **Product & Product Ops**  
  - define use cases & success metrics; [code_file:507]  
  - quyết định rollout & phasing;  
  - validate business impact.  

- **Ops & CS**  
  - sử dụng recommendations/assistants;  
  - provide feedback & thực tế;  
  - giúp detect issues.  

- **Governance & Risk / Security**  
  - define risk levels & guardrails (124); [code_file:510]  
  - review high-risk use cases;  
  - oversee incidents & remediation.  

- **Platform Engineering**  
  - maintain serving infrastructure & logging; [code_file:509]  
  - ensure kill switches & rollout mechanisms hoạt động.

## 10. Điều kiện hoàn thành của tài liệu

Intelligence Operations, Evaluation and Maturity Playbook được xem là đạt yêu cầu khi:
- mọi AI use case Pack 08 đều có lifecycle & rollout/evaluation plan rõ; [code_file:507]  
- có frameworks cụ thể cho offline/online evaluation, A/B testing & drift detection;  
- rollback & kill switches là một phần mặc định của thiết kế;  
- maturity path được hiểu & dùng để quyết định "chúng ta đã sẵn sàng tính năng AI này chưa";  
- và Pack 08 có thể phát triển mà không đánh mất trust của SMEs vào hệ thống.
