import { test, expect } from "../../member2/fixtures/auth-fixture";

async function createFreshCustomer(browser: any, baseURL: string) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const ts = Date.now() + Math.floor(Math.random() * 10000);
  await page.goto("/register");
  await page.fill("#firstName", "Fresh");
  await page.fill("#lastName", "User");
  await page.fill("#email", `fresh${ts}@example.com`);
  await page.fill("#password", "Password123!");
  await page.fill("#confirmPassword", "Password123!");
  await page.click('button[type="submit"]:has-text("Create Account")');
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
  const cookies = await context.cookies();
  const playwright = require('@playwright/test');
  const request = await playwright.request.newContext({
    baseURL,
    storageState: { cookies, origins: [] }
  });
  return { context, request };
}

test.describe("Member 3: ECT for Orders and Reviews (M3_TC_009 - M3_TC_014)", () => {
  let validProductId = "";
  let validCategoryId = "";
  let orderId = "";
  
  let user1Context: any, user1Req: any;
  let user2Context: any, user2Req: any;

  test.beforeAll(async ({ adminRequest, browser, baseURL }) => {
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) validCategoryId = body.data[0].id;
      else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "M3_ECT_Cat_" + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (validCategoryId) {
      const p = { name: "M3_ECT_Product_" + Date.now(), price: 50, categoryId: validCategoryId, stockQuantity: 200, imageUrl: null };
      const res = await adminRequest.post("/api/products", { data: p });
      if (res.ok()) {
        validProductId = (await res.json()).data.id;
        
        // Setup User 1 for Order Status tests
        const u1 = await createFreshCustomer(browser, baseURL!);
        user1Context = u1.context;
        user1Req = u1.request;

        await user1Req.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
        const checkoutRes = await user1Req.post("/api/orders/checkout", {
          data: { shippingAddress: { firstName: "Test", lastName: "User", line1: "123 Test St", city: "Test City", country: "US" } }
        });
        
        if (checkoutRes.ok()) {
            const body = await checkoutRes.json();
            orderId = body.data.id;
        }

        // Setup User 2 for Checkout Validation tests
        const u2 = await createFreshCustomer(browser, baseURL!);
        user2Context = u2.context;
        user2Req = u2.request;
      }
    }
  });

  test.afterAll(async ({ adminRequest }) => {
    if (validProductId) await adminRequest.delete(`/api/products/${validProductId}`);
    if (user1Req) await user1Req.dispose();
    if (user1Context) await user1Context.close();
    if (user2Req) await user2Req.dispose();
    if (user2Context) await user2Context.close();
  });

  test("M3_TC_009 - ECT Valid Order Status (Shipped)", async ({ adminRequest }) => {
    if (!orderId) test.skip(true, "No order available");
    const res = await adminRequest.put(`/api/orders/${orderId}/status`, { data: { status: "Shipped" } });
    expect(res.status()).toBe(200);
  });

  test("M3_TC_010 - ECT Invalid Order Status (In Transit)", async ({ adminRequest }) => {
    if (!orderId) test.skip(true, "No order available");
    const res = await adminRequest.put(`/api/orders/${orderId}/status`, { data: { status: "In Transit" } });
    expect(res.status()).toBe(400); 
  });

  test("M3_TC_011 - ECT Valid Shipping Address", async () => {
    if (!validProductId) test.skip(true, "No product available");
    await user2Req.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
    const res = await user2Req.post("/api/orders/checkout", {
      data: { shippingAddress: { firstName: "John", lastName: "Doe", line1: "456 Validation Ave", city: "Metropolis", country: "US" } }
    });
    expect([201, 200, 409]).toContain(res.status());
  });

  test("M3_TC_012 - ECT Invalid Shipping Address (Missing city)", async () => {
    const res = await user2Req.post("/api/orders/checkout", {
      data: { shippingAddress: { firstName: "John", lastName: "Doe", line1: "456 Validation Ave", country: "US" } }
    });
    expect(res.status()).toBe(400);
  });

  test("M3_TC_013 - ECT Valid UUID for productId", async ({ adminRequest }) => {
    if (!validProductId) test.skip(true, "No product available");
    const res = await adminRequest.post("/api/reviews", {
      data: { productId: validProductId, rating: 4, title: "Good", comment: "Works well" }
    });
    expect([201, 409]).toContain(res.status());
  });

  test("M3_TC_014 - ECT Invalid UUID for productId", async () => {
    const res = await user2Req.post("/api/reviews", {
      data: { productId: "12345-not-a-uuid", rating: 4, title: "Good", comment: "Works well" }
    });
    expect(res.status()).toBe(400); 
  });
});
