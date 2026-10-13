import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: BP for cartService.mergeCart (M2_TC_011 - M2_TC_013)", () => {
  let validProductId = "";

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/api/products");
    if (res.ok()) {
      const body = await res.json();
      if (body.data?.items?.length > 0) {
        validProductId = body.data.items[0].id;
      }
    }
  });

  test("M2_TC_011 - BP mergeCart Path 1 (Empty input)", async ({ customerRequest }) => {
    const res = await customerRequest.post("/api/cart/merge", {
      data: { items: [] }
    });
    expect(res.status()).toBe(200);
  });

  test("M2_TC_012 - BP mergeCart Path 2 (Invalid product)", async ({ customerRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await customerRequest.post("/api/cart/merge", {
      data: { items: [{ productId: fakeId, quantity: 1 }] }
    });
    // The implementation skips invalid products and returns the cart
    expect(res.status()).toBe(200);
  });

  test("M2_TC_013 - BP mergeCart Path 3 (Valid product)", async ({ customerRequest }) => {
    if (!validProductId) test.skip(true, "No valid product");
    const res = await customerRequest.post("/api/cart/merge", {
      data: { items: [{ productId: validProductId, quantity: 2 }] }
    });
    expect(res.status()).toBe(200);
  });
});
