# Nextflow OS – Pack 09 Ecosystem Operations, Support and SLA Playbook

**Document ID:** 145_PACK09_ECOSYSTEM_OPERATIONS_SUPPORT_AND_SLA_PLAYBOOK  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Ecosystem & Partnerships / Support & Operations / Governance & Risk  
**Dependent Packs:** 02 Core Platform & Data, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Advanced Intelligence, 09 Overview (140), 09 Extension Model (141), 09 Catalog & Listing Model (142), 09 Partner Program (143), 09 Marketplace UX (144)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Ecosystem Operations, Support and SLA Playbook** cho Pack 09 – cách Nextflow vận hành marketplace & ecosystem trong thực tế: ai support cái gì, incidents xử lý ra sao, SLA thế nào, monitoring & reporting, deprecation & sunsetting assets.

Mục tiêu:
- định nghĩa **support model** rõ ràng cho các loại assets (first-party, partner, community) và cho các loại issues; [code_file:536][code_file:537]  
- mô tả **incident flow** khi sự cố liên quan tới assets xảy ra (bao gồm security/data incidents, operational incidents); [code_file:452][code_file:454]  
- thiết lập **SLA expectations** cho ecosystem (phân biệt Nextflow vs partner); [code_file:455]  
- định nghĩa **monitoring, reporting, deprecation & sunsetting** quy củ, liên kết Pack 06 & 07.

## 2. Phạm vi ecosystem operations

Scope playbook này bao gồm:

- Assets trên marketplace: connectors packs, automation templates, dashboard packs, AI skills, UI extensions, vertical packs. [code_file:534][code_file:535]  
- Lifecycle assets: install/update, run-time behavior, incidents, support tickets, deprecation/EoL. [code_file:536][code_file:537]  
- Roles: Nextflow Support & Ops, Ecosystem team, Partners, Customers (admins), Governance & Risk.

Không bao gồm:
- support cho core platform (đã nằm ở Pack 06–95/96); [code_file:455][code_file:456]  
- support cho custom code nội bộ mà không publish.

## 3. Support model cho assets

### 3.1 Loại support

1. **Functional issues**  
   - Asset không hoạt động như mô tả: errors, hành vi sai, UI không load…  
2. **Performance issues**  
   - Asset làm chậm workflows hoặc APIs;  
3. **Integration/connector issues**  
   - sync lỗi, data không tới/không đúng, auth thất bại… [code_file:431][code_file:435]  
4. **Security/data incidents**  
   - leak data, access sai tenant, log PII nhạy cảm… [code_file:482][code_file:452]  
5. **AI behavior issues** (nếu asset có AI)  
   - output sai lệch, risk cho flows high-impact, hallucination vi phạm policies. [code_file:510]

### 3.2 Responsibility matrix theo asset type

- **First-party assets** (vendor_type = first_party):  
  - Nextflow chịu primary support & fix;  
  - Support flows & SLA tương tự core, trừ khi có quy định khác. [code_file:536][code_file:455]

- **Partner assets** (vendor_type = partner):  
  - Partner chịu primary support;  
  - Nextflow làm L1 cho tenants (nhận ticket, phân loại, redirect), hoặc cho phép tenants contact partner trực tiếp (tuỳ chương trình); [code_file:537]  
  - có thể có "joint support" cho issues phức tạp (Nextflow + partner cùng xử lý).

- **Community assets** (vendor_type = customer/community):  
  - Không SLA chính thức;  
  - Nextflow không bắt buộc fix;  
  - vẫn có thể trợ giúp best-effort hoặc hướng dẫn.

Responsibility phải được thể hiện rõ trong `support_model` & `sla_summary` trên listing. [code_file:536]

## 4. Ticket & incident routing

### 4.1 Người dùng tạo ticket thế nào?

- Trong UI:
  - từ Installed assets view: nút "Report an issue"; [code_file:538]  
  - từ lỗi UI/flows liên quan asset: link "This might be caused by asset X – report".

- Ticket chứa:  
  - tenant, asset_id, asset_version; [code_file:536]  
  - mô tả, loại issue (functional/performance/integration/security/AI);  
  - logs hoặc error IDs (nếu có). [code_file:452]

### 4.2 Routing logic

- Dựa trên vendor_type & support_model: [code_file:536][code_file:537]  
  - first_party → Nextflow Support queue;  
  - partner → Nextflow L1 hoặc direct partner queue (theo thỏa thuận);  
  - community → Nextflow community/support forum.

- Security/data incidents:  
  - luôn route vào security/data incident process Pack 06–92; [code_file:452][code_file:482]  
  - notify Governance & Risk.

### 4.3 Incident lifecycle (liên kết Pack 06–92)

- Các bước:  
  1) Detection & triage;  
  2) Containment (có thể include disable asset hoặc kill switch logic nếu cần); [code_file:452][code_file:512]  
  3) Eradication & fix;  
  4) Recovery;  
  5) Post-incident review & learning (Nextflow + partner nếu partner asset). [code_file:454]

- Severity & impact assessment dựa trên:  
  - số tenants bị ảnh hưởng;  
  - flows tier 3–4; [code_file:451]  
  - data classes bị ảnh hưởng; [code_file:482]  
  - AI involvement nếu có. [code_file:510]

## 5. SLA cho ecosystem

### 5.1 SLA cho first-party assets

- Có thể nối với core SLA (Pack 06–95): [code_file:455]  
  - Availability: assets không được degrade overall platform uptime;  
  - Response times: thời gian phản hồi tickets;  
  - Time to mitigation cho incidents critical.

- Cụ thể cho connectors:  
  - best effort align với limits của hệ thống external;  
  - không đảm bảo 100% nếu upstream downtime.

### 5.2 SLA cho partner assets

- Partners được khuyến nghị hoặc yêu cầu định nghĩa:  
  - thời gian phản hồi tickets;  
  - thời gian fix issues critical;  
  - availability mục tiêu.

- SLA của partner phải được thể hiện trong `sla_summary` và/hoặc link docs. [code_file:536][code_file:537]  
- Nextflow không cam kết thay partner, nhưng có thể:  
  - provide status transparency;  
  - hỗ trợ tenants escalate nếu cần.

### 5.3 SLA expectations cho community assets

- Không SLA;  
- UI & docs nêu rõ: assets/community scripts dùng "as-is";  
- có thể xếp một số community assets thành "featured" nếu được Nextflow & partner xác nhận.

## 6. Monitoring & health cho assets

### 6.1 Metrics từ Pack 07

Dùng nền tảng analytics Pack 07 để track:

- `fact_asset_install` – installs/uninstalls per tenant/asset/date; [code_file:479][code_file:536]  
- `fact_asset_usage` – số lần asset được gọi (triggers/actions/UI views); [code_file:479][code_file:508]  
- `fact_asset_incident` – incidents liên quan asset (severity, type). [code_file:452][code_file:536]

Derived metrics:
- adoption per vertical; [code_file:480][code_file:507]  
- error rate per asset;  
- mean time to resolve issues per asset/vendor.

### 6.2 Health dashboards

- Cho Ecosystem team:  
  - bảng assets top/bottom theo adoption;  
  - assets có error/incident rate cao;  
  - assets bị stale (không cập nhật > N tháng). [code_file:536][code_file:537]

- Cho Governance & Risk:  
  - assets high-risk với incidents gần đây; [code_file:451][code_file:510]  
  - assets access PII/financial data; [code_file:482]  
  - view cross-incidents patterns.

- Cho Partners:  
  - usage & health riêng asset của họ;  
  - benchmark vs assets tương tự (nếu chính sách cho phép).

## 7. Deprecation & sunsetting assets

### 7.1 Lý do deprecation

Assets có thể bị deprecate vì:
- không còn maintained hoặc vendor rời ecosystem;  
- risk level thay đổi (vd security issues chưa fix);  
- có asset khác thay thế tốt hơn;  
- dependencies (upstream API) bị sunset.

### 7.2 Quy trình deprecation

1. Ecosystem team gắn `deprecation_status = deprecated` trong catalog. [code_file:536]  
2. Cập nhật listing:  
   - banner "Deprecated" + lý do & timeline;  
   - gợi ý asset thay thế nếu có.  
3. Thông báo tới tenants đã cài:  
   - email & in-app notifications;  
   - hướng dẫn migration & deadlines.  
4. Nếu tới EoL:  
   - `deprecation_status = end_of_life`;  
   - asset không còn installable;  
   - có thể bị force-disable nếu critical risk (theo policy Pack 06). [code_file:451][code_file:452]

### 7.3 Data & config handling

- Khi uninstall/EoL:  
  - định nghĩa rõ asset được phép hoặc không được phép giữ data;  
  - config & logs xử lý theo data retention policies Pack 07–104. [code_file:482][code_file:494]

## 8. Kill switches & safety levers

- Mỗi asset high-impact hoặc high-risk nên có khả năng **kill switch**:  
  - disable extension logic; [code_file:535]  
  - tạm thời chặn triggers/actions mới;  
  - ẩn UI entry points liên quan.

- Kill switch có thể triggered bởi:  
  - incident security/data; [code_file:452][code_file:482]  
  - severe performance degradation;  
  - AI behavior gây risk cao (theo 124/126). [code_file:510][code_file:512]

- Ownership:  
  - Nextflow có quyền kill switch đối với assets trong marketplace;  
  - partners được notify & tham gia remediation.

## 9. Gắn kết với AI governance (Pack 08)

Đối với assets có AI components (ai_skill): [code_file:507][code_file:509][code_file:510]

- phải link tới AI Use Case Records (124) nếu high-risk; [code_file:510]  
- monitoring AI-specific:  
  - feedbacks từ users;  
  - override rates & complaint rates;  
- incidents:  
  - AI outputs gây impact phải follow flow 124/126 + 06–92. [code_file:452][code_file:512]

UI (theo 144) phải surface rõ "Uses AI" và link tới governance info. [code_file:538]

## 10. Vai trò & trách nhiệm

- **Ecosystem & Partnerships**  
  - own relationships với partners;  
  - curate assets;  
  - manage deprecation & sunsetting. [code_file:537]

- **Support & Operations**  
  - handle L1 tickets;  
  - route incidents; [code_file:452][code_file:454]  
  - maintain health dashboards. [code_file:479][code_file:480]

- **Governance & Risk / Security**  
  - define policies; [code_file:451][code_file:482][code_file:510]  
  - oversee incidents;  
  - approve high-risk assets & responses.  

- **Product & Engineering**  
  - maintain marketplace platform;  
  - implement kill switches & monitoring hooks. [code_file:535][code_file:536]

- **Partners**  
  - support assets của họ; [code_file:537]  
  - comply với policies;  
  - tham gia incident resolution.

## 11. Điều kiện hoàn thành của tài liệu

Ecosystem Operations, Support and SLA Playbook được xem là đạt yêu cầu khi:
- mọi asset trên marketplace đều có support model & incident path rõ ràng; [code_file:536][code_file:537]  
- Ecosystem & Support biết dùng metrics Pack 07 để theo dõi health & quality của ecosystem; [code_file:479][code_file:480]  
- Governance & Risk có hooks để can thiệp khi assets gây issues (kill switches, deprecation); [code_file:451][code_file:452][code_file:482][code_file:510][code_file:512]  
- và tenants hiểu rõ họ có thể mong đợi gì từ Nextflow vs partners khi sử dụng assets trong hệ sinh thái.
