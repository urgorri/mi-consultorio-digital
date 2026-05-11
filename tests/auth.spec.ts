import { test, expect } from "@playwright/test";

test.describe("Patient Auth Flow @smoke", () => {
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
