CREATE SCHEMA IF NOT EXISTS nf_intelligence;

-- Bảng 1: Lưu vết quyết định tự động của AI (Auto-Triage, Auto-Assign)
CREATE TABLE IF NOT EXISTS nf_intelligence.ai_decisions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    task_id UUID NOT NULL,               -- Bị tác động (VD: WorkItem)
    decision_type VARCHAR(50) NOT NULL,  -- PRIORITY_UPDATE, ASSIGNMENT, AUTO_PAYOUT
    rationale TEXT NOT NULL,             -- Lý do AI quyết định như vậy
    confidence_score FLOAT NOT NULL,     -- 0.0 -> 1.0
    input_snapshot JSONB NOT NULL,       -- Trạng thái dữ liệu đầu vào lúc AI đưa ra quyết định
    tx_hash VARCHAR(255),                -- Bằng chứng đã được Neo lên Blockchain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng 2: Kho tri thức nội bộ (SOP, Guidelines) dùng cho RAG Chatbot
CREATE TABLE IF NOT EXISTS nf_intelligence.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(255) NOT NULL,  -- SHA-256 nội dung để chống bịa đặt
    tx_hash VARCHAR(255),                -- Giao dịch đăng ký hash tài liệu lên Blockchain
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dữ liệu giả lập cho Demo
INSERT INTO nf_intelligence.knowledge_base (id, tenant_id, title, content, content_hash, tx_hash)
VALUES (
    'd1000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000001',
    'Chính sách hoàn tiền (Refund Policy)',
    'Khách hàng sẽ được tự động hoàn tiền 100% nếu sản phẩm bị lỗi trong vòng 3 ngày kể từ lúc nhận.',
    '6fa33c7bd1531e2170366eb5a827da259d81d2f7f90beff81297120a138c2c9d',
    '0x72a5b67e81...29cf'
) ON CONFLICT DO NOTHING;
