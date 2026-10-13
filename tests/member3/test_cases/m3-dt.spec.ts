import { test, expect } from "../../member2/fixtures/auth-fixture";

async function createFreshCustomer(browser: any, baseURL: string) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const ts = Date.now() + Math.floor(Math.random() * 10000);
  await page.goto("/register");
  await page.fill("#firstName", "Fresh");
  await page.fill("#lastName", "User");
  await page.fill("#email", `freshdt${ts}@example.com`);
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

test.describe("Member 3: DT for Order Status Update (M3_TC_026 - M3_TC_030)", () => {
  let validProductId = "";
  let validCategoryId = "";
  let order1Id = ""; // Used for Pending -> Cancelled -> Cancelled
  let order2Id = ""; // Used for Pending -> Shipped -> Delivered
  let u1Ctx: any, u1Req: any;
  let u2Ctx: any, u2Req: any;

  test.beforeAll(async ({ adminRequest, browser, baseURL }) => {
    test.setTimeout(120000); // 120s timeout for this hook
    // We need a category ID to create products for checkout
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) validCategoryId = body.data[0].id;
      else {
        const newCat = await adminRequest.post("/api/categories", { data: { name: "M3_DT_Cat_" + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (validCategoryId) {
      const p = { name: "M3_DT_Product_" + Date.now(), price: 50, categoryId: validCategoryId, stockQuantity: 200, imageUrl: null };
      const res = await adminRequest.post("/api/products", { data: p });
      if (res.ok()) {
        validProductId = (await res.json()).data.id;
        
        const u1 = await createFreshCustomer(browser, baseURL!);
        u1Ctx = u1.context;
        u1Req = u1.request;

        const u2 = await createFreshCustomer(browser, baseURL!);
        u2Ctx = u2.context;
        u2Req = u2.request;

        // Create Order 1
        await u1Req.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
        const o1Res = await u1Req.post("/api/orders/checkout", {
          data: { shippingAddress: { firstName: "A", lastName: "B", line1: "C", city: "D", country: "US" } }
        });
        if (o1Res.ok()) order1Id = (await o1Res.json()).data.id;

        // Create Order 2
        await u2Req.post("/api/cart/items", { data: { productId: validProductId, quantity: 1 } });
        const o2Res = await u2Req.post("/api/orders/checkout", {
          data: { shippingAddress: { firstName: "A", lastName: "B", line1: "C", city: "D", country: "US" } }
        });
        if (o2Res.ok()) order2Id = (await o2Res.json()).data.id;
      }
    }
  });

  test.afterAll(async ({ adminRequest }) => {
    if (validProductId) await adminRequest.delete(`/api/products/${validProductId}`);
    if (u1Req) await u1Req.dispose();
    if (u1Ctx) await u1Ctx.close();
    if (u2Req) await u2Req.dispose();
    if (u2Ctx) await u2Ctx.close();
  });

  test("M3_TC_026 - DT: Pending -> Cancelled", async ({ adminRequest }) => {
    if (!order1Id) test.skip(true, "Order 1 not available");
    // Verify it updates successfully
    const res = await adminRequest.put(`/api/orders/${order1Id}/status`, { data: { status: "Cancelled" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("Cancelled");
    expect(body.data.cancelledAt).toBeTruthy();
  });

  test("M3_TC_027 - DT: Cancelled -> Cancelled (Idempotent)", async ({ adminRequest }) => {
    if (!order1Id) test.skip(true, "Order 1 not available");
    // Already cancelled in M3_TC_026. Updating again should succeed idempotently
    const res = await adminRequest.put(`/api/orders/${order1Id}/status`, { data: { status: "Cancelled" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("Cancelled");
  });

  test("M3_TC_028 - DT: Pending -> Shipped", async ({ adminRequest }) => {
    if (!order2Id) test.skip(true, "Order 2 not available");
    const res = await adminRequest.put(`/api/orders/${order2Id}/status`, { data: { status: "Shipped" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("Shipped");
    expect(body.data.shippedAt).toBeTruthy();
  });

  test("M3_TC_029 - DT: Shipped -> Delivered", async ({ adminRequest }) => {
    if (!order2Id) test.skip(true, "Order 2 not available");
    // Order was shipped in M3_TC_028
    const res = await adminRequest.put(`/api/orders/${order2Id}/status`, { data: { status: "Delivered" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("Delivered");
    expect(body.data.deliveredAt).toBeTruthy();
  });

  test("M3_TC_030 - DT: Invalid Order ID", async ({ adminRequest }) => {
    const res = await adminRequest.put(`/api/orders/00000000-0000-0000-0000-000000000000/status`, { data: { status: "Shipped" } });
    expect(res.status()).toBe(404);
  });
});
