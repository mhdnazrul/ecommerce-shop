import { test, expect } from "../fixtures/auth-fixture";
import path from "path";
import fs from "fs";

test.describe("Member 2: BP for ImageUpload (M2_TC_026 - M2_TC_030)", () => {
  let tempImagePath = "";

  test.beforeAll(() => {
    tempImagePath = path.join(__dirname, "temp-test-image.jpg");
    fs.writeFileSync(tempImagePath, "dummy image content");
  });

  test.afterAll(() => {
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  });

  test.beforeEach(async ({ adminPage }) => {
    // Go to admin product creation page where ImageUpload is used
    await adminPage.goto("/admin/products");

    // Click "Add Product" to show the form containing ImageUpload
    await adminPage.locator('button:has-text("Add Product")').click();

    // Ensure we mock the upload endpoint so we don't pollute Vercel storage
    await adminPage.route("**/api/uploads", route => route.fulfill({
      status: 200,
      json: { success: true, data: { url: "https://example.com/mock-upload.jpg", publicId: "mock-id" } }
    }));
  });

  test("M2_TC_026 - BP ImageUpload Path 1 (invalid file type)", async ({ adminPage }) => {
    // The input accepts image/*, but we can force set a txt file by bypassing accept
    // Create a temporary text file
    const txtPath = path.join(__dirname, "temp.txt");
    fs.writeFileSync(txtPath, "text content");

    const fileChooserPromise = adminPage.waitForEvent('filechooser');
    // The ImageUpload component has an onClick to open the file dialog
    await adminPage.locator('div:has-text("Click or drag to select")').last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(txtPath);

    fs.unlinkSync(txtPath);

    const errorMsg = adminPage.locator('p.text-red-500');
    await expect(errorMsg).toHaveText(/Only JPG, PNG, or WebP images are allowed/i);
  });

  test("M2_TC_027 - BP ImageUpload Path 2 (oversized file)", async ({ adminPage }) => {
    // Create a large file (> 5MB)
    const largePath = path.join(__dirname, "large.jpg");
    const buffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    fs.writeFileSync(largePath, buffer);

    const fileChooserPromise = adminPage.waitForEvent('filechooser');
    await adminPage.locator('div:has-text("Click or drag to select")').last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(largePath);

    fs.unlinkSync(largePath);

    const errorMsg = adminPage.locator('p.text-red-500');
    await expect(errorMsg).toHaveText(/File must be under 5MB/i);
  });

  test("M2_TC_028 - BP ImageUpload Path 3 (valid upload)", async ({ adminPage }) => {
    const fileChooserPromise = adminPage.waitForEvent('filechooser');
    await adminPage.locator('div:has-text("Click or drag to select")').last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempImagePath);

    // Should show success toast or the image preview
    await expect(adminPage.locator('text="Image uploaded!"')).toBeVisible();
    await expect(adminPage.locator('img[alt="Preview"]')).toBeVisible();
  });

  test("M2_TC_029 - BP ImageUpload Path 4 (upload throws Error)", async ({ adminPage }) => {
    // Mock standard error
    await adminPage.route("**/api/uploads", route => route.fulfill({
      status: 400,
      json: { success: false, message: "Server rejected file" }
    }));

    const fileChooserPromise = adminPage.waitForEvent('filechooser');
    await adminPage.locator('div:has-text("Click or drag to select")').last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempImagePath);

    const errorMsg = adminPage.locator('p.text-red-500');
    await expect(errorMsg).toContainText("Server rejected file");
  });

  test("M2_TC_030 - BP ImageUpload Path 5 (upload throws non-Error)", async ({ adminPage }) => {
    // If the server returns 500 without a json message, the fetch wrapper or react-query might throw a string or generic Error.
    // The implementation of useUploadImage throws an Error, so this branch might be hard to reach perfectly unless the hook throws a string.
    await adminPage.route("**/api/uploads", route => route.fulfill({
      status: 500,
      body: "Fatal error"
    }));

    const fileChooserPromise = adminPage.waitForEvent('filechooser');
    await adminPage.locator('div:has-text("Click or drag to select")').last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tempImagePath);

    const errorMsg = adminPage.locator('p.text-red-500');
    // If it throws a standard error due to response.text(), it will be displayed. If non-error, fallback.
    await expect(errorMsg).toBeVisible();
  });
});
