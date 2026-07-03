# Nextflow OS – Pack 08 Advanced Intelligence, Recommendations and Assistants Summary and Usage Guide

**Document ID:** 127_PACK08_SUMMARY_AND_USAGE_GUIDE  
**Pack:** 08 — Advanced Intelligence, Recommendations and Assistants  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Data & Intelligence / Governance & Risk  

## 1. Pack 08 nói về điều gì?

Pack 08 định nghĩa **Advanced Intelligence, Recommendations and Assistants Layer** của Nextflow OS – lớp đứng trên BI & analytics (Pack 07) và workflows (Packs 04–05–06) để cung cấp **scores, recommendations và assistants** giúp SMEs & nội bộ ra quyết định tốt hơn, nhanh hơn, trong giới hạn governance chấp nhận được. [code_file:506][code_file:507]

Nếu Pack 07 trả lời "chúng ta đo lường gì và nhìn thấy gì", thì Pack 08 trả lời:

> **Dựa trên những dữ liệu & insights đó, hệ thống có thể chủ động gợi ý gì, cảnh báo điều gì, và chuẩn bị hỗ trợ gì cho người dùng – mà vẫn giữ được trust, kiểm soát và trách nhiệm?** [code_file:506]

Pack 08 không nói về "AI thần thánh" chung chung; nó gom những capability cụ thể:
- Work & SLA intelligence: ưu tiên công việc, cảnh báo SLA risk, gợi ý staffing. [code_file:507]  
- Exception & integration intelligence: gợi ý fix, nhận diện patterns, cảnh báo integration risk. [code_file:507]  
- Customer health & CS intelligence: health scores, driver insights, QBR assistant. [code_file:507]  
- Knowledge & SOP assistants: trả lời trên SOPs/runbooks/docs nội bộ, sau này có thể mở rộng khách-facing. [code_file:507]  
- Automation & process improvement recommender: tìm điểm automation có ROI tốt. [code_file:507]

Tất cả được xây trên schema & KPIs Pack 07, trong khung governance Pack 06–07, với kiến trúc logic & ops rõ ràng.

## 2. Các tài liệu trong Pack 08

### 2.1 Docs khung & chiến lược

- **120_PACK08_ADVANCED_INTELLIGENCE_RECOMMENDATIONS_AND_ASSISTANTS_OVERVIEW_AND_STRATEGY**  
  Định vị Pack 08: mục tiêu, thesis (assist, không auto-pilot mù), nguyên lý, trụ cột (use cases, feature layer, models & logic, AI governance, UX, ops), và cấu trúc docs 08. [code_file:506]

### 2.2 Use cases, data & logic

- **121_PACK08_INTELLIGENCE_USE_CASES_AND_PATTERNS_FOR_SMES**  
  Catalog use case intelligence theo nhóm A–E (Work & Ops, Integration & Data Quality, Customer Health & CS, Knowledge & SOPs, Automation & Process), mỗi use case có value, inputs (từ schema 101), outputs, pattern kỹ thuật, risk level & guardrails. [code_file:507]

- **122_PACK08_INTELLIGENCE_DATA_AND_FEATURE_LAYER_SPEC**  
  Định nghĩa feature layer cho Intelligence: các feature domains (Work/SLA, Exceptions/Integrations, Incidents/Changes, Adoption/Health, Automation), feature tables/views (feat_work_item_snapshot, feat_queue_daily, feat_tenant_health_snapshot…), grains & fields, mapping từ facts/dims Pack 07, và feature contracts với BI layer. [code_file:479][code_file:508]

- **123_PACK08_INTELLIGENCE_MODEL_AND_LOGIC_ARCHITECTURE**  
  Định nghĩa kiến trúc logic multi-layer: rules & heuristics, scoring & ranking models, pattern mining & similarity, knowledge & assistants (RAG/LLM), và cách chúng kết hợp trong pipelines để phục vụ use cases 121. [code_file:507][code_file:509]

### 2.3 Governance, UX & operations

- **124_PACK08_AI_GOVERNANCE_RISK_AND_GUARDRAILS**  
  Định nghĩa AI governance cho Pack 08: phân loại risk levels (low/medium/high), guardrails theo lớp logic (rules, scoring, pattern mining, RAG/LLM), approval & review cho AI use cases (đặc biệt flows Tier 3–4), monitoring & incidents, kill switches, user control & transparency, data & access controls. [code_file:451][code_file:482][code_file:510]

- **125_PACK08_ASSISTANT_AND_RECOMMENDATION_UX_GUIDELINES**  
  Định nghĩa UX patterns cho recommendations & assistants: inline recommendations trong queues & details, tiles & banners trên dashboards, side panel assistants, chat-style assistants, explainability UI ("Why am I seeing this?"), user control & feedback, copy guidelines. [code_file:480][code_file:509][code_file:510][code_file:511]

- **126_PACK08_INTELLIGENCE_OPERATIONS_EVALUATION_AND_MATURITY_PLAYBOOK**  
  Playbook vận hành intelligence: lifecycle rules & models, evaluation offline/online & A/B, monitoring & drift detection, rollout & rollback & kill switches, maturity path từ rules-based → scoring & CS intelligence → pattern-driven → advanced predictive. [code_file:494][code_file:507][code_file:508][code_file:509][code_file:510][code_file:512]

- **129B_PACK08_MODEL_PERFORMANCE_TESTING_AND_EVALUATION_METRICS**  
  Đặc tả đo lường chất lượng mô hình, tập validation datasets, cách phòng chống AI drift.

## 3. Dùng Pack 08 như thế nào? – theo chu trình triển khai AI use case

### Bước 1 – Chọn và mô tả use case

- Bắt đầu từ doc **120** để hiểu mục tiêu chung & nguyên lý (assist, value-first, grounded & explainable, respect governance). [code_file:506]  
- Dùng **121** để chọn 1–3 use case ưu tiên theo domain:  
  - A1 (SLA Risk & Work Prioritization), B1 (Integration Risk), D1 (Internal SOP Assistant) thường là Phase 1; [code_file:507]  
  - A2/A3/C1/C2/E1 cho các phase sau. [code_file:507]

**Output:** AI use case description theo template: Name, Roles, Value Hypothesis, Inputs, Outputs, Pattern, Risk Level, Guardrails, Metrics of Success. [code_file:507]

### Bước 2 – Xác định dữ liệu & feature layer

- Dùng **122** để map use case → feature tables/views:  
  - A1/A2 → feat_work_item_snapshot, feat_queue_daily, feat_user_workload_daily; [code_file:508]  
  - B1/B2 → feat_integration_daily, feat_integration_mapping_field; [code_file:508]  
  - C1/C2 → feat_tenant_health_snapshot, feat_feature_usage_profile; [code_file:508]  
  - D1 → corpus SOPs/runbooks/docs, context signals;  
  - E1 → feat_automation_candidate. [code_file:508]

**Output:** feature spec cụ thể cho use case (fields, grains, refresh cadence) và các pipeline cần build.

### Bước 3 – Chọn pattern logic & thiết kế kiến trúc

- Dùng **123** để chọn pattern logic phù hợp: [code_file:509]  
  - rules + scoring cho A1, B1, C1;  
  - rules + forecasting cho A2;  
  - pattern mining + similarity + RAG cho A3, B2, E1;  
  - templated summarization + LLM + grounding cho C2;  
  - RAG Q&A cho D1. [code_file:507][code_file:509]

- Xác định:  
  - components cần (rules engine, scorers, pattern miners, assistant);  
  - inputs/outputs APIs;  
  - explainability strategy (reason codes, citations…).

**Output:** logic architecture cho use case, sẵn sàng để Data & Engineering implement.

### Bước 4 – Governance & risk review

- Dùng **124** để gán risk level (low/medium/high) cho use case: [code_file:510]  
  - D1, C2 thường low;  
  - A1, A2, B1, C1, E1 thường medium;  
  - bất kỳ auto-act trên flows Tier 3–4 hoặc khách-facing nhạy cảm → high. [code_file:451][code_file:507][code_file:510]

- Thực hiện **AI use case review**:  
  - Proposal & risk assessment;  
  - design review (data & features, logic pattern, UX & copy); [code_file:508][code_file:509][code_file:511]  
  - pilot plan & approval. [code_file:510]

**Output:** AI Use Case Record đầy đủ (owners, risk, data, logic, guardrails, pilot plan).

### Bước 5 – Thiết kế UX cho recommendations & assistants

- Dùng **125** để chọn UX pattern phù hợp: [code_file:511]  
  - inline recommendations trong queues/dashboards cho A1/A2/B1/C1;  
  - tiles & banners trên Ops/CS dashboards cho insights “Top risk/health”; [code_file:480][code_file:507]  
  - side panel assistants cho A3/D1/C2;  
  - chat-style assistant cho D1 (internal) ở phase sau. [code_file:507][code_file:509]

- Áp dụng nguyên tắc: facts (số liệu Pack 07) trước, recommendations sau; "Why am I seeing this?"; user control (bỏ qua/undo, feedback). [code_file:480][code_file:510][code_file:511]

**Output:** UX spec & copy cho use case, align với AI governance & logic.

### Bước 6 – Ops: evaluation, rollout, monitoring & maturity

- Dùng **126** để: [code_file:512]  
  - định nghĩa lifecycle rule sets/models cho use case;  
  - thiết kế offline evaluation (prediction metrics + business what-if);  
  - set up A/B test hoặc pilot (scope, metrics, thời gian);  
  - thiết lập monitoring, drift detection & kill switch;

- Liên kết với Pack 07–105 cho versioning & operations baseline; [code_file:494]  
- Liên kết với Pack 06–92/93 cho incidents & change. [code_file:452][code_file:453]

**Output:** model/rules được vận hành đúng lifecycle, có rollout & rollback plan rõ, metrics theo dõi xuyên suốt.

## 4. Ai dùng phần nào trong Pack 08?

- **Product & Product Ops**  
  - 120: hiểu chiến lược & trụ cột Pack 08; [code_file:506]  
  - 121: chọn & mô tả use cases; [code_file:507]  
  - 125: thiết kế UX & copy cho recommendations & assistants; [code_file:511]  
  - 126: quyết định rollout & phasing. [code_file:512]

- **Data & Intelligence**  
  - 121: hiểu bối cảnh business & value của use cases; [code_file:507]  
  - 122: thiết kế feature layer & pipelines; [code_file:508]  
  - 123: chọn & hiện thực patterns logic; [code_file:509]  
  - 124: align models với governance & risk; [code_file:510]  
  - 126: chạy evaluation & monitoring. [code_file:512]

- **UX / Design**  
  - 120: grasp overall role của intelligence; [code_file:506]  
  - 125: sử dụng patterns inline/tiles/side panel/chat, explainability & user control. [code_file:511]

- **Ops & Support (Nextflow)**  
  - 121: nhận biết use case hỗ trợ công việc (A1, A2, A3, D1); [code_file:507]  
  - 125: hiểu nơi recommendations & assistants xuất hiện trong UI; [code_file:511]  
  - 126: tham gia feedback & monitoring outcomes. [code_file:512]

- **CSM**  
  - 121: hiểu CS use cases (C1, C2); [code_file:507]  
  - 125: dùng QBR Assistant & health tiles; [code_file:511]  
  - 126: cung cấp feedback về impact trên retention & QBR. [code_file:512]

- **Governance & Risk / Security**  
  - 124: define risk levels, guardrails, approvals; [code_file:510]  
  - 126: oversee AI incidents, drift & kill switches; [code_file:512]  
  - liên kết toàn Pack 08 với Pack 06 & 07 policies. [code_file:451][code_file:482]

## 5. Liên kết Pack 08 với Packs 05–07

- Với **Pack 07**:  
  - Pack 08 tiêu thụ facts/dims & KPIs từ schema & dashboards (101–102); [code_file:479][code_file:480]  
  - feature layer 122 xây trên facts/dims 101 & health snapshots; [code_file:479][code_file:508]  
  - governance & data policies 104 (classes, access, retention) áp dụng cho data AI dùng; [code_file:482]  
  - operations/versioning 105 là baseline cho AI operations 126. [code_file:494][code_file:512]

- Với **Pack 06**:  
  - risk tiers 91 dùng phân loại AI use cases high-risk; [code_file:451]  
  - change governance 93 áp dụng cho rollout models/rules; [code_file:453]  
  - incidents 92 xử lý AI-related incidents (wrong recommendations, data leaks); [code_file:452][code_file:510]  
  - BAU routines 94 có thể tiêu thụ intelligence signals. [code_file:454][code_file:512]

- Với **Pack 05**:  
  - integrations & mapping (82–83–86–87) cung cấp signals & playground cho B1/B2/E1. [code_file:431][code_file:435][code_file:437][code_file:438][code_file:507][code_file:508]

## 6. Khi nào nên triển khai rộng Pack 08?

Pack 08 nên được triển khai rộng khi:
- Pack 07 đã đạt **Foundational BI**: schema & dashboards chuẩn đang được dùng thật sự, self-service có govern, metrics có trust. [code_file:479][code_file:480][code_file:481][code_file:494]  
- Pack 06 governance chạy ổn: incidents & changes được quản, risk tiers rõ và được dùng trong decisions. [code_file:451][code_file:452][code_file:453][code_file:454][code_file:455]  
- Data history đủ để training scoring models cho các use case ưu tiên (A1, B1, C1). [code_file:507][code_file:508]  
- Team Product/Data/Ops đã quen với quy trình review & rollout AI use cases (124, 126). [code_file:510][code_file:512]

Khi các điều kiện này đạt, Pack 08 trở thành lớp "trợ lý" đứng trên Pack 07: thay vì chỉ xem dashboards & KPIs, SMEs & nội bộ còn nhận được "gợi ý bước tiếp theo", "điểm cần chú ý", "kịch bản automation tiềm năng" – nhưng luôn trong biên giới governance & risk rõ ràng.
