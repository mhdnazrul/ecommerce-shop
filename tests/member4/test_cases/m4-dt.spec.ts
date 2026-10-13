import { test, expect } from "../../member2/fixtures/auth-fixture"

test.describe("Member 4: DT for Category Update (M4_TC_027 - M4_TC_030)", () => {
  // Add a 12-second delay before each test to avoid hitting rate limits on Vercel
  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 12000))
  })

  let mainCategoryId = ""
  let validParentId = ""
  const fakeParentId = "00000000-0000-0000-0000-000000000000"

  test.beforeAll(async ({ adminRequest }) => {
    // Create a category to be updated
    const mainCat = await adminRequest.post("/api/categories", {
      data: { name: `DT Main Cat ${Date.now()}`, displayOrder: 1 },
    })
    const mainCatData = await mainCat.json()
    mainCategoryId = mainCatData.data.id

    // Create a valid parent category
    const parentCat = await adminRequest.post("/api/categories", {
      data: { name: `DT Parent Cat ${Date.now()}`, displayOrder: 2 },
    })
    const parentCatData = await parentCat.json()
    validParentId = parentCatData.data.id
  })

  test("M4_TC_027 - DT: parentId omitted (updates non-parent fields)", async ({ adminRequest }) => {
    const res = await adminRequest.put(`/api/categories/${mainCategoryId}`, {
      data: {
        name: `DT Main Cat Updated ${Date.now()}`, // Only updating name, parentId is omitted
      },
    })
    expect(res.status()).toBe(200)
  })

  test("M4_TC_028 - DT: parentId equals own category ID (self-referencing)", async ({ adminRequest }) => {
    const res = await adminRequest.put(`/api/categories/${mainCategoryId}`, {
      data: {
        parentId: mainCategoryId, // Equals its own ID
      },
    })
    expect(res.status()).toBe(409)
  })

  test("M4_TC_029 - DT: parentId does not exist", async ({ adminRequest }) => {
    const res = await adminRequest.put(`/api/categories/${mainCategoryId}`, {
      data: {
        parentId: fakeParentId, // Different ID, but does not exist
      },
    })
    expect(res.status()).toBe(404)
  })

  test("M4_TC_030 - DT: parentId is valid and exists", async ({ adminRequest }) => {
    const res = await adminRequest.put(`/api/categories/${mainCategoryId}`, {
      data: {
        parentId: validParentId, // Valid existing parent
      },
    })
    expect(res.status()).toBe(200)
  })
})
