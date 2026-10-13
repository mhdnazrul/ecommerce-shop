import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: BVA for Cart Item Quantity (addCartItemSchema) (M2_TC_001 - M2_TC_007)", () => {
  let validProductId = "";
  let validCategoryId = "";

  test.beforeAll(async ({ adminRequest }) => {
    // We need a category ID to create products
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) {
        validCategoryId = body.data[0].id;
      } else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "TestCat " + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (validCategoryId) {
      const p = { name: "BVA_Test_Product_" + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 200, imageUrl: null };
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

  test("M2_TC_001 - BVA Min-1 (quantity 0)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 0 }
    });
    expect(res.status()).toBe(400);
  });

  test("M2_TC_002 - BVA Min (quantity 1)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 1 }
    });
    expect(res.status()).toBe(201); // Wait, cart create returns 200 or 201? The implementation returns 201 (mapCartItem)
  });

  test("M2_TC_003 - BVA Min+1 (quantity 2)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 2 }
    });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_004 - BVA Nominal (quantity 50)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 50 }
    });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_005 - BVA Max-1 (quantity 98)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 98 }
    });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_006 - BVA Max (quantity 99)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 99 }
    });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_007 - BVA Max+1 (quantity 100)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No products available in DB");
    const res = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 100 }
    });
    expect(res.status()).toBe(400);
  });
});
