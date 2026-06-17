import { test, expect } from "@playwright/test"
import path from "path"

let adminCookies: string

test.describe("API: Uploads", () => {
  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post("/api/auth/callback/credentials", {
      data: { email: "admin@shopfinity.com", password: "Admin123!", csrfToken: "", callbackUrl: "/" },
    })
    adminCookies = loginRes.headers()["set-cookie"] || ""
  })

  test("POST /api/uploads - should reject unauthenticated request", async ({ request }) => {
    const response = await request.post("/api/uploads")
    expect(response.status()).toBe(401)
  })

  test("POST /api/uploads - should reject without file", async ({ request }) => {
    const response = await request.post("/api/uploads", {
      headers: { Cookie: adminCookies },
      multipart: {},
    })
    expect(response.status()).toBe(400)
  })

  test("DELETE /api/uploads - should reject unauthenticated request", async ({ request }) => {
    const response = await request.delete("/api/uploads", {
      data: { publicId: "test" },
    })
    expect(response.status()).toBe(401)
  })

  test("POST /api/uploads - should reject invalid file type", async ({ request }) => {
    const response = await request.post("/api/uploads", {
      headers: { Cookie: adminCookies },
      multipart: {
        image: {
          name: "test.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("not an image"),
        },
      },
    })
    expect(response.status()).toBe(400)
  })

  test("DELETE /api/uploads - should reject non-admin", async ({ request }) => {
    const customerLogin = await request.post("/api/auth/callback/credentials", {
      data: { email: "test@shopfinity.com", password: "Password123!", csrfToken: "", callbackUrl: "/" },
    })
    const customerCookies = customerLogin.headers()["set-cookie"] || ""

    const response = await request.delete("/api/uploads", {
      headers: { Cookie: customerCookies },
      data: { publicId: "test" },
    })
    expect(response.status()).toBe(403)
  })
})
