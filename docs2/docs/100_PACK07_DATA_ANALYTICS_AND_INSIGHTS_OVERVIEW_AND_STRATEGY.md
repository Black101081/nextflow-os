# Nextflow OS – Pack 07 Data, Analytics and Insights Overview and Strategy

## Cross-pack references

- Xem **000 Global Glossary and Naming Conventions** để tra cứu thuật ngữ (tenant, wedge, fact, metric, KPI, insight...).
- Xem **001 OS Master Index and Reading Map** để biết vị trí Pack 07 trong toàn bộ Nextflow OS.

**Document ID:** 100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Data & Analytics / Governance & Risk  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations  

## 1. Mục tiêu Pack 07

Pack 07 định nghĩa **chiến lược Data, Analytics và Insights** cho Nextflow OS – cách chúng ta biến mọi hoạt động (tasks, cases, SLA, exceptions, integrations, incidents, BAU) thành **signals, dashboards, reports và insights** phục vụ SMEs, Product và Operations.

Nếu Packs 02–06 trả lời “Nextflow **là gì**, **làm gì** và **được govern & vận hành thế nào**”, thì Pack 07 trả lời:

> **Chúng ta đo lường thế nào, nhìn thấy gì, hiểu được gì từ những hoạt động đó – và ai có thể tự khám phá, đặt câu hỏi và ra quyết định dựa trên dữ liệu ra sao, mà vẫn trong guardrails phù hợp với SMEs?**

Mục tiêu cụ thể:
- định nghĩa **data & analytics domain model** dựa trên semantics Packs 02–06;  
- định nghĩa **bộ KPIs & dashboards chuẩn** cho SMEs, Ops, CS, Product & Governance;  
- thiết kế **mô hình self-service analytics có govern** – ai được dùng dataset nào, tạo và chia sẻ dashboard/report ra sao;  
- đặt nền cho các **analytics nâng cao & ML** trong tương lai, nhưng ưu tiên BI & self-service trước;  
- đảm bảo mọi thứ phù hợp với **data governance & risk** đã đặt trong Pack 06.

## 2. Thesis về Data & Analytics trong Nextflow OS

Thesis có thể phát biểu như sau:

> **SMEs không thiếu dữ liệu – họ thiếu một cách nhìn đơn giản, nhất quán và gắn với hành động. Nextflow không cố xây một data lake "vạn năng" khó dùng, mà xây một lớp "Signals & Insights" dựa trên semantics work, integration và governance đã có, để SMEs và nội bộ có thể nhìn cùng một bức tranh và ra quyết định nhanh hơn, an toàn hơn.**

Nguyên lý:

1. **Actionable-first** – ưu tiên metrics & dashboards mà SMEs và Ops có thể chuyển thành hành động cụ thể: đổi routing, chỉnh SLA, sửa mapping, thêm automation, nói chuyện với khách.  
2. **Semantics reuse** – domain model analytics phải dùng lại khái niệm task/case, SLA, exception, queue, integration, incident, risk tier, change… thay vì tạo khái niệm mới.  
3. **Governed self-service** – SMEs và nội bộ có thể tự kéo số và tạo dashboard, nhưng trong guardrails: datasets chuẩn, roles & permissions, review/publishing flow.  
4. **Privacy- & risk-aware** – data analytics phải tuân theo policies học từ Pack 06: data sensitivity, tenant isolation, risk tiers, access controls.  
5. **Incremental maturity** – bắt đầu từ reporting & monitoring cơ bản, rồi dần dần tăng maturity (segmentation, cohort, forecasting, recommendations).  
6. **One backbone, many views** – một data backbone chuẩn, nhiều views (internal + customer-facing) được build từ đó.

## 3. Vị trí Pack 07 trong tổng thể Nextflow OS

### 3.1 Liên kết với Packs 02–06

- **Pack 02 – Core Platform & Data**  
  - Cung cấp schema gốc, multi-tenant model, entity & relationship (tasks, cases, parties, products…).  
  - Pack 07 dựa vào đây để định nghĩa data warehouse/lakehouse schema và data contracts core.

- **Pack 03 – Experience & UX**  
  - Định nghĩa các views & surfaces cho signals: dashboards, control views, status components.  
  - Pack 07 dùng các surfaces này để bề mặt hóa insights cho SMEs, Ops, CS & internal.  

- **Pack 04 – Orchestration & Work Management**  
  - Định nghĩa lifecycle, SLA, priority, exceptions, queues, routing, automation levels.  
  - Đây là *nguồn chính* cho metrics work, SLA, efficiency, exception patterns.

- **Pack 05 – Integration & Extensibility**  
  - Cung cấp events & metrics integration: inbound/outbound volumes, error/retry, mapping, reconciliation, pilot/go-live.  
  - Pack 07 chuyển chúng thành integration KPIs và health dashboards sâu hơn.

- **Pack 06 – Governance & Operations**  
  - Định nghĩa incident, change, BAU, risk tiers, roles & RACI, SLA model.  
  - Pack 07 dùng chúng để xây **governance & ops analytics**: incident trends, change risk, adherence to BAU & SLA.

### 3.2 Đối tượng chính của Pack 07

- Data & Analytics team – thiết kế data model, pipelines, metrics definitions, dashboards.  
- Product & Strategy – dùng insights để quyết định roadmap, wedges, pricing, UX changes.  
- Ops & CS – dùng dashboards để vận hành và nói chuyện với khách.  
- Governance & Risk – dùng metrics risk & compliance để điều chỉnh policies.  
- Customers SMEs – dùng customer-facing dashboards & reports để điều hành business của họ.

## 4. Các trụ cột của Pack 07

Pack 07 tập trung vào 5 trụ cột chính (ưu tiên BI/self-service, sau đó là analytics nâng cao):

1. **Data & Analytics Domain Model** – fact/dimension model cho work, SLA, exceptions, integrations, incidents, changes, usage.  
2. **Core KPIs & Standard Dashboards** – bộ số & views chuẩn cho SMEs, Ops, CS, Product, Governance.  
3. **Governed Self-Service Analytics** – roles, datasets, tooling & process để mọi người tự phân tích trong guardrails.  
4. **Analytics Governance & Data Policies** – access, privacy, retention, data sharing, alignment với risk tiers.  
5. **Analytics Operations & Maturity** – versioning, quality, review cadence, roadmap nâng cao (ML/AI) sau này.

Các docs cụ thể của Pack 07 sẽ map vào từng trụ cột này.

## 5. Phác thảo cấu trúc tài liệu Pack 07

Đề xuất các docs chính:

1. **100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY** (tài liệu hiện tại)  
   - Thesis, nguyên lý, trụ cột, vị trí Pack 07.

2. **101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA**  
   - Định nghĩa mô hình fact/dimension;  
   - mapping từ models Pack 02–06 sang warehouse/lakehouse.  

3. **102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE**  
   - Bộ KPIs & dashboards chuẩn: SMEs ops, leadership SME, internal Ops, CS, Product, Governance.

4. **103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL**  
   - Roles, datasets, permissions;  
   - publishing & review flow;  
   - guardrails cho self-service BI.

5. **104_PACK07_ANALYTICS_GOVERNANCE_AND_DATA_POLICIES**  
   - Data governance cho analytics: data access, privacy, retention, sharing với khách.  

6. **105_PACK07_ANALYTICS_OPERATIONS_VERSIONING_AND_QUALITY_PLAYBOOK**  
   - Versioning metrics & dashboards;  
   - testing & validation;  
   - review cadence;  
   - path nâng maturity (tới advanced analytics/ML).

Nếu sau này bạn muốn thêm ML/AI:  
7. **106_PACK07_ADVANCED_ANALYTICS_AND_ML_USE_CASES_AND_GUARDRAILS**  
   - Catalog use case ML;  
   - guardrails, fairness, monitoring;  
   - connection sang automation & orchestration.

## 6. Cách Pack 07 kết nối với BI & self-service hiện tại

Ở giai đoạn đầu, Pack 07 sẽ tập trung vào:

- Đảm bảo rằng dữ liệu **work, SLA, exceptions, integrations, incidents, changes**  
  - được thu thập đầy đủ, chuẩn hoá;  
  - có schemas rõ;  
  - có lineage từ sản phẩm (Packs 02–06) sang analytics.  

- Xây **bộ dashboards chuẩn** cho các roles chính:  
  - SMEs operations;  
  - SMEs leadership;  
  - internal Ops/CS;  
  - Product;  
  - Governance & Risk.  

- Thiết kế **mô hình self-service BI**:  
  - datasets nào cho phép SME tự explore;  
  - dataset nào chỉ internal;  
  - ai được publish dashboards cho nhiều người;  
  - quy trình review & certify dashboards quan trọng.

Pack 07 không cố định nghĩa tool cụ thể (vd: dbt, Snowflake, BigQuery, Power BI…), mà tập trung vào **khung khái niệm & trách nhiệm**, để sau này mapping sang bất kỳ stack nào.

## 7. Liên kết Pack 07 với governance & risk (Pack 06)

Pack 07 phải respect và hỗ trợ Pack 06:

- Risk tiers (91) ảnh hưởng tới:  
  - cách log & aggregate data;  
  - ai được xem metrics liên quan flows Tier 3–4;  
  - cách expose dữ liệu integration high-risk cho khách.  

- Incident & change analytics:  
  - doc 92–93 cung cấp events & metadata để tính KPIs về stability & change impact;  
  - Pack 07 thiết kế cách surface chúng: incident rate, MTTR, change failure rate…

- BAU & SLA (94–95):  
  - Pack 07 cung cấp dữ liệu & dashboards để chạy BAU reviews (94) và làm reports SLA (95);  
  - alignment giữa internal signals và customer-facing reports.

## 8. Bước tiếp theo sau doc 100

Sau khi doc 100 được chốt, các bước tiếp theo cho Pack 07:

1. Soạn **101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA** – định nghĩa tables chính (facts/dimensions), keys, grain, mappings từ events & entities Packs 02–06.  
2. Soạn **102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE** – bắt đầu từ vài wedges tiêu biểu và roles core (Ops, CS, SMEs leadership).  
3. Soạn **103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL** – roles & process, bảo đảm SMEs có thể self-service mà không phá governance.  
4. Sau đó, tiến tới **104–105** về data governance & analytics operations.

Doc 100 là bản đồ để đảm bảo Pack 07 đi đúng mạch: từ semantics & governance đã có, sang layer data & analytics rõ ràng, ưu tiên BI & self-service, và sẵn sàng cho nâng cấp ML/AI sau này.