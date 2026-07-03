# Nextflow OS – Pack 09 Marketplace Catalog and Listing Model

**Document ID:** 142_PACK09_MARKETPLACE_CATALOG_AND_LISTING_MODEL  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Ecosystem & Partnerships / Platform  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Advanced Intelligence, 09 Overview (140), 09 Extension Model (141)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Marketplace Catalog and Listing Model** cho Pack 09 – cách các assets (extensions, apps, packs) được mô tả, tổ chức, tìm kiếm, version và publish trong marketplace của Nextflow OS.

Mục tiêu:
- định nghĩa **catalog schema** cho assets trong marketplace (metadata, types, states, relationships); [code_file:534][code_file:535]  
- mô tả **listing lifecycle** (draft, private, public, deprecated) và các trạng thái liên quan;  
- xác định **cách tenants & admins nhìn thấy assets** (eligibility, filters, recommendations);  
- đảm bảo model này phục vụ tốt governance (Pack 06), analytics (Pack 07) và intelligence (Pack 08).

## 2. Nguyên tắc thiết kế catalog & listing

1. **Clarity for customers** – SMEs & admins phải dễ dàng hiểu một asset là gì, làm được gì, ai là vendor, risk & support ra sao.  
2. **Governance-aware** – metadata phải đủ để risk tiers, data policies, AI governance có thể áp dụng. [code_file:451][code_file:482][code_file:510]  
3. **Searchable & discoverable, not overwhelming** – ưu tiên cấu trúc & filters tốt hơn là số lượng assets khổng lồ.  
4. **Versioned & traceable** – mỗi listing có history versions & states rõ ràng, hỗ trợ ops & incident analysis. [code_file:453][code_file:494]  
5. **Multi-tenant friendly** – catalog chung nhưng mỗi tenant có view riêng (eligible assets theo region, plan, risk policy…). [code_file:479][code_file:451]

## 3. Catalog schema – Asset record

Mỗi asset (extension/app/pack) trong marketplace được biểu diễn bởi một **Asset Record** với các nhóm field:

### 3.1 Identity & classification

- `asset_id` – unique ID trong marketplace (tham chiếu tới extensions/apps cụ thể trong 141). [code_file:535]  
- `asset_type` – `connector_pack`, `automation_template`, `dashboard_pack`, `ai_skill`, `ui_extension`, `vertical_pack`, v.v. [code_file:534]  
- `name` – tên hiển thị.  
- `short_description` – mô tả ngắn gọn.  
- `long_description` – mô tả chi tiết.  
- `vendor_type` – `first_party` (Nextflow), `partner`, `customer`.  
- `vendor_id` – ID vendor trong hệ thống partner/customer.

### 3.2 Technical metadata

- `extension_ids` – list extensions tham gia asset (một pack vs multiple extensions). [code_file:535]  
- `manifest_version` – version manifest hiện tại;  
- `asset_version` – version asset hiển thị (có thể map 1–1 với extension versions hoặc là grouping logic).  
- `required_core_version_range` – range versions Nextflow OS supported. [code_file:535]  
- `required_packs` – packs & features cần (vd Pack 08 intelligence). [code_file:506][code_file:509]  
- `supported_regions` – nếu có hạn chế theo khu vực / regulatory.

### 3.3 Business & governance metadata

- `industries` / `vertical_tags` – tags ngành / use case (B2B SaaS, MSP, eCommerce…).  
- `wedge_tags` – mapping tới wedges của Nextflow (Operations, CS, Finance…).  
- `risk_level` – low/medium/high, dựa trên flows & data (từ review 124/143). [code_file:451][code_file:510]  
- `data_classes_accessed` – tham chiếu tới data classes 104 (vd `operational`, `customer_PII`, `financial`). [code_file:482]  
- `ai_involved` – boolean + chi tiết (nếu asset dùng AI components). [code_file:510]  
- `support_model` – `nextflow_support`, `partner_support`, `community_support`.  
- `sla_summary` – high-level SLA (response time, coverage). [code_file:455]

### 3.4 Commercial metadata

- `pricing_model` – free, free_with_plan_X, paid_subscription, one_time_fee, usage_based.  
- `price_range` – nếu applicable.  
- `trial_available` – true/false.  
- `contracts_required` – nếu cần phụ lục hợp đồng riêng (gegevens processing, DPA…).

### 3.5 Operational & analytics metadata

- `install_count` (per period) – số tenants/instances cài. [code_file:479][code_file:480]  
- `active_usage_score` – computed metric (dùng từ Pack 07–08) cho mức độ dùng thực tế. [code_file:507][code_file:508][code_file:509]  
- `incident_count` – incidents liên quan asset (link tới Pack 06–92). [code_file:452]  
- `last_update_at` – lần cập nhật gần nhất.  
- `deprecation_status` – active / deprecated / end_of_life.

### 3.6 UX & discovery metadata

- `screenshots` / `demo_links` – nếu có.  
- `documentation_links` – docs, runbooks, FAQs.  
- `rating_average` & `rating_count` – đánh giá từ tenants (nếu cho phép).  
- `featured_flags` – có được featured không, ở wedge/vertical nào.

## 4. Listing lifecycle & states

Mỗi asset đi qua các **listing states**:

1. **Draft**  
   - Asset đang được chuẩn bị, chỉ visible cho vendor & internal reviewers.  

2. **Under Review**  
   - Đang được review bởi Ecosystem/Governance (Pack 06 & 143). [code_file:451][code_file:510]  

3. **Private Listing**  
   - Visible & installable chỉ cho tenants được chọn (pilots, design partners, internal use).  
   - Có thể dùng để test quality, refine metadata.

4. **Public Listing**  
   - Visible cho tất cả tenants eligible (theo region/plan/policies), xuất hiện trong results & recommendations.  

5. **Deprecated**  
   - Không recommended cho installs mới; tenants hiện tại vẫn dùng, nhưng thấy cảnh báo.  

6. **End of Life (EoL)**  
   - Không còn installable; tenants phải migrate hoặc remove; timeline & comms theo playbook Pack 09–145.

Transitions giữa các state phải được log & map tới change governance Pack 06–93. [code_file:453]

## 5. Visibility & eligibility per tenant

Marketplace catalog là chung, nhưng mỗi tenant thấy subset assets dựa trên:

- **Region & legal constraints** – `supported_regions` vs tenant region.  
- **Plan & entitlements** – một số assets chỉ dành cho plan cao hơn.  
- **Risk & policy** – admin có thể đặt policy:  
  - chỉ cho phép assets risk_level ≤ Medium;  
  - yêu cầu review manual cho assets high-risk. [code_file:451][code_file:510]  
- **Roles & permissions** – chỉ admin hoặc roles được phép mới thấy/cài assets nhất định. [code_file:451]

**Eligibility logic:**
- Khi render marketplace cho một tenant/user, áp filters:  
  - region OK;  
  - plan/entitlements OK;  
  - risk_level ≤ policy threshold (hoặc flagged "needs approval");  
  - ai là viewer (admin vs end user) quyết định level detail.

## 6. Search & discovery model

### 6.1 Basic search & filters

Users (thường là admins) cần:
- search theo keyword (name, description, vendor);  
- filter theo:  
  - asset_type; [code_file:534][code_file:535]  
  - wedge/vertical;  
  - risk_level; [code_file:451][code_file:510]  
  - vendor_type;  
  - pricing_model;  
  - support_model.

### 6.2 Curated collections

Để tránh overload:
- tạo **collections**:  
  - "Starter packs" cho new tenants;  
  - "Recommended for your industry";  
  - "Automation accelerators";  
  - "Analytics & QBR packs"; [code_file:480][code_file:507]  
- collections có thể curated manual + backed by insights Pack 07–08 (usage & health). [code_file:479][code_file:509]

### 6.3 Recommendations (link với Pack 08)

Pack 08 có thể cung cấp **recommended assets** dựa trên:
- tenant profile (industry, size, wedges dùng); [code_file:479][code_file:507]  
- current pain signals (SLA breach, integration incidents, low adoption); [code_file:479][code_file:480][code_file:507][code_file:508]  
- usage patterns của tenants tương tự. [code_file:507][code_file:509]

Recommendations phải respect governance 124 (không gợi ý assets high-risk nếu tenant policy không cho). [code_file:510]

## 7. Relationship giữa assets & extensions/apps

Mỗi asset record map tới:

- một hoặc nhiều **extensions** (141):  
  - asset đơn giản: 1 extension = 1 asset;  
  - pack: nhiều extensions; [code_file:535]  
- optional **apps** – grouping UI/logic cho experience (nếu dùng khái niệm app riêng).

Model relationship:
- Bảng `asset_extension_link`:  
  - `asset_id`, `extension_id`, `role` (core/optional).  
- Bảng `asset_dependency`:  
  - assets dependent on other assets (vd vertical pack phụ thuộc connector pack). [code_file:431][code_file:534]

## 8. Analytics & reporting trên marketplace (liên kết Pack 07)

Pack 07 có thể dùng catalog metadata để tạo:

- `fact_asset_install` – installs/uninstalls per tenant/asset/date. [code_file:479]  
- `fact_asset_usage` – active usage metrics per asset (calls, tiles viewed, flows triggered). [code_file:479][code_file:508]  
- `fact_asset_incident` – incidents liên quan asset (link từ Pack 06–92). [code_file:452]

Dashboards:
- cho Ecosystem team: top assets by install/usage, assets with high incident rates, adoption by vertical;  
- cho Partners: performance of their assets;  
- cho Product: gaps & opportunities (industries/wedges ít assets).

## 9. Governance hooks trong catalog

Catalog schema phải hỗ trợ hooks cho governance:
- `risk_level` + `data_classes_accessed` + `ai_involved` để Governance team lọc & review những assets cần attention. [code_file:451][code_file:482][code_file:510]  
- `deprecation_status` & `last_update_at` để phát hiện assets stale;  
- links tới AI Use Case Records nếu asset chứa AI components (Pack 08–124). [code_file:510]

Hệ thống marketplace nên hỗ trợ views cho Governance: "Tất cả assets high-risk", "Assets access customer_PII", "Assets chưa update >12 tháng".

## 10. Điều kiện hoàn thành của tài liệu

Marketplace Catalog and Listing Model được xem là đạt yêu cầu khi:
- mọi loại asset Pack 09 có thể được mô tả rõ ràng bằng Asset Record & relations; [code_file:534][code_file:535]  
- SMEs & admins có thể đọc listing và hiểu asset đó là gì, risk & support như thế nào;  
- Ecosystem, Governance & Product có thể sử dụng metadata để curate, monitor & improve ecosystem; [code_file:451][code_file:482][code_file:510]  
- và Pack 07–08 có đủ hooks để đo lường usage & hiệu quả của marketplace cho chiến lược dài hạn.
