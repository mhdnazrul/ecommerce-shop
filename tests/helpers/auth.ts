import { Page } from "@playwright/test"

export async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "admin@shopfinity.com")
  await page.fill("#password", "Admin123!")
  await page.click('button[type="submit"]:has-text("Sign In")')
  await page.waitForURL("**/")
  await page.waitForLoadState("networkidle")
}

export async function loginAsCustomer(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "test@shopfinity.com")
  await page.fill("#password", "Password123!")
  await page.click('button[type="submit"]:has-text("Sign In")')
  await page.waitForURL("**/")
  await page.waitForLoadState("networkidle")
}

export async function logout(page: Page) {
  await page.click('button:has-text("Logout")')
  await page.waitForLoadState("networkidle")
}

export async function registerUser(page: Page, email: string, password: string) {
  const timestamp = Date.now()
  await page.goto("/register")
  await page.fill("#firstName", "Test")
  await page.fill("#lastName", `User${timestamp}`)
  await page.fill("#email", email)
  await page.fill("#password", password)
  await page.fill("#confirmPassword", password)
  await page.click('button[type="submit"]:has-text("Create Account")')
  await page.waitForLoadState("networkidle")
}
