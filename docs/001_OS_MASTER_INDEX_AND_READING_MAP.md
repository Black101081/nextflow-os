# Nextflow OS – Master Index and Reading Map

**Document ID:** 001_OS_MASTER_INDEX_AND_READING_MAP  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Architecture / PMO  

## Cross-pack references

- Xem **000 Global Glossary and Naming Conventions** để tra cứu thuật ngữ chuẩn.

## 1. Mục tiêu

Tài liệu này là **"bản đồ tổng thể"** của Nextflow OS:

- Liệt kê các packs chính (02–09) và câu hỏi mà mỗi pack trả lời.  
- Chỉ ra các tài liệu "anchor" nên đọc trước.  
- Đề xuất lộ trình đọc theo **vai trò** và **mục tiêu** (onboard, thiết kế, triển khai, vận hành).  

## 2. Danh sách packs chính

| Pack | Tên | Câu hỏi trả lời |
|------|-----|----------------|
| 02 | Foundations | Kiến trúc và thiết kế platform core |
| 03 | Data Foundations | Data platform, ingestion, storage |
| 04 | Work & Workflow | Model hoá work items, workflows, SLAs |
| 05 | Governance & Compliance | Policies, controls, audit |
| 06 | Risk, Incidents & Changes | Quản lý sự cố, rủi ro, thay đổi |
| 07 | Data, Analytics & Insights | Schema analytics, KPIs, dashboards |
| 08 | Intelligence, Recommendations & Assistants | Use cases AI, feature layer, governance, UX |
| 09 | Ecosystem, Marketplace & Extensions | Extension model, catalog, partner program, marketplace |

## 3. Anchor docs nên đọc

### Nếu cần overview nhanh toàn hệ

1. `100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY.md`  
2. `120_PACK08_INTELLIGENCE_OVERVIEW_AND_STRATEGY.md`  
3. `140_PACK09_ECOSYSTEM_AND_MARKETPLACE_OVERVIEW_AND_STRATEGY.md`  
4. Summary docs:
   - `107_PACK07_DATA_ANALYTICS_AND_INSIGHTS_SUMMARY_AND_USAGE_GUIDE.md`
   - `127_PACK08_INTELLIGENCE_SUMMARY_AND_USAGE_GUIDE.md`
   - `147_PACK09_ECOSYSTEM_MARKETPLACE_AND_EXTENSIONS_SUMMARY_AND_USAGE_GUIDE.md`
5. Cross-pack:
   - `000_GLOBAL_GLOSSARY_AND_NAMING_CONVENTIONS.md`
   - `001_OS_MASTER_INDEX_AND_READING_MAP.md` (tài liệu này)

## 4. Reading map theo vai trò

### 4.1 Product Manager / Product Leadership

- `100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY.md`
- `120_PACK08_INTELLIGENCE_OVERVIEW_AND_STRATEGY.md`
- `140_PACK09_ECOSYSTEM_AND_MARKETPLACE_OVERVIEW_AND_STRATEGY.md`
- `102_PACK07_METRICS_KPIS_AND_DASHBOARDS_BY_ROLE_AND_WEDGE.md`
- `121_PACK08_INTELLIGENCE_USE_CASES_FOR_SMES.md`
- `143_PACK09_PARTNER_PROGRAM_AND_TIERS.md`

### 4.2 Data & Intelligence

- `101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA.md`
- `104_PACK07_DATA_POLICIES_QUALITY_AND_GOVERNANCE.md`
- `122_PACK08_FEATURE_LAYER_AND_SIGNAL_ARCHITECTURE.md`
- `123_PACK08_MODEL_AND_LOGIC_ARCHITECTURE.md`
- `124_PACK08_AI_GOVERNANCE_AND_RISK_MANAGEMENT.md`
- `126_PACK08_INTELLIGENCE_OPERATIONS_AND_MATURITY_MODEL.md`
- `129_PACK08_AI_USE_CASE_RECORD_TEMPLATE.md`

### 4.3 CS / Ops / CSM (front-line)

- `107_PACK07_DATA_ANALYTICS_AND_INSIGHTS_SUMMARY_AND_USAGE_GUIDE.md`
- `127_PACK08_INTELLIGENCE_SUMMARY_AND_USAGE_GUIDE.md`
- `147_PACK09_ECOSYSTEM_MARKETPLACE_AND_EXTENSIONS_SUMMARY_AND_USAGE_GUIDE.md`
- `109_PACK07_ANALYTICS_EXECUTION_PROMPTS_LIBRARY.md`
- `128_PACK08_INTELLIGENCE_EXECUTION_PROMPTS_LIBRARY.md`
- `148_PACK09_ECOSYSTEM_AND_MARKETPLACE_EXECUTION_PROMPTS_LIBRARY.md`

### 4.4 Governance, Risk, Security

- `104_PACK07_DATA_POLICIES_QUALITY_AND_GOVERNANCE.md`
- `124_PACK08_AI_GOVERNANCE_AND_RISK_MANAGEMENT.md`
- `145_PACK09_MARKETPLACE_OPERATIONS_AND_SLA.md`
- `146_PACK09_ASSET_LISTING_AND_REVIEW_CHECKLIST.md`

### 4.5 Ecosystem / Partnerships / Tenant Admin

- `140_PACK09_ECOSYSTEM_AND_MARKETPLACE_OVERVIEW_AND_STRATEGY.md`
- `141_PACK09_EXTENSION_MODEL_AND_RUNTIME.md`
- `142_PACK09_CATALOG_MODEL_AND_METADATA.md`
- `143_PACK09_PARTNER_PROGRAM_AND_TIERS.md`
- `144_PACK09_MARKETPLACE_UX_AND_POLICIES.md`
- `145_PACK09_MARKETPLACE_OPERATIONS_AND_SLA.md`
- `146_PACK09_ASSET_LISTING_AND_REVIEW_CHECKLIST.md`
- `148_PACK09_ECOSYSTEM_AND_MARKETPLACE_EXECUTION_PROMPTS_LIBRARY.md`

## 5. Reading map theo mục tiêu

### 5.1 Bật Analytics cho một wedge

Đọc: `100`, `101`, `102`, `103`, `104`, `105`, `107`, `109`.  
Thực thi: thiết lập schema, KPIs, dashboards, self-service, ops & runbook.

### 5.2 Bật Intelligence (AI) cho một wedge

Đọc: `120`, `121`, `122`, `123`, `124`, `125`, `126`, `127`, `128`, `129`.  
Thực thi: chọn use cases, thiết kế feature layer & models, định nghĩa governance & UX, thiết lập monitoring.

### 5.3 Mở Ecosystem / Marketplace

Đọc: `140`, `141`, `142`, `143`, `144`, `145`, `146`, `147`, `148`.  
Thực thi: thiết kế extension model, quản lý catalog & partner, set marketplace policies, review assets, vận hành marketplace.

## 6. Điều kiện hoàn thành

Master Index được xem là đủ khi:

- Mọi pack chính đều có anchor docs rõ.  
- Mỗi vai trò biết mình nên đọc gì trước.  
- Mọi doc mới đều được thêm vào phần index tương ứng (Pack, Role, Goal).  
