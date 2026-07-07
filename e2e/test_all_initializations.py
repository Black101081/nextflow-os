import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "nf_platform_secret_admin_key_2026"

# 12 templates to verify
TEMPLATES = [
    "retail_distribution",
    "field_maintenance",
    "spa_wellness",
    "fb_operations",
    "logistics_delivery",
    "professional_services",
    "education_training",
    "construction_interior",
    "healthcare_clinic",
    "real_estate",
    "manufacturing_sme",
    "auto_repair"
]

def verify_all():
    print("=== STARTING FULL 12 VERTICAL PACKS AUDIT ===")
    
    for t_id in TEMPLATES:
        print(f"\n---> Auditing vertical pack: {t_id}")
        
        # 1. Onboard a new tenant for this template
        domain = f"test-{t_id.replace('_', '-')}.nextflow.vn"
        onboard_payload = {
            "company_name": f"Test Company {t_id.title()}",
            "domain": domain,
            "subscription_tier": "ENTERPRISE",
            "admin_email": f"admin@{domain}",
            "admin_first_name": "Test",
            "admin_last_name": "User"
        }
        
        # Check if already onboarded or create
        onboard_headers = {
            "Content-Type": "application/json",
            "x-platform-admin-key": ADMIN_KEY
        }
        
        res = requests.post(f"{BASE_URL}/api/v1/platform/tenants", headers=onboard_headers, json=onboard_payload)
        
        if res.status_code == 201:
            data = res.json()
            tenant_id = data["tenant"]["id"]
            api_key = data["tenant"]["api_key"]
            print(f"Created new tenant: {tenant_id}")
        elif res.status_code == 409:
            # Domain conflict, fetch list
            list_res = requests.get(f"{BASE_URL}/api/v1/platform/tenants", headers=onboard_headers)
            tenants = list_res.json()
            tenant_id = [t["id"] for t in tenants if t["domain"] == domain][0]
            api_key = f"nf_live_test_{tenant_id}"
            print(f"Using existing tenant: {tenant_id}")
        else:
            print(f"Failed to onboard tenant for {t_id}: {res.text}")
            continue
            
        # 2. Initialize the template
        init_headers = {
            "Content-Type": "application/json",
            "x-nextflow-api-key": api_key,
            "x-nextflow-tenant-id": tenant_id
        }
        init_payload = {
            "template_id": t_id,
            "wipe_existing": True
        }
        
        init_res = requests.post(f"{BASE_URL}/api/v1/tenants/initialize-template", headers=init_headers, json=init_payload)
        if init_res.status_code == 200:
            print(f"Successfully initialized template {t_id}!")
        else:
            print(f"Failed to initialize template {t_id}: {init_res.text}")
            continue
            
        # 3. Retrieve and print seeded work items
        work_items_res = requests.get(f"{BASE_URL}/api/v1/work-items", headers=init_headers)
        if work_items_res.status_code == 200:
            tasks = work_items_res.json()
            print(f"Successfully verified! Seeded {len(tasks)} work items:")
            for idx, task in enumerate(tasks, 1):
                print(f"  Task {idx}: [{task.get('priority')}] {task.get('title')} in Queue: {task.get('queue_id')} (Status: {task.get('status')})")
        else:
            print(f"Failed to fetch work items: {work_items_res.text}")

if __name__ == "__main__":
    verify_all()
