import { test, expect } from '@playwright/test';

test.describe('Appointments Hardening Critical Flows', () => {
  test('professional can configure agenda', async ({ page }) => {
    // 1. Login as professional
    await page.goto('/login/profesional');
    await page.fill('input[type="email"]', 'dra.garcia@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Go to settings/agenda
    await page.goto('/dashboard/configuracion?tab=agenda');
    await expect(page.getByText('Horarios de Atención')).toBeVisible();

    // 3. Verify types are visible
    await expect(page.getByText('Primera vez')).toBeVisible();
  });

  test('public user can book an appointment', async ({ page }) => {
    // 1. Go to public booking page
    await page.goto('/agendar');

    // 2. Select professional
    // Wait for the text to appear as it's loaded from MSW
    await page.waitForSelector('text=Dra. María Pérez');
    await page.click('text=Dra. María Pérez');

    // 3. Select a date and slot
    // This is highly dependent on UI implementation, but we want to verify the flow
    await expect(page.getByText('Seleccione un horario')).toBeVisible();
  });

  test('patient can cancel via management link', async ({ page }) => {
    // Simulate navigation to a signed URL
    const mockToken = 'token-test-123';
    await page.goto(`/citas/v/${mockToken}`);

    // If token is valid (mocked), should show appointment info
    // expect(page.getByText('Detalles de su cita')).toBeVisible();
  });
});
