import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("should display admin dashboard metrics", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1")).toContainText("Dashboard")
  })

  test("should show admin sidebar navigation", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await page.waitForLoadState("networkidle")
    const sidebarLinks = page.locator('nav a[href*="/admin/"]')
    const count = await sidebarLinks.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test("should navigate between admin sections", async ({ page }) => {
    await page.goto("/admin/products")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Products')")).toBeVisible()
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Product Categories')")).toBeVisible()
    await page.goto("/admin/orders")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Order Management')")).toBeVisible()
  })

  test("should restrict admin panel for non-admin users", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/login")
    await page.fill("#email", "test@shopfinity.com")
    await page.fill("#password", "Password123!")
    await page.click('button[type="submit"]:has-text("Sign In")')
    await page.waitForURL("**/")
    await page.goto("/admin/dashboard")
    await page.waitForLoadState("networkidle")
    const onLoginPage = page.url().includes("/login")
    const hasForbidden = await page.locator("text=forbidden").count() > 0
    expect(onLoginPage || hasForbidden).toBe(true)
  })
})
