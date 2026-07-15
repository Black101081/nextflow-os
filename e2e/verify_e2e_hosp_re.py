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

        # Clear service workers and reload
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

        print("📦 Navigating to Pack Operations Hub via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        print("✅ Pack Operations Hub loaded!")
        page.wait_for_timeout(2000)

        # -------------------------------------------------------------
        # Hospitality verification
        # -------------------------------------------------------------
        print("🏨 Selecting Hospitality Solution Pack Card...")
        page.click("button:has-text('Hospitality')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)
        
        print("🏨 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/hosp", timeout=5000)
        print("✅ Hospitality Pack Page loaded!")
        page.wait_for_timeout(2000)

        # Click Tabs and capture screenshots
        hosp_tabs = [
            ("rooms", "Sơ Đồ Phòng", "hosp_rooms_tab.png"),
            ("bookings", "Đặt Phòng & Lưu Trú", "hosp_bookings_tab.png"),
            ("services", "Dịch Vụ & Phòng Buồng", "hosp_services_tab.png")
        ]

        for tab_id, tab_label, filename in hosp_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(2000)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        # -------------------------------------------------------------
        # Real Estate verification
        # -------------------------------------------------------------
        print("🏢 Navigating back to Solution Packs via sidebar...")
        page.click("a[href='/leader/packs']")
        page.wait_for_url("**/leader/packs", timeout=5000)
        page.wait_for_timeout(2000)
        
        print("🏢 Selecting Real Estate Solution Pack Card...")
        page.click("button:has-text('Real Estate')")
        page.wait_for_selector("button:has-text('Mở ứng dụng chuyên biệt')", timeout=5000)

        print("🏢 Clicking specialized app link...")
        page.click("button:has-text('Mở ứng dụng chuyên biệt')")
        page.wait_for_url("**/leader/re", timeout=5000)
        print("✅ Real Estate Pack Page loaded!")
        page.wait_for_timeout(2000)

        re_tabs = [
            ("listings", "Giỏ Hàng Bất Động Sản", "re_listings_tab.png"),
            ("leads", "Nhu Cầu Khách Mua", "re_leads_tab.png"),
            ("deals", "Deal Pipeline & Pháp Lý", "re_deals_tab.png")
        ]

        for tab_id, tab_label, filename in re_tabs:
            print(f"👉 Clicking tab: {tab_label}")
            page.click(f"button:has-text('{tab_label}')")
            page.wait_for_timeout(2000)
            screenshot_path = os.path.join(ARTIFACTS_DIR, filename)
            page.screenshot(path=screenshot_path)
            print(f"📸 Captured: {filename}")

        browser.close()
        print("🎉 Hospitality & Real Estate E2E Verification completed successfully!")

if __name__ == "__main__":
    verify_e2e()
