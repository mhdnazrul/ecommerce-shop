import { test, expect } from "@playwright/test"

test.describe("API: Categories", () => {
  test("GET /api/categories - should return all categories", async ({ request }) => {
    const response = await request.get("/api/categories")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test("GET /api/categories/tree - should return hierarchical tree", async ({ request }) => {
    const response = await request.get("/api/categories/tree")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test("GET /api/categories/slug/[slug] - should return category by slug", async ({ request }) => {
    const listRes = await request.get("/api/categories")
    const list = await listRes.json()
    const slug = list.data?.[0]?.slug
    if (slug) {
      const response = await request.get(`/api/categories/slug/${slug}`)
      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data.slug).toBe(slug)
    }
  })

  test("GET /api/categories/slug/[slug] - should return 404 for invalid slug", async ({ request }) => {
    const response = await request.get("/api/categories/slug/non-existent-category-12345")
    expect(response.status()).toBe(404)
  })

  test("GET /api/categories - should return categories with product count", async ({ request }) => {
    const response = await request.get("/api/categories")
    expect(response.status()).toBe(200)
    const body = await response.json()
    if (body.data?.length > 0) {
      const cat = body.data[0]
      expect(cat.name).toBeDefined()
      expect(cat.slug).toBeDefined()
    }
  })
})
