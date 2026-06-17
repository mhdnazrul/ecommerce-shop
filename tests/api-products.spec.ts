import { test, expect } from "@playwright/test"

test.describe("API: Products", () => {
  test("GET /api/products - should return paginated products", async ({ request }) => {
    const response = await request.get("/api/products")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.products).toBeDefined()
    expect(Array.isArray(body.data.products)).toBe(true)
    expect(body.data.pagination).toBeDefined()
    expect(body.data.pagination.page).toBe(1)
  })

  test("GET /api/products - should respect page and limit params", async ({ request }) => {
    const response = await request.get("/api/products?page=1&limit=2")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.data.products.length).toBeLessThanOrEqual(2)
  })

  test("GET /api/products - should filter by search query", async ({ request }) => {
    const response = await request.get("/api/products?search=Headphones")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    const allMatch = body.data.products.every((p: { name: string }) =>
      p.name.toLowerCase().includes("headphones")
    )
    expect(allMatch).toBe(true)
  })

  test("GET /api/products - should filter by categoryId", async ({ request }) => {
    const categoriesRes = await request.get("/api/categories")
    const categories = await categoriesRes.json()
    const catId = categories.data?.[0]?.id
    if (catId) {
      const response = await request.get(`/api/products?categoryId=${catId}`)
      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    }
  })

  test("GET /api/products - should sort by price ascending", async ({ request }) => {
    const response = await request.get("/api/products?sortBy=price_asc")
    expect(response.status()).toBe(200)
    const body = await response.json()
    const prices = body.data.products.map((p: { price: number }) => Number(p.price))
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
    }
  })

  test("GET /api/products - should sort by price descending", async ({ request }) => {
    const response = await request.get("/api/products?sortBy=price_desc")
    expect(response.status()).toBe(200)
    const body = await response.json()
    const prices = body.data.products.map((p: { price: number }) => Number(p.price))
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1])
    }
  })

  test("GET /api/products - should filter by featured", async ({ request }) => {
    const response = await request.get("/api/products?isFeatured=true")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    body.data.products.forEach((p: { isFeatured: boolean }) => {
      expect(p.isFeatured).toBe(true)
    })
  })

  test("GET /api/products/slug/[slug] - should return product by slug", async ({ request }) => {
    const listRes = await request.get("/api/products?limit=1")
    const list = await listRes.json()
    const slug = list.data.products[0]?.slug
    if (slug) {
      const response = await request.get(`/api/products/slug/${slug}`)
      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data.slug).toBe(slug)
    }
  })

  test("GET /api/products/slug/[slug] - should return 404 for invalid slug", async ({ request }) => {
    const response = await request.get("/api/products/slug/non-existent-product-slug-12345")
    expect(response.status()).toBe(404)
  })
})
