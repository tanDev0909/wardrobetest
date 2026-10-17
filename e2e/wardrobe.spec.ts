import { test, expect } from "@playwright/test";

test.describe("wardrobe", () => {
  test("shows seeded items on first load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/pieces · everything you own/i)).toBeVisible();
    await expect(page.getByText("Blue & black check shirt")).toBeVisible();
    await expect(page.getByText("Black evening gown")).toBeVisible();
  });

  test("category filter narrows the grid", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dress", exact: true }).click();

    await expect(page.getByText("Black evening gown")).toBeVisible();
    // A top should no longer be in the grid once "Dress" is selected.
    await expect(page.getByText("Graphic black tee")).toHaveCount(0);
  });
});
