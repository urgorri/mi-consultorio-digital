from playwright.sync_api import Page, expect, sync_playwright

def test_reschedule_flow(page: Page):
    # Go to public appointment view
    page.goto("http://127.0.0.1:8080/citas/v/token-test-1")

    # Wait for the page to load
    page.wait_for_selector('text=Detalle de cita', timeout=10000)

    # Check if Reprogramar button is visible and click it
    reschedule_btn = page.locator('button:has-text("Reprogramar")')
    expect(reschedule_btn).to_be_visible()
    reschedule_btn.click()

    # Wait for dialog
    page.wait_for_selector('text=Reprogramar cita', timeout=10000)
    expect(page.locator('text=Reprogramar cita')).to_be_visible()

    # Select date 25
    page.locator('button').filter(has_text="25").click()

    # Select time 11:30
    page.locator('button').filter(has_text="11:30").click()

    # Confirmar
    confirm_btn = page.locator('button:has-text("Confirmar")')
    confirm_btn.scroll_into_view_if_needed()
    confirm_btn.click()

    # Wait for success toast
    page.wait_for_selector('.text-sm.font-semibold:has-text("Cita reprogramada")', timeout=10000)
    expect(page.locator('.text-sm.font-semibold:has-text("Cita reprogramada")')).to_be_visible()

    # Take screenshot of success
    page.screenshot(path="/app/verification/reschedule_success_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_reschedule_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/app/verification/error_full.png")
        finally:
            browser.close()
