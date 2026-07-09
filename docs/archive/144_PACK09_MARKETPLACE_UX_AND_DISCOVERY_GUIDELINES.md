# Nextflow OS – Pack 09 Marketplace UX and Discovery Guidelines

**Document ID:** 144_PACK09_MARKETPLACE_UX_AND_DISCOVERY_GUIDELINES  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / UX / Ecosystem & Partnerships  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Advanced Intelligence, 09 Overview (140), 09 Extension Model (141), 09 Catalog & Listing Model (142), 09 Partner Program (143)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Marketplace UX and Discovery Guidelines** cho Pack 09 – cách thiết kế trải nghiệm marketplace trong Nextflow OS để SMEs, admins và partners có thể tìm, hiểu, cài đặt và quản lý assets (extensions, apps, packs) một cách rõ ràng, an toàn và hiệu quả.

Mục tiêu:
- đảm bảo **SMEs & admins hiểu asset là gì, làm gì, rủi ro & support ra sao** (tránh "cài nhầm"); [code_file:536][code_file:537]  
- thiết kế **flows UX chuẩn** cho browsing, search, filter, listing details, install/config, quản lý assets;  
- surface **governance & risk thông minh** (risk badges, data classes, support model) mà không làm UI nặng nề; [code_file:451][code_file:482][code_file:510]  
- hỗ trợ discovery curated (collections, recommendations Pack 08) thay vì "chợ trời" app store. [code_file:506][code_file:507][code_file:509][code_file:513]

## 2. Nguyên tắc UX tổng thể cho marketplace

1. **Clarity over hype** – mô tả assets một cách thực tế, tránh buzzwords; SMEs phải biết "nó làm gì" trước khi nghe "AI" hay "magic".  
2. **Admin-first** – marketplace chủ yếu là bề mặt cho admins (hoặc roles được uỷ quyền), không phải cho mọi end-user; controls & warnings phải hướng tới admin persona. [code_file:451][code_file:479]  
3. **Safety by design** – risk & data access luôn được surface đủ để quyết định; high-risk assets cần flows confirm rõ ràng. [code_file:451][code_file:482][code_file:510]  
4. **Progressive disclosure** – thông tin chi tiết (data classes, AI behavior, logs) có thể mở rộng khi cần, không ép mọi user đọc tất cả.  
5. **Consistency với Pack 03 & 08** – UI patterns (cards, side panels, filters, badges) phải tái sử dụng từ surfaces chung; cách hiển thị risk/AI tương tự 125/124. [code_file:480][code_file:511][code_file:510]

## 3. Marketplace entry points

### 3.1 Marketplace hub

- Vị trí: trong main navigation, dưới nhóm "Settings" hoặc "Extensions & Marketplace" (admin-only). [code_file:480]  
- Nội dung:  
  - search bar;  
  - collections khu vực chính (Starter packs, Recommended for you, By industry); [code_file:536]  
  - tabs hoặc filters cho asset types (Connectors, Automation, Dashboards, AI Skills, Vertical Packs…).

### 3.2 In-context discovery

- Trong các screens khác, marketplace có thể xuất hiện dưới dạng:  
  - link "Find more connectors" ở Integration settings (Pack 05); [code_file:431][code_file:435]  
  - link "Explore automation templates" trong Orchestration/Automation UI (Pack 04); [code_file:421][code_file:429]  
  - suggestion "Need more dashboards? Explore packs" trong analytics area (Pack 07); [code_file:480]  
  - "Add more assistant skills" trong AI Settings (Pack 08). [code_file:509][code_file:511]

Nguyên tắc: in-context entry phải filter sẵn theo asset_type & wedge để giảm noise.

## 4. Browsing & search UX

### 4.1 Browsing catalog

- Default view: card/grid view của assets với thông tin tối thiểu:  
  - name, short description;  
  - vendor (Nextflow / Partner / Community badge); [code_file:537]  
  - asset_type icon (connector, automation, dashboard, AI, vertical); [code_file:534]  
  - risk badge (Low/Medium/High); [code_file:451][code_file:510]  
  - key tags (industry, wedge). [code_file:536]

- Filters được đặt bên trái hoặc trên:  
  - asset_type, wedge, industry, vendor_type, risk_level, pricing_model, support_model. [code_file:536]

### 4.2 Search UX

- Search bar hỗ trợ:  
  - keyword search (name, description, vendor);  
  - suggest queries phổ biến ("Salesforce", "QBR", "SLA"…).

- Results:  
  - highlight match;  
  - hiển thị số lượng assets;  
  - cho phép sort (by relevance, installs, rating, newest).

## 5. Asset listing detail page

Mỗi asset cần một **listing detail page** rõ ràng, là nơi admin quyết định có cài hay không.

### 5.1 Layout

- Header:  
  - name;  
  - vendor name + badge (Nextflow / Partner / Community); [code_file:536][code_file:537]  
  - asset_type;  
  - rating & installs (if available). [code_file:536]

- Body chia thành các section:
  - **What it does** – mô tả value & use cases bằng ngôn ngữ business.  
  - **Capabilities** – tóm tắt capabilities từ manifest (UI, workflows, connectors, analytics, AI). [code_file:535]  
  - **Data & permissions** – hiển thị data classes & permission scopes; [code_file:482][code_file:535]  
  - **Risk & governance** – risk_level, AI involvement, requirements; [code_file:451][code_file:510][code_file:536]  
  - **Support & SLA** – support_model, sla_summary, contact. [code_file:536][code_file:455]  
  - **Screenshots & docs** – hình ảnh, links docs. [code_file:536]

### 5.2 Data & permissions section

- Hiển thị:  
  - data_classes_accessed (vd Operational, Customer PII, Financial); [code_file:482][code_file:536]  
  - permission scopes (vd read:work_items, manage:integrations); [code_file:535]  
  - any external services involved (endpoints).  

- UI pattern:  
  - icon + label + short explanation;  
  - link "View full manifest" cho admin kỹ thuật.

### 5.3 Risk & governance section

- Risk badge + short reason:  
  - "Medium – affects work prioritization & reads operational data";  
  - "High – writes to financial system & accesses PII". [code_file:451][code_file:482][code_file:510]  
- Nếu AI involved:  
  - label "Uses AI" + description (vd "Assistant skill for QBR summarization"); [code_file:507][code_file:509][code_file:536]  
  - link tới AI governance guidelines (124) cho admins. [code_file:510]

### 5.4 Install call-to-action

- Primary CTA: "Install" hoặc "Add to tenant";  
- Với assets high-risk:  
  - CTA có step confirm: "This asset is high-risk. Please confirm you understand its impact";  
  - optional: require additional approval flow trong tenant (internal admin workflow).

## 6. Install & configuration flows

### 6.1 Install flow (high-level)

1. Admin click "Install" trên asset detail.  
2. Dialog/wizard hiển thị tóm tắt: capabilities, data access, risk, support. [code_file:535][code_file:536]  
3. Admin chọn scopes roles nội bộ map với permission scopes asset. [code_file:451][code_file:535]  
4. Nếu cần: nhập config (API keys, mappings…). [code_file:431][code_file:435]  
5. Confirm & apply; logs ghi lại install event. [code_file:452][code_file:479]

### 6.2 Configuration UX

- Config màn hình riêng trong "Installed assets" hoặc trong settings wedge liên quan (Integration, Automation, Analytics, AI). [code_file:431][code_file:480][code_file:509]  
- Dùng JSON schema `config_schema` từ manifest để render forms, validations. [code_file:535]

## 7. Managing installed assets

### 7.1 Installed assets view

- Admin có thể xem danh sách assets đã cài:  
  - name, vendor, asset_type;  
  - status (active, misconfigured, deprecated);  
  - version & update info;  
  - risk badge & data classes. [code_file:536]

- Actions per asset:  
  - open config;  
  - view logs/usage; [code_file:479][code_file:480]  
  - update;  
  - disable/uninstall.

### 7.2 Updates & deprecation

- Khi có update mới:  
  - hiển thị banner hoặc badge "Update available" cho asset;  
  - provide changelog summary;  
  - cho phép chọn "Update now" hoặc "Schedule".

- Nếu asset deprecated/EoL:  
  - highlight rõ trong list & detail page;  
  - cung cấp hướng dẫn migration (nếu có). [code_file:536]

## 8. Surfacing analytics & feedback

### 8.1 Usage & health signals

- Trong Installed assets, hiển thị:  
  - usage summary (calls, flows used, dashboards views); [code_file:479][code_file:480]  
  - error/incident indicator (link tới incident details nếu có). [code_file:452][code_file:536]

- Cho phép admins quickly see:  
  - assets ít dùng (consider removal);  
  - assets nhiều incident (cần review hoặc update).

### 8.2 Ratings & reviews

- Nếu enable ratings:  
  - allow admins đánh giá (1–5) & optional comment;  
  - hiển thị rating average + count; [code_file:536]  
  - filter theo rating.

- Moderation:  
  - đối với community reviews, cần flow report & review nội dung.

### 8.3 Feedback to partners

- Partners nhận reports định kỳ:  
  - usage metrics;  
  - ratings & comments;  
  - incidents liên quan asset. [code_file:537]

## 9. Recommendations UX (kết nối Pack 08)

- Trong marketplace hub và một số screens, hiển thị **Recommended for you**:
  - dựa trên tenant profile, wedges dùng, pain signals (SLA breaches, integration incidents, low adoption…); [code_file:507][code_file:508][code_file:509]  
  - luôn surface rõ: "Recommendation powered by Nextflow Intelligence" + explain short. [code_file:513]

- UX guardrails:  
  - không auto-install;  
  - không recommend assets trái với risk policy tenant; [code_file:451][code_file:510]  
  - admin luôn có thể dismiss hoặc mark "Not relevant".

## 10. Admin controls & policies UX

- Page "Marketplace Policies" trong admin settings:  
  - bật/tắt marketplace;  
  - giới hạn asset types (vd không cho AI skills);  
  - risk threshold (chỉ allow ≤ Medium, require approval for High); [code_file:451][code_file:510]  
  - vendor filters (cho phép chỉ first-party & strategic partners).

- UI cho policy effect:  
  - assets vượt risk threshold có thể ẩn hoặc hiển thị nhưng với banner "Requires extra approval";  
  - admins khác phải follow internal approval flow.

## 11. Điều kiện hoàn thành của tài liệu

Marketplace UX and Discovery Guidelines được xem là đạt yêu cầu khi:
- UX team có thể thiết kế marketplace hub, listing & install flows mà người dùng SMEs & admins hiểu rõ assets;  
- Governance & Ecosystem có thể surface risk/data/support thông minh mà không làm UI quá phức tạp; [code_file:451][code_file:482][code_file:510][code_file:536][code_file:537]  
- và Pack 07–08 có thể cắm insights/recommendations vào marketplace một cách tự nhiên, không phá vỡ trải nghiệm.
