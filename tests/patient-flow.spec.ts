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

    // Mock dashboard data to ensure "Reprogramar" is visible
    await page.route("**/api/portal/dashboard", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            upcoming: [
              {
                id: "apt-1",
                patientId: "p-1",
                patientName: "Laura Gomez",
                professionalId: "prof-1",
                professionalName: "Dra. María Pérez",
                locationName: "Consultorio Centro",
                date: "2030-01-01", // Far in the future to ensure canReschedule is true
                time: "10:00",
                endTime: "10:30",
                type: "Seguimiento",
                status: "confirmed",
                cancellationDeadlineHours: 24
              }
            ],
            history: []
          }
        }),
      });
    });

    await page.route("**/api/appointments/v1/apt-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "apt-1",
            patientId: "p-1",
            patientName: "Laura Gomez",
            professionalId: "prof-1",
            professionalName: "Dra. María Pérez",
            locationName: "Consultorio Centro",
            date: "2030-01-01",
            time: "10:00",
            endTime: "10:30",
            type: "Seguimiento",
            status: "confirmed",
            cancellationDeadlineHours: 24
          }
        }),
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

  test("navigation to notifications", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.waitForFunction(() => (window as any).mswReady === true, { timeout: 30000 });
    await page.waitForLoadState("networkidle");

    await page.getByLabel('Correo electrónico').fill("laura@email.com");
    await page.getByLabel('Contraseña').fill("password123");

    const loginBtn = page.getByRole('button', { name: /Iniciar sesión/i });
    await loginBtn.waitFor({ state: 'attached', timeout: 10000 });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await loginBtn.click();

    await expect(page).toHaveURL(/\/portal/, { timeout: 15000 });
    await page.click('text=Notificaciones');
    await expect(page).toHaveURL(/\/portal\/notificaciones/);
  });

  test("reschedule an appointment from detail page", async ({ page }) => {
    await page.goto("/login/paciente");
    await page.waitForFunction(() => (window as any).mswReady === true, { timeout: 30000 });
    await page.waitForLoadState("networkidle");

    await page.getByLabel('Correo electrónico').fill("laura@email.com");
    await page.getByLabel('Contraseña').fill("password123");

    const loginBtn = page.getByRole('button', { name: /Iniciar sesión/i });
    await loginBtn.waitFor({ state: 'attached', timeout: 10000 });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await loginBtn.click();

    await expect(page).toHaveURL(/\/portal/, { timeout: 15000 });
    await page.waitForSelector('text=Dra. María Pérez');
    await page.click('text=Dra. María Pérez');

    await expect(page).toHaveURL(/\/portal\/citas\//);

    const rescheduleBtn = page.locator('button:has-text("Reprogramar")');
    await expect(rescheduleBtn).toBeVisible({ timeout: 10000 });
  });
});
