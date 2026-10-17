import { test, expect } from "@playwright/test";

test.describe("inspo", () => {
  test("generates AI styles from the wardrobe", async ({ page }) => {
    await page.goto("/inspo");
    await page.getByRole("button", { name: /generate styles/i }).click();
    // Generated looks render as outfit cards (<article>).
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 });
  });

  test("styles around a chosen item and exposes a Find-it link", async ({ page }) => {
    await page.goto("/inspo");
    // Each picker tile is a button whose accessible name is the item name.
    await page.getByRole("button", { name: /Blue & black check shirt/i }).first().click();

    await expect(page.getByText(/looks built around/i)).toBeVisible({ timeout: 15_000 });

    const findIt = page.getByRole("link", { name: /find it/i }).first();
    await expect(findIt).toBeVisible();
    await expect(findIt).toHaveAttribute("href", /google\.com/);
  });
});
