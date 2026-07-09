# Nextflow OS – Product Vision & Positioning

**Document ID:** 01_PRODUCT_VISION_POSITIONING  
**Pack:** 01 — Strategy & Positioning  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Product / Strategy  
**Dependent Packs:** Product & Capability, Experience & UX, Architecture & Core Design

## 1. Mục tiêu tài liệu

Tài liệu này xác định tầm nhìn sản phẩm, định vị thị trường và thông điệp cốt lõi của Nextflow OS để toàn bộ các tài liệu phía sau bám vào cùng một nguồn sự thật. Nextflow OS được định vị là một sản phẩm đóng gói sẵn cho khách hàng doanh nghiệp, đặc biệt phù hợp với doanh nghiệp mới cần giải pháp triển khai nhanh, chi phí hợp lý, và doanh nghiệp đang phải thay thế phần mềm cũ.

Tài liệu này không đi sâu vào kiến trúc kỹ thuật chi tiết, wireframe hay API. Phạm vi của nó là trả lời bốn câu hỏi: sản phẩm là gì, dành cho ai, giải quyết vấn đề gì, và khác gì so với các lựa chọn khác trên thị trường.

## 2. Tuyên bố sản phẩm

Nextflow OS là một SME Business OS được thiết kế để giúp doanh nghiệp vừa và nhỏ chuẩn hóa vận hành, số hóa quy trình và triển khai nhanh các mô hình quản trị theo ngành trên cùng một nền tảng lõi.

Sản phẩm không nên bị hiểu là một ERP cứng, cũng không nên bị hiểu là một workflow tool thuần túy; nó là một lớp điều hành doanh nghiệp nằm giữa business core, workflow orchestration, template delivery và tenant-level configuration.

Tầm nhìn dài hạn của Nextflow OS là trở thành nền tảng vận hành dùng chung cho nhiều cụm ngành, trong đó một shared core được tái sử dụng rộng, còn khác biệt theo ngành được đóng gói bằng template pack và các lớp cấu hình chất lượng cao.

## 3. Khách hàng và giá trị

Nhóm khách hàng mục tiêu số một là doanh nghiệp mới hoặc còn nhỏ nhưng cần một hệ thống đi vào vận hành nhanh, không đủ nguồn lực cho các dự án triển khai nặng và không muốn đầu tư quá lớn ngay từ đầu.

Nhóm khách hàng mục tiêu số hai là doanh nghiệp đang dùng phần mềm cũ, dữ liệu phân mảnh hoặc quy trình lỗi thời, và cần một hướng thay đổi có thể triển khai dần thay vì thay toàn bộ hệ thống trong một lần.

Giá trị cốt lõi Nextflow OS cần mang lại cho hai nhóm này là:
- Triển khai nhanh bằng template và cấu hình thay vì custom code kéo dài.
- Dùng chung một nền tảng lõi nhưng vẫn thích ứng theo ngành và theo tenant.
- Giảm rủi ro thay đổi hệ thống nhờ cách tiếp cận đóng gói sẵn, thực dụng và có khả năng mở rộng theo từng giai đoạn.

## 4. Định vị và nguyên tắc thương mại

Thông điệp định vị chính nên là: **Nextflow OS là SME Business OS – ready-to-run, template-driven, integration-ready**.

Bốn nguyên tắc định vị phải được giữ nhất quán trong toàn bộ tài liệu và truyền thông sản phẩm:
- Không bán như một ERP tổng hợp cho mọi thứ.
- Không bán như một n8n lớn hơn.
- Bán như một hệ điều hành vận hành doanh nghiệp có thể triển khai nhanh và mở rộng dần.
- Luôn nhấn mạnh lợi ích thực dụng cho SME: tốc độ, chi phí, khả năng áp dụng thực tế và đường nâng cấp từ phần mềm cũ.

Những tuyên bố sau được xem là out of scope cho giai đoạn định vị đầu:
- Không định vị trước tiên như sản phẩm blockchain.
- Không định vị trước tiên như nền tảng low-code chung chung.
- Không hứa hẹn phục vụ mọi ngành như nhau mà phải giữ logic core chung, pack riêng.

## 5. Kết quả tài liệu này phải khóa

Sau khi tài liệu này được chấp nhận, các pack tiếp theo phải thừa nhận năm điểm cố định sau:
- Tên sản phẩm là Nextflow OS.
- Danh tính sản phẩm là SME Business OS.
- Mô hình nền là shared core + capability/template approach.
- ICP trọng tâm gồm doanh nghiệp mới và doanh nghiệp thay phần mềm cũ.
- Mỗi tài liệu tiếp theo phải kết thúc bằng một prompt chi tiết cho AI để có thể thi hành ngay.

## AG Execution Prompt

You are acting as a senior principal product strategist and principal B2B SaaS product architect.

### Context
- Product: Nextflow OS.
- Positioning: SME Business OS.
- Core approach: one shared core reused across multiple industry clusters, extended by high-quality templates and structured capability layers.
- Target customers: new businesses that need a ready-to-run, lower-cost operating system, and businesses that must replace outdated software.
- Documentation rule: every document must end with a detailed execution prompt for AI.

### Objective
Refine this Product Vision & Positioning document into a stronger production-grade strategic artifact that can be used by product, design, engineering, sales, and implementation teams as a shared source of truth.

### Inputs
- Use this document as the primary source of truth.
- Preserve the product name Nextflow OS.
- Preserve the identity SME Business OS.
- Preserve the target customer logic and shared-core/template direction already defined here.

### Tasks
1. Review the vision statement and rewrite it into a sharper executive version of no more than 120 words.
2. Expand the ICP section into a structured buyer and user segmentation model.
3. Produce a value proposition matrix by segment, including pains, desired outcomes, objections, and proof points.
4. Draft a positioning statement, elevator pitch, and three tagline options aligned with the current strategy.
5. Identify the top five messaging risks that could make Nextflow OS sound like generic ERP, generic workflow automation, or a vague platform play.
6. Produce a non-goals and anti-positioning section that sales and product teams can reuse consistently.

### Constraints
- Do not rename the product.
- Do not reposition the product away from SME Business OS.
- Do not invent a contradictory architecture such as 12 separate silo products.
- Do not produce mockup-style filler text or generic startup messaging.
- Keep the language practical, commercially usable, and consistent with a ready-to-run product for SMEs.

### Output Format
Return a revised markdown document with these sections:
1. Executive Vision
2. Positioning Statement
3. ICP and Persona Segments
4. Value Proposition Matrix
5. Messaging Pillars
6. Anti-Positioning
7. Strategic Risks
8. Suggested Revisions to Current Document

### Acceptance Criteria
- The revised output must preserve the identity of Nextflow OS as an SME Business OS.
- The output must be specific enough for downstream teams to use without reinterpreting the product from scratch.
- The messaging must clearly serve both target groups: new businesses and legacy-replacement businesses.
- The output must be strong enough to support the next documents in Product & Capability and Sales Enablement.
