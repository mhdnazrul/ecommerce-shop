import { test, expect } from "../../member2/fixtures/auth-fixture";

test.describe("Member 3: BVA for Orders and Reviews (M3_TC_001 - M3_TC_008)", () => {
  let validProductId = "";
  let validCategoryId = "";

  test.beforeAll(async ({ adminRequest }) => {
    // We need a category ID to create products for reviews
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) {
        validCategoryId = body.data[0].id;
      } else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "M3_Cat_" + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (validCategoryId) {
      const p = { name: "M3_BVA_Product_" + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 20, imageUrl: null };
      const res = await adminRequest.post("/api/products", { data: p });
      if (res.ok()) {
        validProductId = (await res.json()).data.id;
      }
    }
  });

  test.afterAll(async ({ adminRequest }) => {
    if (validProductId) {
      await adminRequest.delete(`/api/products/${validProductId}`);
    }
  });

  // limit: min(1) max(100)
  test("M3_TC_001 - BVA limit Min-1 (limit 0)", async ({ customerRequest }) => {
    const res = await customerRequest.get("/api/orders?limit=0");
    expect(res.status()).toBe(400); // Validation error
  });

  test("M3_TC_002 - BVA limit Min (limit 1)", async ({ customerRequest }) => {
    const res = await customerRequest.get("/api/orders?limit=1");
    expect(res.status()).toBe(200);
  });

  test("M3_TC_003 - BVA limit Max (limit 100)", async ({ customerRequest }) => {
    const res = await customerRequest.get("/api/orders?limit=100");
    expect(res.status()).toBe(200);
  });

  test("M3_TC_004 - BVA limit Max+1 (limit 101)", async ({ customerRequest }) => {
    const res = await customerRequest.get("/api/orders?limit=101");
    expect(res.status()).toBe(400); // Validation error
  });

  // rating: min(1) max(5)
  test("M3_TC_005 - BVA rating Min-1 (rating 0)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 0, title: "Test", comment: "Test comment" }
    });
    expect(res.status()).toBe(400);
  });

  test("M3_TC_006 - BVA rating Min (rating 1)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 1, title: "Test", comment: "Test comment" }
    });
    // Can be 201 created or 409 conflict if already reviewed by this user. Both mean validation passed.
    expect([201, 409]).toContain(res.status());
  });

  test("M3_TC_007 - BVA rating Max (rating 5)", async ({ adminRequest }) => { // Using admin to avoid conflict with customerRequest
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await adminRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 5, title: "Test", comment: "Test comment" }
    });
    expect([201, 409]).toContain(res.status());
  });

  test("M3_TC_008 - BVA rating Max+1 (rating 6)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 6, title: "Test", comment: "Test comment" }
    });
    expect(res.status()).toBe(400);
  });
});
