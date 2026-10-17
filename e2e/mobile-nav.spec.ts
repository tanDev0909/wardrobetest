import { test, expect } from "@playwright/test";

// Mobile-first: the bottom tab bar must stay pinned to the viewport while
// scrolling (this regressed once when an ancestor's backdrop-filter created a
// containing block for the fixed nav).
test.describe("mobile bottom nav", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("stays pinned to the viewport while scrolling", async ({ page }) => {
    await page.goto("/");

    // DOM order: desktop rail nav first, mobile bottom nav last.
    const bottomNav = page.locator("nav").last();
    await expect(bottomNav).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(bottomNav).toBeInViewport();

    const box = await bottomNav.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Its bottom edge should align with the viewport bottom (812px).
      expect(Math.abs(box.y + box.height - 812)).toBeLessThan(3);
    }
  });
});
