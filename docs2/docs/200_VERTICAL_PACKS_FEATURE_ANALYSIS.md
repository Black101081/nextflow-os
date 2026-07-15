# Nextflow OS – 12 Vertical Industry Packs: Phân tích Tính năng & Đặc tả Kỹ thuật

**Document ID:** 200_VERTICAL_PACKS_FEATURE_ANALYSIS  
**Pack:** 10 — Vertical Industry Packs  
**Version:** 2.0 — Phase 3 Upgrade  
**Status:** ACTIVE  
**Date:** 2026-07-15  
**Primary Owner:** Product Architecture / AI Agent Antigravity  

---

## 1. Tổng quan hệ thống 12 Vertical Packs

NextFlow OS phục vụ 12 cụm ngành SME thông qua hệ thống **Vertical Pack** — các gói giải pháp được đóng gói sẵn (cài đặt bằng một lệnh), tái sử dụng Shared Core hoàn toàn.

| Thành phần Pack | Mô tả |
|---|---|
| **Queues** | Hàng đợi công việc theo nghiệp vụ ngành |
| **Policies (SLAs)** | Chính sách thời gian xử lý và leo thang cấp |
| **SOPs** | Quy trình vận hành chuẩn kèm checklist |
| **Entities** | Cấu trúc dữ liệu nghiệp vụ riêng ngành |
| **Workflows** | Luồng tự động N8N-style theo trigger |
| **Connectors** | Tích hợp hệ thống bên ngoài |

---

## 2. PACK 01 — Retail Pro

### 2.1 Định vị
Chuỗi bán lẻ 2–50 điểm bán: siêu thị mini, cửa hàng tiện lợi, thời trang, mỹ phẩm.

### 2.2 Queues cần thiết
| Queue | Mô tả | Priority | Icon |
|---|---|---|---|
| Xử lý Đơn hàng Online | Đơn từ Website, Shopee, TikTok Shop | 1 | ShoppingBag |
| Đổi trả hàng | Hoàn hàng, đổi sản phẩm lỗi | 2 | RefreshCw |
| CSKH Inbox | Facebook, Zalo, Email | 3 | MessageSquare |
| Kiểm kê / Điều phối Kho | Chuyển hàng giữa điểm bán | 4 | Package |

### 2.3 Entities đặc thù
```json
{
  "retail_order": {
    "orderId": "string",
    "channel": "enum[Online,TaiQuay,Shopee,TikTok,Lazada]",
    "items": "array[{sku,quantity,price}]",
    "total": "number",
    "status": "enum[Pending,Processing,Shipped,Completed,Returned]",
    "branchId": "string",
    "customerId": "string"
  },
  "retail_inventory_transfer": {
    "fromBranchId": "string",
    "toBranchId": "string",
    "items": "array[{sku,quantity}]",
    "reason": "string",
    "approvedBy": "string",
    "status": "enum[Pending,Approved,Shipped,Received]"
  },
  "retail_return": {
    "orderId": "string",
    "reason": "string",
    "items": "array",
    "resolution": "enum[Refund,Exchange,StoreCredit]",
    "status": "enum[Pending,Processing,Completed]"
  }
}
```

### 2.4 Automation Workflows
1. **Auto Channel Sync**: Đơn mới từ Shopee/TikTok → Tạo Work Item → Assign theo điểm bán gần nhất
2. **Low Stock Alert**: Tồn kho < threshold → Tạo yêu cầu nhập hàng → Gửi lên Quản lý duyệt
3. **Return Process**: Yêu cầu đổi trả → Tạo vé xử lý → Zalo thông báo kết quả cho khách
4. **Daily Revenue Report**: 20:00 → AI tổng hợp doanh thu theo điểm bán → Gửi Email/Zalo cho Owner

### 2.5 KPIs
- Tỷ lệ đơn hoàn thành đúng SLA (%)
- Tồn kho realtime theo điểm bán
- Tỷ lệ đổi trả (%), Revenue theo channel
- NPS Customer Score

### 2.6 Tích hợp
- KiotViet: Đồng bộ đơn hàng, tồn kho, khách hàng 2 chiều
- Zalo ZNS: Thông báo trạng thái đơn
- Facebook Messenger: Inbox CSKH
- Shopee/TikTok API: Pull đơn hàng tự động

---

## 3. PACK 02 — F&B Standard

### 3.1 Định vị
Chuỗi F&B SME: nhà hàng 2–5 cơ sở, trà sữa, bánh mì, cà phê.

### 3.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Order Bếp (Kitchen Display) | Đơn gọi món cần chế biến | 1 |
| Quản lý Ca (Shift) | Điều phối nhân sự theo ca | 2 |
| QC Nguyên liệu | Kiểm tra chất lượng hàng nhập mỗi sáng | 3 |
| Phản hồi Khách | Xử lý review xấu Google Maps, Baemin | 4 |

### 3.3 Entities đặc thù
```json
{
  "fnb_order": {
    "tableNumber": "string",
    "branchId": "string",
    "items": "array[{menuItemId,quantity,note}]",
    "status": "enum[Received,Cooking,Ready,Served,Closed]",
    "servedBy": "string"
  },
  "fnb_shift": {
    "date": "date",
    "branchId": "string",
    "shift": "enum[Morning,Afternoon,Evening]",
    "plannedStaff": "array",
    "actualStaff": "array",
    "notes": "string"
  },
  "fnb_ingredient_check": {
    "date": "date",
    "branchId": "string",
    "items": "array[{name,expected,actual,status}]",
    "checkedBy": "string",
    "issues": "string"
  }
}
```

### 3.4 Automation Workflows
1. **Auto Shift Reminder**: 2h trước ca → Zalo nhắc nhân viên → Nếu thiếu người → Cảnh báo Quản lý
2. **Low Ingredient Alert**: Nguyên liệu < ngưỡng → Tạo lệnh mua → Bếp trưởng duyệt
3. **Bad Review Handler**: Review ≤ 3 sao → Tạo case CSKH → AI phân tích → Cảnh báo Quản lý cơ sở
4. **Daily COGS Report**: 23:00 → Tính giá vốn theo ca → Báo cáo GP margin cho Owner

### 3.5 Tích hợp
- Baemin/GrabFood: Pull đơn delivery
- MISA AMIS: Đồng bộ phiếu xuất kho nguyên liệu
- POS Kiosk: Gọi món tại quầy

---

## 4. PACK 03 — Spa & Clinic

### 4.1 Định vị
Spa, Thẩm mỹ viện, Nha khoa, Phòng khám da liễu.

### 4.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Telesale & Đặt lịch | Xác nhận lịch hẹn, tư vấn gói | 1 |
| Chăm sóc Sau dịch vụ | Feedback 24h sau liệu trình | 2 |
| Nhắc Tái khám | Theo lịch chu kỳ | 3 |
| Telesale Gói dịch vụ | Upsell combo, thẻ thành viên | 4 |

### 4.3 Entities đặc thù
```json
{
  "spa_skin_profile": {
    "customerId": "string",
    "skinType": "enum[Dau,Kho,HonHop,NhayCam]",
    "issues": "array[string]",
    "currentTreatment": "string",
    "history": "array[{date,service,technicianId,result}]",
    "photos": "array[url]"
  },
  "spa_booking": {
    "customerId": "string",
    "service": "string",
    "scheduledAt": "datetime",
    "technicianId": "string",
    "status": "enum[Pending,Confirmed,InProgress,Done,NoShow]",
    "notes": "string"
  },
  "spa_course": {
    "customerId": "string",
    "courseName": "string",
    "totalSessions": "number",
    "usedSessions": "number",
    "expiryDate": "date",
    "status": "enum[Active,Expiring,Expired]"
  }
}
```

### 4.4 Automation Workflows
1. **Booking Reminder**: T-24h → Zalo ZNS nhắc khách → T-4h chưa xác nhận → Telesale gọi lại
2. **Post-Treatment Care**: 24h sau liệu trình → Gửi hướng dẫn chăm sóc (Zalo) → 48h → Feedback call
3. **Course Expiry Alert**: 30 ngày trước hết liệu trình → Gửi offer gia hạn ưu đãi
4. **Birthday Greeting**: Ngày sinh nhật → Voucher chúc mừng → Queue telesale upsell

---

## 5. PACK 04 — Edu & Training

### 5.1 Định vị
Trung tâm Tiếng Anh, Đào tạo kỹ năng, Luyện thi đại học.

### 5.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Tuyển sinh (Lead Mới) | Tư vấn khóa học cho Lead đăng ký | 1 |
| Nhắc Học phí | Gọi nhắc gia hạn, đóng phí đúng hạn | 2 |
| Điểm danh & QA | Theo dõi chuyên cần, điểm thi | 3 |
| Báo cáo Phụ huynh | Gửi tiến độ học tập định kỳ | 4 |

### 5.3 Entities đặc thù
```json
{
  "edu_student": {
    "name": "string",
    "dob": "date",
    "level": "string",
    "courseId": "string",
    "parentContact": "string",
    "totalDebt": "number",
    "attendanceRate": "number",
    "status": "enum[Active,Paused,Graduated,Dropped]"
  },
  "edu_grade_record": {
    "studentId": "string",
    "classId": "string",
    "testType": "enum[GiuaKy,CuoiKy,Practice,Mock]",
    "score": "number",
    "feedback": "string",
    "gradedBy": "string"
  },
  "edu_payment": {
    "studentId": "string",
    "amount": "number",
    "dueDate": "date",
    "paidDate": "date",
    "method": "enum[Cash,Transfer,Card]",
    "status": "enum[Pending,Paid,Overdue,Waived]"
  }
}
```

### 5.4 Automation Workflows
1. **Score Report to Parent**: Điểm mới → AI viết nhận xét → Email/Zalo cho phụ huynh
2. **Fee Reminder**: 7 ngày trước hạn → Zalo nhắc → 3 ngày trước → Nhắc lần 2 → Quá hạn → Queue telesale
3. **Lead Nurturing**: Lead mới → Auto test đầu vào → AI lên lộ trình → Gửi tư vấn cá nhân hóa

---

## 6. PACK 05 — Real Estate Agency

### 6.1 Định vị
Sàn giao dịch BĐS, Môi giới nhà đất SME.

### 6.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Lead Mới (Hot) | Khách để SĐT cần gọi trong 15 phút | 1 |
| Chăm Lead Ấm | Lead đã tư vấn, chưa quyết định | 2 |
| Thủ tục Pháp lý | Công chứng, sang tên, làm sổ | 3 |
| Hậu mãi Khách mua | Chăm sau giao dịch, xin giới thiệu | 4 |

### 6.3 Entities đặc thù
```json
{
  "re_listing": {
    "address": "string",
    "type": "enum[CanHo,NhaPho,DatNen,BietThu,Shophouse]",
    "price": "number",
    "area": "number",
    "status": "enum[Available,Reserved,Deposited,Sold]",
    "agentId": "string",
    "virtualTourUrl": "string",
    "legalStatus": "string"
  },
  "re_lead": {
    "name": "string",
    "phone": "string",
    "budget": "number",
    "preferredArea": "string",
    "propertyType": "string",
    "urgency": "enum[Hot,Warm,Cold]",
    "source": "enum[Zalo,Facebook,Website,Referral,Call]",
    "aiScore": "number",
    "agentId": "string"
  },
  "re_deal": {
    "leadId": "string",
    "listingId": "string",
    "stage": "enum[Viewed,Negotiating,Deposited,Contracted,Completed]",
    "agentId": "string",
    "commission": "number",
    "legalMilestones": "array[{step,dueDate,status}]"
  }
}
```

### 6.4 Automation Workflows
1. **AI Lead Scoring**: Lead mới → AI chấm điểm (budget/urgency) → Route: Senior Agent (≥8) / Junior (< 8)
2. **Hot Lead 15-min SLA**: Chưa gọi trong 15p → Cảnh báo Quản lý → Tự động reassign
3. **Legal Milestone Tracker**: Ký HĐ đặt cọc → Tạo 5 milestone pháp lý → Nhắc tự động từng ngày đến hạn
4. **Market Report**: Hàng tuần → AI phân tích biến động giá khu vực → Gửi Zalo cho toàn đội

---

## 7. PACK 06 — Professional Services

### 7.1 Định vị
Văn phòng Luật, Kế toán doanh nghiệp, Tư vấn thuế, Kiểm toán.

### 7.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Xử lý Hồ sơ KH | Soạn thảo, thẩm định tài liệu | 1 |
| Deadline Nộp tờ khai | Theo dõi hạn nộp báo cáo thuế | 2 |
| Review & Ký duyệt | Trình ký hợp đồng, báo cáo tài chính | 3 |
| Billing & Thu phí | Xuất hóa đơn, theo dõi công nợ | 4 |

### 7.3 Entities đặc thù
```json
{
  "b2b_client": {
    "companyName": "string",
    "taxCode": "string",
    "legalRep": "string",
    "accountingEmail": "string",
    "status": "enum[Active,Inactive,Suspended]",
    "contractValue": "number",
    "assignedCPA": "string",
    "ndaSigned": "boolean"
  },
  "ps_contract": {
    "clientId": "string",
    "type": "enum[KeToan,KiemToan,TuVan,PhapLy]",
    "startDate": "date",
    "endDate": "date",
    "autoRenewal": "boolean",
    "status": "enum[Draft,Active,Expired,Terminated]"
  },
  "ps_tax_filing": {
    "clientId": "string",
    "filingType": "string",
    "period": "string",
    "dueDate": "date",
    "filedDate": "date",
    "status": "enum[Pending,InProgress,Filed,Overdue,Waived]",
    "responsibleCPA": "string"
  }
}
```

### 7.4 Automation Workflows
1. **Tax Deadline Alert**: T-5 ngày → Tạo Work Item → Alert CPA → T-1 chưa xử lý → Leo thang Trưởng phòng
2. **Contract Renewal**: T-30 ngày → Email đề xuất gia hạn → Theo dõi phản hồi → T-7 chưa ký → Telesale gọi
3. **Billing Cycle**: Cuối tháng → Tự động tạo phiếu thu phí → Gửi Email + Zalo

---

## 8. PACK 07 — Contractor & Interior

### 8.1 Định vị
Nhà thầu xây dựng, Thiết kế thi công nội thất.

### 8.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Giám sát Công trình | Nghiệm thu khối lượng, kiểm tra chất lượng | 1 |
| Khảo sát Báo giá | Đo đạc, lên báo giá cho khách | 2 |
| Mua hàng Vật tư | Lệnh mua nguyên vật liệu theo tiến độ | 3 |
| Báo cáo Chủ đầu tư | Tiến độ thi công hàng tuần | 4 |

### 8.3 Entities đặc thù
```json
{
  "const_project": {
    "projectName": "string",
    "clientId": "string",
    "contractValue": "number",
    "startDate": "date",
    "endDate": "date",
    "progress": "number",
    "siteManagerId": "string",
    "address": "string",
    "status": "enum[Planning,InProgress,Paused,Completed,Defects]"
  },
  "const_daily_log": {
    "projectId": "string",
    "date": "date",
    "workersCount": "number",
    "summary": "string",
    "completedItems": "array[string]",
    "issues": "string",
    "photos": "array[url]",
    "weather": "string",
    "supervisorId": "string"
  },
  "const_material_request": {
    "projectId": "string",
    "items": "array[{name,quantity,unit,estimatedCost}]",
    "requestedBy": "string",
    "approvedBy": "string",
    "urgency": "enum[Normal,Urgent]",
    "status": "enum[Pending,Approved,Ordered,Delivered,Rejected]"
  }
}
```

### 8.4 Automation Workflows
1. **Daily Report Sender**: Cuối ngày → AI tóm tắt Daily Log → Gửi Zalo cho Chủ đầu tư kèm ảnh
2. **Quote SLA**: Sau khảo sát → 48h SLA gửi báo giá → Trễ → Cảnh báo Sales Manager
3. **Payment Milestone**: Nghiệm thu giai đoạn → Tạo đề nghị thanh toán → Email + Zalo Chủ đầu tư
4. **Material Shortage Alert**: BOM tính thiếu vật tư → Tạo lệnh mua khẩn → Approve trong ngày

---

## 9. PACK 08 — Auto Repair & Garage

### 9.1 Định vị
Gara ô tô, Xe máy, Dịch vụ điện lạnh ô tô.

### 9.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Tiếp nhận & Kiểm tra KTV | Kiểm tra 20 hạng mục khi xe vào | 1 |
| Chờ duyệt Báo giá | Xe nằm chờ khách duyệt | 2 |
| Đang sửa chữa | Theo dõi tiến độ sửa | 3 |
| Nhắc Bảo dưỡng | Khách chưa quay lại đúng lịch | 4 |

### 9.3 Entities đặc thù
```json
{
  "auto_vehicle": {
    "licensePlate": "string",
    "brand": "string",
    "model": "string",
    "year": "number",
    "ownerId": "string",
    "currentMileage": "number",
    "lastServiceDate": "date",
    "nextServiceDate": "date",
    "nextServiceMileage": "number"
  },
  "auto_repair_order": {
    "vehicleId": "string",
    "checkInTime": "datetime",
    "symptoms": "string",
    "diagnosisItems": "array[{item,cost,approved}]",
    "totalEstimate": "number",
    "customerApproved": "boolean",
    "technicianId": "string",
    "status": "enum[Received,Diagnosing,AwaitingApproval,Repairing,Done,Delivered]"
  }
}
```

### 9.4 Automation Workflows
1. **Maintenance Reminder**: 3 tháng sau lần sửa cuối → Zalo nhắc bảo dưỡng + ưu đãi 5%
2. **Waiting Approval Alert**: Xe chờ duyệt báo giá > 24h → CSKH gọi lại → Tạo Work Item ưu tiên
3. **Service Completion**: Sửa xong → Zalo thông báo → Tạo hóa đơn → Nhắc nhận xe
4. **Monthly Loyal Customer**: Top 20 khách quay lại nhiều nhất → Gửi voucher tri ân

---

## 10. PACK 09 — Logistics & Delivery

### 10.1 Định vị
Công ty vận tải nội đô, Chuyển phát nhanh nhỏ.

### 10.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Xử lý Sự cố Giao hàng | Bom hàng, sai địa chỉ, hàng hỏng | 1 |
| Đối soát COD | Chốt tiền mặt với bưu tá cuối ngày | 2 |
| Phân công Tài xế | Route optimization buổi sáng | 3 |
| Khiếu nại & Bồi thường | Mất hàng, hàng vỡ | 4 |

### 10.3 Entities đặc thù
```json
{
  "log_waybill": {
    "trackingCode": "string",
    "senderId": "string",
    "receiverName": "string",
    "receiverPhone": "string",
    "receiverAddress": "string",
    "codAmount": "number",
    "weight": "number",
    "status": "enum[Received,Sorting,InTransit,OutForDelivery,Delivered,Failed,Returned]",
    "driverId": "string",
    "hubId": "string",
    "failedAttempts": "number"
  },
  "log_cod_reconciliation": {
    "driverId": "string",
    "date": "date",
    "totalOrders": "number",
    "successOrders": "number",
    "expectedCash": "number",
    "actualCash": "number",
    "discrepancy": "number",
    "status": "enum[Pending,Matched,Discrepancy,Resolved]"
  }
}
```

### 10.4 Automation Workflows
1. **AI Route Optimization**: Batch mới → AI tối ưu route theo địa chỉ + khoảng cách → Assign tài xế
2. **Failed Delivery Handler**: Giao thất bại → AI Voice gọi lại → Không liên lạc → Tạo case xử lý khẩn
3. **COD Reconciliation Alert**: Cuối ngày → So sánh tiền nộp vs đơn thành công → Cảnh báo nếu lệch > 50k

---

## 11. PACK 10 — Micro-Manufacturing

### 11.1 Định vị
Xưởng sản xuất nhỏ: may mặc, thực phẩm đóng gói, linh kiện.

### 11.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Lệnh Sản xuất (Mới) | Lệnh đang chờ lên chuyền | 1 |
| KCS / QC Kiểm hàng | Kiểm tra trước khi nhập kho | 2 |
| Mua hàng Nguyên liệu | Yêu cầu mua khi BOM báo thiếu | 3 |
| Bảo trì Máy móc | Lịch định kỳ và sự cố phát sinh | 4 |

### 11.3 Entities đặc thù
```json
{
  "mfg_work_order": {
    "orderId": "string",
    "productId": "string",
    "targetQuantity": "number",
    "producedQuantity": "number",
    "defectQuantity": "number",
    "lineId": "string",
    "supervisorId": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "enum[Planned,InProgress,QCCheck,Completed,Paused]"
  },
  "mfg_bom": {
    "productId": "string",
    "version": "string",
    "materials": "array[{materialId,quantity,unit}]",
    "laborHours": "number",
    "approved": "boolean"
  },
  "mfg_qc_report": {
    "workOrderId": "string",
    "checkedQuantity": "number",
    "passQuantity": "number",
    "defectTypes": "array[{type,count,photo}]",
    "disposition": "enum[Accept,Rework,Scrap]",
    "inspectorId": "string"
  }
}
```

### 11.4 Automation Workflows
1. **BOM Auto Deduction**: Work Order hoàn thành → Trừ kho nguyên liệu theo BOM tự động
2. **Defect Rate Alert**: Defect rate > 5% trong một ca → Dừng chuyền → Cảnh báo Quản đốc ngay
3. **Maintenance Schedule**: Theo lịch → Tạo Work Item bảo trì → Assign kỹ thuật viên
4. **Production Dashboard**: Real-time: % hoàn thành, defect rate, output/giờ

---

## 12. PACK 11 — Pharmacy & Healthcare

### 12.1 Định vị
Nhà thuốc chuỗi, Phòng khám đa khoa, Nha khoa.

### 12.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Xử lý Đơn thuốc Online | Chuẩn bị hàng theo đơn chụp qua Zalo | 1 |
| Cảnh báo Thuốc cận date | Kiểm tra và xử lý thuốc sắp hết hạn | 2 |
| Nhắc Tái khám | Khách cần tái khám theo lịch | 3 |
| Chăm sóc Bệnh nhân mãn tính | Đái tháo đường, cao huyết áp | 4 |

### 12.3 Entities đặc thù
```json
{
  "phar_prescription": {
    "patientName": "string",
    "dob": "date",
    "doctorName": "string",
    "clinicName": "string",
    "diagnosis": "string",
    "medicines": "array[{name,dosage,quantity,frequency,duration}]",
    "requiresNarcoticFlag": "boolean",
    "status": "enum[Received,Checking,AIChecking,Ready,Dispensed]",
    "aiInteractionCheck": "{status,warnings,recommendations}"
  },
  "phar_inventory": {
    "medicineId": "string",
    "name": "string",
    "genericName": "string",
    "quantity": "number",
    "expiryDate": "date",
    "batchNumber": "string",
    "reorderPoint": "number",
    "requiresPrescription": "boolean",
    "category": "string"
  },
  "phar_patient_record": {
    "patientId": "string",
    "chronicConditions": "array[string]",
    "currentMedications": "array[string]",
    "allergies": "array[string]",
    "lastVisit": "date",
    "nextAppointment": "date",
    "bloodType": "string"
  }
}
```

### 12.4 Automation Workflows
1. **AI Drug Interaction Check**: Đơn mới → AI check tương tác nguy hiểm → Cảnh báo Dược sĩ nếu phát hiện vấn đề
2. **Expiry Date Alert**: T-90 ngày → Tạo Work Item xử lý (trả NSX, bán trước, hủy có biên bản)
3. **Chronic Patient Follow-up**: Bệnh nhân mãn tính chưa tái khám đúng lịch → Auto call nhắc

---

## 13. PACK 12 — Hospitality & Homestay

### 13.1 Định vị
Khách sạn mini, Homestay, Resort nhỏ.

### 13.2 Queues cần thiết
| Queue | Mô tả | Priority |
|---|---|---|
| Buồng phòng (Housekeeping) | Dọn phòng ngay khi khách checkout | 1 |
| Hỗ trợ Lưu trú | Yêu cầu dịch vụ trong phòng | 2 |
| Check-in / Check-out | Thủ tục khách đến/đi | 3 |
| Upsell Dịch vụ | Tour, spa, thuê xe... | 4 |

### 13.3 Entities đặc thù
```json
{
  "hosp_booking": {
    "guestName": "string",
    "guestEmail": "string",
    "guestPhone": "string",
    "roomNumber": "string",
    "checkIn": "datetime",
    "checkOut": "datetime",
    "source": "enum[BookingCom,Agoda,Direct,Airbnb,Traveloka]",
    "status": "enum[Confirmed,CheckedIn,CheckedOut,Cancelled,NoShow]",
    "specialRequests": "string",
    "totalAmount": "number"
  },
  "hosp_room": {
    "roomNumber": "string",
    "type": "enum[Standard,Deluxe,Suite,Family]",
    "floor": "number",
    "status": "enum[Available,Occupied,Cleaning,Maintenance,Inspecting]",
    "lastCleaned": "datetime",
    "smartLockCode": "string",
    "amenities": "array[string]"
  },
  "hosp_service_request": {
    "bookingId": "string",
    "type": "enum[ExtraTowel,Breakfast,Taxi,Tour,Laundry,RoomService]",
    "requestedAt": "datetime",
    "fulfilledAt": "datetime",
    "status": "enum[Requested,Processing,Done,Cancelled]",
    "charge": "number"
  }
}
```

### 13.4 Automation Workflows
1. **Pre-arrival Welcome**: T-24h → Email/Zalo hướng dẫn checkin + mã Smart Lock
2. **Auto Housekeeping Dispatch**: Checkout → Tạo task dọn phòng → Assign nhân viên theo tầng → 45 phút SLA
3. **Review Request**: 2h sau checkout → Link đánh giá Google Maps/Booking.com
4. **Revenue per Night Report**: 23:00 → AI so sánh doanh thu vs kỳ trước → Báo cáo Owner

---

## 14. Ma trận Tích hợp các Pack

| Pack | KiotViet | Zalo ZNS | MISA | Blockchain | AI | GPS |
|---|---|---|---|---|---|---|
| Retail Pro | YES | YES | YES | YES | YES | NO |
| F&B Standard | YES | YES | YES | NO | YES | NO |
| Spa & Clinic | NO | YES | YES | NO | YES | NO |
| Edu & Training | NO | YES | YES | NO | YES | NO |
| Real Estate | NO | YES | YES | YES | YES | YES |
| Professional Svc | NO | NO | YES | YES | YES | NO |
| Contractor | NO | YES | YES | YES | YES | YES |
| Auto Repair | NO | YES | NO | NO | YES | NO |
| Logistics | NO | YES | NO | YES | YES | YES |
| Manufacturing | NO | YES | YES | YES | YES | NO |
| Pharmacy | NO | YES | YES | YES | YES | NO |
| Hospitality | NO | YES | NO | NO | YES | YES |

---

## 15. Shared Core (Dùng chung cho tất cả 12 Packs)

| Core Module | Vai trò |
|---|---|
| Work Items Engine | Tất cả công việc trong mọi queue |
| SLA Engine | Tất cả policies về thời gian |
| RBAC Engine | Phân quyền theo role |
| AI Copilot | Insights tự động & phân tích |
| Blockchain Ledger | Ghi nhận bất biến dữ liệu |
| Customer Portal | Khách tự phục vụ |
| Mobile Field App | Tác nghiệp tại hiện trường |
| Analytics & Reports | KPIs theo tenant |
| Gamification Engine | Động lực nhân viên |
| Notification Engine | Zalo / Email / SMS |
