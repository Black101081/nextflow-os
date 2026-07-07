-- 004_sme_policies_templates.sql
-- Create policy configuration and template pack tables in nf_core schema

-- 1. Bảng lưu trữ cấu hình chính sách của từng Tenant
CREATE TABLE IF NOT EXISTS nf_core.tenant_policies (
    tenant_id UUID PRIMARY KEY,
    sla_minutes_default INTEGER NOT NULL DEFAULT 60,
    sla_minutes_high INTEGER NOT NULL DEFAULT 30,
    auto_assignment_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    routing_mode VARCHAR(50) NOT NULL DEFAULT 'FIFO',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES nf_core.tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_routing_mode CHECK (routing_mode IN ('FIFO', 'ROUND_ROBIN', 'AI_RECOMMENDED'))
);

CREATE TRIGGER update_tenant_policies_modtime 
    BEFORE UPDATE ON nf_core.tenant_policies 
    FOR EACH ROW EXECUTE FUNCTION nf_core.update_modified_column();

-- 2. Bảng lưu trữ danh mục Gói Mẫu (Template Packs)
CREATE TABLE IF NOT EXISTS nf_core.template_packs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    config_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed mặc định 3 gói mẫu cho SME
-- Seed mặc định 12 gói mẫu cho SME (12 cụm ngành)
INSERT INTO nf_core.template_packs (id, name, description, industry, config_metadata)
VALUES 
(
  'retail_distribution', 
  'Retail & Light Distribution (Bán lẻ & Phân phối)', 
  'Thiết lập tối ưu cho các doanh nghiệp bán lẻ, kho hàng và giao nhận. Bao gồm các hàng đợi Xử lý đơn, Đóng gói kho, Shipper giao hàng và Đối soát.', 
  'Retail',
  '{"queues": [
    {"id": "q_order_processing", "name": "1. Xử lý Đơn hàng", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1800},
    {"id": "q_warehouse_pack", "name": "2. Xuất kho đóng gói", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_shipper_delivery", "name": "3. Shipper Giao hàng", "category": "OPERATIONS", "routing": "ROUND_ROBIN", "sla_seconds": 7200},
    {"id": "q_finance_clearance", "name": "4. Đối soát Tài chính", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 10800}
  ]}'::jsonb
),
(
  'field_maintenance', 
  'Field Maintenance & Installation (Bảo trì & Lắp đặt)', 
  'Cấu hình cho các dịch vụ bảo trì kỹ thuật, lắp đặt thiết bị tận nơi. Bao gồm tiếp nhận yêu cầu, kỹ thuật viên thực địa và nghiệm thu khách hàng.', 
  'Services',
  '{"queues": [
    {"id": "q_service_request", "name": "1. Tiếp nhận Yêu cầu", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1800},
    {"id": "q_tech_dispatch", "name": "2. Kỹ thuật viên Thực địa", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 14400},
    {"id": "q_customer_signoff", "name": "3. Nghiệm thu & Bàn giao", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 7200},
    {"id": "q_billing_clearance", "name": "4. Đối soát thanh toán", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 7200}
  ]}'::jsonb
),
(
  'spa_wellness', 
  'Spa & Wellness Booking (Dịch vụ Spa & Làm đẹp)', 
  'Thiết lập cho các spa, tiệm thẩm mỹ và trung tâm chăm sóc sức khỏe. Gồm đặt lịch, phân phòng & kỹ thuật viên, thực hiện liệu trình và chăm sóc khách hàng.', 
  'Wellness',
  '{"queues": [
    {"id": "q_booking_scheduler", "name": "1. Đặt lịch Spa", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 900},
    {"id": "q_room_assigner", "name": "2. Xếp phòng & Kỹ thuật viên", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 1800},
    {"id": "q_therapy_execution", "name": "3. Thực hiện Liệu trình", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 7200},
    {"id": "q_post_service", "name": "4. Chăm sóc sau dịch vụ", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 14400}
  ]}'::jsonb
),
(
  'fb_operations', 
  'F&B Operations (Nhà hàng & Quán cafe)', 
  'Quy trình vận hành tối ưu cho ngành ẩm thực và đồ uống. Bao gồm ghi nhận order tại bàn/thu ngân, chế biến bếp, phục vụ bàn và đối soát doanh thu.', 
  'F&B',
  '{"queues": [
    {"id": "q_order_taking", "name": "1. Tiếp nhận & Thu ngân", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 600},
    {"id": "q_kitchen_prep", "name": "2. Chế biến & Bếp", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1200},
    {"id": "q_table_service", "name": "3. Phục vụ bàn", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 600},
    {"id": "q_fb_reconciliation", "name": "4. Đối soát doanh thu", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 3600}
  ]}'::jsonb
),
(
  'logistics_delivery', 
  'Logistics & Express Delivery (Vận tải & Giao nhận nhanh)', 
  'Thiết lập cho các công ty chuyển phát nhanh và kho vận. Tối ưu thu gom đơn hàng bưu cục, phân loại và phân công shipper chặng cuối.', 
  'Logistics',
  '{"queues": [
    {"id": "q_pickup_request", "name": "1. Tiếp nhận đơn ký gửi", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1800},
    {"id": "q_hub_sorting", "name": "2. Phân loại tại Bưu cục", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_last_mile", "name": "3. Giao hàng chặng cuối", "category": "OPERATIONS", "routing": "ROUND_ROBIN", "sla_seconds": 7200},
    {"id": "q_cod_reconciliation", "name": "4. Đối soát thu hộ COD", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 10800}
  ]}'::jsonb
),
(
  'professional_services', 
  'Professional Services (Dịch vụ Tư vấn & Agency)', 
  'Quy trình vận hành cho các công ty thiết kế, quảng cáo và tư vấn. Quản lý luồng tiếp nhận lead, thiết kế giải pháp và nghiệm thu dự án.', 
  'Services',
  '{"queues": [
    {"id": "q_lead_qualification", "name": "1. Đánh giá nhu cầu khách hàng", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_proposal_design", "name": "2. Thiết kế giải pháp & Báo giá", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 14400},
    {"id": "q_project_delivery", "name": "3. Triển khai dự án", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 28800},
    {"id": "q_milestone_billing", "name": "4. Nghiệm thu & Xuất hóa đơn", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 7200}
  ]}'::jsonb
),
(
  'education_training', 
  'Education & Training Centers (Trung tâm Giáo dục)', 
  'Giải pháp cho các trung tâm đào tạo, anh ngữ và dạy nghề. Quản lý tư vấn viên, xếp lớp học, gán giảng viên và nghiệm thu kết quả học tập.', 
  'Education',
  '{"queues": [
    {"id": "q_consultation", "name": "1. Tư vấn khóa học", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1800},
    {"id": "q_class_allocation", "name": "2. Xếp lớp & Gán giảng viên", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_tuition_fee", "name": "3. Đối soát học phí", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 7200},
    {"id": "q_course_evaluation", "name": "4. Nghiệm thu & Báo cáo chất lượng", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 14400}
  ]}'::jsonb
),
(
  'construction_interior', 
  'Construction & Interior Contractor (Thi công & Nội thất)', 
  'Cấu hình cho các đơn vị thầu xây dựng và thiết kế nội thất. Quản lý khảo sát hiện trường, thiết kế 3D, mua sắm vật tư và thi công dự án.', 
  'Construction',
  '{"queues": [
    {"id": "q_site_survey", "name": "1. Khảo sát hiện trường", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 7200},
    {"id": "q_3d_modeling", "name": "2. Thiết kế bản vẽ 3D", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 28800},
    {"id": "q_material_procurement", "name": "3. Mua sắm vật tư", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 14400},
    {"id": "q_site_execution", "name": "4. Thi công & Nghiệm thu", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 57600}
  ]}'::jsonb
),
(
  'healthcare_clinic', 
  'Healthcare & Clinic Booking (Phòng khám & Y tế)', 
  'Thiết lập tối ưu cho phòng khám đa khoa, nha khoa hoặc thẩm mỹ viện. Chuẩn hóa tiếp nhận bệnh nhân, khám lâm sàng, phát thuốc và tái khám.', 
  'Healthcare',
  '{"queues": [
    {"id": "q_patient_reception", "name": "1. Tiếp nhận bệnh nhân", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 600},
    {"id": "q_clinical_exam", "name": "2. Khám lâm sàng", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 1800},
    {"id": "q_pharmacy_dispense", "name": "3. Phát thuốc & Thanh toán", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 1200},
    {"id": "q_followup_scheduling", "name": "4. Hẹn lịch tái khám", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600}
  ]}'::jsonb
),
(
  'real_estate', 
  'Real Estate Agency & Brokerage (Môi giới Bất động sản)', 
  'Dành cho các sàn giao dịch bất động sản. Quy trình quản lý từ việc nhận nguồn ký gửi, xác thực thông tin, dẫn khách xem nhà và đối soát hoa hồng.', 
  'Real Estate',
  '{"queues": [
    {"id": "q_listing_verification", "name": "1. Xác thực nguồn nhà", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_viewing_schedule", "name": "2. Lên lịch xem nhà", "category": "OPERATIONS", "routing": "ROUND_ROBIN", "sla_seconds": 7200},
    {"id": "q_contract_negotiation", "name": "3. Thương lượng & Soạn hợp đồng", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 14400},
    {"id": "q_commission_clearance", "name": "4. Đối soát phí môi giới", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 14400}
  ]}'::jsonb
),
(
  'manufacturing_sme', 
  'Manufacturing & Work Order (Sản xuất quy mô vừa/nhỏ)', 
  'Tối ưu cho xưởng sản xuất cơ khí, may mặc, chế biến gỗ. Quản lý lệnh sản xuất, cấp phát nguyên vật liệu, theo dõi công đoạn lắp ráp và QA.', 
  'Manufacturing',
  '{"queues": [
    {"id": "q_work_order_intake", "name": "1. Tiếp nhận lệnh sản xuất", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_material_allocation", "name": "2. Cấp phát nguyên vật liệu", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 7200},
    {"id": "q_assembly_production", "name": "3. Lắp ráp & Sản xuất", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 28800},
    {"id": "q_quality_assurance", "name": "4. Kiểm định chất lượng QA", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 7200}
  ]}'::jsonb
),
(
  'auto_repair', 
  'Automotive Repair & Garage (Sửa chữa Ô tô & Garage)', 
  'Quy trình quản lý tiếp nhận xe chẩn đoán lỗi, lập báo giá cho khách duyệt, phân công kỹ thuật viên garage sửa chữa và bàn giao xe thanh toán.', 
  'Automotive',
  '{"queues": [
    {"id": "q_vehicle_reception", "name": "1. Tiếp nhận xe & Chẩn đoán lỗi", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 1800},
    {"id": "q_quote_approval", "name": "2. Báo giá & Khách hàng duyệt", "category": "OPERATIONS", "routing": "FIFO", "sla_seconds": 3600},
    {"id": "q_repair_execution", "name": "3. Sửa chữa & Thay thế linh kiện", "category": "OPERATIONS", "routing": "CAPACITY_BASED", "sla_seconds": 14400},
    {"id": "q_wash_checkout", "name": "4. Rửa xe, bàn giao & Thanh toán", "category": "FINANCE", "routing": "FIFO", "sla_seconds": 1800}
  ]}'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, config_metadata = EXCLUDED.config_metadata;