import { test, expect } from "../fixtures/auth-fixture";

test.describe("Member 1: Basis Path for categoryService.delete (M1_TC_019 - M1_TC_021)", () => {
  
  test("M1_TC_019 - BP: delete Path 1 (Deleting category with subcategories)", async ({ adminRequest }) => {
    // 1. Create a parent category
    const parentRes = await adminRequest.post("/api/categories", {
      data: { name: "ParentCategory" + Date.now() }
    });
    const parentId = (await parentRes.json()).data.id;
    expect(parentId).toBeDefined();

    // 2. Create subcategory
    const subRes = await adminRequest.post("/api/categories", {
      data: { name: "SubCategory" + Date.now(), parentId }
    });
    expect(subRes.status()).toBe(201);

    // 3. Attempt to delete parent
    const delRes = await adminRequest.delete(`/api/categories/${parentId}`);
    
    // 4. Assert conflict (Branch: category has subcategories)
    const delStatus = delRes.status();
    expect([400, 409]).toContain(delStatus); 
  });

  test("M1_TC_020 - BP: delete Path 2 (Deleting category with products)", async ({ adminRequest }) => {
    // Create a category
    const catRes = await adminRequest.post("/api/categories", {
      data: { name: "CategoryForProducts" + Date.now() }
    });
    const catId = (await catRes.json()).data.id;
    expect(catId).toBeDefined();
    
    // Create a product in it
    await adminRequest.post("/api/products", {
      data: { name: "TestProduct" + Date.now(), price: 100, categoryId: catId }
    });

    // Attempt to delete category
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
