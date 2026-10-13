import { test, expect } from "@playwright/test"

test.describe("Member 4: BVA for User Registration (M4_TC_001 - M4_TC_008)", () => {
  // Add a 12-second delay before each test to avoid hitting the 5req/60s rate limit on Vercel
  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 12000))
  })

  const getUniqueEmail = () => `bva-m4-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
  const validPassword = "Password123!"

  test("M4_TC_001 - BVA firstName Min-1 (length 0)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "",
        lastName: "Doe",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_002 - BVA firstName Min (length 1)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "A",
        lastName: "Doe",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_003 - BVA firstName Max (length 100)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "A".repeat(100),
        lastName: "Doe",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_004 - BVA firstName Max+1 (length 101)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "A".repeat(101),
        lastName: "Doe",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_005 - BVA lastName Min-1 (length 0)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "John",
        lastName: "",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_006 - BVA lastName Min (length 1)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "John",
        lastName: "B",
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_007 - BVA lastName Max (length 100)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "John",
        lastName: "B".repeat(100),
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_008 - BVA lastName Max+1 (length 101)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.1.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "John",
        lastName: "B".repeat(101),
        email: getUniqueEmail(),
        password: validPassword,
      },
    })
    expect(res.status()).toBe(400)
  })
})
