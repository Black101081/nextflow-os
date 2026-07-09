# Nextflow OS – Pack 09 Asset Listing and Review Checklist

**Document ID:** 146_PACK09_ASSET_LISTING_AND_REVIEW_CHECKLIST  
**Pack:** 09 — Ecosystem, Marketplace and Extensions  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Ecosystem & Partnerships / Product / Governance & Risk  
**Dependent Packs:** 09 Extension Model (141), 09 Catalog & Listing Model (142), 09 Partner Program (143), 09 Marketplace UX (144), 09 Ops & SLA (145)  

## 1. Mục tiêu tài liệu

Checklist này dùng để xác nhận một asset đã **sẵn sàng để review hoặc niêm yết** trên marketplace hay chưa.

Checklist áp dụng cho:
- connectors packs  
- automation templates  
- dashboard packs  
- AI skills  
- UI extensions  
- vertical packs

## 2. Cách dùng checklist

- Vendor/partner điền self-check trước khi submit.  
- Ecosystem team dùng để triage nhanh.  
- Governance, Security, UX và Support dùng các phần liên quan khi review sâu hơn.

## 3. Submission essentials

### A. Identity and ownership

- [ ] Asset name rõ ràng, không mơ hồ.  
- [ ] Vendor name, vendor type và owner contact đã có.  
- [ ] Asset type được chọn đúng.  
- [ ] Version hiện tại đã được khai báo.  
- [ ] Required core version range đã được khai báo.

### B. Manifest and technical completeness

- [ ] Manifest hợp lệ và đầy đủ các field bắt buộc.  
- [ ] Danh sách capabilities đã khai báo đúng (UI, workflow, integration, analytics, AI).  
- [ ] Permission scopes đã khai báo đầy đủ.  
- [ ] Config schema có đủ validations cơ bản.  
- [ ] Dependencies (extensions/assets khác) đã được mô tả.

### C. Business clarity

- [ ] Có short description dễ hiểu với SME admin.  
- [ ] Có long description mô tả value và use cases.  
- [ ] Đã khai báo wedge tags / industry tags phù hợp.  
- [ ] Đã mô tả rõ “asset này làm gì” và “không làm gì”.

## 4. Governance and risk review checklist

### D. Data and permissions

- [ ] Data classes accessed đã được khai báo.  
- [ ] Không có scope nào thừa hoặc không justified.  
- [ ] External endpoints/services đã được khai báo.  
- [ ] Cross-tenant behavior đã được mô tả rõ.  
- [ ] Retention/logging expectations đã được nêu.

### E. Risk and policy fit

- [ ] Risk level đề xuất đã được ghi rõ.  
- [ ] Lý do cho risk level đã được mô tả.  
- [ ] Nếu ảnh hưởng workflows high-impact, điều này đã được nêu rõ.  
- [ ] Nếu asset dùng AI, AI behavior và guardrails đã được mô tả.  
- [ ] Có link tới AI Use Case Record nếu applicable.

### F. Security and resilience

- [ ] Error handling cơ bản đã được kiểm tra.  
- [ ] Timeouts/retries/backoff đã được cân nhắc.  
- [ ] Không có hành vi rõ ràng có thể làm degrade core platform quá mức.  
- [ ] Secrets/config nhạy cảm không được hardcode.  
- [ ] Logging không lộ dữ liệu nhạy cảm vượt chính sách.

## 5. UX and support checklist

### G. Marketplace listing UX

- [ ] Listing có screenshots hoặc demo materials nếu phù hợp.  
- [ ] Documentation links hoạt động.  
- [ ] Support model đã rõ: Nextflow / Partner / Community.  
- [ ] SLA summary đã được điền nếu asset không phải community-only.  
- [ ] Risk badge, AI label và data summary có thể hiển thị rõ ràng cho admin.

### H. Install and configuration readiness

- [ ] Install flow đã được test cơ bản.  
- [ ] Configuration steps có hướng dẫn đầy đủ.  
- [ ] Validation errors có thông điệp dễ hiểu.  
- [ ] Uninstall/disable behavior đã được mô tả.  
- [ ] Update path hoặc backward compatibility đã được nêu.

## 6. Operations checklist

### I. Monitoring and support readiness

- [ ] Asset có logs/telemetry tối thiểu để support.  
- [ ] Issue reporting path đã được xác định.  
- [ ] Owner cho incidents đã rõ.  
- [ ] Kill switch hoặc disable path đã được xác định nếu asset high-impact.  
- [ ] Deprecation/EoL expectations đã được nêu.

### J. Pilot and listing readiness

- [ ] Asset phù hợp để bắt đầu ở state Draft / Under Review / Private Listing / Public Listing.  
- [ ] Nếu cần pilot trước public, scope pilot đã được đề xuất.  
- [ ] Success criteria của pilot đã được mô tả.  
- [ ] Review comments trước đó (nếu có) đã được xử lý.

## 7. Review outcomes

Sau checklist, asset có thể được phân vào một trong bốn kết quả:
- **Ready for review** – đủ thông tin để review sâu.  
- **Needs vendor fixes** – còn thiếu dữ liệu hoặc có lỗi cơ bản.  
- **Pilot only** – chưa đủ an toàn/chín để public.  
- **Not acceptable** – không phù hợp policies hoặc chất lượng quá thấp.

## 8. Điều kiện hoàn thành của tài liệu

Checklist được xem là đạt yêu cầu khi:
- vendors biết cần chuẩn bị gì trước khi submit;  
- Ecosystem/Governance/Support có thể review nhanh và nhất quán;  
- asset listings trên marketplace có chất lượng tối thiểu đồng đều.
