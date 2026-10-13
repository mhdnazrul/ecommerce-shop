import { test, expect } from "@playwright/test"

test.describe("Member 4: ECT for User Registration (M4_TC_009 - M4_TC_016)", () => {
  // Add a 12-second delay before each test to avoid hitting the 5req/60s rate limit on Vercel
  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 12000))
  })

  const getUniqueEmail = () => `ect-m4-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`

  test("M4_TC_009 - ECT Valid everything (Email & Password all rules met)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "ValidPassword123!",
      },
    })
    expect(res.status()).toBe(201)
  })

  test("M4_TC_010 - ECT Email invalid (missing @)", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "invalidemail.com",
        password: "ValidPassword123!",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_011 - ECT Email empty/missing", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "",
        password: "ValidPassword123!",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_012 - ECT Password missing uppercase", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "invalidpassword123!",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_013 - ECT Password missing lowercase", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "INVALIDPASSWORD123!",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_014 - ECT Password missing number", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "InvalidPassword!",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_015 - ECT Password missing special character", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "InvalidPassword123",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("M4_TC_016 - ECT Password less than 8 characters", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": `192.168.2.${Math.floor(Math.random() * 255)}` },
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: getUniqueEmail(),
        password: "Short1!",
      },
    })
    expect(res.status()).toBe(400)
  })
})
