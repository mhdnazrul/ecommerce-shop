import { test, expect } from "@playwright/test"
import { registerUser, logout } from "./helpers/auth"
import { TEST_USERS } from "./helpers/test-data"

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should show login and register links when logged out", async ({ page }) => {
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible()
    await expect(page.locator('a:has-text("Sign Up")')).toBeVisible()
  })

  test("should register a new user", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.com`
    await registerUser(page, email, "TestPass123!")
    await expect(page.locator("text=Account created")).toBeVisible()
    await expect(page.locator('button:has-text("Logout")')).toBeVisible()
  })

  test("should show validation errors on empty registration form", async ({ page }) => {
    await page.goto("/register")
    await page.click('button[type="submit"]:has-text("Create Account")')
    await expect(page.locator("text=First name is required")).toBeVisible()
    await expect(page.locator("text=Last name is required")).toBeVisible()
    await expect(page.locator("text=Please enter a valid email")).toBeVisible()
    await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible()
  })

  test("should reject weak passwords", async ({ page }) => {
    await page.goto("/register")
    await page.fill("#firstName", "Test")
    await page.fill("#lastName", "User")
    await page.fill("#email", "weak@test.com")
    await page.fill("#password", "short")
    await page.fill("#confirmPassword", "short")
    await page.click('button[type="submit"]:has-text("Create Account")')
    await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible()
  })

  test("should reject duplicate email registration", async ({ page }) => {
    await page.goto("/register")
    await page.fill("#firstName", "Dup")
    await page.fill("#lastName", "User")
    await page.fill("#email", TEST_USERS.customer.email)
    await page.fill("#password", "TestPass123!")
    await page.fill("#confirmPassword", "TestPass123!")
    await page.click('button[type="submit"]:has-text("Create Account")')
    await expect(page.locator("text=already exists")).toBeVisible()
  })

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", TEST_USERS.customer.email)
    await page.fill("#password", TEST_USERS.customer.password)
    await page.click('button[type="submit"]:has-text("Sign In")')
    await page.waitForURL("**/")
    await expect(page.locator('button:has-text("Logout")')).toBeVisible()
  })

  test("should show error on invalid login", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", "wrong@test.com")
    await page.fill("#password", "WrongPass123!")
    await page.click('button[type="submit"]:has-text("Sign In")')
    await expect(page.locator("text=Invalid email or password")).toBeVisible()
  })

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", TEST_USERS.customer.email)
    await page.fill("#password", TEST_USERS.customer.password)
    await page.click('button[type="submit"]:has-text("Sign In")')
    await page.waitForURL("**/")
    await page.waitForLoadState("networkidle")
    await logout(page)
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible()
  })

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/orders")
    await page.waitForURL("**/login**")
    await expect(page.locator("text=Welcome back")).toBeVisible()
  })

  test("should redirect unauthenticated users from wishlist", async ({ page }) => {
    await page.goto("/wishlist")
    await page.waitForURL("**/login**")
    await expect(page.locator("text=Welcome back")).toBeVisible()
  })
})
