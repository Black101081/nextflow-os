# Nextflow OS – Pack 09 Extension and App Model Spec

**Document ID:** 141_PACK09_EXTENSION_AND_APP_MODEL_SPEC  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Platform & Extensibility Engineering / Product / Security  
**Dependent Packs:** 02 Core Platform & Data, 03 Experience & UX, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Advanced Intelligence, 09 Overview (140)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Extension and App Model** cho Pack 09 – mô tả một extension/app trong Nextflow OS là gì, có thể làm gì, bị giới hạn bởi những boundaries nào, được đóng gói & versioning ra sao, và cách nó tương tác với permissions, tenants, data & workflows.

Mục tiêu:
- cung cấp một **contract kỹ thuật** thống nhất cho mọi loại assets Pack 09 (connectors packs, automation templates, dashboard packs, AI skills, mini-apps, vertical packs); [code_file:534]  
- định nghĩa **capabilities & boundaries** của extensions/apps (UI, workflows, data, intelligence);  
- mô tả **manifest & packaging model**, versioning & compatibility;  
- đảm bảo extension/app model tôn trọng multi-tenant, data policies & governance từ Packs 02, 05, 06, 07, 08. [code_file:431][code_file:451][code_file:482][code_file:506]

## 2. Nguyên tắc thiết kế extension/app model

1. **Sandboxed & scoped** – mỗi extension chạy trong context tenant rõ, với permissions cụ thể; không có "super app" override toàn hệ thống. [code_file:451][code_file:482]  
2. **Composable, không monolithic** – extensions là các blocks nhỏ (connectors, flows, dashboards, skills), có thể bundle thành packs, nhưng luôn gắn với primitives core (work items, queues, incidents, metrics…). [code_file:421][code_file:479]  
3. **Contract-first** – mỗi capability (UI, workflow hooks, data access, intelligence) có interface rõ (APIs, events, schemas); extension không được "chọc" trực tiếp vào database core. [code_file:479][code_file:508][code_file:509]  
4. **Governance-ready** – metadata & config của extensions đủ chi tiết để Packs 06–07–08 govern: risk classification, incidents, analytics & AI policies. [code_file:451][code_file:452][code_file:482][code_file:510]  
5. **Versioned & compatible** – extension/apps phải có version, declared compatibility với versions core; cho phép upgrade/rollback có kiểm soát. [code_file:453][code_file:494]

## 3. Khái niệm cơ bản

### 3.1 Extension vs App vs Pack

Để thống nhất thuật ngữ:

- **Extension**  
  - đơn vị kỹ thuật nhỏ, thêm năng lực vào Nextflow:  
    - ví dụ: connector tới một SaaS, một workflow module, một dashboard, một AI skill.  
  - có manifest riêng, được version, có permissions.

- **App**  
  - grouping logic gồm nhiều extensions liên quan, cung cấp một trải nghiệm tương đối hoàn chỉnh cho một vấn đề cụ thể;  
  - ví dụ: "QBR Manager" app bao gồm dashboards, QBR assistant skill, templates cho QBR documents. [code_file:507][code_file:509]

- **Pack** (trong ngữ cảnh marketplace asset)  
  - bundle có thể gồm nhiều apps/extensions: connectors + workflows + dashboards + assistants, thường cho một wedge/industry;  
  - ví dụ: "B2B SaaS Customer Onboarding Pack".

Trong model kỹ thuật, **extension** là đơn vị căn bản; app/pack chủ yếu là packaging & UX layer.

### 3.2 Extension Capabilities

Mỗi extension có thể khai báo một hoặc nhiều **capability types**:

1. **UI Components** – pages, panels, widgets được render trong Nextflow UI (Pack 03). [code_file:480][code_file:511]  
2. **Workflow Hooks** – triggers & actions plug vào flows Pack 04 (work items, queues, automation). [code_file:421][code_file:429]  
3. **Integrations & Connectors** – endpoints & mappings plug vào Integration layer Pack 05. [code_file:431][code_file:435][code_file:437][code_file:438]  
4. **Analytics & Dashboard Add-ons** – views/dashboards & KPIs dùng schema 101 Pack 07. [code_file:479][code_file:480]  
5. **AI & Intelligence Skills** – logic/skills thêm cho assistants & recommenders Pack 08. [code_file:507][code_file:509][code_file:510]

## 4. Capability model chi tiết

### 4.1 UI Components Capability

Extension có thể khai báo các UI components:

- **Page** – trang riêng trong navigation (vd "Contracts", "QBR Workspace").  
- **Panel/Side Panel** – panel context trong views hiện có (vd panel trong work item detail). [code_file:480][code_file:511]  
- **Widget/Tile** – component nhỏ trong dashboards hoặc home screens (vd tile "Integration Health" custom).

**Contract UI:**
- Extension không render toàn bộ shell; chỉ render nội dung bên trong container do core cung cấp.  
- UI components tương tác với core qua APIs & events (vd truy vấn dữ liệu, trigger actions).  
- UI phải respect permissions & tenant context core cung cấp (vd không tự query cross-tenant).

### 4.2 Workflow Hooks Capability

Extensions có thể đăng ký:

- **Triggers** – được gọi khi xảy ra events Pack 04 (work item created/updated, SLA events, queue threshold exceeded). [code_file:421][code_file:429]  
- **Actions** – callable từ automation/rules (vd "create ticket in system X", "post message to Slack").

**Contract:**
- Triggers nhận payload entity ở dạng chuẩn (work_item, queue, tenant…);  
- Actions chạy trong context tenant & role, không thể escalate permissions;  
- Execution phải time-bounded & retry-aware;  
- Critical flows Tier 3–4 chỉ gọi actions extensions đã được classify & approve. [code_file:451][code_file:453]

### 4.3 Integrations & Connectors Capability

Extensions có thể định nghĩa connectors & integration flows:

- APIs, auth configs, mapping templates; [code_file:431][code_file:435][code_file:437][code_file:438]  
- inbound/outbound flows (polling, webhooks, push/pull).  

**Contract:**
- Connector không có quyền truy cập trực tiếp database; chỉ thông qua integration engine của Pack 05;  
- mapping configs phải comply với data policies 104 (không lộ fields beyond scope). [code_file:482]  
- Health & errors được báo cáo về `fact_integration_daily_health` & `fact_exception`. [code_file:479]

### 4.4 Analytics & Dashboard Add-ons Capability

Extensions có thể cung cấp:

- dashboards preconfigured; [code_file:480]  
- views hoặc metrics derived (nhưng vẫn trên schema 101 Pack 07); [code_file:479]  
- không được tự ý tạo tables ngoài schema contract nếu không khai báo rõ.

**Contract:**
- Dashboards phải sử dụng datasets/views đã được pack 07 approve, hoặc tạo view mới nhưng documented; [code_file:479][code_file:494]  
- phải respect analytics governance 104 (data classes & access) & self-service model 103. [code_file:482][code_file:481]

### 4.5 AI & Intelligence Skills Capability

Extensions có thể thêm **skills** cho assistants Pack 08:

- thêm domains knowledge (corpus docs, SOPs); [code_file:507][code_file:509]  
- thêm suggestion patterns (E1 automation finder variant cho một vertical); [code_file:507][code_file:509]  
- thêm summarization templates (QBR cho ngành X). [code_file:507]

**Contract:**
- Phải follow AI governance & guardrails 124/126; [code_file:510][code_file:512]  
- không được dùng models/LLM bên ngoài mà không qua review;  
- RAG skills chỉ truy cập corpus được phép & respect tenant boundaries; [code_file:482]  
- AI skills high-risk (tác động flows Tier 3–4) phải được classify & approve rõ. [code_file:451][code_file:510]

## 5. Manifest & packaging model

Mỗi extension/app phải có **manifest** mô tả:

- `id` – unique identifier trong ecosystem.  
- `name`, `description`, `vendor` (Nextflow/Partner/Customer).  
- `version` – semantic versioning (major.minor.patch). [code_file:453][code_file:494]  
- `type` – connector, automation_template, dashboard_pack, ai_skill, ui_extension, vertical_pack. [code_file:534]  
- `capabilities` – list UI/workflow/integration/analytics/ai.  
- `permissions` – scopes data & actions cần.  
- `tenant_scope` – multi-tenant behavior (single-tenant scoped, global admin-only). [code_file:479]  
- `required_core_version` – range versions Nextflow OS.  
- `risk_profile` – proposed risk based on flows & data. [code_file:451][code_file:510]  
- `config_schema` – JSON schema cho config mà admin phải nhập.  
- `support` – contact, SLA commitments (đối với partner).  
- `logging` – events extension sẽ log để platform ingest. [code_file:452][code_file:454]

Packaging có thể là:
- archive bundle (code + manifest + assets);  
- registry entry (đối với SaaS-hosted extension), nhưng manifest vẫn bắt buộc.

## 6. Permissions & tenant model

### 6.1 Permission scopes

Extensions không dùng raw roles; thay vào đó, khai báo **scopes** như:

- `read:work_items`, `write:work_items`  
- `read:queues`, `write:queues`  
- `read:integrations`, `manage:integrations`  
- `read:analytics_basic`, `read:analytics_sensitive`  
- `invoke:assistant_skill`, `read:knowledge_domain:X`  
- `manage:automation_rules`, v.v.

Admin mapping scopes → roles cụ thể trong tenant. [code_file:451][code_file:482]

### 6.2 Tenant isolation

- Mỗi extension instance chạy trong context một tenant (hoặc group tenants do admin cấu hình), không có cross-tenant access trừ khi là Nextflow internal tools với guardrails đặc biệt. [code_file:479][code_file:482]  
- Multi-tenant extensions (vd partner analytics) phải tách biệt rành mạch:  
  - aggregator không nhìn raw data tenants;  
  - chỉ nhận aggregates & metrics đã anonymize theo policies. [code_file:482][code_file:494]

## 7. Lifecycle extension/app

Stages:

1. **Development** – Nextflow/partner/customer build extension/app theo contract.  
2. **Internal Testing** – test chức năng, performance, security basic.  
3. **Review & Approval** – extension/app được review theo governance Pack 06 & AI governance nếu applicable. [code_file:451][code_file:452][code_file:510]  
4. **Private Listing** – cho một số tenants pilot (private marketplace).  
5. **Public Listing** – xuất hiện cho audience rộng hơn (tất cả hoặc subset tenants đủ điều kiện).  
6. **Update & Patch** – version mới; phải maintain backward compatibility hoặc có migration plan. [code_file:453][code_file:494]  
7. **Deprecation & Sunsetting** – ngừng hỗ trợ; phải có kế hoạch migration & comms.

Lifecycle này align với change governance Pack 06 & operations 145.

## 8. Compatibility & versioning

- Extensions/apps declare:  
  - `required_core_version` – Nextflow OS version range (vd >=1.5, <2.0);  
  - `required_packs` – dependencies on specific pack features (vd Pack 08 intelligence required). [code_file:506][code_file:509]

- Khi core upgrade:  
  - marketplace kiểm tra compatibility;  
  - extensions không tương thích bị flag & có thể disable/bật warning cho admins.

- Versioning:  
  - Major: breaking changes trong APIs/behaviors;  
  - Minor: features mới, backward compatible;  
  - Patch: bug fixes.

## 9. Observability & logging requirements

Extension/app phải log đủ để:
- support debugging & incidents; [code_file:452][code_file:454]  
- supply analytics & intelligence layer with signals (usage, errors); [code_file:479][code_file:480][code_file:507][code_file:508]  
- enable governance & audit (who did what, with which extension). [code_file:451][code_file:482]

Logs nên include:
- extension_id, version, tenant_id;  
- action type (trigger fired, action called, UI interaction);  
- success/failure, error codes;  
- performance metrics (latency, timeouts);  
- any access to sensitive scopes.

## 10. Điều kiện hoàn thành của tài liệu

Extension and App Model Spec được xem là đạt yêu cầu khi:
- mọi loại asset Pack 09 (connectors packs, automation templates, dashboards, AI skills, mini-apps, vertical packs) có thể biểu diễn bằng extension model này; [code_file:534]  
- Platform/Engineering hiểu rõ boundaries & contracts khi implement extensibility APIs;  
- Governance & Security có thông tin đủ để áp dụng policies Packs 06–07–08; [code_file:451][code_file:482][code_file:510]  
- và Product/Ecosystem có thể dùng nó để design marketplace listings & partner program một cách rõ ràng.
