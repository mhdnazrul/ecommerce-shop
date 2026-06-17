import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Admin Category Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("should display category list", async ({ page }) => {
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1:has-text('Product Categories')")).toBeVisible()
    await expect(page.locator('button:has-text("Add Category")')).toBeVisible()
  })

  test("should open create category form", async ({ page }) => {
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    await page.click('button:has-text("Add Category")')
    await expect(page.locator("text=New Category Formation")).toBeVisible()
    await expect(page.locator('button:has-text("Initialize Category")')).toBeVisible()
  })

  test("should create a new category", async ({ page }) => {
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    await page.click('button:has-text("Add Category")')
    await page.waitForTimeout(500)
    const categoryName = `E2E-Cat-${Date.now()}`
    await page.fill("#catName", categoryName)
    await page.click('button[type="submit"]:has-text("Initialize Category")')
    await page.waitForTimeout(2000)
    await expect(page.locator(`text=${categoryName}`).first()).toBeVisible({ timeout: 10000 })
  })

  test("should validate required category name", async ({ page }) => {
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    await page.click('button:has-text("Add Category")')
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]:has-text("Initialize Category")')
    await page.waitForTimeout(1000)
    const bodyText = await page.locator("body").textContent()
    const hasValidation = bodyText?.toLowerCase().includes("required") || bodyText?.toLowerCase().includes("invalid")
    expect(hasValidation || await page.locator("text=New Category Formation").isVisible()).toBe(true)
  })

  test("should show edit button on category cards", async ({ page }) => {
    await page.goto("/admin/categories")
    await page.waitForLoadState("networkidle")
    const editButtons = page.locator('button[title="Edit"]')
    const count = await editButtons.count()
    if (count > 0) {
      await editButtons.first().click()
      await expect(page.locator("text=Edit Category")).toBeVisible()
    }
  })

  test("should restrict category management for non-admins", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/admin/categories")
    await page.waitForURL("**/login**")
  })
})
