import { test, expect } from "@playwright/test";
import { checkoutSchema } from "../../../lib/validations/order";

test.describe("Member 5: BVA for Checkout Validation Schemas (M5_TC_001 - M5_TC_006)", () => {
  const baseValidAddress = {
    firstName: "John",
    lastName: "Doe",
    city: "New York",
    country: "US",
  };

  test("M5_TC_001 - BVA: Shipping address line1 Min-1 (length=0 empty string)", async () => {
    // Scenario: Customer submits empty string for delivery street address line1
    // Test Data: line1 = ""
    // Expected Result: Validation fails rejecting empty line1
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        ...baseValidAddress,
        line1: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const line1Errors = result.error.issues.filter(
        (issue) => issue.path.join(".") === "shippingAddress.line1"
      );
      expect(line1Errors.length).toBeGreaterThan(0);
      expect(line1Errors[0].message).toContain("Address is required");
    }
  });

  test("M5_TC_002 - BVA: Shipping address line1 Min (length=1)", async () => {
    // Scenario: Customer submits single-character street address line1
    // Test Data: line1 = "A"
    // Expected Result: Validation succeeds for line1 field
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        ...baseValidAddress,
        line1: "A",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.shippingAddress?.line1).toBe("A");
    }
  });

  test("M5_TC_003 - BVA: Checkout notes length Max (length=500)", async () => {
    // Scenario: Customer enters special delivery instructions exactly at the 500-character upper limit
    // Test Data: notes = "N" repeated 500 times
    // Expected Result: Validation succeeds; notes accepted within 500-char limit
    const notes500 = "N".repeat(500);
    const result = checkoutSchema.safeParse({
      notes: notes500,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes?.length).toBe(500);
    }
  });

  test("M5_TC_004 - BVA: Checkout notes length Max+1 (length=501)", async () => {
    // Scenario: Customer enters special delivery instructions exceeding boundary by 1 character
    // Test Data: notes = "N" repeated 501 times
    // Expected Result: Validation fails: notes must be at most 500 characters
    const notes501 = "N".repeat(501);
    const result = checkoutSchema.safeParse({
      notes: notes501,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const noteIssues = result.error.issues.filter(
        (issue) => issue.path.join(".") === "notes"
      );
      expect(noteIssues.length).toBeGreaterThan(0);
    }
  });

  test("M5_TC_005 - BVA: idempotencyKey length Max (length=100)", async () => {
    // Scenario: Client submits checkout with idempotency key at the maximum allowed length of 100 characters
    // Test Data: idempotencyKey = "K" repeated 100 times
    // Expected Result: Validation succeeds; key accepted within 100-char limit
    const key100 = "K".repeat(100);
    const result = checkoutSchema.safeParse({
      idempotencyKey: key100,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.idempotencyKey).toBe(key100);
      expect(result.data.idempotencyKey?.length).toBe(100);
    }
  });

  test("M5_TC_006 - BVA: idempotencyKey length Max+1 (length=101)", async () => {
    // Scenario: Client submits checkout with idempotency key exceeding boundary by 1 character
    // Test Data: idempotencyKey = "K" repeated 101 times
    // Expected Result: Validation fails: idempotencyKey must be at most 100 characters
    const key101 = "K".repeat(101);
    const result = checkoutSchema.safeParse({
      idempotencyKey: key101,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const keyIssues = result.error.issues.filter(
        (issue) => issue.path.join(".") === "idempotencyKey"
      );
      expect(keyIssues.length).toBeGreaterThan(0);
    }
  });
});
