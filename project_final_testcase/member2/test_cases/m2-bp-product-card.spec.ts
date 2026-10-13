import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 2: BP for ProductCard (M2_TC_021 - M2_TC_025)", () => {
  let createdProductIds: string[] = [];
  let validCategoryId = "";

  test.beforeAll(async ({ adminRequest }) => {
    // We need a category ID to create products
    const catRes = await adminRequest.get("/api/categories");
    if (catRes.ok()) {
      const body = await catRes.json();
      if (body.data?.length > 0) {
        validCategoryId = body.data[0].id;
      } else {
        // Create one if none exists
        const newCat = await adminRequest.post("/api/categories", { data: { name: "TestCat " + Date.now() }});
        if (newCat.ok()) validCategoryId = (await newCat.json()).data.id;
      }
    }

    if (!validCategoryId) return;

    // Create 5 test products to exercise ProductCard paths
    const productsToCreate = [
      { name: "M2_TC_021 " + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 10, imageUrl: null },
      { name: "M2_TC_022 " + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 0, imageUrl: "https://example.com/img.jpg" },
      { name: "M2_TC_023 " + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 10, imageUrl: "http://localhost:3000/img.jpg" },
      { name: "M2_TC_024 " + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 10, imageUrl: "http://127.0.0.1:3000/img.jpg" },
      { name: "M2_TC_025 " + Date.now(), price: 10, categoryId: validCategoryId, stockQuantity: 10, imageUrl: "https://example.com/img2.jpg" },
    ];

    for (const p of productsToCreate) {
      const res = await adminRequest.post("/api/products", { data: p });
      if (res.ok()) {
        createdProductIds.push((await res.json()).data.id);
      }
    }
  });

  test.afterAll(async ({ adminRequest }) => {
    // Cleanup temporary products
    for (const id of createdProductIds) {
      await adminRequest.delete(`/api/products/${id}`);
    }
  });

  test("M2_TC_021 - BP ProductCard Path 1 (no image + stock)", async ({ page }) => {
    if (createdProductIds.length < 5) test.skip(true, "Setup failed");
    await page.goto("/?search=M2_TC_021");
    const card = page.locator('div.group').filter({ hasText: "M2_TC_021" }).first();
    await expect(card.locator("text=📦")).toBeVisible();
    await expect(card.locator('button:has-text("Add to Cart")')).toBeEnabled();
  });

  test("M2_TC_022 - BP ProductCard Path 2 (image + out of stock)", async ({ page }) => {
    if (createdProductIds.length < 5) test.skip(true, "Setup failed");
    await page.goto("/?search=M2_TC_022");
    const card = page.locator('div.group').filter({ hasText: "M2_TC_022" }).first();
    await expect(card.locator('text="Out of Stock"')).toBeVisible();
    await expect(card.locator('button:has-text("Add to Cart")')).toBeDisabled();
  });

  test("M2_TC_023 - BP ProductCard Path 3 (localhost image URL)", async ({ page }) => {
    if (createdProductIds.length < 5) test.skip(true, "Setup failed");
    await page.goto("/?search=M2_TC_023");
    const card = page.locator('div.group').filter({ hasText: "M2_TC_023" }).first();
    // The image should have unoptimized=true, meaning the src is exactly the URL, not a /_next/image proxy
    const img = card.locator("img");
    await expect(img).toHaveAttribute("src", "http://localhost:3000/img.jpg");
  });

  test("M2_TC_024 - BP ProductCard Path 4 (127.0.0.1 image URL)", async ({ page }) => {
    if (createdProductIds.length < 5) test.skip(true, "Setup failed");
    await page.goto("/?search=M2_TC_024");
    const card = page.locator('div.group').filter({ hasText: "M2_TC_024" }).first();
    const img = card.locator("img");
    await expect(img).toHaveAttribute("src", "http://127.0.0.1:3000/img.jpg");
  });

  test("M2_TC_025 - BP ProductCard Path 5 (normal remote image URL)", async ({ page }) => {
    if (createdProductIds.length < 5) test.skip(true, "Setup failed");
    await page.goto("/?search=M2_TC_025");
    const card = page.locator('div.group').filter({ hasText: "M2_TC_025" }).first();
    const img = card.locator("img");
    // Should be optimized, so src starts with /_next/image
    const src = await img.getAttribute("src");
    expect(src).toMatch(/^\/_next\/image/);
  });
});
