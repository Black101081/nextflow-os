# Nextflow OS – Pack 09 Partner and Developer Program and Governance

**Document ID:** 143_PACK09_PARTNER_AND_DEVELOPER_PROGRAM_AND_GOVERNANCE  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Ecosystem & Partnerships / Product / Governance & Risk  
**Dependent Packs:** 02 Core Platform & Data, 04 Orchestration & Work Management, 05 Integration & Extensibility, 06 Governance & Operations, 07 Data, Analytics & Insights, 08 Advanced Intelligence, 09 Overview (140), 09 Extension Model (141), 09 Catalog & Listing Model (142)  

## 1. Mục tiêu tài liệu

Tài liệu này định nghĩa **Partner and Developer Program and Governance** cho Pack 09 – cách Nextflow làm việc với partners & developers để xây dựng, review, publish và vận hành assets trong ecosystem (extensions, apps, packs) một cách có kiểm soát.

Mục tiêu:
- phân loại **loại partners & developers** (first-party, strategic partners, solution partners, community developers);  
- định nghĩa **yêu cầu & trách nhiệm** cho mỗi loại (security, data, quality, support);  
- mô tả **governance process** cho asset lifecycle (review, approval, audits, incidents);  
- đảm bảo program này align với risk tiers, incidents & change governance Pack 06. [code_file:451][code_file:452][code_file:453][code_file:454][code_file:455]

## 2. Phân loại partners & developers

### 2.1 First-party (Nextflow-built)

- Assets được build bởi chính đội Nextflow (Product, Engineering, Data, Ecosystem).  
- Thường là connectors core, automation templates chuẩn, dashboards & AI skills quan trọng. [code_file:431][code_file:435][code_file:479][code_file:480][code_file:507][code_file:509]

Đặc điểm:
- chịu full ownership bởi Nextflow (thiết kế, chất lượng, support).  
- là "baseline" để partners biết tiêu chuẩn.

### 2.2 Strategic partners

- Công ty có quan hệ hợp tác sâu (vd nhà cung cấp SaaS lớn có connector chính thức, integrator chiến lược).  
- Assets: connectors chính thức, vertical packs chung, solution kits phức tạp.

Đặc điểm:
- thường có hợp đồng đối tác, mutual commitments về roadmap & support.  
- có thể được gắn cờ "Official Partner" trong marketplace.

### 2.3 Solution partners / System integrators

- Đối tác triển khai, tư vấn, có thể build custom packs cho khách và (khi phù hợp) publish versions generic.  
- Assets: vertical packs, automation templates, dashboards, workflows sector-specific.

Đặc điểm:
- không nhất thiết có brand lớn, nhưng có chuyên môn domain.  
- quality & support do họ đảm nhận, Nextflow curate & khuyến nghị.

### 2.4 Community developers / Customers

- Khách hàng hoặc dev community build các extensions/app/packs;  
- ban đầu có thể chỉ dùng private trong tenant;  
- sau này có thể đề xuất đưa lên marketplace (với review nghiêm ngặt hơn).

Đặc điểm:
- độ tin cậy & support đa dạng;  
- cần khung rõ ràng cho phân biệt "internal only" vs "public-ready".

## 3. Yêu cầu chung cho mọi partners & developers

Tất cả assets publish ra ngoài tenant riêng đều phải đáp ứng tối thiểu:

- **Security & data handling**  
  - tuân multi-tenant isolation; [code_file:479][code_file:482]  
  - không log PII nhạy cảm ngoài những gì allowed; [code_file:482]  
  - không gửi data tới dịch vụ bên ngoài ngoài những endpoint đã khai báo.  

- **Quality & resilience**  
  - error handling cơ bản;  
  - không làm degrade performance core quá mức (time-bounded, backoff).  

- **Documentation**  
  - docs sử dụng & cấu hình (admin, end-users);  
  - mô tả rõ dependencies & impact (flows, data).  

- **Support & contact**  
  - kênh support;  
  - thời gian phản hồi cam kết (nếu có SLA). [code_file:455]

## 4. Governance process cho asset lifecycle

### 4.1 Tổng quan

Asset lifecycle đã được định nghĩa ở 141–142 (development → review → private listing → public → deprecation/EoL). [code_file:535][code_file:536] Governance bổ sung **checkpoints & requirements** cho mỗi bước.

### 4.2 Onboarding partner/developer

- 
  - ký các thỏa thuận cần thiết (NDA, data processing, partner agreement);  
  - xác minh entity (company info, domain ownership).  

- 
  - bootstrap access vào dev tools, sandbox environment, docs Extensibility (141). [code_file:535]

### 4.3 Asset submission & review

Partners/developers gửi assets kèm:
- manifest (141) + asset metadata (142); [code_file:535][code_file:536]  
- tài liệu mô tả: value, flows, data, risk;  
- test results cơ bản.

Review gồm:
- **Security review** – xem scopes permissions, data_classes_accessed, thứ ba liên quan. [code_file:482][code_file:535]  
- **Risk assessment** – gán risk_level (low/medium/high) dựa trên flows & data (Pack 06–91, 124). [code_file:451][code_file:510]  
- **Functional review** – confirm asset hoạt động như mô tả, không phá workflow cốt lõi.  
- **UX review** – check UX patterns & copy nếu asset có UI (align Pack 03 & 125). [code_file:480][code_file:511]

### 4.4 Approval & listing

- Nếu qua review:  
  - asset được chuyển sang state Private Listing; [code_file:536]  
  - chọn tenants pilot (nếu đối tượng rộng).  

- Sau pilot thành công & feedback tốt:  
  - asset có thể lên Public Listing;  
  - updated metadata (risk_level nếu cần điều chỉnh; rating; summary). [code_file:536]

### 4.5 Periodic review & audits

Đối với assets public/high-impact:
- periodic review (6–12 tháng):  
  - check `last_update_at`, incidents, rating, usage; [code_file:452][code_file:479][code_file:480]  
  - audit lại data access & AI behavior nếu có (liên quan 124–126). [code_file:510][code_file:512]

- Partners có thể bị yêu cầu cập nhật để giữ asset active.

## 5. Risk tiers & policies áp dụng cho assets

Dựa trên Pack 06–91 & AI governance 124, assets được phân:

- **Low-risk assets**  
  - automation templates, dashboards không chạm data nhạy cảm;  
  - internal-only SOP assistants;  
  - connectors chỉ đọc data low-sensitivity. [code_file:451][code_file:482]  

- **Medium-risk assets**  
  - assets ảnh hưởng ưu tiên work, routing, staffing;  
  - connectors sync data moderate sensitivity; [code_file:431][code_file:435]  
  - AI skills dùng cho prioritization nhưng không auto-act. [code_file:507][code_file:509]

- **High-risk assets**  
  - assets auto-act trên flows Tier 3–4 hoặc types financial/compliance;  
  - connectors đọc/ghi financial/PII nhạy cảm;  
  - AI skills có thể gợi ý decisions high-impact external. [code_file:451][code_file:482][code_file:510]

Policies:
- High-risk assets:  
  - strict review;  
  - có thể chỉ được cài bởi tenants đã ký thỏa thuận cao hơn;  
  - yêu cầu monitoring & incident playbook rõ ràng.

## 6. Trách nhiệm support & incidents

### 6.1 Support model

- **First-party assets**  
  - Nextflow cung cấp support (theo SLA core hoặc SLA riêng); [code_file:455]  

- **Partner assets**  
  - partner chịu primary support;  
  - Nextflow có thể hỗ trợ level 1 & chuyển tiếp;  
  - rõ ràng trong `support_model` & `sla_summary`. [code_file:536]

- **Community assets**  
  - không SLA chính thức;  
  - được label "community".

### 6.2 Incident handling

- Khi incident liên quan asset xảy ra:  
  - classify theo Pack 06–92: security/data vs quality/operations; [code_file:452]  
  - xác định bên chịu trách nhiệm chính (Nextflow vs partner vs customer);  
  - mở ticket tới parties liên quan;  
  - chạy joint post-incident review khi cần (Nextflow + partner). [code_file:454]

- Asset có incident nghiêm trọng có thể bị:  
  - tạm thời unlisted;  
  - forced update;  
  - move to deprecated/EoL.

## 7. Compliance & legal considerations

- Partner phải tuân các yêu cầu tối thiểu:  
  - data processing agreements (DPA) khi xử lý data cá nhân;  
  - chuẩn bảo mật cơ bản (encrypt in transit, secure SDLC…);  
  - tuân luật theo region supported.  

- Marketplace nên cho admins thấy:  
  - links tới legal docs của partner;  
  - summary compliance (vd ISO, SOC 2 nếu relevant).

## 8. Incentives & metrics cho partners

Để ecosystem sống khỏe, Pack 09 cũng nên định nghĩa:

- **Incentives:**  
  - visibility (feature trong collections, recommendations); [code_file:536]  
  - access tới insights usage aggregated; [code_file:479][code_file:480]  
  - co-marketing hoặc referral programs.  

- **Metrics:**  
  - installs, active usage, retention tenants dùng asset; [code_file:479][code_file:480][code_file:507][code_file:508]  
  - incident rates; [code_file:452]  
  - ratings & feedback.

Partners nên nhận reports định kỳ về performance assets của họ.

## 9. Điều kiện hoàn thành của tài liệu

Partner and Developer Program and Governance được xem là đạt yêu cầu khi:
- các loại partners & developers được phân loại rõ với yêu cầu & trách nhiệm;  
- governance process cho asset lifecycle (review, approvals, periodic audits, incidents) align với Pack 06–07–08; [code_file:451][code_file:452][code_file:482][code_file:510]  
- SMEs & admins có thể tin rằng assets trên marketplace đã qua một mức curate tối thiểu;  
- và Ecosystem team có khung thực tế để vận hành chương trình partner/developer.
