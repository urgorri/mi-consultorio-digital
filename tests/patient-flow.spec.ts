import { test, expect } from "@playwright/test";

test.describe("Patient Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth API responses for E2E tests
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { user: { id: "p-1", role: "paciente", firstName: "Laura", lastName: "Gomez", email: "laura@email.com", emailVerifiedAt: new Date().toISOString(), kycStatus: "approved" } } }),
      });
    });

    await page.route("**/auth/me", async (route) => {
      // Simulate unauthenticated state initially
      if (page.url().includes("/login/paciente")) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "Unauthorized" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: { id: "p-1", role: "paciente", firstName: "Laura", lastName: "Gomez", email: "laura@email.com", emailVerifiedAt: new Date().toISOString(), kycStatus: "approved" } }),
        });
      }
    });

    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { message: "Sesión cerrada." } }),
      });
    });
  });

  test("navigation to notifications", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    await page.fill('input[type="email"]', "laura@email.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL(/\/portal/);
    await page.click('text=Notificaciones');
    await expect(page).toHaveURL(/\/portal\/notificaciones/);
  });

  test("reschedule an appointment from detail page", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    await page.fill('input[type="email"]', "laura@email.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL(/\/portal/);
    await page.waitForSelector('text=Dra. María García');
    await page.click('text=Dra. María García');

    await expect(page).toHaveURL(/\/portal\/citas\//);

    const rescheduleBtn = page.locator('button:has-text("Reprogramar")');
    await expect(rescheduleBtn).toBeVisible();
  });
});
