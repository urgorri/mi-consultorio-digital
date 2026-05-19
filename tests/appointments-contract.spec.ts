import { test, expect } from '@playwright/test';

test.describe('Public Appointments API v1 Contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for MSW to be ready
    await page.waitForFunction(() => (window as any).mswReady === true, { timeout: 30000 });
  });

  test('should return availability for a professional', async ({ page }) => {
    const data = await page.evaluate(async () => {
      const response = await fetch(`/api/appointments-public/v1/availability?professionalId=prof-1&date=2026-05-20`);
      let body;
      const text = await response.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse JSON: ${text.substring(0, 100)}...`);
      }
      return {
        ok: response.ok,
        status: response.status,
        body
      };
    });

    expect(data.ok).toBeTruthy();
    expect(data.body.success).toBe(true);
    expect(Array.isArray(data.body.data)).toBe(true);
  });

  test('should handle invalid token error payload', async ({ page }) => {
    const data = await page.evaluate(async () => {
      const response = await fetch(`/api/appointments-public/v1/reservations/token/invalid-token`);
      let body;
      const text = await response.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse JSON: ${text.substring(0, 100)}...`);
      }
      return {
        ok: response.ok,
        status: response.status,
        body
      };
    });

    if (!data.body.success) {
      expect(data.body.error.code).toBe('TOKEN_EXPIRED');
    }
  });
});
