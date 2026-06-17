import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Admin Product Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("should display product list", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Products')")).toBeVisible()
    await expect(page.locator('input[aria-label="Filter products by name"]')).toBeVisible()
    await expect(page.locator('button:has-text("Add Product")')).toBeVisible()
  })

  test("should open create product form", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    await page.click('button:has-text("Add Product")')
    await expect(page.locator("text=Create New Product")).toBeVisible()
    await expect(page.locator('button:has-text("Save Product")')).toBeVisible()
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible()
  })

  test("should validate required fields on create form", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    await page.click('button:has-text("Add Product")')
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]:has-text("Save Product")')
    await page.waitForTimeout(1000)
    const bodyText = await page.locator("body").textContent()
    const hasValidationErrors = bodyText?.toLowerCase().includes("required") || bodyText?.toLowerCase().includes("invalid")
    const stillOnForm = await page.locator("text=Create New Product").isVisible()
    expect(stillOnForm || hasValidationErrors).toBe(true)
  })

  test("should filter products by search", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    const searchInput = page.locator('input[aria-label="Filter products by name"]')
    await searchInput.fill("Headphones")
    await page.waitForTimeout(1000)
    await page.waitForLoadState("networkidle")
    const rows = page.locator("tbody tr")
    const rowCount = await rows.count()
    if (rowCount > 0) {
      await expect(page.locator("tbody tr").first()).toContainText("Headphones", { timeout: 5000 })
    }
  })

  test("should show empty state when no products match search", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    await page.fill('input[aria-label="Filter products by name"]', "NONEXISTENT_PRODUCT_XYZ")
    await page.waitForTimeout(1000)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=No products found")).toBeVisible()
  })

  test("should restrict access for non-admins", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/admin/products")
    await page.waitForURL("**/login**")
    await expect(page.locator("text=Welcome back")).toBeVisible()
  })
})
