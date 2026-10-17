import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("home renders the wardrobe", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Your wardrobe" })).toBeVisible();
  });

  test("nav links route between every section", async ({ page }) => {
    await page.goto("/");

    const routes: Array<[string, string]> = [
      ["Today", "Today"],
      ["Inspo", "Inspo"],
      ["Try on", "Try it on"],
      ["Add", "Add a piece"],
      ["Wardrobe", "Your wardrobe"],
    ];

    for (const [link, heading] of routes) {
      // The app renders two navs (desktop rail + mobile bottom bar); click the
      // one that's actually visible at this viewport.
      await page
        .getByRole("link", { name: link, exact: true })
        .filter({ visible: true })
        .first()
        .click();
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });
});
