import { test, expect } from "@playwright/test";

test.describe("today", () => {
  test("suggests an outfit and elevates it with AI", async ({ page }) => {
    await page.goto("/today");
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

    // Suggestions appear after weather (fallback) + the simulated styling delay.
    const elevate = page.getByRole("button", { name: /elevate this look with ai/i });
    await expect(elevate).toBeVisible({ timeout: 15_000 });

    await elevate.click();
    await expect(page.getByText("AI elevated")).toBeVisible({ timeout: 15_000 });
  });

  test("mood can be changed", async ({ page }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: "Professional", exact: true }).click();
    await expect(page.getByRole("button", { name: "Professional", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
