import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: ECT for updateCartItemSchema (M2_TC_031 - M2_TC_035)", () => {
  let validProductId = "";
  let validCategoryId = "";
  let validItemId = "";

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
      const p = { name: "ECT_Test_Product_" + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 200, imageUrl: null };
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

  test.beforeEach(async ({ customerRequest }) => {
    if (!validProductId) return;
    const addRes = await customerRequest.post("/api/cart/items", {
      data: { productId: validProductId, quantity: 1 }
    });
    if (addRes.ok()) {
      const body = await addRes.json();
      validItemId = body.id || (body.data && body.data.id);
    }
  });

  test("M2_TC_031 - ECT valid quantity (10)", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "Setup failed");
    const res = await customerRequest.put(`/api/cart/items/${validItemId}`, {
      data: { quantity: 10 }
    });
    expect(res.status()).toBe(200);
  });

  test("M2_TC_032 - ECT invalid quantity (-1)", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "Setup failed");
    const res = await customerRequest.put(`/api/cart/items/${validItemId}`, {
      data: { quantity: -1 }
    });
    expect(res.status()).toBe(400);
  });

  test("M2_TC_033 - ECT invalid quantity (100)", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "Setup failed");
    const res = await customerRequest.put(`/api/cart/items/${validItemId}`, {
      data: { quantity: 100 }
    });
    expect(res.status()).toBe(400);
  });

  test("M2_TC_034 - ECT invalid type ('abc')", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "Setup failed");
    const res = await customerRequest.put(`/api/cart/items/${validItemId}`, {
      data: { quantity: "abc" }
    });
    expect(res.status()).toBe(400);
  });

  test("M2_TC_035 - ECT invalid type ({})", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "Setup failed");
    const res = await customerRequest.put(`/api/cart/items/${validItemId}`, {
      data: { quantity: {} }
    });
    expect(res.status()).toBe(400);
  });
});
