import { test, expect } from "../../member2/fixtures/auth-fixture"

test.describe("Member 4: BP for Categories, Dashboard, and Register (M4_TC_017 - M4_TC_026)", () => {
  // Add a 12-second delay before each test to avoid hitting rate limits on Vercel
  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 12000))
  })

  let emptyCategoryId = ""
  let categoryIdWithChildren = ""
  let categoryIdWithProducts = ""
  const getUniqueEmail = () => `bp-m4-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
  const duplicateEmail = getUniqueEmail()
  const validPassword = "Password123!"

  test.beforeAll(async ({ adminRequest }) => {
    // 1. Create an empty category to delete successfully
    const emptyCat = await adminRequest.post("/api/categories", {
      data: { name: `Empty Cat M4 ${Date.now()}`, displayOrder: 1 },
    })
    const emptyCatData = await emptyCat.json()
    emptyCategoryId = emptyCatData.data.id

    // 2. Create a parent category and a child category
    const parentCat = await adminRequest.post("/api/categories", {
      data: { name: `Parent Cat M4 ${Date.now()}`, displayOrder: 2 },
    })
    const parentCatData = await parentCat.json()
    categoryIdWithChildren = parentCatData.data.id

    await adminRequest.post("/api/categories", {
      data: { name: `Child Cat M4 ${Date.now()}`, displayOrder: 1, parentId: categoryIdWithChildren },
    })

    // 3. Create a category and add a product to it
    const prodCat = await adminRequest.post("/api/categories", {
      data: { name: `Prod Cat M4 ${Date.now()}`, displayOrder: 3 },
    })
    const prodCatData = await prodCat.json()
    categoryIdWithProducts = prodCatData.data.id

    await adminRequest.post("/api/products", {
      data: {
        name: `Product in Cat M4 ${Date.now()}`,
        categoryId: categoryIdWithProducts,
        price: 10.99,
        stockQuantity: 5,
        isPublished: true,
      },
    })
  })

  // BP: Category Delete Paths
  test("M4_TC_017 - BP Category Delete: Category not found", async ({ adminRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000"
    const res = await adminRequest.delete(`/api/categories/${fakeId}`)
    expect(res.status()).toBe(404)
  })

  test("M4_TC_018 - BP Category Delete: Category has children", async ({ adminRequest }) => {
    const res = await adminRequest.delete(`/api/categories/${categoryIdWithChildren}`)
    expect(res.status()).toBe(409)
  })

  test("M4_TC_019 - BP Category Delete: Category has products", async ({ adminRequest }) => {
    const res = await adminRequest.delete(`/api/categories/${categoryIdWithProducts}`)
    expect(res.status()).toBe(409)
  })

  test("M4_TC_020 - BP Category Delete: Empty category successfully deleted", async ({ adminRequest }) => {
    const res = await adminRequest.delete(`/api/categories/${emptyCategoryId}`)
    expect(res.status()).toBe(200)
  })

  // BP: Dashboard Metrics Paths
  test("M4_TC_021 - BP Dashboard: Admin access", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/dashboard/metrics")
    expect(res.status()).toBe(200)
  })

  test("M4_TC_022 - BP Dashboard: Customer access", async ({ customerRequest }) => {
    const res = await customerRequest.get("/api/dashboard/metrics")
    expect(res.status()).toBe(403)
  })

  test("M4_TC_023 - BP Dashboard: Unauthenticated access", async ({ request }) => {
    const res = await request.get("/api/dashboard/metrics")
    expect(res.status()).toBe(401)
  })

  // BP: Register Paths
  test("M4_TC_024 - BP Register: Success path", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.3.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Test",
        lastName: "User",
        email: duplicateEmail,
        password: validPassword,
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_025 - BP Register: Duplicate email", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.3.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Another",
        lastName: "User",
        email: duplicateEmail, // Same email as above
        password: validPassword,
      },
    })
    expect(res.status()).toBe(409)
  })

  test("M4_TC_026 - BP Register: Validation failed (empty body)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.3.${Math.floor(Math.random() * 255)}` },
      data: {}, // Missing required fields
    })
    expect(res.status()).toBe(400)
  })
})
