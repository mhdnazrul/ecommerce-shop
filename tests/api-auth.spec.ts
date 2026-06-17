import { test, expect } from "@playwright/test"

test.describe("API: Authentication", () => {
  const uniqueEmail = `api-auth-${Date.now()}@test.com`

  test("POST /api/auth/register - should register a new user", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail,
        password: "TestPass123!",
        firstName: "API",
        lastName: "TestUser",
      },
    })
    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.email).toBe(uniqueEmail)
  })

  test("POST /api/auth/register - should reject duplicate email", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: uniqueEmail,
        password: "TestPass123!",
        firstName: "API",
        lastName: "TestUser",
      },
    })
    expect(response.status()).toBe(409)
    const body = await response.json()
    expect(body.success).toBe(false)
  })

  test("POST /api/auth/register - should reject weak password", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: `weak-${Date.now()}@test.com`,
        password: "short",
        firstName: "API",
        lastName: "TestUser",
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.success).toBe(false)
  })

  test("POST /api/auth/register - should reject missing email", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        password: "TestPass123!",
        firstName: "API",
        lastName: "TestUser",
      },
    })
    expect(response.status()).toBe(400)
  })

  test("POST /api/auth/session - should return session for authenticated user", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/callback/credentials", {
      data: {
        email: "admin@shopfinity.com",
        password: "Admin123!",
        csrfToken: "",
        callbackUrl: "/",
      },
    })
    expect(loginResponse.status()).toBe(302)
    const cookies = loginResponse.headers()["set-cookie"]
    expect(cookies).toBeTruthy()
  })

  test("POST /api/auth/register - should reject missing firstName", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: `no-fname-${Date.now()}@test.com`,
        password: "TestPass123!",
        lastName: "TestUser",
      },
    })
    expect(response.status()).toBe(400)
  })

  test("POST /api/auth/register - should reject missing lastName", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: `no-lname-${Date.now()}@test.com`,
        password: "TestPass123!",
        firstName: "API",
      },
    })
    expect(response.status()).toBe(400)
  })
})
