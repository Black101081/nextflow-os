$templateDir = "c:\Users\Black\Downloads\NextFlow OS\nextflow-os\backend\src\templates"

$spa = @{
    id = "tpl_spa_clinic"
    name = "Spa & Clinic Pack"
    description = "Quản lý toàn diện cơ sở Làm đẹp, Thẩm mỹ viện. Hỗ trợ nhắc lịch hẹn, theo dõi hồ sơ da liễu và quy trình chăm sóc khách hàng tự động."
    category = "spa"
    queues = @(
        @{ name = "Telesale & Đặt lịch"; description = "Gọi điện xác nhận lịch hẹn và tư vấn gói dịch vụ"; priority = 1; color = "pink"; icon = "Phone" },
        @{ name = "Chăm sóc sau dịch vụ"; description = "Lấy feedback khách hàng sau 1 ngày sử dụng dịch vụ"; priority = 2; color = "purple"; icon = "Heart" }
    )
    policies = @(
        @{ name = "SLA - Phản hồi KH mới"; description = "Khách nhắn tin qua Fanpage phải được trả lời trong 5 phút."; target_type = "response_time"; target_value = "5"; action = "escalate_to_manager" }
    )
    sops = @(
        @{ title = "Quy trình Đón Khách Spa"; content = "## 1. Mời trà và tư vấn`n- Mời khách ngồi, phục vụ trà detox.`n- Đưa form khảo sát tình trạng da.`n## 2. Soi da`n- Sử dụng máy soi da chuyên dụng.`n- Giải thích cặn kẽ từng chỉ số (độ ẩm, mụn ẩn, sắc tố)." }
    )
    entities = @(
        @{ name = "Hồ sơ Da liễu"; system_name = "spa_skin_profile"; description = "Theo dõi tình trạng da qua các buổi"; schema = @{ type = "object"; properties = @{ customerId = @{ type = "string" }; skinType = @{ type = "string" }; issues = @{ type = "string" }; history = @{ type = "array" } } } },
        @{ name = "Lịch hẹn"; system_name = "spa_booking"; description = "Lịch khách đến làm dịch vụ"; schema = @{ type = "object"; properties = @{ date = @{ type = "string" }; time = @{ type = "string" }; serviceId = @{ type = "string" }; status = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "Auto Reminder Booking"; trigger_event = "spa_booking.created"; dag = @{ nodes = @( @{ id = "delay_24h"; type = "Delay"; hours = 24; next = @("zalo_remind") }, @{ id = "zalo_remind"; type = "ZaloZNS"; template_id = "spa_remind"; next = @() } ) } }
    )
    connectors = @(
        @{ name = "zalo_oa"; settings = @{ enable_zns = $true } }
    )
}

$edu = @{
    id = "tpl_edu_training"
    name = "Edu & Training Pack"
    description = "Bộ giải pháp cho Trung tâm Tiếng Anh, Đào tạo kỹ năng. Quản lý học viên, lớp học, nhắc học phí và báo cáo kết quả tự động."
    category = "education"
    queues = @(
        @{ name = "Tuyển sinh"; description = "Tư vấn khóa học cho Lead tiềm năng"; priority = 1; color = "blue"; icon = "GraduationCap" },
        @{ name = "Nhắc học phí"; description = "Gọi điện nhắc gia hạn khóa học"; priority = 2; color = "red"; icon = "CreditCard" }
    )
    policies = @(
        @{ name = "SLA - Cập nhật điểm danh"; description = "Giáo viên phải cập nhật điểm danh trong vòng 2h sau khi lớp kết thúc."; target_type = "time_based"; target_value = "2"; action = "warning_teacher" }
    )
    sops = @(
        @{ title = "Kịch bản Tư vấn Khóa học IELTS"; content = "## 1. Khai thác nhu cầu`n- Hỏi mục tiêu band điểm (6.5, 7.0+) và thời gian thi dự kiến.`n## 2. Test đầu vào`n- Cho học viên làm bài test 4 kỹ năng.`n## 3. Chốt Sales`n- Đưa ra lộ trình cam kết đầu ra và offer ưu đãi trong tuần." }
    )
    entities = @(
        @{ name = "Học viên"; system_name = "edu_student"; description = "Thông tin cá nhân và lịch sử học"; schema = @{ type = "object"; properties = @{ name = @{ type = "string" }; level = @{ type = "string" }; totalDebt = @{ type = "number" } } } },
        @{ name = "Bảng điểm"; system_name = "edu_grade_record"; description = "Điểm thi giữa kỳ/cuối kỳ"; schema = @{ type = "object"; properties = @{ studentId = @{ type = "string" }; classId = @{ type = "string" }; score = @{ type = "number" }; comments = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "Auto Score Report to Parent"; trigger_event = "edu_grade_record.created"; dag = @{ nodes = @( @{ id = "ai_generate"; type = "AIAgent"; prompt = "Write a polite report card to parent based on score."; next = @("send_email") }, @{ id = "send_email"; type = "EmailSender"; to = "{{parentEmail}}"; next = @() } ) } }
    )
    connectors = @(
        @{ name = "gmail"; settings = @{ auth_configured = $true } }
    )
}

$real_estate = @{
    id = "tpl_real_estate"
    name = "Real Estate Agency Pack"
    description = "Hệ thống chuyên dụng cho Sàn Giao dịch BĐS. Phân loại Lead tự động, quản lý giỏ hàng, và theo dõi thủ tục pháp lý."
    category = "real_estate"
    queues = @(
        @{ name = "Lead Mới (Hot)"; description = "Khách hàng vừa để lại thông tin cần gọi ngay"; priority = 1; color = "red"; icon = "PhoneCall" },
        @{ name = "Thủ tục Pháp lý"; description = "Hỗ trợ công chứng, làm sổ đỏ"; priority = 2; color = "gray"; icon = "FileText" }
    )
    policies = @(
        @{ name = "SLA - Chăm Lead Hot"; description = "Lead có độ quan tâm cao phải được gọi trong 15 phút."; target_type = "time_based"; target_value = "0.25"; action = "reassign_lead" }
    )
    sops = @(
        @{ title = "Quy trình Dẫn Khách Xem Nhà"; content = "## 1. Chuẩn bị`n- Kiểm tra tình trạng chìa khóa, thông báo chủ nhà.`n- In sẵn tài liệu dự án, bảng giá.`n## 2. Dẫn khách`n- Đến sớm 15p bật điều hòa, mở đèn.`n- Tập trung giới thiệu tiện ích xung quanh trước." }
    )
    entities = @(
        @{ name = "Bất động sản"; system_name = "re_listing"; description = "Thông tin nhà/đất đang bán"; schema = @{ type = "object"; properties = @{ address = @{ type = "string" }; price = @{ type = "number" }; status = @{ type = "string"; enum = @("Available", "Deposited", "Sold") } } } },
        @{ name = "Lead KH"; system_name = "re_lead"; description = "Nhu cầu tìm nhà của khách"; schema = @{ type = "object"; properties = @{ budget = @{ type = "number" }; area = @{ type = "string" }; propertyType = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "AI Lead Scoring & Routing"; trigger_event = "re_lead.created"; dag = @{ nodes = @( @{ id = "ai_scoring"; type = "AIAgent"; prompt = "Score lead based on budget and urgency."; next = @("route_lead") }, @{ id = "route_lead"; type = "Condition"; condition = "{{score}} > 8"; next = @("assign_senior") } ) } }
    )
    connectors = @()
}

$services = @{
    id = "tpl_professional_services"
    name = "Professional Services Pack"
    description = "Cho văn phòng Luật, Kế toán, Tư vấn. Tập trung vào lưu trữ hồ sơ bảo mật, trình ký điện tử và quản lý deadline hợp đồng."
    category = "services"
    queues = @(
        @{ name = "Xử lý Hồ sơ Khách hàng"; description = "Thẩm định và soạn thảo hợp đồng/báo cáo"; priority = 1; color = "blue"; icon = "Briefcase" }
    )
    policies = @(
        @{ name = "SLA - Deadline Báo cáo Thuế"; description = "Cảnh báo trước 5 ngày đối với hạn nộp báo cáo thuế doanh nghiệp."; target_type = "time_based"; target_value = "5"; action = "alert_manager" }
    )
    sops = @(
        @{ title = "Quy chuẩn Bảo mật NDA"; content = "- Không mang tài liệu khách hàng ra khỏi công ty.`n- Xóa dữ liệu tạm sau khi hoàn tất thanh lý hợp đồng." }
    )
    entities = @(
        @{ name = "Hồ sơ Khách hàng B2B"; system_name = "b2b_client"; description = "Thông tin doanh nghiệp đối tác"; schema = @{ type = "object"; properties = @{ taxCode = @{ type = "string" }; companyName = @{ type = "string" }; status = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "Auto Expiry Alert"; trigger_event = "contract_signed"; dag = @{ nodes = @( @{ id = "delay_until"; type = "DelayUntil"; date = "{{expiryDate - 7 days}}"; next = @("send_alert") }, @{ id = "send_alert"; type = "Notification"; message = "Contract expiring soon!"; next = @() } ) } }
    )
    connectors = @()
}

$contractor = @{
    id = "tpl_contractor"
    name = "Contractor & Interior Pack"
    description = "Quản lý thi công và thiết kế nội thất. Bám sát tiến độ dự án, nguyên vật tư, và tự động gửi báo cáo thi công hàng ngày."
    category = "construction"
    queues = @(
        @{ name = "Giám sát Công trình"; description = "Nghiệm thu khối lượng và chất lượng hàng ngày"; priority = 1; color = "orange"; icon = "HardHat" },
        @{ name = "Khảo sát Báo giá"; description = "Đo đạc và lên báo giá cho khách"; priority = 2; color = "blue"; icon = "Ruler" }
    )
    policies = @(
        @{ name = "SLA - Gửi Báo giá"; description = "Báo giá phải được gửi cho khách trong vòng 48h sau khi khảo sát."; target_type = "time_based"; target_value = "48"; action = "escalate" }
    )
    sops = @(
        @{ title = "Quy định An toàn Lao động"; content = "1. Bắt buộc đội mũ bảo hộ tại công trường.`n2. Căng dây cảnh báo ở khu vực có hố sâu hoặc điện." }
    )
    entities = @(
        @{ name = "Dự án Thi công"; system_name = "const_project"; description = "Thông tin tổng quan dự án"; schema = @{ type = "object"; properties = @{ projectName = @{ type = "string" }; startDate = @{ type = "string" }; progress = @{ type = "number" } } } },
        @{ name = "Báo cáo Ngày (Daily Log)"; system_name = "const_daily_log"; description = "Tiến độ thi công trong ngày"; schema = @{ type = "object"; properties = @{ projectId = @{ type = "string" }; workersCount = @{ type = "number" }; summary = @{ type = "string" }; photos = @{ type = "array" } } } }
    )
    workflows = @(
        @{ name = "Auto Send Daily Report"; trigger_event = "const_daily_log.created"; dag = @{ nodes = @( @{ id = "zalo_send"; type = "ZaloZNS"; phone_number = "{{clientPhone}}"; template_id = "daily_report"; template_data = @{ project = "{{projectName}}"; progress = "{{summary}}" }; next = @() } ) } }
    )
    connectors = @()
}

$auto = @{
    id = "tpl_auto_repair"
    name = "Auto Repair Garage Pack"
    description = "Số hóa toàn bộ quy trình Gara Ô tô. Từ tiếp nhận xe, báo giá linh kiện, lịch sử sửa chữa đến thông báo bảo dưỡng định kỳ."
    category = "automotive"
    queues = @(
        @{ name = "Tiếp nhận & Kiểm tra (KTV)"; description = "Kiểm tra 20 hạng mục an toàn khi xe vào xưởng"; priority = 1; color = "green"; icon = "Wrench" }
    )
    policies = @(
        @{ name = "SLA - Duyệt báo giá"; description = "Xe nằm chờ duyệt báo giá quá 1 ngày sẽ cảnh báo CSKH gọi điện lại."; target_type = "time_based"; target_value = "24"; action = "alert" }
    )
    sops = @(
        @{ title = "Tiêu chuẩn Giao Xe"; content = "1. Rửa vỏ và hút bụi nội thất miễn phí.`n2. Bàn giao chìa khóa cùng checklist các hạng mục đã thay thế." }
    )
    entities = @(
        @{ name = "Hồ sơ Xe"; system_name = "auto_vehicle"; description = "Theo dõi theo Biển số xe"; schema = @{ type = "object"; properties = @{ licensePlate = @{ type = "string" }; brand = @{ type = "string" }; mileage = @{ type = "number" } } } }
    )
    workflows = @(
        @{ name = "Auto Maintenance Reminder"; trigger_event = "auto_repair.completed"; dag = @{ nodes = @( @{ id = "delay_3_months"; type = "Delay"; hours = 2160; next = @("zalo_remind") }, @{ id = "zalo_remind"; type = "ZaloZNS"; template_id = "maintenance_reminder"; next = @() } ) } }
    )
    connectors = @()
}

$logistics = @{
    id = "tpl_logistics"
    name = "Logistics & Delivery Pack"
    description = "Giải pháp cho Công ty Vận tải, Chuyển phát. Tối ưu định tuyến giao hàng, đối soát COD và xử lý sự cố hàng hóa dập vỡ."
    category = "logistics"
    queues = @(
        @{ name = "Xử lý Sự cố Giao hàng"; description = "Giải quyết khách bom hàng, sai địa chỉ, hỏng hóc"; priority = 1; color = "red"; icon = "AlertOctagon" }
    )
    policies = @(
        @{ name = "SLA - Lưu kho 48h"; description = "Đơn hàng nằm ở kho chờ giao không được quá 48h."; target_type = "time_based"; target_value = "48"; action = "warning_hub_manager" }
    )
    sops = @(
        @{ title = "Quy trình Đối soát COD"; content = "Kế toán chốt bưu tá nộp đủ tiền mặt tương ứng với số đơn thành công trên app trước khi cho bưu tá về." }
    )
    entities = @(
        @{ name = "Vận đơn (Waybill)"; system_name = "log_waybill"; description = "Hành trình đơn hàng"; schema = @{ type = "object"; properties = @{ trackingCode = @{ type = "string" }; codAmount = @{ type = "number" }; status = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "AI Route Optimization"; trigger_event = "batch_created"; dag = @{ nodes = @( @{ id = "ai_route"; type = "AIAgent"; prompt = "Optimize delivery route for these addresses."; next = @("assign_driver") } ) } }
    )
    connectors = @()
}

$manufacturing = @{
    id = "tpl_manufacturing"
    name = "Micro-Manufacturing Pack"
    description = "Quản lý Xưởng sản xuất quy mô nhỏ. Lên Lệnh sản xuất (Work Order), trừ kho nguyên liệu (BOM) tự động và báo cáo QA/QC."
    category = "manufacturing"
    queues = @(
        @{ name = "Lệnh Sản xuất (Mới)"; description = "Lệnh sx đang chờ lên chuyền"; priority = 1; color = "blue"; icon = "Factory" },
        @{ name = "KCS / QC Kiểm hàng"; description = "Kiểm tra chất lượng thành phẩm trước khi nhập kho"; priority = 2; color = "purple"; icon = "Search" }
    )
    policies = @(
        @{ name = "SLA - Tỷ lệ Lỗi (Defect Rate)"; description = "Nếu lô hàng có tỷ lệ phế phẩm > 5%, tự động đóng chuyền và gọi Quản đốc."; target_type = "metric_threshold"; target_value = "5"; action = "stop_line_alert" }
    )
    sops = @(
        @{ title = "An toàn Vận hành Máy dập"; content = "1. Bắt buộc mặc áo bảo hộ, găng tay chống cắt.`n2. Tuyệt đối không dùng tay với lấy phôi khi máy đang chạy." }
    )
    entities = @(
        @{ name = "Lệnh Sản Xuất (Work Order)"; system_name = "mfg_work_order"; description = "Yêu cầu sx từ phòng Kinh doanh"; schema = @{ type = "object"; properties = @{ orderId = @{ type = "string" }; targetQuantity = @{ type = "number" }; status = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "Auto BOM Material Deduction"; trigger_event = "mfg_work_order.completed"; dag = @{ nodes = @( @{ id = "db_update"; type = "DatabaseUpdate"; query = "UPDATE inventory..."; next = @() } ) } }
    )
    connectors = @()
}

$pharmacy = @{
    id = "tpl_pharmacy"
    name = "Pharmacy & Healthcare Pack"
    description = "Vận hành chuỗi Nhà thuốc, Nha khoa. Cảnh báo thuốc cận date, cảnh báo chống chỉ định kê đơn bằng AI và lưu trữ hồ sơ bệnh án."
    category = "healthcare"
    queues = @(
        @{ name = "Xử lý Đơn thuốc Online"; description = "Nhà thuốc chuẩn bị hàng theo đơn khách chụp qua Zalo"; priority = 1; color = "teal"; icon = "Pill" }
    )
    policies = @(
        @{ name = "SLA - Giao thuốc Online"; description = "Đơn đặt nội thành phải được ship trong vòng 1 tiếng."; target_type = "time_based"; target_value = "1"; action = "discount_voucher" }
    )
    sops = @(
        @{ title = "Quy định Bán thuốc Kháng sinh"; content = "Chỉ bán khi khách mang theo đơn thuốc của bác sĩ có mộc đỏ." }
    )
    entities = @(
        @{ name = "Đơn thuốc"; system_name = "phar_prescription"; description = "Đơn kê của bác sĩ"; schema = @{ type = "object"; properties = @{ patientName = @{ type = "string" }; medicines = @{ type = "array" }; diagnosis = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "AI Interaction Check"; trigger_event = "phar_prescription.created"; dag = @{ nodes = @( @{ id = "ai_check"; type = "AIAgent"; prompt = "Check if any medicines interact dangerously."; next = @("notify_pharmacist") } ) } }
    )
    connectors = @()
}

$hospitality = @{
    id = "tpl_hospitality"
    name = "Hospitality & Homestay Pack"
    description = "Tự động hóa vận hành Khách sạn mini, Homestay. Tự động gửi mật khẩu cửa (Smart lock), phân việc buồng phòng (Housekeeping) ngay khi khách checkout."
    category = "hospitality"
    queues = @(
        @{ name = "Buồng phòng (Housekeeping)"; description = "Dọn phòng ngay khi khách vừa trả khóa"; priority = 1; color = "cyan"; icon = "Bed" },
        @{ name = "Hỗ trợ Lưu trú"; description = "Giải quyết phàn nàn điều hòa hỏng, xin thêm khăn..."; priority = 2; color = "orange"; icon = "Bell" }
    )
    policies = @(
        @{ name = "SLA - Dọn phòng"; description = "Thời gian dọn 1 phòng tiêu chuẩn không quá 45 phút."; target_type = "time_based"; target_value = "0.75"; action = "warning_housekeeper" }
    )
    sops = @(
        @{ title = "Tiêu chuẩn Dọn Phòng 4 Sao"; content = "1. Mở cửa sổ thông thoáng 10 phút.`n2. Gấp ga giường chuẩn góc 45 độ.`n3. Bổ sung 2 chai nước suối, trà, cafe." }
    )
    entities = @(
        @{ name = "Booking (Đặt phòng)"; system_name = "hosp_booking"; description = "Lịch sử khách đặt phòng"; schema = @{ type = "object"; properties = @{ roomNumber = @{ type = "string" }; checkIn = @{ type = "string" }; checkOut = @{ type = "string" } } } }
    )
    workflows = @(
        @{ name = "Auto Check-in Instructions"; trigger_event = "hosp_booking.confirmed"; dag = @{ nodes = @( @{ id = "delay_to_checkin"; type = "DelayUntil"; date = "{{checkIn - 1 day}}"; next = @("send_email") }, @{ id = "send_email"; type = "EmailSender"; to = "{{guestEmail}}"; template = "Welcome to our Homestay. Door code is 1234#"; next = @() } ) } }
    )
    connectors = @()
}

$all = @($spa, $edu, $real_estate, $services, $contractor, $auto, $logistics, $manufacturing, $pharmacy, $hospitality)

foreach ($pack in $all) {
    $path = Join-Path $templateDir "$($pack.id).json"
    $pack | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
}
