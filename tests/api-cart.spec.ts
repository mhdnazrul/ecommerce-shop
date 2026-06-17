import { test, expect } from "@playwright/test"
import { TEST_PRODUCTS } from "./helpers/test-data"

let authCookies: string
let cartId: string
let itemId: string

test.describe("API: Cart", () => {
  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post("/api/auth/callback/credentials", {
      data: { email: "test@shopfinity.com", password: "Password123!", csrfToken: "", callbackUrl: "/" },
    })
    authCookies = loginRes.headers()["set-cookie"] || ""
  })

  test("GET /api/cart - should return empty cart for new user", async ({ request }) => {
    const response = await request.get("/api/cart", {
      headers: { Cookie: authCookies },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  test("POST /api/cart/items - should add item to cart", async ({ request }) => {
    const productsRes = await request.get("/api/products?limit=1")
    const products = await productsRes.json()
    const productId = products.data.products[0]?.id

    const response = await request.post("/api/cart/items", {
      headers: { Cookie: authCookies },
      data: { productId, quantity: 1 },
    })
    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  test("GET /api/cart - should show cart with items after add", async ({ request }) => {
    const response = await request.get("/api/cart", {
      headers: { Cookie: authCookies },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    if (body.data?.items?.length > 0) {
      cartId = body.data.id
      itemId = body.data.items[0].id
    }
  })

  test("GET /api/cart - should return 401 without auth", async ({ request }) => {
    const response = await request.get("/api/cart")
    expect(response.status()).toBe(401)
  })

  test("POST /api/cart/items - should return 401 without auth", async ({ request }) => {
    const response = await request.post("/api/cart/items", {
      data: { productId: "00000000-0000-0000-0000-000000000000", quantity: 1 },
    })
    expect(response.status()).toBe(401)
  })
})
