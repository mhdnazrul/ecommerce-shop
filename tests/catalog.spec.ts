import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS } from "./helpers/test-data"

test.describe("Product Catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/products")
  })

  test("should display product grid", async ({ page }) => {
    await page.waitForSelector("text=All Products", { timeout: 10000 })
    const productCount = await page.locator('a[href*="/products/"]').count()
    expect(productCount).toBeGreaterThan(0)
  })

  test("should navigate to product detail page", async ({ page }) => {
    await page.waitForSelector(`a[href="/products/${TEST_PRODUCTS.inStock.slug}"]`, { timeout: 10000 })
    await page.click(`a[href="/products/${TEST_PRODUCTS.inStock.slug}"]`)
    await page.waitForURL(`**/products/${TEST_PRODUCTS.inStock.slug}`)
    await expect(page.locator(`h1:has-text("${TEST_PRODUCTS.inStock.name}")`)).toBeVisible()
  })

  test("should show product price and stock on detail page", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator(`text=${TEST_PRODUCTS.inStock.price}`)).toBeVisible()
    await expect(page.locator("text=In Stock")).toBeVisible()
  })

  test("should show out of stock status for zero stock products", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.outOfStock.slug}`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Out of Stock")).toBeVisible()
  })

  test("should search products by name", async ({ page }) => {
    await page.waitForSelector('input[placeholder="Search products..."]', { timeout: 10000 })
    await page.fill('input[placeholder="Search products..."]', TEST_PRODUCTS.inStock.name)
    await page.press('input[placeholder="Search products..."]', "Enter")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    const result = page.locator(`a[href="/products/${TEST_PRODUCTS.inStock.slug}"]`)
    await expect(result).toBeVisible()
  })

  test("should show no results for unmatched search", async ({ page }) => {
    await page.waitForSelector('input[placeholder="Search products..."]', { timeout: 10000 })
    await page.fill('input[placeholder="Search products..."]', "zzzzzxyzzy")
    await page.press('input[placeholder="Search products..."]', "Enter")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    await expect(page.locator("text=No products found")).toBeVisible()
  })

  test("should filter products by category", async ({ page }) => {
    await page.waitForSelector("select", { timeout: 10000 })
    await page.selectOption("select:first-of-type", "electronics")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    const count = await page.locator('a[href*="/products/"]').count()
    expect(count).toBeGreaterThan(0)
  })

  test("should sort products by price low to high", async ({ page }) => {
    await page.waitForSelector("select", { timeout: 10000 })
    const sortSelects = page.locator("select")
    const count = await sortSelects.count()
    if (count >= 2) {
      await sortSelects.nth(1).selectOption("price-asc")
      await page.waitForLoadState("networkidle")
      await page.waitForTimeout(1000)
      const prices = await page.locator(".font-black.text-gray-900").allTextContents()
      const numericPrices = prices.map((p) => parseFloat(p.replace(/[^0-9.]/g, "")))
      for (let i = 1; i < numericPrices.length; i++) {
        expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1])
      }
    }
  })
})
