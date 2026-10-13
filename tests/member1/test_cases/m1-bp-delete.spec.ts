import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 1: Basis Path for categoryService.delete (M1_TC_019 - M1_TC_021)", () => {
  
  test("M1_TC_019 - BP: delete Path 1 (Deleting category with subcategories)", async ({ adminRequest }) => {
    // 1. Get root category (e.g. electronics)
    const res = await adminRequest.get("/api/categories/slug/electronics");
    const body = await res.json();
    const parentId = body.data?.id;
    expect(parentId).toBeDefined();

    // 2. Create subcategory
    const subRes = await adminRequest.post("/api/categories", {
      data: { name: "SubElectronics" + Date.now(), parentId }
    });
    expect(subRes.status()).toBe(201);

    // 3. Attempt to delete parent
    const delRes = await adminRequest.delete(`/api/categories/${parentId}`);
    
    // 4. Assert conflict (Branch: category has subcategories)
    // The exact response depends on application logic, but typically 409 Conflict.
    // If it returns 200 and orphans/deletes them, it's an application defect against standard logic,
    // but we record the actual result. We expect 409 or 400.
    const delStatus = delRes.status();
    // Assuming 409 or 400 is the expected rejection for constraint violation
    expect([400, 409]).toContain(delStatus); 
  });

  test("M1_TC_020 - BP: delete Path 2 (Deleting category with products)", async ({ adminRequest }) => {
    // "accessories" category has products seeded.
    const res = await adminRequest.get("/api/categories/slug/accessories");
    const body = await res.json();
    const catId = body.data?.id;
    expect(catId).toBeDefined();
    
    const delRes = await adminRequest.delete(`/api/categories/${catId}`);
    // Expect 409 Conflict because it has products
    const delStatus = delRes.status();
    expect([400, 409]).toContain(delStatus);
  });

  test("M1_TC_021 - BP: delete Path 3 (Deleting empty category)", async ({ adminRequest }) => {
    // Create an empty category first
    const createRes = await adminRequest.post("/api/categories", {
      data: { name: "Empty Category " + Date.now() }
    });
    expect(createRes.status()).toBe(201);
    const newCatId = (await createRes.json()).data.id;

    // Delete it
    const delRes = await adminRequest.delete(`/api/categories/${newCatId}`);
    expect(delRes.status()).toBe(200);
  });
});
