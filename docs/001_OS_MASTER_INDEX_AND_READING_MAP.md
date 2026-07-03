# Nextflow OS – Master Index and Reading Map

**Document ID:** 001_OS_MASTER_INDEX_AND_READING_MAP  
**Scope:** Cross-pack navigation layer for Packs 02–09 and future extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Documentation Ops  

## 1. Mục tiêu tài liệu

Tài liệu này là **master index** cho bộ tài liệu Nextflow OS: giúp người đọc biết bộ tài liệu hiện có những pack nào, mỗi pack trả lời câu hỏi gì, nên đọc theo thứ tự nào và ai nên đọc pack nào.

## 2. Cách dùng tài liệu này

Bạn có thể dùng master index theo ba cách:
- đọc theo **chiều dọc**: từ nền tảng lõi đến intelligence và ecosystem;  
- đọc theo **vai trò**: Product, Engineering, Data, Governance, Ecosystem, Tenant Admin;  
- đọc theo **mục tiêu**: thiết kế platform, vận hành governance, dựng analytics, bật intelligence, mở ecosystem.

## 3. Sơ đồ các pack hiện có

### Pack 02 – Core Platform & Data

Trả lời các câu hỏi nền tảng:
- tenant, users, roles, permissions là gì;  
- entities và contracts cốt lõi của OS là gì;  
- dữ liệu lõi được tổ chức như thế nào.

**Anchor docs đã có:**
- **10_PRODUCT_OVERVIEW**: Định nghĩa sản phẩm Nextflow OS.
- **11_CAPABILITY_MAP**: Sơ đồ phân rã năng lực.
- **12_ENGINE_BOUNDARY_SPECIFICATION**: Ranh giới của các core engines.
- **16_PACK02_CORE_DATABASE_SCHEMA_AND_DDL**: Đặc tả database PostgreSQL runtime vận hành.

**Nên đọc khi:** thiết kế platform foundations, identity, data contracts, multi-tenancy.

### Pack 03 – Experience & UX

Trả lời:
- trải nghiệm người dùng được tổ chức thành surfaces nào;  
- navigation, dashboards, panels và admin areas nên xuất hiện ra sao.

**Nên đọc khi:** thiết kế screens, workflows UX, dashboards surfaces, assistant entry points.

### Pack 04 – Orchestration & Work Management

Trả lời:
- work items, queues, routing, SLA, workflows và automation hoạt động thế nào.

**Nên đọc khi:** xây workflow engine, operational routing, queue management, SLA governance.

### Pack 05 – Integration & Extensibility

Trả lời:
- kết nối với hệ thống ngoài ra sao;  
- connectors, mappings, pilots, go-live, health & exceptions được govern thế nào.

**Anchor docs đã có:** các docs 82–88.
- **85_PACK05_API_REFERENCE_AND_CONNECTOR_DEVELOPMENT_SPEC**: Đặc tả API chi tiết và Connector Development Guide.

### Pack 06 – Governance & Operations

Trả lời:
- risk tiers, incidents, changes, BAU routines, SLAs, roles & RACI được định nghĩa thế nào.

**Anchor docs đã có:** 91–97.

### Pack 07 – Data, Analytics & Insights

Trả lời:
- data domain model và analytics schema là gì;  
- KPIs và dashboards chuẩn cho wedges/roles là gì;  
- self-service analytics, governance, quality, operations vận hành thế nào.

**Anchor docs đã có:** 100, 101, 102, 103, 104, 105, 107, 109.
- **106_PACK07_DATABASE_DDL_AND_SCHEMA_CREATION_SQL**: SQL Scripts khởi tạo DB vật lý.
- **108_PACK07_DATA_PIPELINE_ETL_AND_INGESTION_SPEC**: Quy trình CDC & pipelines ETL đồng bộ dữ liệu.

### Pack 08 – Advanced Intelligence, Recommendations and Assistants

Trả lời:
- intelligence use cases nào đáng làm cho SMEs;  
- feature layer, logic architecture, AI governance, assistant UX, model ops và maturity path ra sao.

**Anchor docs đã có:** 120, 121, 122, 123, 124, 125, 126, 127.
- **129B_PACK08_MODEL_PERFORMANCE_TESTING_AND_EVALUATION_METRICS**: Đo lường và đánh giá chất lượng mô hình AI.

### Pack 09 – Ecosystem, Marketplace and Extensions

Trả lời:
- extension/app model là gì;  
- marketplace catalog, partner program, UX, support/SLA và ecosystem governance hoạt động thế nào.

**Anchor docs đã có:** 140, 141, 142, 143, 144, 145, 147.
- **149_PACK09_DEVELOPER_QUICKSTART_AND_SDK_GUIDE**: Tài liệu Sandbox, SDK và App store submission checklist.

## 4. Reading paths theo vai trò

### 4.1 Product Leadership / Product Managers

Đọc theo thứ tự:
1. Pack 04 summary / core workflow docs  
2. Pack 06 summary  
3. Pack 07 summary & KPI docs  
4. Pack 08 overview, use cases, UX, summary  
5. Pack 09 overview, partner/governance, summary

### 4.2 Platform & Engineering

Đọc theo thứ tự:
1. Pack 02 foundations  
2. Pack 04 orchestration  
3. Pack 05 integrations  
4. Pack 06 governance ops  
5. Pack 07 schema & operations  
6. Pack 08 feature layer & logic architecture  
7. Pack 09 extension model, catalog model, ops

### 4.3 Data & Intelligence

Đọc theo thứ tự:
1. Pack 07 full set  
2. Pack 08 full set  
3. Pack 06 governance docs liên quan risk, incidents, change  
4. Pack 09 để hiểu marketplace assets và AI skills trong ecosystem

### 4.4 Governance & Risk / Security

Đọc theo thứ tự:
1. Pack 06 full set  
2. Pack 07 governance & data policies  
3. Pack 08 AI governance & ops  
4. Pack 09 partner program, catalog metadata, ecosystem ops

### 4.5 Ecosystem / Partnerships

Đọc theo thứ tự:
1. Pack 05 summary  
2. Pack 06 summary  
3. Pack 08 AI governance overview  
4. Pack 09 full set

### 4.6 Tenant Admins / SME Ops Leads

Đọc theo thứ tự:
1. Pack 06 summary  
2. Pack 07 dashboard & KPI docs  
3. Pack 08 summary and usage  
4. Pack 09 summary and marketplace UX

## 5. Reading paths theo mục tiêu

### Mục tiêu A – Xây nền tảng vận hành cốt lõi

Đọc Packs 02 → 04 → 05 → 06.

### Mục tiêu B – Bật lớp data & analytics

Đọc Pack 07 overview trước, sau đó 101 → 102 → 103 → 104 → 105 → 107.

### Mục tiêu C – Bật lớp intelligence & assistants

Đọc Pack 08 theo thứ tự: 120 → 121 → 122 → 123 → 124 → 125 → 126 → 127.

### Mục tiêu D – Mở ecosystem & marketplace

Đọc Pack 09 theo thứ tự: 140 → 141 → 142 → 143 → 144 → 145 → 147.

## 6. Recommended anchor docs

Nếu cần đọc nhanh toàn hệ, 10 tài liệu nên ưu tiên là:
1. Pack 06 summary and usage guide  
2. 100 Pack 07 overview and strategy  
3. 101 Pack 07 analytics schema  
4. 102 Pack 07 KPIs and dashboards  
5. 120 Pack 08 overview and strategy  
6. 121 Pack 08 intelligence use cases  
7. 124 Pack 08 AI governance  
8. 140 Pack 09 overview and strategy  
9. 141 Pack 09 extension and app model  
10. 147 Pack 09 summary and usage guide

## 7. Tài liệu bổ trợ cross-pack

Các tài liệu cross-pack nên tồn tại bên cạnh các pack chính:
- **002_OS_PRODUCTION_RULES_AND_DEVELOPMENT_LOG**: Quy tắc sản xuất phần mềm bất biến và Nhật ký phát triển thực tế.
- **003_OS_PRODUCTION_PHASE_1_IMPLEMENTATION_PLAN**: Kế hoạch sản xuất chi tiết cho Lát cắt năng lực 1.
- **004_OS_MASTER_PRODUCTION_ROADMAP**: Lộ trình sản xuất tổng thể gồm 8 giai đoạn từ Core API đến DevOps Go-Live.
- Global Glossary and Naming Conventions  - SME End-User Operational Playbook (150)
- Master Index and Reading Map  
- AI Use Case Record Template  
- Asset Listing and Review Checklist  
- Prompt libraries cho analytics, intelligence và ecosystem

## 8. Điều kiện hoàn thành của tài liệu

Master Index được xem là đạt yêu cầu khi:
- người đọc mới có thể biết bắt đầu từ đâu;  
- từng vai trò có reading path rõ;  
- các pack 05–09 được kết nối thành một hệ mạch lạc thay vì các tài liệu rời.
