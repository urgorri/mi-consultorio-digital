import { test, expect } from "@playwright/test";

test.describe("Patient Auth Flow @smoke", () => {
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
      // Return 401 to simulate unauthenticated state initially
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Unauthorized" }),
      });
    });

    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { message: "Sesión cerrada." } }),
      });
    });
  });

  test("login, navigate and logout", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.fill('input[type="email"]', "laura@email.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL(/\/portal/);
    await expect(page.locator("text=Mis citas")).toBeVisible();

    const logoutButton = page.locator('button:has(svg.lucide-log-out)');
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
    } else {
        await page.click('button:has(svg.lucide-menu)');
        await page.click('text=Cerrar sesión');
    }

    await expect(page).toHaveURL(/\/login\/paciente/);
  });
});
