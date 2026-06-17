import { test, expect } from "@playwright/test"

let authCookies: string

test.describe("API: Payments", () => {
  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post("/api/auth/callback/credentials", {
      data: { email: "test@shopfinity.com", password: "Password123!", csrfToken: "", callbackUrl: "/" },
    })
    authCookies = loginRes.headers()["set-cookie"] || ""
  })

  test("POST /api/payments/create-intent - should reject without auth", async ({ request }) => {
    const response = await request.post("/api/payments/create-intent", {
      data: { orderId: "00000000-0000-0000-0000-000000000000" },
    })
    expect(response.status()).toBe(401)
  })

  test("POST /api/payments/create-intent - should reject non-existent order", async ({ request }) => {
    const response = await request.post("/api/payments/create-intent", {
      headers: { Cookie: authCookies },
      data: { orderId: "00000000-0000-0000-0000-000000000000" },
    })
    expect(response.status()).toBe(404)
  })

  test("POST /api/webhooks/stripe - should reject empty body", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: {},
    })
    expect(response.status()).toBe(400)
  })

  test("POST /api/webhooks/stripe - should reject invalid signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": "invalid_signature",
        "content-type": "application/json",
      },
      data: { type: "payment_intent.succeeded", data: { object: {} } },
    })
    expect(response.status()).toBe(400)
  })
})
