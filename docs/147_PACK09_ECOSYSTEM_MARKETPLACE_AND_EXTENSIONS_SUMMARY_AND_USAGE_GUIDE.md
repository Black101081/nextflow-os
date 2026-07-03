# Nextflow OS – Pack 09 Ecosystem, Marketplace and Extensions Summary and Usage Guide

## Cross-pack references

- Xem **000 Global Glossary and Naming Conventions** để hiểu các thuật ngữ extension, app, asset, pack, listing, vendor.
- Xem **001 OS Master Index and Reading Map** để thấy vị trí Pack 09 trong toàn bộ OS.
- Sử dụng **129 Pack 08 AI Use Case Record Template** cho các AI skills hoặc assistants được đóng gói thành assets.
- Sử dụng **146 Pack 09 Asset Listing and Review Checklist** khi chuẩn bị hoặc review một asset marketplace.
- Tham khảo **128 Pack 08 Intelligence Execution Prompts Library** nếu muốn dùng intelligence để đánh giá/ecosystem health.
- Tham khảo **148 Pack 09 Ecosystem and Marketplace Execution Prompts Library** cho tenant admins, Ecosystem team và partners khi làm việc với marketplace.

**Document ID:** 147_PACK09_ECOSYSTEM_MARKETPLACE_AND_EXTENSIONS_SUMMARY_AND_USAGE_GUIDE  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Ecosystem & Partnerships / Platform  

## 1. Pack 09 nói về điều gì?

Pack 09 định nghĩa **Ecosystem, Marketplace and Extensions Layer** của Nextflow OS – lớp biến Nextflow từ một sản phẩm đơn lẻ thành một **nền tảng có hệ sinh thái**, nơi Nextflow, partners và customers có thể xây, publish, cài đặt và vận hành các extensions, apps và packs một cách an toàn, governed và có giá trị. [code_file:534]

Nếu Packs 02–08 trả lời:
- chúng ta có core platform, workflows, integrations, governance, analytics & intelligence gì; [code_file:479][code_file:480][code_file:451][code_file:482][code_file:506][code_file:507][code_file:509]  
…thì Pack 09 trả lời:

> **Làm sao mở rộng Nextflow ra bên ngoài – cho phép các building blocks (connectors, workflows, dashboards, AI skills, vertical packs) được build & chia sẻ – mà vẫn giữ được multi-tenant isolation, data policies, risk tiers, SLA, UX & AI governance?** [code_file:451][code_file:482][code_file:510][code_file:534]

Pack 09 tập trung vào ba câu hỏi:
- Một **extension/app** trong Nextflow là gì, có thể làm gì, boundaries & permissions ra sao? (141) [code_file:535]  
- Một **asset trên marketplace** được mô tả, tìm kiếm, publish thế nào, và ai được publish? (142, 143, 144) [code_file:536][code_file:537][code_file:538]  
- Marketplace & ecosystem được **vận hành & support** ra sao, SLA & incidents thế nào? (145) [code_file:539]

## 2. Các tài liệu trong Pack 09

### 2.1 Docs khung & model kỹ thuật

- **140_PACK09_ECOSYSTEM_AND_MARKETPLACE_OVERVIEW_AND_STRATEGY**  
  Định vị Pack 09: Ecosystem & Marketplace là gì, thesis (curated, governed, composable), nguyên lý (governed openness, tenant isolation, marketplace như một product), các loại assets, trụ cột (extension model, catalog, partner program, UX, ops), và cấu trúc docs 09. [code_file:534]

- **141_PACK09_EXTENSION_AND_APP_MODEL_SPEC**  
  Định nghĩa "extension/app" trong Nextflow: capabilities (UI, workflow hooks, integrations, analytics, AI skills), boundaries (sandbox, scoped, contract-first), manifest & packaging (id, version, type, capabilities, permissions, tenant_scope, required_core_version, risk_profile, config_schema, support), permission scopes & tenant isolation, lifecycle & versioning, observability & logging. [code_file:535]

### 2.2 Catalog, partner program & UX

- **142_PACK09_MARKETPLACE_CATALOG_AND_LISTING_MODEL**  
  Định nghĩa Asset Record trong marketplace: identity, technical metadata, business & governance metadata (risk_level, data_classes_accessed, ai_involved, support_model, sla_summary), commercial metadata, operational & analytics metadata, UX metadata; listing states (draft, under_review, private, public, deprecated, EoL); visibility & eligibility per tenant (region, plan, risk policy, roles); search/filters, curated collections, recommended assets; quan hệ asset ↔ extensions, analytics hooks. [code_file:536]

- **143_PACK09_PARTNER_AND_DEVELOPER_PROGRAM_AND_GOVERNANCE**  
  Phân loại partners & developers (first-party, strategic partners, solution partners, community), yêu cầu chung (security, data handling, quality, docs, support), governance process (onboarding, asset submission & review, approval & listing, periodic audits), risk tiers & policies cho assets, trách nhiệm support & incidents, compliance/legal requirements, incentives & metrics cho partners. [code_file:537]

- **144_PACK09_MARKETPLACE_UX_AND_DISCOVERY_GUIDELINES**  
  UX patterns cho marketplace: marketplace hub (admin-first), in-context discovery (Integration, Automation, Analytics, AI settings), browsing & search (cards, filters, sort), asset detail page (What it does, Capabilities, Data & permissions, Risk & governance, Support & SLA, Screenshots & docs), install & config flows, managing installed assets (updates, deprecation), analytics & feedback (usage, incidents, ratings), recommendations UX (powered by Pack 08), admin policies UI (marketplace on/off, risk thresholds, vendor filters). [code_file:538]

### 2.3 Operations & playbook

- **145_PACK09_ECOSYSTEM_OPERATIONS_SUPPORT_AND_SLA_PLAYBOOK**  
  Playbook vận hành ecosystem: support model (who supports what cho first-party/partner/community assets; types of issues), ticket & incident routing (L1, partner handoff, security/data incidents theo 06–92), SLA expectations (Nextflow vs partner vs community), monitoring & health (fact_asset_install, fact_asset_usage, fact_asset_incident, dashboards cho Ecosystem, Governance, Partners), deprecation & sunsetting (status, comms, migration, EoL), kill switches & safety levers, liên kết với AI governance (AI Use Case Records, AI-specific monitoring & incidents), phân vai Ecosystem/Support/Governance/Product/Engineering/Partners. [code_file:539]

## 3. Dùng Pack 09 như thế nào? – theo góc nhìn tenant admin & product/ecosystem

### 3.1 Đối với tenant admin – sử dụng marketplace an toàn

Tenant admin có thể dùng Pack 09 theo flow:

1) **Hiểu marketplace & policies**  
   - Từ doc 140, hiểu mục tiêu: marketplace là catalog curated, không phải chợ app mở tràn lan; assets luôn nằm trong governance & data policies. [code_file:534]  
   - Dùng doc 144 để biết marketplace hub ở đâu, AI & risk badges nghĩa là gì, cách đọc asset listing detail. [code_file:538]

2) **Thiết lập policies**  
   - Sử dụng UI policy trong 144 để:  
     - bật/tắt marketplace;  
     - giới hạn asset types (vd không cho AI skills ban đầu);  
     - đặt risk thresholds (only ≤ Medium, require approval for High);  
     - giới hạn vendor (chỉ first-party & strategic partners). [code_file:451][code_file:510][code_file:536][code_file:538]

3) **Đánh giá & cài assets**  
   - Đọc listing detail (142 + 144):  
     - What it does (value & use cases);  
     - Capabilities (UI, workflows, connectors, analytics, AI); [code_file:535][code_file:538]  
     - Data & permissions (data_classes_accessed, permission scopes, external services); [code_file:482][code_file:535][code_file:536]  
     - Risk & governance (risk_level, AI involvement, policies); [code_file:451][code_file:510][code_file:536]  
     - Support & SLA (Nextflow vs partner vs community). [code_file:536][code_file:537][code_file:455]
   - Chỉ cài assets phù hợp policies & risk appetite của tổ chức.

4) **Quản lý assets đã cài**  
   - Dùng Installed assets view (144) để xem:  
     - assets active/misconfigured/deprecated;  
     - versions, updates;  
     - risk badges & data access. [code_file:536][code_file:538]  
   - Xem usage & health (145) để quyết định giữ/bỏ/migrate; [code_file:479][code_file:480][code_file:452][code_file:536][code_file:539]  
   - Dùng kill switches hoặc disable khi asset gây vấn đề (theo playbook 145). [code_file:539]

### 3.2 Đối với Product/Ecosystem – thiết kế & vận hành ecosystem

Product & Ecosystem teams dùng Pack 09 để:

1) **Định nghĩa asset types & extension model**  
   - Dùng 140 & 141 để phân loại assets (connector packs, automation templates, dashboard packs, AI skills, UI extensions, vertical packs) và capabilities (UI, workflows, integrations, analytics, AI). [code_file:534][code_file:535]

2) **Xây catalog & listing**  
   - Dùng 142 để thiết kế catalog schema & listing model: Asset Record fields, listing states, visibility rules, search & filters, curated collections, recommended assets. [code_file:536]

3) **Thiết kế chương trình partner/developer & governance**  
   - Dùng 143 để phân loại partners, yêu cầu, onboarding & asset review flow, periodic audits, risk tiers & policies, support & incident responsibilities. [code_file:537]

4) **Thiết kế UX marketplace & discovery**  
   - Dùng 144 cho marketplace hub, in-context discovery, listing/detail/install/config UX, admin policies UI, recommendations UX. [code_file:538]

5) **Thiết kế ops, SLAs & monitoring**  
   - Dùng 145 để triển khai support model, ticket routing, SLA contracts, monitoring dashboards, deprecation & sunsetting, kill switches, AI-specific monitoring. [code_file:539]

## 4. Ai dùng phần nào trong Pack 09?

- **Tenant admins & IT/ops trong SMEs**  
  - 140: hiểu triết lý ecosystem & marketplace và phạm vi. [code_file:534]  
  - 142: hiểu metadata quan trọng (risk_level, data_classes_accessed, support_model). [code_file:536]  
  - 144: biết cách dùng marketplace, đọc listings, cài & quản lý assets, set policies. [code_file:538]  
  - 145: hiểu support/incident/SLA & kill switches. [code_file:539]

- **Product & Ecosystem PMs**  
  - 140: định hướng chiến lược ecosystem. [code_file:534]  
  - 141: làm việc với Platform để mở capabilities đúng hướng. [code_file:535]  
  - 142: quyết định structure catalog & discovery. [code_file:536]  
  - 143: define partner program & governance. [code_file:537]  
  - 144: dẫn dắt UX; 145: agree ops & SLAs. [code_file:538][code_file:539]

- **Platform & Extensibility Engineering**  
  - 141: implement extension APIs, manifest model, permission & tenant isolation. [code_file:535]  
  - 142: implement catalog, listing states, relationships & search APIs. [code_file:536]  
  - 145: build monitoring, kill switches, logging hooks. [code_file:539]

- **Governance & Risk / Security**  
  - 140–143: define policies & review processes; [code_file:534][code_file:537]  
  - 142: sử dụng risk/data/AI metadata để govern; [code_file:536]  
  - 145: oversee incidents, deprecation, kill switches. [code_file:451][code_file:452][code_file:482][code_file:510][code_file:512][code_file:539]

- **Partners & Developers**  
  - 140: hiểu role trong ecosystem; [code_file:534]  
  - 141: biết cách thiết kế extension đúng contract; [code_file:535]  
  - 143: biết yêu cầu chương trình partner, review, responsibilities & incentives; [code_file:537]  
  - 142, 144: biết asset sẽ xuất hiện thế nào trên marketplace & cần cung cấp metadata/UX gì. [code_file:536][code_file:538]

## 5. Liên kết Pack 09 với Packs 05–08

- Với **Pack 05 (Integration & Extensibility)**  
  - Connector packs và integration bundles là một trong các asset types chính; extension model 141 reuse primitives của Pack 05; support & incidents cho connectors map vào 145 + 06–92. [code_file:431][code_file:435][code_file:437][code_file:438][code_file:452][code_file:539]

- Với **Pack 06 (Governance & Operations)**  
  - Risk tiers 91, incidents 92, changes 93, BAU 94, SLAs 95 được áp dụng cho assets & marketplace (risk_level, incident handling, listing changes, support expectations). [code_file:451][code_file:452][code_file:453][code_file:454][code_file:455][code_file:456][code_file:536][code_file:537][code_file:539]

- Với **Pack 07 (Data, Analytics & Insights)**  
  - Analytics layer theo dõi installs/usage/incidents cho assets (fact_asset_install, fact_asset_usage, fact_asset_incident) và cung cấp dashboards cho Ecosystem/Governance/Partners. [code_file:479][code_file:480][code_file:508][code_file:536][code_file:539]

- Với **Pack 08 (Intelligence & Assistants)**  
  - AI skills & assistants có thể được publish như assets; AI governance 124 & ops 126 áp dụng cho ai_skill assets; recommendations trong marketplace ("Recommended for you") dùng engines từ Pack 08, trong guardrails policy & risk. [code_file:507][code_file:509][code_file:510][code_file:512][code_file:513][code_file:538][code_file:539]

## 6. Khi nào nên bật mạnh Pack 09?

Pack 09 (ecosystem & marketplace) nên được triển khai đầy đủ khi:
- Core extensibility & integrations (Pack 05) đủ ổn định: connector model, mapping & retries rõ, có monitoring. [code_file:431][code_file:435][code_file:437][code_file:438][code_file:479]  
- Governance & risk (Pack 06) vận hành trơn tru: risk tiers, incidents, change management & BAU rõ ràng. [code_file:451][code_file:452][code_file:453][code_file:454][code_file:455][code_file:456]  
- Analytics & intelligence (Packs 07–08) đủ mature để đo usage & quality, và để hỗ trợ curated recommendations cho marketplace. [code_file:479][code_file:480][code_file:494][code_file:506][code_file:507][code_file:508][code_file:509][code_file:512][code_file:513]  
- Đội ngũ Ecosystem & Partnerships có bandwidth để curate assets, run partner program & vận hành support/ops và review.

Khi các điều kiện này đạt, Pack 09 cho phép Nextflow OS chuyển từ "một sản phẩm" sang "một nền tảng" với hệ sinh thái quản trị chặt chẽ: SMEs không chỉ dùng những gì Nextflow build, mà còn có thể lắp ghép connectors, flows, dashboards, AI skills & vertical packs từ partners & cộng đồng – nhưng luôn trong các đường ray về data, risk, SLA & UX đã được thiết kế trong Packs 05–08.

## 8. Illustrative scenario – B2B SaaS CS team và Marketplace (Pack 09)

Tiếp tục cùng công ty B2B SaaS CS: sau khi đã dùng tốt analytics (Pack 07) và intelligence (Pack 08), họ muốn tận dụng marketplace để mở rộng nhanh.

- Tenant admin dùng prompts trong **148** để khám phá assets phù hợp với ngành B2B SaaS và wedge CS (dashboard packs, connectors, CS assistants).  
- Họ dùng **000** và docs Pack 07/08 để hiểu rõ asset nào dựa trên schema & use cases chuẩn, tránh trùng lặp hoặc xung đột.  
- Trước khi cài, admin dùng checklist **146** để review listing: dữ liệu truy cập, risk level, vendor, support model, kế hoạch gỡ/migration.  
- Với các assets có AI (assistants, recs), Product & Governance dùng template **129** để tạo AI Use Case Record tương ứng.  
- CS team được hướng dẫn prompts từ **128** và **148** để tận dụng các assets mới trong công việc hàng ngày.  
- Ecosystem/Partnerships theo dõi performance assets và feedback theo Pack 09; nếu một CS assistant asset hoạt động tốt, họ có thể đề xuất đưa vào vertical pack chuẩn cho các tenants B2B SaaS khác.

