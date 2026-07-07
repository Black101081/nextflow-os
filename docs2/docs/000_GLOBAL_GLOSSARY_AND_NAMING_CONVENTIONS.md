# Nextflow OS – Global Glossary and Naming Conventions

**Document ID:** 000_GLOBAL_GLOSSARY_AND_NAMING_CONVENTIONS  
**Scope:** Cross-pack foundation for Packs 02–09 and future packs  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product Leadership / Platform Architecture / Documentation Ops  

## 1. Mục tiêu tài liệu

Tài liệu này chuẩn hoá **thuật ngữ, định nghĩa và naming conventions** dùng xuyên suốt Nextflow OS để các packs sử dụng cùng một ngôn ngữ khi mô tả platform, workflows, data, analytics, intelligence và ecosystem.

Mục tiêu:
- giảm mơ hồ giữa các từ gần nghĩa như *extension / app / pack / asset*, *metric / KPI / score*, *workflow / automation / assistant*;  
- tạo nền thống nhất cho các summary packs và các template thực thi;  
- hỗ trợ Product, Engineering, Governance, Data, Ecosystem và Partners đọc tài liệu theo cùng một mental model.

## 2. Nguyên tắc naming conventions

1. **Một khái niệm cốt lõi chỉ nên có một tên chính** trong toàn bộ bộ tài liệu.  
2. **Phân biệt entity-level terms với packaging-level terms**; ví dụ extension là đơn vị kỹ thuật, còn pack là đơn vị đóng gói/chủ đề tài liệu hoặc gói giải pháp.  
3. **Ưu tiên tên mô tả đúng chức năng hơn tên marketing**; ví dụ `ai_skill` rõ hơn các nhãn mơ hồ như “smart module”.  
4. **Giữ nhất quán giữa docs, schemas, APIs, dashboards và marketplace listings**.  
5. **Nếu một thuật ngữ có nghĩa khác nhau theo ngữ cảnh**, tài liệu phải nêu rõ ngữ cảnh đó.

## 3. Glossary cốt lõi

### 3.1 Tổ chức & phạm vi

- **Tenant**  
  Đơn vị logic đại diện cho một khách hàng/không gian vận hành riêng trong Nextflow OS, với data boundaries, users, roles, policies và assets riêng.

- **User**  
  Người dùng trong tenant hoặc người dùng nội bộ Nextflow/partner, được gán role và permissions cụ thể.

- **Role**  
  Nhóm quyền ở mức business/system dùng để kiểm soát ai xem, sửa, approve hoặc vận hành một phần của hệ thống.

- **Scope**  
  Quyền ở mức capability/action được khai báo rõ ràng, thường dùng trong extension/app model thay vì gán raw roles trực tiếp.

- **Wedge**  
  Miền nghiệp vụ/chức năng trong Nextflow OS, ví dụ Operations, Customer Success, Finance, Integrations. Wedge được dùng để nhóm workflows, dashboards, use cases và marketplace assets.

### 3.2 Work, workflows và operations

- **Work item**  
  Đơn vị công việc cốt lõi được theo dõi trong hệ thống, có lifecycle, trạng thái, SLA, assignee và các quan hệ ngữ cảnh khác.

- **Queue**  
  Không gian logic nơi work items được gom, sắp xếp, phân phối và theo dõi tải công việc.

- **Workflow**  
  Chuỗi trạng thái, bước xử lý, routing và các quy tắc liên quan để hoàn thành một loại công việc.

- **Automation**  
  Logic hoặc hành động tự động được áp dụng vào workflow, queue hoặc integration flow; có thể dựa trên rules, triggers hoặc intelligence signals.

- **SLA**  
  Service level expectation/commitment áp dụng cho work items, queues, support hoặc ecosystem assets; có thể xuất hiện ở pack governance, analytics và marketplace.

- **Incident**  
  Sự cố ảnh hưởng đến chất lượng dịch vụ, dữ liệu, bảo mật hoặc hoạt động; được xử lý theo incident playbooks và severity models.

- **Change**  
  Điều chỉnh có kiểm soát đối với cấu hình, workflow, model, extension hoặc thành phần vận hành khác; chịu change governance.

### 3.3 Data, analytics và insights

- **Entity**  
  Đối tượng nghiệp vụ có identity rõ ràng, ví dụ tenant, user, work item, integration, incident, asset.

- **Fact table**  
  Bảng sự kiện/đo lường trong analytics schema, ghi lại hoạt động hoặc trạng thái theo thời gian.

- **Dimension table**  
  Bảng ngữ cảnh/phân loại mô tả entities, dùng để join và phân tích facts.

- **Metric**  
  Số đo đơn lẻ được định nghĩa rõ công thức, grain và ngữ nghĩa.

- **KPI**  
  Metric có vai trò quản trị/điều hành quan trọng, được chuẩn hoá và dùng rộng rãi trong dashboards hoặc reviews.

- **Dashboard**  
  Tập hợp views/tiles/charts cho một role, wedge hoặc mục tiêu điều hành cụ thể.

- **Insight**  
  Diễn giải hoặc phát hiện dựa trên metrics, trends hoặc patterns; insight không đồng nghĩa với raw metric.

### 3.4 Intelligence & AI

- **Feature**  
  Biến đầu vào có cấu trúc dùng cho rules, scoring, ranking, pattern mining hoặc AI logic; thường được build từ facts/dimensions.

- **Feature layer**  
  Lớp tables/views chuẩn hoá features để nhiều use cases intelligence dùng chung.

- **Rule**  
  Logic điều kiện-hành động rõ ràng, explainable, thường dùng cho thresholds, routing, flags và baseline intelligence.

- **Score**  
  Giá trị tổng hợp/ranking/risk do rules hoặc models tạo ra để hỗ trợ sắp xếp, cảnh báo hoặc đánh giá health.

- **Model**  
  Thành phần scoring/ranking/predictive được huấn luyện hoặc cấu hình để tạo outputs từ features.

- **Pattern mining**  
  Kỹ thuật phát hiện hành vi lặp lại, associations hoặc similar cases từ dữ liệu lịch sử.

- **Assistant**  
  Bề mặt tương tác hoặc service giúp trả lời, tóm tắt, gợi ý hoặc giải thích trong một ngữ cảnh công việc cụ thể.

- **RAG**  
  Retrieval-Augmented Generation: mô hình assistant truy xuất tài liệu/corpus liên quan trước khi sinh câu trả lời.

- **AI skill**  
  Capability intelligence/assistant đóng gói để cắm vào Pack 08 hoặc marketplace Pack 09, thường có corpus, prompts, logic hoặc retrieval riêng.

- **AI Use Case Record**  
  Hồ sơ chuẩn hoá mô tả mục tiêu, dữ liệu, logic, risk, guardrails, eval và rollout của một use case AI/intelligence.

### 3.5 Ecosystem, marketplace và đóng gói

- **Extension**  
  Đơn vị kỹ thuật cơ bản mở rộng Nextflow OS, có manifest, capabilities, permissions, version và lifecycle riêng.

- **App**  
  Nhóm một hoặc nhiều extensions thành một trải nghiệm tương đối hoàn chỉnh cho một vấn đề cụ thể.

- **Asset**  
  Đơn vị được niêm yết trên marketplace; có thể map tới một extension, nhiều extensions hoặc một app/pack.

- **Pack** (ngữ cảnh marketplace)  
  Bundle gồm nhiều assets/extensions/apps cho một wedge, bài toán hoặc vertical cụ thể.

- **Pack** (ngữ cảnh tài liệu)  
  Nhóm tài liệu kiến trúc theo chủ đề lớn của Nextflow OS, ví dụ Pack 07 Data, Pack 08 Intelligence, Pack 09 Ecosystem.

- **Listing**  
  Bản ghi hiển thị của một asset trên marketplace, bao gồm metadata, states, support, risk và UX materials.

- **Vendor**  
  Bên cung cấp asset: Nextflow, partner hoặc community/customer.

- **Vertical pack**  
  Bundle giải pháp theo ngành, thường gồm connectors, workflows, dashboards, assistants và templates.

### 3.6 Governance & vận hành

- **Risk tier / risk level**  
  Cấp độ rủi ro dùng để áp controls phù hợp cho workflows, AI use cases hoặc marketplace assets.

- **Guardrail**  
  Biện pháp kiểm soát ngăn hệ thống, user hoặc AI vượt quá ranh giới cho phép.

- **Kill switch**  
  Cơ chế tắt nhanh một capability, model hoặc asset khi có sự cố hoặc rủi ro nghiêm trọng.

- **Deprecation**  
  Trạng thái asset/feature vẫn tồn tại nhưng không còn được khuyến nghị cho sử dụng mới.

- **End of Life (EoL)**  
  Trạng thái ngừng hỗ trợ/ngừng cài mới/ngừng sử dụng của asset hoặc capability.

## 4. Quy ước đặt tên file tài liệu

Quy ước chung:
- `[NNN]_[PACK]_[TOPIC_IN_UPPER_SNAKE_CASE].md`
- Ví dụ: `101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA.md`

Nguyên tắc:
- số thứ tự phản ánh vị trí logic trong pack;  
- `PACK07`, `PACK08`, `PACK09` nhất quán;  
- topic name nên mô tả rõ nội dung, tránh tên quá marketing.

## 5. Quy ước đặt tên entities, tables và views

- Dimensions ưu tiên prefix `dim_`  
- Facts ưu tiên prefix `fact_`  
- Features ưu tiên prefix `feat_`  
- Bridge/relationship tables có thể dùng `bridge_` hoặc `link_`  
- Snapshots cần thể hiện rõ grain thời gian, ví dụ `_daily`, `_snapshot`, `_monthly`

Ví dụ:
- `fact_work_item`  
- `dim_integration`  
- `feat_queue_daily`  
- `asset_extension_link`

## 6. Quy ước viết thuật ngữ trong docs

- Khi giới thiệu một thuật ngữ lần đầu trong doc, nên viết đầy đủ trước, rồi dùng viết tắt sau nếu cần.  
- Các từ như **tenant**, **wedge**, **asset**, **extension**, **SLA**, **KPI**, **AI skill** nên dùng đúng casing xuyên suốt.  
- Không dùng cùng lúc nhiều từ cho một thứ nếu không có lý do rõ ràng; ví dụ không trộn “plugin”, “module”, “extension” trừ khi định nghĩa riêng.

## 7. Điều kiện hoàn thành của tài liệu

Glossary and Naming Conventions được xem là đạt yêu cầu khi:
- các packs 02–09 có thể tham chiếu tới đây để giảm mơ hồ thuật ngữ;  
- Product, Engineering, Data, Governance và Ecosystem dùng cùng một vocabulary;  
- các docs mới có thể bám theo naming conventions này ngay từ đầu.
