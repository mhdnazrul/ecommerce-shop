import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: BP for cartService.updateQuantity (M2_TC_008 - M2_TC_010)", () => {
  let validProductId = "";
  let validItemId = "";

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/api/products");
    if (res.ok()) {
      const body = await res.json();
      if (body.data?.items?.length > 0) {
        validProductId = body.data.items[0].id;
      }
    }
  });

  test.beforeEach(async ({ customerRequest }) => {
    if (!validProductId) return;
    // Add item to cart to ensure it exists for updating
    const addRes = await customerRequest.post("/api/cart", {
      data: { productId: validProductId, quantity: 1 }
    });
    if (addRes.ok()) {
      const body = await addRes.json();
      validItemId = body.id || (body.data && body.data.id);
    }
  });

  test("M2_TC_008 - BP updateQuantity Path 1 (Item not found)", async ({ customerRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await customerRequest.put(`/api/cart/${fakeId}`, {
      data: { quantity: 5 }
    });
    expect(res.status()).toBe(404);
  });

  test("M2_TC_009 - BP updateQuantity Path 2 (Item found + quantity 0)", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "No valid item ID");
    const res = await customerRequest.put(`/api/cart/${validItemId}`, {
      data: { quantity: 0 }
    });
    expect(res.status()).toBe(200);
  });

  test("M2_TC_010 - BP updateQuantity Path 3 (Item found + quantity > 0)", async ({ customerRequest }) => {
    if (!validItemId) test.skip(true, "No valid item ID");
    const res = await customerRequest.put(`/api/cart/${validItemId}`, {
      data: { quantity: 10 }
    });
    expect(res.status()).toBe(200);
  });
});
