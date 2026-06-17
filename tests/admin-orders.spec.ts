import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Admin Order Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("should display order management page", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Order Management')")).toBeVisible()
  })

  test("should show order count badge", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    const badge = page.locator("text=total").first()
    await expect(badge).toBeVisible()
  })

  test("should display order cards with status dropdown", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      const statusSelect = orderCards.first().locator("select")
      await expect(statusSelect).toBeVisible()
      const totalAmount = orderCards.first().locator(".font-black.text-gray-900")
      await expect(totalAmount).toBeVisible()
    }
  })

  test("should have all order status options", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      const statusSelect = orderCards.first().locator("select")
      const options = await statusSelect.locator("option").allTextContents()
      expect(options.length).toBeGreaterThanOrEqual(5)
    }
  })

  test("should show order items list", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    const orderCards = page.locator(".rounded-2xl.border.border-gray-200")
    const count = await orderCards.count()
    if (count > 0) {
      await expect(orderCards.first().locator("text=Qty:")).toBeVisible()
    }
  })

  test("should show empty state when no orders exist", async ({ page }) => {
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    const bodyText = await page.locator("body").textContent()
    const showEmptyState = bodyText?.includes("No orders yet")
    const hasOrders = bodyText?.includes("Order ID:")
    expect(showEmptyState || hasOrders).toBe(true)
  })

  test("should redirect non-admin users", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/admin/orders")
    await page.waitForURL("**/login**")
  })
})
