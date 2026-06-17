import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS, SHIPPING_ADDRESS } from "./helpers/test-data"

test.describe("Checkout & Payment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test("should display checkout page with cart items", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
    await page.goto("/checkout")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Checkout")).toBeVisible()
    await expect(page.locator("text=Shipping Address")).toBeVisible()
    await expect(page.locator("text=In Your Cart")).toBeVisible()
  })

  test("should fill shipping form and proceed to payment", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })
    await page.goto("/checkout")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.fill('input[name="firstName"]', SHIPPING_ADDRESS.firstName)
    await page.fill('input[name="lastName"]', SHIPPING_ADDRESS.lastName)
    await page.fill('input[name="address"]', SHIPPING_ADDRESS.address)
    await page.fill('input[name="city"]', SHIPPING_ADDRESS.city)
    await page.fill('input[name="postalCode"]', SHIPPING_ADDRESS.postalCode)
    await page.click('button[type="submit"]:has-text("Place Order")')
    await page.waitForTimeout(3000)
  })

  test("should redirect to cart if empty", async ({ page }) => {
    await page.goto("/checkout")
    await page.waitForURL("**/cart")
    await expect(page.locator("text=Shopping Cart")).toBeVisible()
  })

  test("should show order summary on checkout page", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })

    await page.goto(`/products/${TEST_PRODUCTS.inStock2.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })

    await page.goto("/checkout")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await expect(page.locator(`text=${TEST_PRODUCTS.inStock.name}`)).toBeVisible()
    await expect(page.locator(`text=${TEST_PRODUCTS.inStock2.name}`)).toBeVisible()
    await expect(page.locator("text=Total Due")).toBeVisible()
    await expect(page.locator("text=Free")).toBeVisible()
  })

  test("should redirect unauthenticated users from checkout", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/checkout")
    await page.waitForURL("**/login**")
    await expect(page.locator("text=Welcome back")).toBeVisible()
  })
})
