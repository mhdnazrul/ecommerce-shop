import { test, expect } from "@playwright/test";

test.describe("Member 1: Basis Path for productService.search (M1_TC_008 - M1_TC_015)", () => {
  
  test("M1_TC_008 - BP: search Path 1 (Base search query with no filters)", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toBeInstanceOf(Array);
  });

  test("M1_TC_009 - BP: search Path 2 (Search with keyword filter)", async ({ request }) => {
    // Note: Depends on seeded data. "Wireless Headphones" should be seeded.
    const res = await request.get("/api/products?search=Wireless");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // If there are products, ensure they match the search string
    body.data.items.forEach((p: any) => {
      const match = p.name.toLowerCase().includes("wireless") || 
                    (p.description && p.description.toLowerCase().includes("wireless"));
      expect(match).toBe(true);
    });
  });

  test("M1_TC_010 - BP: search Path 3 (Search with categoryId filter)", async ({ request }) => {
    // Get a valid category first
    const catRes = await request.get("/api/categories");
    const catBody = await catRes.json();
    const catId = catBody.data?.[0]?.id;
    
    if (catId) {
      const res = await request.get(`/api/products?categoryId=${catId}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      body.data.items.forEach((p: any) => {
        expect(p.category.id).toBe(catId);
      });
    }
  });

  test("M1_TC_011 - BP: search Path 4 (Search with valid categorySlug)", async ({ request }) => {
    const res = await request.get("/api/products?categorySlug=electronics");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    body.data.items.forEach((p: any) => {
      expect(p.category.slug).toBe("electronics");
    });
  });

  test("M1_TC_012 - BP: search Path 5 (Search with invalid categorySlug)", async ({ request }) => {
    // Should fallback to base query skipping category
    const res = await request.get("/api/products?categorySlug=fake-slug-xyz");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("M1_TC_013 - BP: search Path 6 (Search with price bounds)", async ({ request }) => {
    const res = await request.get("/api/products?minPrice=10&maxPrice=100");
    expect(res.status()).toBe(200);
    const body = await res.json();
    body.data.items.forEach((p: any) => {
      expect(p.price).toBeGreaterThanOrEqual(10);
      expect(p.price).toBeLessThanOrEqual(100);
    });
  });

  test("M1_TC_014 - BP: search Path 7 (Search with isFeatured)", async ({ request }) => {
    const res = await request.get("/api/products?isFeatured=true");
    expect(res.status()).toBe(200);
    const body = await res.json();
    body.data.items.forEach((p: any) => {
      expect(p.isFeatured).toBe(true);
    });
  });

  test("M1_TC_015 - BP: search Path 8 (Search with isPublished)", async ({ request }) => {
    const res = await request.get("/api/products?isPublished=false");
    expect(res.status()).toBe(200);
    const body = await res.json();
    body.data.items.forEach((p: any) => {
      expect(p.isPublished).toBe(false); // API doesn't expose isPublished in payload? Actually, API only returns published? No, API returns whatever. But productService.search doesn't restrict isPublished unless passed.
    });
  });
});
