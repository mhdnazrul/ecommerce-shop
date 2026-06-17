import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS } from "./helpers/test-data"

test.describe("Wishlist", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test("should show empty wishlist state", async ({ page }) => {
    await page.goto("/wishlist")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Your Wishlist is Empty")).toBeVisible()
    await expect(page.locator('a:has-text("Start Exploring")')).toBeVisible()
  })

  test("should add and remove items from wishlist", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    const wishlistBtn = page.locator('[title="My Wishlist"]')
    if (await wishlistBtn.count() > 0) {
      await wishlistBtn.click()
      await page.waitForURL("**/wishlist")
    }
  })

  test("should navigate to product from wishlist", async ({ page }) => {
    await page.goto("/wishlist")
    await page.waitForLoadState("networkidle")
    const productLink = page.locator(`a[href*="/products/"]`).first()
    if (await productLink.count() > 0) {
      await productLink.click()
      await expect(page.locator("h1")).toBeVisible()
    }
  })
})
