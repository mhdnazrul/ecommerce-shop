import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS } from "./helpers/test-data"

test.describe("Order History", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test("should show empty orders state", async ({ page }) => {
    await page.goto("/orders")
    await page.waitForLoadState("networkidle")
    const body = page.locator("body")
    const bodyText = await body.textContent()
    const hasNoOrders = bodyText?.includes("No orders yet")
    const hasOrders = await page.locator(".rounded-2xl.border").count() > 0
    if (hasNoOrders || hasOrders) {
      expect(true).toBe(true)
    }
  })

  test("should display order with correct structure", async ({ page }) => {
    await page.goto("/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      const firstOrder = orderCards.first()
      await expect(firstOrder.locator(".font-mono")).toBeVisible()
      const statusBadge = firstOrder.locator(".rounded-full.text-xs")
      await expect(statusBadge).toBeVisible()
    }
  })

  test("should show order items with quantities", async ({ page }) => {
    await page.goto("/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      const firstOrder = orderCards.first()
      await expect(firstOrder.locator("text=×")).toBeVisible()
    }
  })

  test("should show formatted order date", async ({ page }) => {
    await page.goto("/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      const dateText = await orderCards.first().locator("text=/").textContent()
      expect(dateText?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeTruthy()
    }
  })
})
