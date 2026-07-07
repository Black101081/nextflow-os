# Nextflow OS – Experience Delivery Strategy

## 1. Mục tiêu tài liệu

Tài liệu này chốt chiến lược phân phối trải nghiệm người dùng cho Nextflow OS, bao gồm cách sản phẩm nên được cung cấp qua web, mobile và các portal chuyên biệt theo vai trò. [cite:170][cite:200] Trọng tâm không chỉ là chọn kênh hiển thị, mà là xác định đúng loại trải nghiệm cho từng nhóm người dùng để sản phẩm vừa triển khai nhanh, vừa dễ dùng, vừa giữ được chiều sâu vận hành của một SME Business OS. [web:246][web:256]

## 2. Kết luận chiến lược

Nextflow OS nên được triển khai theo mô hình **web-first, mobile-assisted, PWA-first**. [web:255][web:260][cite:200] Web là trung tâm điều hành và cấu hình; mobile là lớp tác nghiệp tốc độ cao cho nhân sự hiện trường hoặc di chuyển; còn các portal chuyên biệt giúp tách trải nghiệm theo actor thay vì ép mọi người vào cùng một giao diện. [web:242][web:258][cite:170]

Điều này đặc biệt phù hợp với SME vì giúp tối ưu ba yếu tố quan trọng nhất: tốc độ go-live, chi phí sở hữu và khả năng học nhanh của người dùng. [web:225][web:228][cite:200] Đồng thời, mô hình này tương thích với hướng integration-first của U2U Next và giai đoạn sản phẩm hóa thành Nextflow OS. [cite:174][cite:200]

## 3. Nguyên tắc thiết kế trải nghiệm

### 3.1 Một lõi dữ liệu, nhiều giao diện theo vai trò

Nextflow OS không nên có một giao diện khổng lồ cho tất cả mọi người. [cite:170] Thay vào đó, một lõi dữ liệu và capability engine dùng chung phải được bọc bởi nhiều trải nghiệm mỏng hơn, tối ưu cho từng vai trò như admin, operator, nhân sự hiện trường, khách hàng và đối tác triển khai. [cite:170][cite:200]

### 3.2 Web cho chiều sâu, mobile cho tốc độ

Các tác vụ cấu hình, báo cáo, phân quyền, template, policy và giám sát đa chiều phù hợp nhất với web vì cần không gian màn hình lớn và tương tác phức tạp. [web:246][web:256] Ngược lại, tác vụ hiện trường, cập nhật trạng thái nhanh, check-in, xác nhận hoàn thành, xử lý công việc tại điểm nên được tối ưu cho mobile. [web:242][web:258]

### 3.3 Offline chọn lọc, không đồng bộ vô hạn

Kinh nghiệm từ field service mobile cho thấy offline tốt không có nghĩa là kéo toàn bộ dữ liệu về thiết bị. [web:258][web:264] Offline đúng là chỉ đồng bộ những dữ liệu cần thiết theo vai trò, theo khu vực và theo khoảng thời gian làm việc, nhằm giữ hiệu năng và giảm rủi ro đồng bộ lỗi. [web:258][web:259]

### 3.4 Portal hóa trải nghiệm

Để sản phẩm dễ học và dễ bán hơn, mỗi nhóm người dùng chính nên có portal riêng với điều hướng, ngôn ngữ và mục tiêu khác nhau. [cite:170][cite:200] Đây là cách biến một nền tảng phức tạp thành các trải nghiệm đơn giản, có thể tiếp cận dần theo nhu cầu thực tế. [web:230][web:237]

## 4. Mô hình trải nghiệm tổng thể

| Bề mặt trải nghiệm | Vai trò chính | Thiết bị chính | Mục tiêu |
|---|---|---|---|
| Web Admin | Owner, admin, back office, manager | Desktop/laptop | Điều hành, cấu hình, báo cáo, policy, template, quản trị tenant. [web:246][cite:170] |
| Mobile Ops | Sales, kỹ thuật, giao nhận, supervisor, nhân sự hiện trường | Điện thoại/tablet | Tác nghiệp nhanh, nhận việc, cập nhật tiến độ, check-in/out, scan, phê duyệt nhanh. [web:242][web:258] |
| Customer Portal | Khách hàng cuối, đối tác mua hàng/dịch vụ | Mobile + web | Tự phục vụ, booking, theo dõi đơn/trạng thái, thanh toán, hỗ trợ. [web:243][web:249] |
| Partner Portal | Đội triển khai, đại lý, đối tác tích hợp, agency | Desktop/laptop | Cài đặt tenant, quản lý rollout, connector, template, migration, support. [cite:174][cite:200] |

## 5. Screen strategy cho Web Admin

### 5.1 Vai trò

Web Admin là **control center** của Nextflow OS. [cite:119][cite:170] Đây là nơi chủ doanh nghiệp, quản lý và back-office nhìn thấy bức tranh toàn doanh nghiệp, thiết lập quy tắc và điều phối hệ thống. [cite:170][cite:200]

### 5.2 Đặc tính trải nghiệm

- Data-dense nhưng phải dễ quét. [web:246]
- Điều hướng rõ theo capability, không theo cấu trúc kỹ thuật. [cite:170]
- Có khả năng drill-down từ KPI xuống transaction, task hoặc record cụ thể. [cite:119]
- Phải hỗ trợ cấu hình tenant, policy, template và báo cáo mà không đòi hỏi người dùng biết kỹ thuật. [cite:200]

### 5.3 Bộ màn hình cốt lõi

1. **Executive Dashboard** – tình hình doanh nghiệp, doanh thu, tồn kho, công việc chậm, backlog phê duyệt, cảnh báo. [cite:119][cite:170]
2. **Operations Console** – danh sách công việc, đơn hàng, lịch hẹn, yêu cầu dịch vụ, ticket vận hành. [cite:170]
3. **Records & Transactions** – xem và xử lý entity gốc như khách hàng, đơn hàng, hóa đơn, lịch hẹn, hợp đồng, tài sản. [cite:170][cite:201]
4. **Workflow & Approval Center** – hàng đợi phê duyệt, escalation, trạng thái tiến trình. [cite:170]
5. **Template & Automation Studio** – chọn template, chỉnh flow ở mức cấu hình, quản lý trigger/action. [cite:170]
6. **Policy & Roles** – role, permission, SLA, rule, ngưỡng duyệt, quy tắc branch. [cite:170]
7. **Reports & Insights** – KPI, báo cáo, xuất dữ liệu, so sánh kỳ, AI insight. [cite:174]
8. **Settings & Integrations** – connector, tenant profile, branding, dữ liệu chủ, audit, health check. [cite:174][cite:200]

### 5.4 Điều hướng đề xuất

Web Admin nên dùng cấu trúc điều hướng 3 tầng:
- **Primary nav** theo business domains: Dashboard, Operations, Sales, Finance, Service, Customers, Reports, Settings.
- **Context nav** theo module hoặc vertical pack đang dùng.
- **Detail panel / drawer** cho thao tác nhanh thay vì đẩy người dùng sang quá nhiều page.

## 6. Screen strategy cho Mobile Ops

### 6.1 Vai trò

Mobile Ops là công cụ cho lực lượng hiện trường và người dùng đang di chuyển. [web:242][web:258] Nó không thay web admin mà phục vụ những tương tác ngắn, quyết đoán và theo ngữ cảnh. [web:242]

### 6.2 Đặc tính trải nghiệm

- Mỗi vai trò chỉ thấy những gì họ cần trong ca làm việc. [web:258][web:264]
- Hỗ trợ offline có chọn lọc cho job list, customer details, task checklist và trạng thái gửi chờ đồng bộ. [web:258][web:266]
- Thao tác 1 tay, màn hình ngắn, CTA lớn, ít form dài. [web:255]
- Camera, vị trí, quét mã, chữ ký, ảnh chứng từ là các hành vi ưu tiên. [web:242][web:255]

### 6.3 Bộ màn hình cốt lõi

1. **Today / Shift Home** – lịch hôm nay, job ưu tiên, công việc trễ, KPI cá nhân. [web:242]
2. **Assigned Work List** – danh sách việc được giao theo trạng thái và mức ưu tiên. [web:258]
3. **Task Detail** – thông tin khách hàng, checklist, vật tư, ghi chú, ảnh, chữ ký, trạng thái. [web:242][web:258]
4. **Check-in / Check-out** – xác nhận hiện diện, thời gian, địa điểm, bằng chứng. [web:245]
5. **Quick Actions** – gọi khách, nhắn tin, tạo note, thu tiền, xin phê duyệt, báo sự cố. [web:243]
6. **Offline Queue** – các thay đổi đang chờ đồng bộ, cảnh báo xung đột, trạng thái sync. [web:258][web:266]
7. **Profile / Device Health** – ca làm, hiệu lực phiên, pin, mạng, trạng thái dữ liệu offline.

### 6.4 Quy tắc thiết kế

- Không nhồi dashboard web vào mobile.
- Không yêu cầu người dùng nhập quá nhiều trường trong hiện trường.
- Mọi màn hình chính phải hoàn thành trong dưới 30 giây thao tác. 
- Mọi tác vụ dài phải tách thành stepper hoặc checklist.

## 7. Screen strategy cho Customer Portal

### 7.1 Vai trò

Customer Portal là lớp self-service cho khách hàng cuối hoặc khách hàng doanh nghiệp. [web:243][web:249] Đây là nơi tạo cảm giác chuyên nghiệp và giảm tải cho đội vận hành nội bộ. [web:243]

### 7.2 Mục tiêu

- Cho phép khách hàng tự tạo yêu cầu hoặc đặt lịch.
- Xem trạng thái đơn hàng, lịch hẹn, yêu cầu hỗ trợ, hóa đơn hoặc tài liệu.
- Thực hiện một số hành động như xác nhận, thanh toán, tải file, phản hồi. [web:243][web:249]

### 7.3 Bộ màn hình cốt lõi

1. **Portal Home** – tóm tắt trạng thái, việc cần làm, CTA chính.
2. **Booking / Request Flow** – tạo mới lịch hẹn, yêu cầu dịch vụ hoặc đơn hàng.
3. **Status Tracker** – theo dõi tiến trình theo mốc.
4. **Documents & Invoices** – hóa đơn, hợp đồng, chứng từ, file đính kèm.
5. **Support & Messages** – trao đổi, ticket, phản hồi.
6. **Payments** – thanh toán, xác nhận đã trả, biên nhận.
7. **Profile & Preferences** – thông tin doanh nghiệp/cá nhân, người liên hệ, địa chỉ, thông báo.

### 7.4 Quy tắc thiết kế

- Thiết kế mobile-first vì phần lớn khách hàng mở từ điện thoại. [web:246]
- Nội dung ngắn, CTA rõ, ít menu. [web:253]
- Mỗi portal nên bám chặt theo một vertical cụ thể, tránh generic quá mức. [cite:170]

## 8. Screen strategy cho Partner Portal

### 8.1 Vai trò

Partner Portal phục vụ đội triển khai, reseller, agency và đối tác tích hợp. [cite:174][cite:200] Đây là bề mặt quan trọng nếu Nextflow OS muốn scale nhanh qua mạng lưới triển khai thay vì tự làm hết. [cite:170]

### 8.2 Mục tiêu

- Tạo tenant mới.
- Chọn vertical/template pack.
- Quản lý rollout và môi trường.
- Mapping connector, import dữ liệu và migration.
- Theo dõi support, health và usage của tenant. [cite:174][cite:200]

### 8.3 Bộ màn hình cốt lõi

1. **Partner Dashboard** – tenant đang quản lý, trạng thái rollout, cảnh báo. 
2. **Tenant Provisioning** – tạo tenant, chọn pack, region, plan, branding.
3. **Template Installer** – cài template, vertical pack, report pack, connector pack. [cite:170]
4. **Migration Workspace** – import dữ liệu, mapping field, validation, dry run, dual-run, reconciliation. [cite:174]
5. **Integration Console** – API key, webhook, connector, sync jobs, lỗi mapping. [cite:174][cite:222]
6. **Support & Success Center** – ticket, health score, usage, adoption, renewal signals.
7. **Partner Knowledge Base** – playbook, SOP, checklist go-live, tài liệu đào tạo.

### 8.4 Quy tắc thiết kế

- Portal này phải data-rich nhưng cực rõ ràng, vì sai ở đây sẽ kéo theo lỗi ở nhiều tenant.
- Cần audit trail mạnh cho provisioning, migration và connector changes. [cite:174]
- Nên có wizard nhiều bước cho các thao tác rủi ro cao như cài template hoặc migration.

## 9. Kiến trúc trải nghiệm theo giai đoạn

| Giai đoạn | Kênh nên làm trước | Ghi chú |
|---|---|---|
| Phase 1 | Web Admin + Customer Portal cơ bản | Đủ để bán và chạy tenant đầu tiên. [cite:200] |
| Phase 2 | Mobile Ops dạng PWA | Thêm lớp tác nghiệp cho các vertical cần hiện trường hoặc vận hành theo lịch. [web:255][web:258] |
| Phase 3 | Partner Portal | Tăng tốc rollout, template scale và hỗ trợ ecosystem. [cite:170][cite:200] |
| Phase 4 | Native mobile có chọn lọc | Chỉ khi vertical cụ thể đòi hỏi phần cứng/offline sâu. [web:266] |

## 10. Quyết định chốt

Nextflow OS nên được chốt như một sản phẩm đa bề mặt nhưng một lõi thống nhất. [cite:170][cite:200] Cách triển khai đúng là **Web Admin làm control center**, **Mobile Ops làm lớp tác nghiệp hiện trường**, **Customer Portal làm lớp self-service**, và **Partner Portal làm lớp scale triển khai**. [web:242][web:246][cite:174]

Chiến lược này giúp Nextflow OS vừa giữ được chiều sâu của một Business OS, vừa tránh rơi vào bẫy “một giao diện cố phục vụ tất cả mọi người”. [cite:170][cite:200] Đây là cách phù hợp nhất để sản phẩm vừa dễ bán cho SME, vừa đủ chắc để mở rộng sang nhiều cụm ngành mà không phải viết lại trải nghiệm từ đầu cho mỗi vertical. [cite:170][cite:172]
