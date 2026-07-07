import requests
import psycopg2
import json
import uuid
import random

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "nf_platform_secret_admin_key_2026"
DB_DSN = "dbname=nextflow_db user=postgres password=postgres host=localhost port=5435"

print("🚀 Bắt đầu quá trình nạp Retail Pack Ready-To-Run...")

# 1. Onboard Tenant
domain = "demo-retail.nextflow.vn"
onboard_payload = {
    "company_name": "Smart Retail VN",
    "domain": domain,
    "subscription_tier": "ENTERPRISE",
    "admin_email": "admin@smartretail.vn",
    "admin_first_name": "Admin",
    "admin_last_name": "Retail"
}

headers = {"Content-Type": "application/json", "x-platform-admin-key": ADMIN_KEY}
res = requests.post(f"{BASE_URL}/api/v1/platform/tenants", headers=headers, json=onboard_payload)

if res.status_code == 201:
    tenant_id = res.json()["tenant"]["id"]
    api_key = res.json()["tenant"]["api_key"]
    print(f"✅ Đã tạo doanh nghiệp mới: Smart Retail VN (ID: {tenant_id})")
elif res.status_code == 409:
    # Get existing
    list_res = requests.get(f"{BASE_URL}/api/v1/platform/tenants", headers=headers)
    tenant_id = [t["id"] for t in list_res.json() if t["domain"] == domain][0]
    api_key = f"nf_live_test_{tenant_id}"
    print(f"✅ Doanh nghiệp đã tồn tại (ID: {tenant_id})")
else:
    print("❌ Lỗi khi khởi tạo doanh nghiệp:", res.text)
    exit(1)

# 2. Khởi tạo template retail_distribution qua API
init_headers = {
    "Content-Type": "application/json",
    "x-nextflow-api-key": api_key,
    "x-nextflow-tenant-id": tenant_id
}
init_res = requests.post(
    f"{BASE_URL}/api/v1/tenants/initialize-template", 
    headers=init_headers, 
    json={"template_id": "retail_distribution", "wipe_existing": False}
)
if init_res.status_code == 200:
    print("✅ Đã kích hoạt Base Template: retail_distribution")
else:
    print("⚠️ Lỗi kích hoạt Template:", init_res.text)

# 3. Kết nối DB để tạo Schema Động (No-Code Form)
conn = psycopg2.connect(DB_DSN)
cur = conn.cursor()

def insert_entity(name, system_name, schema):
    entity_id = str(uuid.uuid4())
    schema_id = str(uuid.uuid4())
    
    cur.execute("""
        INSERT INTO nf_meta.entities (id, tenant_id, name, system_name)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (tenant_id, system_name) DO NOTHING
        RETURNING id
    """, (entity_id, tenant_id, name, system_name))
    
    res = cur.fetchone()
    if res:
        e_id = res[0]
        cur.execute("""
            INSERT INTO nf_meta.entity_schemas (id, entity_id, tenant_id, schema_json)
            VALUES (%s, %s, %s, %s)
        """, (schema_id, e_id, tenant_id, json.dumps(schema)))
        print(f"  -> Đã tạo Schema: {name} ({system_name})")
        return e_id, schema_id
    else:
        # Fetch existing
        cur.execute("SELECT id FROM nf_meta.entities WHERE tenant_id = %s AND system_name = %s", (tenant_id, system_name))
        e_id = cur.fetchone()[0]
        cur.execute("SELECT id FROM nf_meta.entity_schemas WHERE entity_id = %s ORDER BY version DESC LIMIT 1", (e_id,))
        s_id = cur.fetchone()[0]
        # Clear existing data for re-run
        cur.execute("DELETE FROM nf_meta.entity_records WHERE tenant_id = %s AND entity_id = %s", (tenant_id, e_id))
        print(f"  -> Đã xóa dữ liệu cũ và dùng lại Schema: {name} ({system_name})")
        return e_id, s_id

print("\n📦 Đang thiết lập Cấu trúc Dữ liệu động...")
product_schema = {
    "type": "object",
    "properties": {
        "sku": {"type": "string", "title": "Mã SKU"},
        "name": {"type": "string", "title": "Tên sản phẩm"},
        "price": {"type": "number", "title": "Đơn giá (VNĐ)"},
        "stock_qty": {"type": "number", "title": "Tồn kho"}
    }
}

branch_schema = {
    "type": "object",
    "properties": {
        "branch_code": {"type": "string", "title": "Mã Trạm/Kho"},
        "name": {"type": "string", "title": "Tên Chi nhánh"},
        "address": {"type": "string", "title": "Địa chỉ"}
    }
}

employee_schema = {
    "type": "object",
    "properties": {
        "emp_id": {"type": "string", "title": "Mã NV"},
        "name": {"type": "string", "title": "Họ và Tên"},
        "role": {"type": "string", "title": "Vai trò"},
        "branch_code": {"type": "string", "title": "Thuộc Chi nhánh"}
    }
}

p_eid, p_sid = insert_entity("Danh mục Sản Phẩm", "products", product_schema)
b_eid, b_sid = insert_entity("Mạng lưới Chi Nhánh", "branches", branch_schema)
e_eid, e_sid = insert_entity("Hồ sơ Nhân Sự", "employees", employee_schema)

print("\n⚙️ Đang bơm dữ liệu (Seeding)...")
# Bơm 3 Chi nhánh
branches = [
    {"branch_code": "B01", "name": "Kho Tổng Quận 1", "address": "123 Lê Lợi, Q1, TP.HCM"},
    {"branch_code": "B02", "name": "Trạm Giao nhận Quận 3", "address": "456 NTMK, Q3, TP.HCM"},
    {"branch_code": "B03", "name": "Trung tâm Phân phối Thủ Đức", "address": "789 Kha Vạn Cân, TP.Thủ Đức"}
]
for b in branches:
    cur.execute("INSERT INTO nf_meta.entity_records (tenant_id, entity_id, schema_version_id, data) VALUES (%s, %s, %s, %s)", 
                (tenant_id, b_eid, b_sid, json.dumps(b)))

# Bơm 50 Sản phẩm
product_prefixes = ["Laptop", "Smartphone", "Màn hình", "Bàn phím", "Chuột"]
brands = ["Asus", "Dell", "Apple", "Logitech", "Samsung"]
for i in range(1, 51):
    name = f"{random.choice(product_prefixes)} {random.choice(brands)} Model {i:02d}"
    p = {
        "sku": f"PRD-{i:03d}",
        "name": name,
        "price": random.randint(5, 500) * 100000,
        "stock_qty": random.randint(0, 100)
    }
    cur.execute("INSERT INTO nf_meta.entity_records (tenant_id, entity_id, schema_version_id, data) VALUES (%s, %s, %s, %s)", 
                (tenant_id, p_eid, p_sid, json.dumps(p)))

# Bơm 5 Nhân viên
emps = [
    {"emp_id": "E01", "name": "Nguyễn Văn A", "role": "Manager", "branch_code": "B01"},
    {"emp_id": "E02", "name": "Trần Thị B", "role": "Sales", "branch_code": "B01"},
    {"emp_id": "E03", "name": "Lê Văn C", "role": "Warehouse", "branch_code": "B02"},
    {"emp_id": "E04", "name": "Phạm Thị D", "role": "Shipper", "branch_code": "B03"},
    {"emp_id": "E05", "name": "Hoàng Văn E", "role": "Shipper", "branch_code": "B01"}
]
for e in emps:
    cur.execute("INSERT INTO nf_meta.entity_records (tenant_id, entity_id, schema_version_id, data) VALUES (%s, %s, %s, %s)", 
                (tenant_id, e_eid, e_sid, json.dumps(e)))

conn.commit()
cur.close()
conn.close()

print(f"\n🎉 HOÀN TẤT! Đã bơm thành công: 3 Chi nhánh, 50 Sản phẩm, 5 Nhân viên.")
print("   Sản phẩm Retail Pack đã sẵn sàng để demo!")
