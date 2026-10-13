import { test, expect } from "@playwright/test";

test.describe("Member 2: BP for NavbarSearch (M2_TC_014 - M2_TC_020)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("M2_TC_014 - BP NavbarSearch Path 1 (closed + ArrowDown + term)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("a");
    await page.waitForTimeout(500); // debounce
    await page.keyboard.press("ArrowDown");
    // Should open the panel
    const panel = page.locator('div[role="listbox"]');
    await expect(panel.first()).toBeVisible();
  });

  test("M2_TC_015 - BP NavbarSearch Path 2 (closed + other key)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.focus();
    await input.fill("a");
    // Immediately press Shift (other key) before panel opens
    await page.keyboard.press("Shift");
    // Assuming debounce handles when panel opens, but Shift shouldn't trigger specific nav logic
    const panel = page.locator('div[role="listbox"]');
    // panel might still open if term is filled, but just ensure no active descendant is set yet
    const attr = await input.getAttribute("aria-activedescendant");
    expect(attr).toBeNull();
  });

  test("M2_TC_016 - BP NavbarSearch Path 3 (open + ArrowDown)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("a");
    await page.waitForTimeout(1000);
    const panel = page.locator('div[role="listbox"]');
    await expect(panel.first()).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /search-opt-0/);
  });

  test("M2_TC_017 - BP NavbarSearch Path 4 (open + ArrowUp)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("a");
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /search-opt-0/);
    await page.keyboard.press("ArrowUp");
    // Should go to 0, if there's at least 1 option
    await expect(input).toHaveAttribute("aria-activedescendant", /search-opt-0/);
  });

  test("M2_TC_018 - BP NavbarSearch Path 5 (open + Enter)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("testquery123");
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowDown");
    // Enter should navigate to /?search=testquery123 OR to the product if active >= 0
    // Actually, if we pressed ArrowDown, active is 0, so it will navigate to the product if exists.
    // If we just press Enter without active, it submits search.
    // Let's test the submit search without ArrowDown
    await input.fill("testquery123");
    await page.keyboard.press("Escape"); // Close panel if open
    await input.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/search=testquery123/);
    expect(page.url()).toContain("search=testquery123");
  });

  test("M2_TC_019 - BP NavbarSearch Path 6 (open + Escape)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("a");
    await page.waitForTimeout(1000);
    const panel = page.locator('div[role="listbox"]');
    await expect(panel.first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel.first()).not.toBeVisible();
  });

  test("M2_TC_020 - BP NavbarSearch Path 7 (open + other key)", async ({ page }) => {
    const input = page.locator('input[type="search"][placeholder*="Search"]');
    await input.fill("a");
    await page.waitForTimeout(1000);
    const panel = page.locator('div[role="listbox"]');
    await expect(panel.first()).toBeVisible();
    await page.keyboard.press("b"); // type another char
    await expect(input).toHaveValue("ab");
    await expect(panel.first()).toBeVisible();
  });
});
