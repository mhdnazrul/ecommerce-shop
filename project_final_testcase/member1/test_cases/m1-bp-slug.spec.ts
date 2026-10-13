import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 1: Basis Path for ensureSlugUnique (M1_TC_022 - M1_TC_024)", () => {
  // Creating a category indirectly triggers ensureSlugUnique
  
  test("M1_TC_022 - BP: slug Path 1 (Base slug is immediately unique)", async ({ adminRequest }) => {
    // Generate a highly unique name
    const timestamp = Date.now();
    const uniqueName = "Test Category " + timestamp;
    const res = await adminRequest.post("/api/categories", {
      data: { name: uniqueName }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.slug).toBe(`test-category-${timestamp}`);
  });

  test("M1_TC_023 - BP: slug Path 2 (Base slug conflicts, counter appends)", async ({ adminRequest }) => {
    // Electronics is already seeded. If we create another Electronics, 
    // it should get electronics-1 or electronics-2
    const res = await adminRequest.post("/api/categories", {
      data: { name: "Electronics" }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.slug).toMatch(/^electronics-\d+$/);
  });

  test("M1_TC_024 - BP: slug Path 3 (Base slug matches excludeId)", async ({ adminRequest }) => {
    // Updating an existing category with its own name shouldn't append a counter
    // First, create a category
    const catName = "AccCategory " + Date.now();
    const catRes = await adminRequest.post("/api/categories", {
      data: { name: catName }
    });
    expect(catRes.status()).toBe(201);
    const catBody = await catRes.json();
    const id = catBody.data.id;
    const initialSlug = catBody.data.slug;

    // Now update it with the exact same name
    const updateRes = await adminRequest.put(`/api/categories/${id}`, {
      data: { name: catName, slug: initialSlug }
    });
    // Record actual result
    if (updateRes.status() === 200) {
      const updateBody = await updateRes.json();
      expect(updateBody.data.slug).toBe(initialSlug);
    } else {
      expect(updateRes.status()).toBe(200); 
    }
  });
});
