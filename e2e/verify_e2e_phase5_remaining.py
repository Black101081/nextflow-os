import os
import sys
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\Black\.gemini\antigravity-ide\brain\48483146-919e-4ce9-950a-0389253fab25"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def verify_e2e():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Listen to console logs and page errors
        page.on("console", lambda msg: print(f"🖥️ [Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"❌ [Browser PageError] {err}"))

        print("🌐 Opening login page...")
        page.goto("http://127.0.0.1:8082/login")
        page.wait_for_timeout(2000)

        # Clear service workers and cache
        print("🧹 Clearing service workers and cache...")
        page.evaluate("""() => {
            navigator.serviceWorker.getRegistrations().then(regs => {
                for (let r of regs) { r.unregister(); }
            });
            localStorage.clear();
            sessionStorage.clear();
        }""")
        page.reload()
        page.wait_for_timeout(2000)

        print("🔑 Logging in...")
        page.fill("input[type='email']", "admin@smartretail.vn")
        page.fill("input[type='password']", "Sme_Nextflow_2026!")
        page.click("button[type='submit']")
        
        print("⏳ Waiting for dashboard to load...")
        page.wait_for_url("**/leader/dashboard", timeout=10000)
        print("✅ Logged in successfully!")
        page.wait_for_timeout(2000)

        # -------------------------------------------------------------
        # 1. Logistics & Delivery verification
        # -------------------------------------------------------------
        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        print("✅ Pack Operations Hub loaded!")
        page.wait_for_timeout(3000)

        # Capture Pack Operations Hub initial state
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "pack_hub_init.png"))
        print("📸 Captured pack_hub_init.png for diagnostics")

        # Click the 'Tất cả (12)' tab to display all packs
        print("🔍 Clicking 'Tất cả (12)' tab...")
        page.click("button:has-text('Tất cả')")
        page.wait_for_timeout(2000)

        print("🚚 Selecting Logistics & Delivery Solution Pack Card...")
        page.click("button:has-text('Logistics')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("🚚 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/log", timeout=5000)
        print("✅ Logistics Pack Page loaded!")
        page.wait_for_timeout(2000)

        log_tabs = [
            ("waybills", "Quản Lý Vận Đơn", "log_waybills_tab.png"),
            ("reconciliation", "Đối Soát COD", "log_reconciliation_tab.png")
        ]

        for tab_id, tab_label, filename in log_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(1500)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        # -------------------------------------------------------------
        # 2. Pharmacy & Healthcare verification
        # -------------------------------------------------------------
        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        page.wait_for_timeout(2000)

        print("💊 Selecting Pharmacy & Healthcare Solution Pack Card...")
        page.click("button:has-text('Pharmacy')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("💊 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/phar", timeout=5000)
        print("✅ Pharmacy Pack Page loaded!")
        page.wait_for_timeout(2000)

        phar_tabs = [
            ("prescriptions", "Kê Đơn & Bốc Thuốc", "phar_prescriptions_tab.png"),
            ("inventory", "Kho Dược Phẩm", "phar_inventory_tab.png"),
            ("patients", "Hồ Sơ Bệnh Nhân", "phar_patients_tab.png")
        ]

        for tab_id, tab_label, filename in phar_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(1500)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        # -------------------------------------------------------------
        # 3. Micro-Manufacturing verification
        # -------------------------------------------------------------
        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        page.wait_for_timeout(2000)

        print("🏗️ Selecting Micro-Manufacturing Solution Pack Card...")
        page.click("button:has-text('Manufacturing')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("🏗️ Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/mfg", timeout=5000)
        print("✅ Micro-Manufacturing Pack Page loaded!")
        page.wait_for_timeout(2000)

        mfg_tabs = [
            ("workorders", "Lệnh Sản Xuất", "mfg_workorders_tab.png"),
            ("boms", "Định Mức BOM", "mfg_boms_tab.png"),
            ("qc", "Kiểm Định QC", "mfg_qc_tab.png")
        ]

        for tab_id, tab_label, filename in mfg_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(1500)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        # -------------------------------------------------------------
        # 4. Contractor & Interior verification
        # -------------------------------------------------------------
        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        page.wait_for_timeout(2000)

        print("👷 Selecting Contractor & Interior Solution Pack Card...")
        page.click("button:has-text('Contractor')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("👷 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/const", timeout=5000)
        print("✅ Contractor Pack Page loaded!")
        page.wait_for_timeout(2000)

        const_tabs = [
            ("projects", "Hồ Sơ Dự Án", "const_projects_tab.png"),
            ("logs", "Nhật Ký Thi Công", "const_logs_tab.png"),
            ("materials", "Yêu Cầu Vật Tư", "const_materials_tab.png")
        ]

        for tab_id, tab_label, filename in const_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(1500)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        # -------------------------------------------------------------
        # 5. Professional Services verification
        # -------------------------------------------------------------
        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        page.wait_for_timeout(2000)

        print("💼 Selecting Professional Services Solution Pack Card...")
        page.click("button:has-text('Professional Svcs')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("💼 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/ps", timeout=5000)
        print("✅ Professional Services Pack Page loaded!")
        page.wait_for_timeout(2000)

        ps_tabs = [
            ("clients", "Doanh Nghiệp B2B", "ps_clients_tab.png"),
            ("contracts", "Hợp Đồng Retainer", "ps_contracts_tab.png"),
            ("tax", "Lịch Trình Báo Cáo Thuế", "ps_tax_tab.png")
        ]

        for tab_id, tab_label, filename in ps_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"text={tab_label}")
            page.wait_for_timeout(1500)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        browser.close()
        print("🎉 E2E Verification completed successfully for all 5 remaining packs!")

if __name__ == "__main__":
    verify_e2e()
