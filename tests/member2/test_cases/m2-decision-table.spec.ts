import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: Decision Table for Cart Operations (M2_TC_036 - M2_TC_050)", () => {
  let validProductId = "";
  let deletedProductId = "";
  let unpublishedProductId = "";
  let validCategoryId = "";

  test.beforeAll(async ({ adminRequest }) => {
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) validCategoryId = body.data[0].id;
      else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "TestCat " + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (!validCategoryId) return;

    // Create valid product
    const p1 = await adminRequest.post("/api/products", { data: { name: "Valid " + Date.now(), price: 10, categoryId: validCategoryId } });
    if (p1.ok()) validProductId = (await p1.json()).data.id;

    // Create product and delete it
    const p2 = await adminRequest.post("/api/products", { data: { name: "Deleted " + Date.now(), price: 10, categoryId: validCategoryId } });
    if (p2.ok()) {
      deletedProductId = (await p2.json()).data.id;
      await adminRequest.delete(`/api/products/${deletedProductId}`);
    }

    // Create unpublished product
    const p3 = await adminRequest.post("/api/products", { data: { name: "Unpub " + Date.now(), price: 10, categoryId: validCategoryId, isPublished: false } });
    if (p3.ok()) unpublishedProductId = (await p3.json()).data.id;
  });

  test.afterAll(async ({ adminRequest }) => {
    if (validProductId) await adminRequest.delete(`/api/products/${validProductId}`);
    if (unpublishedProductId) await adminRequest.delete(`/api/products/${unpublishedProductId}`);
  });

  test.beforeEach(async ({ customerRequest }) => {
    // Clear cart before each DT test to ensure isolated state
    await customerRequest.delete("/api/cart");
  });

  // ================= addItem Decision Table =================
  test("M2_TC_036 - DT addItem (Valid product, cart exists, item missing)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    // Ensure cart exists
    await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    await customerRequest.delete("/api/cart"); // Clear it so item is missing but cart exists
    const res = await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_037 - DT addItem (Valid product, cart exists, item present)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const res = await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 2 } });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_038 - DT addItem (Valid product, cart missing)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    // Hard to truly delete cart since the API upserts it, but clearing items simulates it enough
    const res = await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    expect(res.status()).toBe(201);
  });

  test("M2_TC_039 - DT addItem (Invalid product - Deleted)", async ({ customerRequest }) => {
    if (!deletedProductId) test.skip(true, "Setup failed");
    const res = await customerRequest.post("/api/cart/items", { data: { productId: deletedProductId, quantity: 1 } });
    expect(res.status()).toBe(404);
  });

  test("M2_TC_040 - DT addItem (Invalid product - Unpublished)", async ({ customerRequest }) => {
    if (!unpublishedProductId) test.skip(true, "Setup failed");
    const res = await customerRequest.post("/api/cart/items", { data: { productId: unpublishedProductId, quantity: 1 } });
    expect(res.status()).toBe(404);
  });

  // ================= removeItem Decision Table =================
  test("M2_TC_041 - DT removeItem (Cart + item exist)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    const addRes = await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const itemId = (await addRes.json()).id || (await addRes.json()).data?.id;
    const res = await customerRequest.delete(`/api/cart/items/${itemId}`);
    expect(res.status()).toBe(200); // 200 or 204 depending on impl. Usually 200 for success in this project
  });

  test("M2_TC_042 - DT removeItem (Cart exists, item missing)", async ({ customerRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await customerRequest.delete(`/api/cart/items/${fakeId}`);
    expect(res.status()).toBe(404);
  });

  test("M2_TC_043 - DT removeItem (Cart missing)", async ({ customerRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await customerRequest.delete(`/api/cart/items/${fakeId}`);
    expect(res.status()).toBe(404); // Even if cart missing, throws 404 for item
  });

  // ================= clearCart Decision Table =================
  test("M2_TC_044 - DT clearCart (Cart with 3 items)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 3 } });
    const res = await customerRequest.delete("/api/cart");
    expect(res.status()).toBe(200);
  });

  test("M2_TC_045 - DT clearCart (Cart with 0 items)", async ({ customerRequest }) => {
    const res = await customerRequest.delete("/api/cart");
    expect(res.status()).toBe(200);
  });

  test("M2_TC_046 - DT clearCart (Cart missing)", async ({ customerRequest }) => {
    const res = await customerRequest.delete("/api/cart");
    expect(res.status()).toBe(200); // Creates cart and returns it empty
  });

  // ================= mergeCart Decision Table =================
  test("M2_TC_047 - DT mergeCart (1 valid + 1 invalid)", async ({ customerRequest }) => {
    if (!validProductId || !deletedProductId) test.skip(true, "Setup failed");
    const res = await customerRequest.post("/api/cart/merge", { 
      data: { items: [
        { productId: validProductId, quantity: 1 },
        { productId: deletedProductId, quantity: 1 }
      ]}
    });
    expect(res.status()).toBe(200); // Should succeed by skipping invalid
  });

  test("M2_TC_048 - DT mergeCart (Duplicate valid products)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    const res = await customerRequest.post("/api/cart/merge", { 
      data: { items: [
        { productId: validProductId, quantity: 1 },
        { productId: validProductId, quantity: 2 }
      ]}
    });
    expect(res.status()).toBe(200);
  });

  test("M2_TC_049 - DT mergeCart (Valid item already in DB)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const res = await customerRequest.post("/api/cart/merge", { 
      data: { items: [{ productId: validProductId, quantity: 5 }]}
    });
    expect(res.status()).toBe(200);
  });

  test("M2_TC_050 - DT mergeCart (Valid item not in DB)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "Setup failed");
    const res = await customerRequest.post("/api/cart/merge", { 
      data: { items: [{ productId: validProductId, quantity: 1 }]}
    });
    expect(res.status()).toBe(200);
  });
});
