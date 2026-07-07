# Nextflow OS – Pack 07 Data, Analytics and Insights Summary and Usage Guide

**Document ID:** 107_PACK07_SUMMARY_AND_USAGE_GUIDE  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Product Leadership / Governance & Risk  

## 1. Pack 07 nói về điều gì?

Pack 07 định nghĩa **Data, Analytics and Insights Layer** cho Nextflow OS – cách dữ liệu từ lifecycle, SLA, exceptions, integrations, incidents, BAU, adoption… được gom lại, quản lý và biến thành **signals, KPIs, dashboards và insights** cho SMEs, Product, Ops, CS và Governance.

Nếu Packs 02–06 trả lời "Nextflow là gì, làm gì, được govern & vận hành thế nào", thì Pack 07 trả lời:

- Chúng ta đo lường gì, theo cấu trúc dữ liệu nào. [code_file:479]  
- Ai nhìn được số gì, trên dashboards nào, với KPIs nào. [code_file:480][code_file:481]  
- SMEs và nội bộ có thể tự phân tích đến đâu, trong guardrails nào. [code_file:481]  
- Dữ liệu analytics được bảo vệ, retention và chia sẻ ra sao. [code_file:482]  
- Metrics/dashboards sống thế nào: versioning, testing, review, quality và maturity path. [code_file:494]

## 2. Các tài liệu trong Pack 07

### 2.1 Docs cốt lõi

- **100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY**  
  Định nghĩa chiến lược Pack 07: thesis, nguyên lý, trụ cột (data model, KPIs/dashboards, self-service, governance, operations) và vị trí Pack 07 trong toàn bộ Nextflow OS. [code_file:478]

- **101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA**  
  Định nghĩa schema analytics: các bảng fact/dimension chính (work & SLA, exceptions, integrations, incidents, changes, usage/adoption…), grain, keys, mapping từ runtime (Packs 02–06) sang warehouse/lakehouse. [code_file:479]

- **102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE**  
  Định nghĩa bộ KPIs cốt lõi và dashboards chuẩn cho các roles chính: SME Ops, SME Leadership, Internal Ops/Support, CSM, Product & Governance. [code_file:480]

- **103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL**  
  Định nghĩa mô hình self-service có govern: loại người dùng (SME vs nội bộ), subject-area datasets, roles (Viewer/Explorer/Publisher/Curator), workflow publish & certify dashboards, kết nối với risk tiers & data policies. [code_file:481]

- **104_PACK07_ANALYTICS_GOVERNANCE_AND_DATA_POLICIES**  
  Định nghĩa chính sách data cho layer analytics: phân loại data theo độ nhạy, access model, minimization & masking, retention, sharing/exports, xử lý incidents liên quan analytics data. [code_file:482]

- **105_PACK07_ANALYTICS_OPERATIONS_VERSIONING_AND_QUALITY_PLAYBOOK**
- **106_PACK07_DATABASE_DDL_AND_SCHEMA_CREATION_SQL**
  Bộ SQL DDL Scripts khởi tạo cấu trúc bảng vật lý trên PostgreSQL/BigQuery.
- **108_PACK07_DATA_PIPELINE_ETL_AND_INGESTION_SPEC**
  Đặc tả thiết kế CDC, pipelines ETL/Ingestion dữ liệu.  
  Định nghĩa cách vận hành analytics như một sản phẩm: versioning metrics/datasets/dashboards, testing & validation layers, review cadences, quality dimensions & scorecards, lifecycle và maturity path từ BI nền tảng tới analytics nâng cao. [code_file:494]

### 2.2 Docs hỗ trợ

- **109_PACK07_ANALYTICS_EXECUTION_PROMPTS_LIBRARY**  
  Thư viện AG Execution Prompts cho Pack 07 – dùng khi cần refine chiến lược, schema, KPIs/dashboards, self-service model, governance & policies. [code_file:493]

## 3. Dùng Pack 07 như thế nào? – theo vòng đời analytics

### Bước 1 – Cố định chiến lược & trụ cột

- Đọc **100** để thống nhất thesis Pack 07 (BI & governed self-service trước, advanced analytics sau), các trụ cột và vị trí trong hệ. [code_file:478]  
- Xác định:  
  - wedges & roles nào cần ưu tiên (vd wedge core đầu tiên, SMEs Ops & CSM);  
  - level maturity hiện tại (Foundational BI hay đã tới Governed Self-Service) theo khung 105. [code_file:494]

**Output:** roadmap ngắn hạn cho Pack 07 (6–12 tháng), ưu tiên BI/self-service.

### Bước 2 – Thiết kế schema analytics

- Dùng **101** để thiết kế schema warehouse/lakehouse, quyết định facts/dims đầu tiên sẽ triển khai: work/SLA, exceptions, integrations, incidents & changes, adoption. [code_file:479]  
- Map events & entities từ Packs 02–06 vào schema này, đảm bảo grains & keys hỗ trợ KPIs 102. [code_file:421][code_file:429][code_file:431][code_file:436][code_file:451][code_file:452][code_file:453][code_file:454]

**Output:** data model triển khai thực tế (DDL/schema), pipelines mapping runtime → analytics.

### Bước 3 – Xây KPIs & dashboards chuẩn

- Dùng **102** để:  
  - chọn KPIs & dashboards quan trọng đầu tiên cho SME Ops, Internal Ops & CSM;  
  - thiết kế layout dashboards theo role, dựa trên schema 101. [code_file:480]  
- Đảm bảo metric definitions được ghi lại theo playbook 105 (Metric Definition Records). [code_file:494]

**Output:** bộ dashboards chuẩn version 1, dùng thử với một số wedges/tenants pilot.

### Bước 4 – Bật self-service có govern

- Dùng **103** để định nghĩa:  
  - roles self-service (Viewer/Explorer/Publisher/Curator) và mapping vào roles thực trong sản phẩm;  
  - subject-area datasets (Work & SLA, Exceptions, Integrations, Adoption, Customer Health) và ai được dùng dataset nào. [code_file:479][code_file:481]  
- Thiết lập workflow "Create → Team use → Submit for Certification → Certified" cho dashboards. [code_file:481]

**Output:** self-service layer cho SMEs & nội bộ, với guardrails rõ (không cross-tenant, không raw PII tràn lan).

### Bước 5 – Thiết lập governance & data policies

- Dùng **104** để align analytics với governance & risk:  
  - phân loại data analytics theo độ nhạy;  
  - quyết định access model cho SMEs vs nội bộ; [code_file:482]  
  - định nghĩa retention default cho từng nhóm dữ liệu;  
  - định nghĩa luật export/sharing với SMEs & bên thứ ba;  
  - kết nối xử lý incidents analytics với incident playbook 92 và customer comms 95. [code_file:452][code_file:455][code_file:482]

**Output:** bộ policies khả thi, có thể map vào tooling (permissions, masking, logging, retention jobs).

### Bước 6 – Vận hành analytics như sản phẩm sống

- Dùng **105** để:  
  - set up versioning model cho metrics/datasets/dashboards;  
  - tạo test & validation layers (data, metric, dashboard, permissions);  
  - thiết kế review cadence daily/weekly/monthly/quarterly cho analytics;  
  - thiết lập quality scorecards cho dashboards Certified. [code_file:494]  
- Kết nối analytics change với change governance Pack 06 (docs 93, 96). [code_file:453][code_file:456]

**Output:** analytics layer được quản như sản phẩm: có owner, version, review, change management, quality & maturity path rõ.

## 4. Ai nên dùng phần nào của Pack 07?

- **Data & Analytics Team**  
  - 101: design schema & pipelines; [code_file:479]  
  - 102: hợp tác với Product/Ops để chốt KPIs & dashboards; [code_file:480]  
  - 103: thiết kế self-service datasets & roles; [code_file:481]  
  - 104–105: policies, operations, quality. [code_file:482][code_file:494]

- **Product Leadership & Product Owners**  
  - 100: hiểu thesis & trụ cột Pack 07; [code_file:478]  
  - 102: định nghĩa KPIs & dashboards theo wedge; [code_file:480]  
  - 105: tham gia versioning metrics & review cadence, tránh metric sprawl. [code_file:494]

- **Ops & Support (Nextflow)**  
  - 102: dùng dashboards Platform & Integration Health, Ops Workload & Exceptions; [code_file:480]  
  - 103: hiểu self-service & cách đề xuất dashboards Certified; [code_file:481]  
  - 105: tham gia reviews, báo signals về metrics/dashboards gây hiểu nhầm. [code_file:494]

- **Customer Success (CSM)**  
  - 102: dùng Customer Health & Portfolio dashboards; [code_file:480]  
  - 103: dùng self-service để chuẩn bị reports/custom views cho khách; [code_file:481]  
  - 104: hiểu policies về sharing & exports; [code_file:482]  
  - 105: tham gia monthly reviews về dashboard hiệu quả trong customer conversations. [code_file:494]

- **Governance & Risk / Security**  
  - 104: thiết kế & duy trì data policies analytics; [code_file:482]  
  - 105: review changes liên quan metrics khách-facing, risk dashboards, retention & incidents analytics. [code_file:494]

- **Customers SMEs**  
  - 102: dùng dashboards chuẩn cho Ops & Leadership; [code_file:480]  
  - 103: dùng self-service workflows trong guardrails; [code_file:481]  
  - 104: hiểu high-level cách Nextflow dùng & bảo vệ dữ liệu analytics của họ. [code_file:482]

## 5. Liên kết Pack 07 với Packs 05–06

Pack 05 (Integration & Extensibility) và Pack 06 (Governance & Operations) là hai nguồn signals quan trọng cho Pack 07:

- Từ **Pack 05**:  
  - `fact_integration_call` & `fact_integration_daily_health` cho health & KPIs integration; [code_file:436][code_file:479]  
  - exceptions integration (83), pilots & go-live logs (87) cho dashboards pilot/post-go-live. [code_file:435][code_file:438]

- Từ **Pack 06**:  
  - incidents (92) & changes (93) vào facts incidents/changes; [code_file:452][code_file:453][code_file:479]  
  - BAU routines (94) sử dụng dashboards Pack 07; [code_file:454][code_file:480]  
  - governance & SLA (95) tiêu thụ reports & metrics từ Pack 07; [code_file:455]  
  - roles & RACI (96) áp dụng với analytics operations & governance. [code_file:456][code_file:494]

Như vậy, Pack 07 vừa **tiêu thụ** thông tin vận hành từ 05–06, vừa **cung cấp lại** insights & KPIs cho governance & integration reviews.

## 6. Điều kiện xem Pack 07 "đủ chín" để dùng rộng

Pack 07 được xem là đủ chín khi:

- Schema analytics (101) triển khai cho các facts/dims chính và đang được dùng thực tế. [code_file:479]  
- Dashboards chuẩn (102) đang được sử dụng trong BAU, incident reviews, customer reviews. [code_file:480]  
- Self-service (103) hoạt động: SMEs & nội bộ có thể tự tạo views trong guardrails, với phân biệt rõ Personal/Team/Certified. [code_file:481]  
- Data policies (104) được enforce trong tooling (permissions, masking, retention, logging). [code_file:482]  
- Analytics operations (105) đang chạy: versioning metrics/dashboards, testing & validation, review cadences, quality scorecards. [code_file:494]  
- Data & Product leadership có roadmap rõ để dần đưa Pack 07 từ Foundational BI lên Governed Self-Service và Diagnostic Analytics.

Khi các điều kiện này đạt, Pack 07 trở thành **lớp thần kinh** của Nextflow OS: mọi hành vi từ Packs 02–06 đều có "tín hiệu" và "câu chuyện" dễ hiểu cho SMEs và nội bộ.
