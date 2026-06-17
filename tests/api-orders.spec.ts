import { test, expect } from "@playwright/test"

let authCookies: string

test.describe("API: Orders", () => {
  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post("/api/auth/callback/credentials", {
      data: { email: "test@shopfinity.com", password: "Password123!", csrfToken: "", callbackUrl: "/" },
    })
    authCookies = loginRes.headers()["set-cookie"] || ""
  })

  test("GET /api/orders - should return orders list", async ({ request }) => {
    const response = await request.get("/api/orders", {
      headers: { Cookie: authCookies },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.orders).toBeDefined()
    expect(Array.isArray(body.data.orders)).toBe(true)
    expect(body.data.pagination).toBeDefined()
  })

  test("GET /api/orders - should return 401 without auth", async ({ request }) => {
    const response = await request.get("/api/orders")
    expect(response.status()).toBe(401)
  })

  test("POST /api/orders/checkout - should return 400 with empty cart", async ({ request }) => {
    const response = await request.post("/api/orders/checkout", {
      headers: { Cookie: authCookies },
      data: { shippingAddressId: "00000000-0000-0000-0000-000000000000", notes: "" },
    })
    expect(response.status()).toBe(400)
  })

  test("GET /api/orders - should return orders with pagination metadata", async ({ request }) => {
    const response = await request.get("/api/orders?page=1&limit=10", {
      headers: { Cookie: authCookies },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.data.pagination.page).toBe(1)
    expect(body.data.pagination.limit).toBe(10)
    expect(typeof body.data.pagination.total).toBe("number")
    expect(typeof body.data.pagination.totalPages).toBe("number")
  })
})
