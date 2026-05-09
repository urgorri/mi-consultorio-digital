import { test, expect } from "@playwright/test";

test.describe("Patient Flow", () => {
  test("navigation to notifications", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.fill('input[type="email"]', "laura@email.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Iniciar sesión")');

    await page.click('text=Notificaciones');
    await expect(page).toHaveURL(/\/portal\/notificaciones/);
  });

  test("reschedule an appointment from detail page", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.fill('input[type="email"]', "laura@email.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Iniciar sesión")');

    await page.waitForSelector('text=Dra. María García');
    await page.click('text=Dra. María García');

    await expect(page).toHaveURL(/\/portal\/citas\//);

    const rescheduleBtn = page.locator('button:has-text("Reprogramar")');
    await expect(rescheduleBtn).toBeVisible();
  });
});
