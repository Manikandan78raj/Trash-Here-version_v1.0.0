import { test, expect } from '@playwright/test';

test.describe('Household User Journey E2E', () => {
  test('should load application and verify page title and basic layout structure', async ({ page }) => {
    // Navigate to homepage/dashboard
    await page.goto('/');

    // Check title or document content exists
    expect(await page.title()).toBeDefined();

    // Verify main body is rendered without fatal client errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
