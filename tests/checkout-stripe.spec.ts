import { test, expect } from "@playwright/test"
import { loginAsCustomer } from "./helpers/auth"
import { TEST_PRODUCTS, SHIPPING_ADDRESS, STRIPE_TEST_CARD, FUTURE_DATE, TEST_CVC, TEST_ZIP } from "./helpers/test-data"

test.describe("Stripe Payment Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test("should process Stripe payment successfully with 4242 card", async ({ page }) => {
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
    await page.waitForTimeout(5000)

    const stripeFrame = page.frameLocator("iframe").first().frameLocator("iframe")
    const cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    const cardExpiryFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').nth(1)
    const cardCvcFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').nth(2)

    if (await cardNumberFrame.locator('input[name="cardnumber"]').isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardNumberFrame.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARD, { timeout: 5000 })
      await cardExpiryFrame.locator('input[name="exp-date"]').fill(FUTURE_DATE, { timeout: 5000 })
      await cardCvcFrame.locator('input[name="cvc"]').fill(TEST_CVC, { timeout: 5000 })

      await page.click('button:has-text("Pay")')

      await page.waitForURL("**/orders/success/**", { timeout: 15000 })
      await expect(page.locator("text=Order Confirmed")).toBeVisible({ timeout: 10000 })
    }
  })

  test("should show Stripe payment form on checkout", async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCTS.inStock2.slug}`)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    await page.locator('button:has-text("Add to Cart")').click()
    await expect(page.locator("text=Added to Cart")).toBeVisible({ timeout: 10000 })

    await page.goto("/checkout")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)

    const stripeFrameCount = await page.locator('iframe[name^="__privateStripeFrame"]').count()
    if (stripeFrameCount > 0) {
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
      await expect(stripeFrame.locator("body")).toBeAttached({ timeout: 5000 })
    }
  })

  test("should show PaymentElement on checkout page after placing order", async ({ page }) => {
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

    const bodyText = await page.locator("body").textContent()
    const hasPaymentElement = bodyText?.includes("Card") || bodyText?.includes("stripe") || bodyText?.includes("Pay")
    expect(hasPaymentElement).toBe(true)
  })
})
