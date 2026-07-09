-- Seed Retail Pro Pack Template

INSERT INTO nf_core.template_packs (id, name, description, industry, config_metadata)
VALUES (
    'tpl_retail_pro_001',
    'Retail Pro Pack',
    'Giải pháp Bán lẻ toàn diện: Tích hợp KiotViet, gửi tin nhắn tự động qua Zalo ZNS và thanh toán VietQR.',
    'RETAIL',
    '{
        "queues": [
            {
                "id": "q_kiotviet_orders",
                "name": "KiotViet Orders (Cần Xử Lý)",
                "category": "SALES",
                "routing": "ROUND_ROBIN",
                "sla_seconds": 1800
            },
            {
                "id": "q_zalo_failed",
                "name": "Zalo ZNS Failed (Cần xử lý thủ công)",
                "category": "SUPPORT",
                "routing": "FIFO",
                "sla_seconds": 3600
            }
        ],
        "entities": [
            {
                "name": "Đơn hàng KiotViet",
                "system_name": "kiotviet_order",
                "description": "Thực thể lưu trữ đơn hàng đồng bộ từ KiotViet",
                "schema": {
                    "type": "object",
                    "properties": {
                        "orderCode": { "type": "string" },
                        "totalPayment": { "type": "number" },
                        "customerName": { "type": "string" },
                        "customerPhone": { "type": "string" }
                    }
                }
            }
        ],
        "workflows": [
            {
                "name": "Auto ZNS on New Order",
                "trigger_event": "kiotviet_order.created",
                "dag": {
                    "nodes": [
                        {
                            "id": "start",
                            "type": "Trigger",
                            "next": ["zalo_send"]
                        },
                        {
                            "id": "zalo_send",
                            "type": "ZaloZNS",
                            "phone_number": "{{customerPhone}}",
                            "template_id": "12345",
                            "template_data": {
                                "order_code": "{{orderCode}}",
                                "amount": "{{totalPayment}}"
                            },
                            "next": []
                        }
                    ]
                }
            }
        ],
        "connectors": [
            {
                "name": "kiotviet",
                "settings": {
                    "sync_orders": true,
                    "sync_customers": true
                }
            },
            {
                "name": "zalo_oa",
                "settings": {
                    "enable_zns": true
                }
            },
            {
                "name": "vietqr",
                "settings": {
                    "auto_generate_invoice": true
                }
            }
        ]
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    industry = EXCLUDED.industry,
    config_metadata = EXCLUDED.config_metadata;
