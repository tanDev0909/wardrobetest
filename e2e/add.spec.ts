import { test, expect } from "@playwright/test";
import { PNG } from "./fixtures";

test.describe("add item", () => {
  test("add without a photo", async ({ page }) => {
    await page.goto("/add");
    await page.getByRole("button", { name: /add without a photo/i }).click();

    await page.getByPlaceholder("e.g. Red knit top").fill("Test Piece");
    await page.getByRole("button", { name: /save to wardrobe/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Test Piece")).toBeVisible();
  });

  test("upload a photo runs (mock) AI tagging then saves", async ({ page }) => {
    await page.goto("/add");
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "red-dress.png", mimeType: "image/png", buffer: PNG });

    // The TagChips review panel appears after the simulated tagging delay.
    await expect(page.getByText(/AI tags · edit anything/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /save to wardrobe/i }).click();

    await expect(page).toHaveURL(/\/$/);
    // Filename hints "red" + "dress" → auto-named "Red dress".
    await expect(page.getByText(/red dress/i)).toBeVisible();
  });
});
