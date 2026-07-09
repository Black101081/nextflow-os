# Nextflow OS – Pack 09 Ecosystem and Marketplace Execution Prompts Library

**Document ID:** 148_PACK09_ECOSYSTEM_AND_MARKETPLACE_EXECUTION_PROMPTS_LIBRARY  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Ecosystem & Partnerships / Product / Tenant Admin Enablement  
**Dependent Packs:** 09 Overview (140), 09 Extension Model (141), 09 Catalog Model (142), 09 Partner Program (143), 09 Marketplace UX (144), 09 Ops & SLA (145), 09 Summary (147)  

## 1. Mục tiêu tài liệu

Tài liệu này là **prompt library thực thi** cho Pack 09 – giúp tenant admins, Product/Ecosystem và partners biết **hỏi gì và làm gì** khi sử dụng marketplace, review assets, chọn packs và theo dõi sức khoẻ ecosystem.

## 2. Prompts cho tenant admin – khám phá & cài đặt an toàn

### 2.1 Khám phá assets phù hợp

- "Với tenant của tôi (ngành [INDUSTRY], size [SIZE], wedges đang dùng [WEDGES]), gợi ý 5 assets đầu tiên nên cài để cải thiện [MỤC TIÊU: SLA, QBR, CSAT…]."  
- "Cho tôi xem các vertical packs phù hợp với ngành [INDUSTRY] và giải thích ngắn gọn từng pack gồm những gì."  
- "Tôi đang gặp vấn đề [PAIN POINT], assets nào trên marketplace có thể giúp giải quyết?"  
- "Danh sách connectors phổ biến mà các tenants giống tôi thường cài và lợi ích chính là gì?" 

### 2.2 Đọc & hiểu listing chi tiết

- "Giải thích giúp tôi phần Data & permissions của asset [ASSET_NAME] – nó truy cập loại dữ liệu nào và có rủi ro gì?"  
- "Asset [ASSET_NAME] được gán risk level [LEVEL]; điều này có nghĩa gì đối với tổ chức của tôi?"  
- "So sánh giúp tôi hai assets [A] và [B] để giải quyết cùng một bài toán – khác nhau về capabilities, data access và support thế nào?"  
- "Cho tôi checklist các câu hỏi nên tự hỏi trước khi cài asset [ASSET_NAME]."  

### 2.3 Thiết lập policies

- "Gợi ý chính sách marketplace ban đầu cho một SME mới: risk levels nào nên được cho phép, vendor nào nên ưu tiên?"  
- "Tôi muốn chỉ cho phép first-party và strategic partners; hãy liệt kê cách set up policy và kiểm tra lại."  
- "Nếu tôi chỉ cho phép assets risk ≤ Medium, những asset high-risk nào tôi đang bỏ lỡ và có thể bù trừ bằng cách khác?"

### 2.4 Quản lý assets đã cài

- "Danh sách các assets đã cài trên tenant tôi, kèm theo risk level, data classes và vendor."  
- "Asset nào đã lâu không được sử dụng hoặc có incident rate cao – tôi nên xem xét gỡ hoặc thay thế?"  
- "Gợi ý 3 hành động để dọn dẹp/chuẩn hoá ecosystem assets trong tenant của tôi."  
- "Cho tôi xem assets đang ở trạng thái deprecated/EoL và kế hoạch migration tương ứng." 

## 3. Prompts cho Product/Ecosystem – thiết kế & curate ecosystem

### 3.1 Phát hiện gaps & cơ hội assets mới

- "Dựa trên usage & pain signals từ tenants trong ngành [INDUSTRY], những loại assets nào đang thiếu?"  
- "Có wedge nào (Operations/CS/Finance…) có ít assets nhưng usage cao – gợi ý cơ hội xây vertical pack?"  
- "Những connectors nào thường được yêu cầu nhưng chưa có pack nào hỗ trợ đầy đủ?"  
- "Cho tôi top 10 search terms trong marketplace không có kết quả phù hợp – đây là các gap gì?"

### 3.2 Curate collections & recommendations

- "Gợi ý danh sách "Starter packs" cho tenants mới ở ngành [INDUSTRY] với 5–7 assets hữu ích nhất."  
- "Tạo một collection "Automation accelerators" dựa trên assets có impact tốt lên SLA/throughput."  
- "Gợi ý assets nên được featured cho kỳ [THỜI GIAN] dựa trên usage, rating và risk profile." 

### 3.3 Đánh giá quality của assets và partners

- "Liệt kê assets của partner [PARTNER_NAME] cùng với installs, usage, incident rate và rating."  
- "Assets nào có adoption cao nhưng rating thấp – cần ưu tiên làm việc với vendor/partner nào?"  
- "Cho tôi xem assets với incident security/data gần đây và các hành động đã thực hiện."  
- "Gợi ý partners nên mời vào chương trình strategic dựa trên performance hiện tại." 

## 4. Prompts cho Governance & Risk / Security

- "Danh sách tất cả assets high-risk hiện active, cùng với data classes access và incidents gần đây."  
- "Assets nào truy cập PII hoặc financial data nhưng chưa được review lại trong 12 tháng?"  
- "Cho tôi view các assets sử dụng AI, risk level, guardrails và link đến AI Use Case Records tương ứng."  
- "Những tenants nào đang sử dụng assets high-risk nhiều nhất và có cần review thêm về policy không?" 

## 5. Prompts cho Partners / Developers

- "Tôi là partner muốn build asset cho ngành [INDUSTRY]; gợi ý loại asset, capabilities và risk level phù hợp để bắt đầu."  
- "Dựa trên usage hiện tại, assets nào (của tôi) nên được ưu tiên cải thiện performance hoặc UX?"  
- "Cho tôi feedback tổng hợp từ tenants về asset [ASSET_NAME] – rating, comments, incidents."  
- "Gợi ý cách điều chỉnh asset [ASSET_NAME] để giảm risk level từ High xuống Medium (nếu possible)." 

## 6. Prompts cho Ops/Support – xử lý incidents & support

- "Liệt kê các tickets hỗ trợ liên quan đến asset [ASSET_NAME] trong 30 ngày qua và nhóm theo loại issue."  
- "Assets nào đang gây nhiều tickets nhất và nguyên nhân thường gặp là gì?"  
- "Gợi ý hành động để giảm số ticket liên quan đến connectors (training, docs, changes)."  
- "Cho tôi danh sách assets mà gần đây đã kích hoạt kill switch hoặc deprecation và lý do." 

## 7. Điều kiện hoàn thành của tài liệu

Prompt Library Pack 09 được xem là đạt yêu cầu khi:
- Tenant admins có thể dùng prompts để khám phá, đánh giá và quản lý assets an toàn;  
- Product/Ecosystem & Partners có prompts để tìm gap, curate và cải thiện assets;  
- Governance & Risk có prompts để giám sát risk và AI usage trong ecosystem.
