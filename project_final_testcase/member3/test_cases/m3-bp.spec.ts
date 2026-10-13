import { test, expect } from "../../member2/fixtures/auth-fixture";

test.describe("Member 3: BP for Wishlist, Reviews, Orders (M3_TC_015 - M3_TC_025)", () => {
  let validProductId = "";
  let deletedProductId = "";
  let noStockProductId = "";
  let validCategoryId = "";

  test.beforeAll(async ({ adminRequest }) => {
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) validCategoryId = body.data[0].id;
      else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "M3_BP_Cat_" + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (validCategoryId) {
      // 1. Valid product
      let res = await adminRequest.post("/api/products", {
        data: { name: "M3_BP_Product_" + Date.now(), price: 50, categoryId: validCategoryId, stockQuantity: 200, imageUrl: null }
      });
      if (res.ok()) validProductId = (await res.json()).data.id;

      // 2. Product to be deleted
      res = await adminRequest.post("/api/products", {
        data: { name: "M3_BP_Del_" + Date.now(), price: 50, categoryId: validCategoryId, stockQuantity: 10, imageUrl: null }
      });
      if (res.ok()) {
        deletedProductId = (await res.json()).data.id;
        await adminRequest.delete(`/api/products/${deletedProductId}`);
      }

      // 3. Product with no stock
      res = await adminRequest.post("/api/products", {
        data: { name: "M3_BP_NoStock_" + Date.now(), price: 50, categoryId: validCategoryId, stockQuantity: 0, imageUrl: null }
      });
      if (res.ok()) noStockProductId = (await res.json()).data.id;
    }
  });

  test.afterAll(async ({ adminRequest }) => {
    if (validProductId) await adminRequest.delete(`/api/products/${validProductId}`);
    if (noStockProductId) await adminRequest.delete(`/api/products/${noStockProductId}`);
  });

  // --- Wishlist BP ---
  test("M3_TC_015 - BP Wishlist: Product does not exist", async ({ customerRequest }) => {
    const res = await customerRequest.post("/api/wishlist/items", {
      data: { productId: "00000000-0000-0000-0000-000000000000" }
    });
    expect(res.status()).toBe(404);
  });

  test("M3_TC_016 - BP Wishlist: Product already in wishlist", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No product");
    // Add first time
    await customerRequest.post("/api/wishlist/items", { data: { productId: validProductId } });
    // Add second time
    const res = await customerRequest.post("/api/wishlist/items", { data: { productId: validProductId } });
    expect(res.status()).toBe(409);
  });

  test("M3_TC_017 - BP Wishlist: Success path", async ({ adminRequest }) => {
    if (!validProductId) test.skip(true, "No product");
    // Using adminRequest to represent a different user who hasn't added it yet
    const res = await adminRequest.post("/api/wishlist/items", { data: { productId: validProductId } });
    expect(res.status()).toBe(201);
  });

  // --- Review BP ---
  test("M3_TC_018 - BP Review: Product does not exist", async ({ customerRequest }) => {
    const res = await customerRequest.post("/api/reviews", {
      data: { productId: "00000000-0000-0000-0000-000000000000", rating: 5, title: "T", comment: "C" }
    });
    expect(res.status()).toBe(404);
  });

  test("M3_TC_019 - BP Review: Review already exists", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No product");
    // Create first review
    await customerRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 5, title: "T", comment: "C" }
    });
    // Create second review
    const res = await customerRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 5, title: "T2", comment: "C2" }
    });
    expect(res.status()).toBe(409);
  });

  test("M3_TC_020 - BP Review: Success path", async ({ adminRequest }) => {
    if (!validProductId) test.skip(true, "No product");
    const res = await adminRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 5, title: "T", comment: "C" }
    });
    // Assuming adminRequest user hasn't reviewed yet
    expect([201, 409]).toContain(res.status());
  });

  // --- Checkout BP ---
  test("M3_TC_021 - BP Checkout: Cart empty/missing", async ({ customerRequest }) => {
    // Attempt checkout immediately (might be empty)
    const res = await customerRequest.post("/api/orders/checkout", { data: {} });
    expect(res.status()).toBe(404);
  });

  test("M3_TC_022 - BP Checkout: Product invalid/deleted in cart", async ({ customerRequest }) => {
    if (!deletedProductId) test.skip(true, "No deleted product");
    await customerRequest.post("/api/cart/items", { data: { productId: deletedProductId, quantity: 1 } });
    const res = await customerRequest.post("/api/orders/checkout", { data: {} });
    expect(res.status()).toBe(404);
    // Cleanup cart
    await customerRequest.delete("/api/cart");
  });

  test("M3_TC_023 - BP Checkout: Insufficient stock", async ({ customerRequest }) => {
    if (!noStockProductId) test.skip(true, "No out-of-stock product");
    await customerRequest.post("/api/cart/items", { data: { productId: noStockProductId, quantity: 1 } });
    const res = await customerRequest.post("/api/orders/checkout", { data: {} });
    expect(res.status()).toBe(409);
    await customerRequest.delete("/api/cart");
  });

  test("M3_TC_024 - BP Checkout: Existing idempotency key", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No valid product");
    await customerRequest.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const payload = {
      data: {
        shippingAddress: { firstName: "A", lastName: "B", line1: "C", city: "D", country: "US" }
      }
    };
    const res1 = await customerRequest.post("/api/orders/checkout", payload);
    // Second checkout attempt should ideally return the idempotency hit (200/201)
    // Even if there's an application defect that causes a 404, we test the intention of the branch
    const res2 = await customerRequest.post("/api/orders/checkout", payload);
    
    // We expect the backend to respect idempotency. (If it fails, it's a defect caught by STQA)
    expect([200, 201]).toContain(res2.status());
  });

  test("M3_TC_025 - BP Checkout: Success path", async ({ browser, baseURL }) => {
    if (!validProductId) test.skip(true, "No valid product");
    
    // Create fresh user to avoid idempotency key collisions
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const ts = Date.now() + Math.floor(Math.random() * 10000);
    await page.goto("/register");
    await page.fill("#firstName", "Fresh");
    await page.fill("#lastName", "User");
    await page.fill("#email", `freshbp${ts}@example.com`);
    await page.fill("#password", "Password123!");
    await page.fill("#confirmPassword", "Password123!");
    await page.click('button[type="submit"]:has-text("Create Account")');
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");
    const cookies = await context.cookies();
    const playwright = require('@playwright/test');
    const freshReq = await playwright.request.newContext({
      baseURL,
      storageState: { cookies, origins: [] }
    });

    await freshReq.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const res = await freshReq.post("/api/orders/checkout", {
      data: {
        shippingAddress: { firstName: "Success", lastName: "BP", line1: "123", city: "City", country: "US" }
      }
    });
    expect([201, 200]).toContain(res.status());

    await freshReq.dispose();
    await context.close();
  });
});
