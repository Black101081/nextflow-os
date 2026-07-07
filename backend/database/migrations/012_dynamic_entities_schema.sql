-- MIGRATION 012: DYNAMIC SCHEMA AND ENTITIES (META-ARCHITECTURE)
-- Chuyển đổi từ mô hình Relation tĩnh (hardcoded tables) sang mô hình Động.

CREATE SCHEMA IF NOT EXISTS nf_meta;

-- 1. Entities: Khai báo định nghĩa của một "Thực thể" (VD: Bệnh án, Đơn hàng, Lô hàng)
CREATE TABLE IF NOT EXISTS nf_meta.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- Tên hiển thị (VD: "Đơn bảo hành")
    system_name VARCHAR(100) NOT NULL, -- Tên hệ thống (VD: "warranty_ticket")
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, system_name)
);

-- 2. Entity_Schemas: Schema (Cấu trúc JSON) để validate dữ liệu của một Thực thể
CREATE TABLE IF NOT EXISTS nf_meta.entity_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES nf_meta.entities(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    version INT NOT NULL DEFAULT 1,
    schema_json JSONB NOT NULL, -- JSON Schema quy định bắt buộc phải có trường nào (VD: required: ["customer_name", "price"])
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, version)
);

-- 3. Entity_Records: Lưu trữ dữ liệu thực tế (thay thế cho bảng work_items)
CREATE TABLE IF NOT EXISTS nf_meta.entity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    entity_id UUID NOT NULL REFERENCES nf_meta.entities(id) ON DELETE RESTRICT,
    schema_version_id UUID NOT NULL REFERENCES nf_meta.entity_schemas(id),
    
    -- Các trường cố định cơ bản để Index và Filter nhanh
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by UUID,
    assigned_to UUID,
    
    -- Toàn bộ dữ liệu linh hoạt (Dynamic Data) được nén vào đây
    data JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo GIN Index trên cột data (JSONB) để tìm kiếm tốc độ cao
CREATE INDEX IF NOT EXISTS idx_entity_records_data ON nf_meta.entity_records USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_entity_records_tenant_entity ON nf_meta.entity_records (tenant_id, entity_id);

-- Dữ liệu giả lập mẫu cho SME (Một phòng khám nha khoa)
INSERT INTO nf_meta.entities (id, tenant_id, name, system_name, description)
VALUES (
    'e1000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000001',
    'Hồ sơ Khám bệnh', 
    'medical_record', 
    'Lưu trữ thông tin khám chữa bệnh của khách hàng'
) ON CONFLICT DO NOTHING;

INSERT INTO nf_meta.entity_schemas (id, entity_id, tenant_id, schema_json)
VALUES (
    '51000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "type": "object",
      "required": ["patient_name", "symptoms"],
      "properties": {
        "patient_name": { "type": "string", "title": "Tên Bệnh nhân" },
        "symptoms": { "type": "string", "title": "Triệu chứng" },
        "blood_pressure": { "type": "string", "title": "Huyết áp" },
        "ai_diagnosis_suggestion": { "type": "string", "title": "AI Chẩn đoán sơ bộ" }
      }
    }'::jsonb
) ON CONFLICT DO NOTHING;
