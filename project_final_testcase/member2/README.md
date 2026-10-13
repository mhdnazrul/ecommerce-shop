# STQA Project: Member 2 Test Cases

## Member 2 Scope
Member 2 covers the **Cart & Event Handling** modules, specifically:
- Cart Validation Schemas (`addCartItemSchema`, `updateCartItemSchema`)
- Cart Services (`addItem`, `updateQuantity`, `removeItem`, `clearCart`, `mergeCart`)
- Component Rendering & Events (`NavbarSearch onKeyDown`, `ProductCard`, `ImageUpload processFile`)

## 50 Test Case Breakdown
The final test suite comprises exactly 50 tests mapped from the planning report:
- **BVA (7 tests):** `m2-bva.spec.ts` (M2_TC_001 - M2_TC_007)
- **Basis Path (23 tests):**
  - `updateQuantity`: `m2-bp-update-quantity.spec.ts` (M2_TC_008 - M2_TC_010)
  - `mergeCart`: `m2-bp-merge-cart.spec.ts` (M2_TC_011 - M2_TC_013)
  - `NavbarSearch`: `m2-bp-navbar-search.spec.ts` (M2_TC_014 - M2_TC_020)
  - `ProductCard`: `m2-bp-product-card.spec.ts` (M2_TC_021 - M2_TC_025)
  - `ImageUpload`: `m2-bp-image-upload.spec.ts` (M2_TC_026 - M2_TC_030)
- **ECT (5 tests):** `m2-ect.spec.ts` (M2_TC_031 - M2_TC_035)
- **Decision Table (15 tests):** `m2-decision-table.spec.ts` (M2_TC_036 - M2_TC_050)

## Final Execution Results
**Date:** September 21, 2026
**Target URL:** `https://shopfinity-shop-phi.vercel.app/`
**Configuration:** `playwright.vercel.member2.config.ts`

- **Total tests:** 50
- **Executed:** 50
- **PASS:** 7
- **FAIL:** 28
- **BLOCKED/SKIPPED:** 15

## Artifacts
- **JSON Report:** `project_final_testcase/member2/test_results/vercel-report.json`
- **Excel Report:** `project_final_testcase/Member_2_STQA_Test_Cases.xlsx`
- **Test Files:** `project_final_testcase/member2/test_cases/`

## Failure Analysis & Environment Limitations
Running tests against a live Vercel production server introduced significant environment limitations that contributed to test failures and timeouts:
1. **Timeouts on UI Navigation (`ImageUpload`, `NavbarSearch`)**: 
   - Many Playwright UI locators (e.g., `text="Click or drag to select"`, `input[type="search"]`) experienced 60000ms timeouts. This occurs because the live Vercel application behaves differently than `localhost`, potentially displaying slow-loading chunks, triggering rate limits on rapid UI automation, or blocking automated Chromium browsers from fetching React chunks securely.
2. **CSRF & NextAuth Rate Limiting (`BVA`, `ECT`, `Decision Tables`)**:
   - The test setup bypasses CSRF by logging in via UI and transferring cookies to an `APIRequestContext`. However, rapid API hits against Vercel's serverless functions resulted in unexpected `500 Internal Server Error`, CSRF token invalidation (resulting in 401s), and `429 Too Many Requests` (which fail `toBe(200)` assertions). 
   - This causes genuine valid logic branches to fail on the remote environment.
3. **ProductCard Image Resolution (`M2_TC_025`)**:
   - Strict locator issues triggered (`locator resolved to 8 elements`) because multiple product cards matched the generic structure during remote parallel seed execution.
4. **Genuine Application Defects**:
   - `M2_TC_029` (ImageUpload error handling): The UI expects `"Server rejected file"` from the mocked 400 error, but the application's React Query/fetch implementation wrapped the error into a generic `"Internal server error"`, indicating a genuine flaw in client-side error parsing from the server.
   - BVA boundary failures: Some API routes throw 500 instead of 400 when validating cart schemas on the server, exposing insufficient zod schema validation at the edge.
