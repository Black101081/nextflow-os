import psycopg2
import json
import uuid

DB_DSN = "dbname=nextflow_db user=postgres password=postgres host=localhost port=5435"
DOMAIN = "demo-retail.nextflow.vn"

conn = psycopg2.connect(DB_DSN)
cur = conn.cursor()

# Get the tenant_id
cur.execute("SELECT id FROM nf_core.tenants WHERE domain = %s", (DOMAIN,))
tenant_id = cur.fetchone()[0]

# Define the DAG
retail_dag = {
    "workflow_id": str(uuid.uuid4()),
    "nodes": [
        {
            "id": "node_trigger",
            "name": "Bắt đầu khi có Đơn hàng",
            "type": "Trigger",
            "event_name": "order.created"
        },
        {
            "id": "node_check_value",
            "name": "Kiểm tra giá trị đơn > 50Tr",
            "type": "Condition",
            "field": "payload.order_value",
            "operator": ">",
            "value": 50000000
        },
        {
            "id": "node_require_approval",
            "name": "Chuyển sang Chờ Duyệt",
            "type": "UpdateData",
            "field": "status",
            "value": "PENDING_APPROVAL"
        },
        {
            "id": "node_deduct_stock",
            "name": "Trừ số lượng Tồn kho",
            "type": "UpdateData",
            "field": "stock_qty",
            "value": "${{ math: payload.current_stock - payload.order_qty }}"
        },
        {
            "id": "node_zalo_webhook",
            "name": "Báo Zalo cho Shipper",
            "type": "WebhookCall",
            "url": "https://api.zalo.me/v2.0/oa/message",
            "method": "POST"
        }
    ],
    "edges": [
        {"source_id": "node_trigger", "target_id": "node_check_value", "condition_outcome": None},
        {"source_id": "node_check_value", "target_id": "node_require_approval", "condition_outcome": True},
        {"source_id": "node_check_value", "target_id": "node_deduct_stock", "condition_outcome": False},
        {"source_id": "node_require_approval", "target_id": "node_deduct_stock", "condition_outcome": None},
        {"source_id": "node_deduct_stock", "target_id": "node_zalo_webhook", "condition_outcome": None}
    ]
}

# Delete existing if any, then insert
cur.execute("DELETE FROM nf_meta.workflow_definitions WHERE tenant_id = %s AND trigger_event = %s", (tenant_id, "order.created"))

cur.execute("""
    INSERT INTO nf_meta.workflow_definitions (id, tenant_id, name, trigger_event, dag_json)
    VALUES (%s, %s, %s, %s, %s)
""", (str(uuid.uuid4()), tenant_id, "Luồng Xử Lý Đơn Hàng Bán Lẻ", "order.created", json.dumps(retail_dag)))

# --- SEED RETAIL SOPS FOR AI Assistant (Knowledge Base) ---
cur.execute("DELETE FROM nf_intelligence.knowledge_base WHERE tenant_id = %s", (tenant_id,))

sops = [
    {
        "title": "Chính sách Giao Nhận & Đối Soát (Retail Delivery SOP)",
        "content": "Nhân viên giao nhận (Shipper) khi đi giao các đơn hàng có giá trị thu hộ (COD) bắt buộc phải chụp ảnh bằng chứng giao hàng (Proof of Delivery) và tải lên hệ thống trước khi nhấn Hoàn tất đơn hàng. Tiền COD sẽ được đối soát vào cuối mỗi ngày làm việc.",
        "content_hash": "a1b2c3d4e5f6g7h8i9j0"
    },
    {
        "title": "Quy trình Phê Duyệt Đơn Hàng Giá Trị Cao (High Value Order SOP)",
        "content": "Mọi đơn hàng bán lẻ có tổng giá trị sản phẩm từ 50,000,000 VNĐ trở lên bắt buộc phải đi qua luồng phê duyệt từ ban giám đốc (SME_LEADER) hoặc Quản lý chi nhánh trước khi được chuyển xuống bộ phận Kho để đóng gói và giao hàng. Các đơn hàng dưới 50,000,000 VNĐ sẽ được tự động chuyển thẳng sang trừ kho và phân phối.",
        "content_hash": "f9e8d7c6b5a43210"
    }
]

for sop in sops:
    cur.execute("""
        INSERT INTO nf_intelligence.knowledge_base (id, tenant_id, title, content, content_hash)
        VALUES (%s, %s, %s, %s, %s)
    """, (str(uuid.uuid4()), tenant_id, sop["title"], sop["content"], sop["content_hash"]))

print("✅ Đã nạp thành công SOP Tri thức Bán lẻ vào Database!")

conn.commit()
cur.close()
conn.close()

print("✅ Đã nạp thành công Workflow DAG Bán Lẻ vào Database!")
