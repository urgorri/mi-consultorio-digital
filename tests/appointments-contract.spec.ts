import { test, expect } from '@playwright/test';

test.describe('Public Appointments API v1 Contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for MSW to be ready
    await page.waitForFunction(() => (window as any).mswReady !== false);
  });

  test('should return availability for a professional', async ({ page }) => {
    const data = await page.evaluate(async () => {
      const response = await fetch(`/api/appointments-public/v1/availability?professionalId=prof-1&date=2026-05-20`);
      return {
        ok: response.ok,
        status: response.status,
        body: await response.json()
      };
    });

    expect(data.ok).toBeTruthy();
    expect(data.body.success).toBe(true);
    expect(Array.isArray(data.body.data)).toBe(true);
  });

  test('should handle invalid token error payload', async ({ page }) => {
    const data = await page.evaluate(async () => {
      const response = await fetch(`/api/appointments-public/v1/reservations/token/invalid-token`);
      return {
        ok: response.ok,
        status: response.status,
        body: await response.json()
      };
    });

    if (!data.body.success) {
      expect(data.body.error.code).toBe('TOKEN_EXPIRED');
    }
  });
});
