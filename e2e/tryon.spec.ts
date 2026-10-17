import { test, expect } from "@playwright/test";
import { PNG } from "./fixtures";

test.describe("try on", () => {
  test("composites a chosen look onto the uploaded photo", async ({ page }) => {
    await page.goto("/tryon");
    await expect(page.getByRole("heading", { name: "Try it on" })).toBeVisible();

    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });

    // After upload, AI styles are generated as selectable looks.
    const tryLook = page.getByRole("button", { name: /try on →/i }).first();
    await expect(tryLook).toBeVisible({ timeout: 15_000 });
    await tryLook.click();

    // The (simulated) virtual try-on preview is labelled.
    await expect(page.getByText("Simulated preview")).toBeVisible({ timeout: 15_000 });
  });
});
