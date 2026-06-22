# Nextflow OS – Global Glossary and Naming Conventions

**Document ID:** 000_GLOBAL_GLOSSARY_AND_NAMING_CONVENTIONS  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Platform / Data & Intelligence / Governance  

## Cross-pack references

- Tài liệu này là nền tảng ngôn ngữ cho toàn bộ Packs 02–09. Mọi doc nên link ngược về đây khi dùng các thuật ngữ chuẩn.  
- Xem **001 OS Master Index and Reading Map** để biết vị trí từng pack trong tổng thể OS.  

## 1. Mục tiêu

Tài liệu này chuẩn hoá **từ vựng và cách đặt tên** dùng xuyên suốt các Packs 02–09 của Nextflow OS.  

Mục tiêu:

- Giảm mơ hồ khi trao đổi giữa Product / Engineering / Data / CS / Ops.  
- Tránh việc cùng một khái niệm nhưng nhiều tên khác nhau trong docs và schema.  
- Làm "từ điển gốc" để mọi pack (đặc biệt 04–09) cross-ref khi cần.  

## 2. Các nhóm khái niệm chính

### 2.1 Tenant, account, wedge

- **Tenant**: một khách hàng tổ chức sử dụng Nextflow OS (một công ty, brand, đơn vị kinh doanh).  
- **Account**: thực thể con trong tenant — ví dụ một end-customer, một contract, một business unit.  
- **Wedge**: "mảng nghiệp vụ" mà Nextflow OS phục vụ, ví dụ:
  - CS / Customer Success
  - Operations / Back-office
  - Finance / Billing / AR
  - Risk & Compliance
  - Leadership / Executive reporting

### 2.2 Work, workflow, automation

- **Work item**: đơn vị công việc cụ thể cần xử lý (một ticket, một case, một request, một invoice, một incident…).  
- **Workflow**: chuỗi steps/transitions để một loại work item di chuyển từ trạng thái A → B → Done (định nghĩa logic trong Pack 04).  
- **Automation**: bất kỳ logic tự động nào can thiệp vào workflow (auto assign, auto close, auto escalate, auto notify).  

### 2.3 Data, facts, metrics, KPIs, insights

- **Fact**: bản ghi sự kiện ở một grain cụ thể, ví dụ: fact_ticket_day, fact_invoice, fact_interaction.  
- **Dimension**: bảng tra cứu (customer, date, product, channel…).  
- **Metric**: phép đo đơn, có thể aggregate (số ticket, thời gian xử lý).  
- **KPI**: tập hợp metrics quan trọng để điều hành wedge/role (SLA hit rate, CSAT, churn rate).  
- **Insight**: kết luận/nhận định được rút ra từ data (ví dụ "SLA breach tập trung ở queue APAC, ca tối thứ Hai").  

### 2.4 Intelligence layer

- **Feature**: biến đầu vào cho rules/models (ví dụ: số incident 30 ngày, logged_in_last_7d).  
- **Feature layer**: tập các bảng/khung dữ liệu chứa nhiều features có thể reuse cho nhiều use case.  
- **Rule**: logic if-then, thường deterministic, dễ giải thích.  
- **Score**: giá trị số (0–1, 0–100) thể hiện risk, priority, propensity.  
- **Model**: cơ chế sinh ra scores/labels từ features (ML, heuristic phức tạp…).  
- **Assistant**: surface UX giúp user đặt câu hỏi hoặc nhận hướng dẫn (chat-like, side panel, QBR assistant…).  
- **AI Skill**: "ability" cụ thể của assistant (ví dụ: "tóm tắt QBR", "giải thích SLA risk", "đề xuất automation").  

### 2.5 Extensions, apps, assets, packs

- **Extension**: phần mở rộng logic/UX chạy trên Nextflow OS (có thể do first-party hoặc partner build).  
- **App**: tập hợp functions/UI tương đối hoàn chỉnh, có thể bao gồm nhiều extensions.  
- **Asset** (trên marketplace): đơn vị được publish/install — có thể là app, connector, pack dashboards/intelligence, hoặc automation bundle.  
- **Pack** (trong tài liệu OS): nhóm tài liệu conceptual (Pack 07, Pack 08, Pack 09…); không trùng nghĩa hoàn toàn với "pack asset" trên marketplace, nhưng có thể truyền cảm hứng.  

## 3. Quy ước đặt tên file tài liệu

Mọi tài liệu nên có format:  
`NNN_PACKXX_TOPIC_IN_UPPER_SNAKE_CASE.md`

- **NNN**: số thứ tự trong pack (100, 101, 120, 127, 140…).  
- **PACKXX**: mã pack (PACK07, PACK08, PACK09…).  
- **TOPIC**: mô tả ngắn gọn nội dung.  

Ví dụ:

- `100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY.md`  
- `128_PACK08_INTELLIGENCE_EXECUTION_PROMPTS_LIBRARY.md`  
- `146_PACK09_ASSET_LISTING_AND_REVIEW_CHECKLIST.md`  

## 4. Quy ước đặt tên bảng dữ liệu

- **Fact tables**: `fact_<subject>_<grain>` — VD: `fact_ticket_day`, `fact_customer_month`, `fact_invoice`.  
- **Dimension tables**: `dim_<subject>` — VD: `dim_customer`, `dim_product`, `dim_date`.  
- **Feature tables / views**: `feat_<domain>_<purpose>` — VD: `feat_cs_health_signals`, `feat_ops_sla_risk_signals`.  

## 5. Quy ước thuật ngữ AI & governance

- **Risk level**: Low / Medium / High / Critical — dùng nhất quán trong Pack 08 và Pack 09.  
- **Guardrail**: cơ chế giới hạn hành vi AI (không tự động hành động, chỉ gợi ý, yêu cầu xác nhận 2 bước...).  
- **AI Use Case Record**: bản ghi mô tả đầy đủ một use case AI (template 129).  
- **Kill switch**: cách tắt nhanh một model/assistant/asset khi phát hiện rủi ro.  

## 6. Cách dùng tài liệu này

- Mọi pack khi dùng các thuật ngữ trên nên **link ngược** về `000_GLOBAL_GLOSSARY_AND_NAMING_CONVENTIONS.md`.  
- Khi có thuật ngữ mới, Product/Platform/Data nên cập nhật vào đây trước khi lan sang các docs khác.  
