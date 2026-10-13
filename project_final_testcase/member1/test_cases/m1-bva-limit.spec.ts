import { test, expect } from "@playwright/test";

test.describe("Member 1: BVA for Product Query Limit (M1_TC_001 - M1_TC_007)", () => {
  
  test("M1_TC_001 - BVA limit Min-1 (limit=0)", async ({ request }) => {
    const res = await request.get("/api/products?limit=0");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Validation failed");
  });

  test("M1_TC_002 - BVA limit Min (limit=1)", async ({ request }) => {
    const res = await request.get("/api/products?limit=1");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(1);
  });

  test("M1_TC_003 - BVA limit Min+1 (limit=2)", async ({ request }) => {
    const res = await request.get("/api/products?limit=2");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(2);
  });

  test("M1_TC_004 - BVA limit Nominal (limit=12)", async ({ request }) => {
    const res = await request.get("/api/products?limit=12");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(12);
  });

  test("M1_TC_005 - BVA limit Max-1 (limit=99)", async ({ request }) => {
    const res = await request.get("/api/products?limit=99");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(99);
  });

  test("M1_TC_006 - BVA limit Max (limit=100)", async ({ request }) => {
    const res = await request.get("/api/products?limit=100");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(100);
  });

  test("M1_TC_007 - BVA limit Max+1 (limit=101)", async ({ request }) => {
    const res = await request.get("/api/products?limit=101");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Validation failed");
  });
});
