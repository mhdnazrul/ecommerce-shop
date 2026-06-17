import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS } from "./helpers/test-data"

test.describe("Cart", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test("should add a product to cart from detail page", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    const addButton = page.locator('button:has-text("Add to Cart")')
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
  })

  test("should display cart with added items", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
    await page.goto("/cart")
    await page.waitForLoadState("networkidle")
    await expect(page.locator(`text=${TEST_PRODUCTS.inStock.name}`)).toBeVisible()
    await expect(page.locator(`text=${TEST_PRODUCTS.inStock.price}`)).toBeVisible()
  })

  test("should remove item from cart", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
    await page.goto("/cart")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    const removeButton = page.locator('button:has-text("Remove")')
    await expect(removeButton).toBeVisible({ timeout: 10000 })
    await removeButton.click()
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Your cart is empty")).toBeVisible({ timeout: 10000 })
  })

  test("should show empty cart state", async ({ page }) => {
    await page.goto("/cart")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Your cart is empty")).toBeVisible()
    await expect(page.locator('a:has-text("Shop Now")')).toBeVisible()
  })

  test("should proceed to checkout from cart", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
    await page.goto("/cart")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    const checkoutBtn = page.locator('button:has-text("Checkout Securely")')
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 })
    await checkoutBtn.click()
    await page.waitForURL("**/checkout")
    await expect(page.locator("text=Checkout")).toBeVisible()
  })
})
