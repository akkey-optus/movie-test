import { expect, test } from "@playwright/test";

test("planet_test route resolves", async ({ page }) => {
  await page.goto("/quiz/planet_test");

  await expect(page.getByRole("heading", { name: /planet_test scaffold/i })).toBeVisible();
});
