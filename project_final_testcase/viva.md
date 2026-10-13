
# Shopfinity STQA — Complete Viva Preparation, Test Execution & Bangla Briefing Guide

This guide prepares you to present the Shopfinity STQA project to your professor with confidence, academic integrity, and reproducible evidence.

---

## 1. Current Evidence Summary (Source of Truth)

Every claim in your presentation is backed by the current repository state:

| Metric / Dimension | Verified Value | Evidence Source | Notes & Disclosures |
| :--- | :---: | :--- | :--- |
| **Total Canonical Test Cases** | **150** | `STQA_Final_150_Cases.xlsx` | Exactly 30 test cases per member across 5 members. |
| **Documented Pass Cases** | **105** | Master Workbook (`Test_Cases` sheet) | Substantiated by Playwright runs and unit/regression suites. |
| **Documented Not Run Cases** | **45** | Master Workbook (`Test_Cases` sheet) | Intentionally skipped to protect live production database. |
| **Automated Regression Suite** | **71 Tests** | `tests/phase2a-regression.ts` | 71 Passed, 0 Failed in ~3.5s (offline, safe, 0 DB writes). |
| **Historical Member 5 Unit Report** | **26 Tests** | `tests/member5/test_results/test-report.json` | 26 Expected/Passed, 4 Skipped (100% offline schema & logic). |
| **Total Defect Records** | **30** | `30_Defects_Tracker.xlsx` | 12 Application Defects, 12 Test Setup Failures, 6 Suspected Infra. |
| **TypeScript Strict Status** | **0 Errors** | `npx tsc --noEmit` | Strict mode type-check passed cleanly. |
| **Multi-Sheet Architecture** | **7 Sheets** | RentNest Reference Standard | Overview, Test_Cases, BVA, ECT_DecisionTable, Basis_Path, Bug_Reports, Automation_Coverage. |

> [!IMPORTANT]
> **Key Viva Disclosure**: Canonical test cases (150 total, 105 Pass) and test runner test numbers (71 in regression, 26 in Member 5) do not have a 1-to-1 mapping. Composite automated tests exercise multiple boundaries or decision branches in single assertions. Furthermore, `M5_TC_018` is evaluated as an in-memory customer privacy simulation (`Behavior 6`), not a live production database integration test.

---

## 2. PowerShell Setup and Execution Commands

Run all commands in **Windows PowerShell** from the project root (`C:\Users\mhd\Desktop\projects\ecommerce-shop`).

### A. Safe Offline Regression Suite (Recommended Live Demo)
```powershell
npx tsx tests/phase2a-regression.ts
```
* **What it does:** Executes all 71 unit, schema, BVA, ECT, and Basis Path regression tests in-memory.
* **Prerequisites:** None. Needs no `.env`, no running server, no network, and does not connect to Supabase.
* **Execution Duration:** ~3 to 4 seconds.
* **Expected Output:**
  ```text
  === Shopfinity Phase 2C Focused Regression & Verification Suite ===
  Coverage breakdown: Unit Tests with Mocks | Pure Logic Tests | Phase 2C Bug Regressions
  NOTE: This suite does NOT mutate or connect to the production database.

  [PASS] Schema: Omitted isPublished parses to undefined
  ...
  [PASS] Order Query Schema (M3_TC_009, M3_TC_010): Valid status accepts 'Shipped', invalid status 'In Transit' is rejected
  [PASS] Review Input Schema (M3_TC_013, M3_TC_014): Valid UUID accepts review, malformed non-UUID productId is rejected
  ...
  [PASS] Dashboard Metrics RBAC (M4_TC_021 - M4_TC_023): Production authorization logic executes and asserts HTTP 200 (Admin), HTTP 403 (Customer), and HTTP 401 (Unauthenticated)
  ...
  [PASS] Cart Service (M2_TC_017): DELETE /api/cart route logic executes clearCart and returns HTTP 200 with emptied cart
  ...
  [PASS] [In-Memory Simulation] Behavior 6 / M5_TC_018: Cross-customer isolation guarantees 404 NotFound on unauthorized order query
  ...
  === All 71 Tests Executed Successfully (Passed: 71, Failed: 0) ===
  ```
* **What to do if it fails:** Ensure you are in the project root. If Node modules are missing, run `npm install`.

---

### B. TypeScript Compilation Validation
```powershell
npx tsc --noEmit
```
* **What it does:** Compiles all TypeScript files (`.ts`, `.tsx`) across Next.js app routes, lib services, and test files using strict type checking without writing build output to disk.
* **Prerequisites:** None.
* **Expected Output:** Returns immediately with exit code `0` and **no output/zero errors**. (In Unix/PowerShell philosophy, silence means complete success).

---

### C. Canonical Workbook & Defect Validation
```powershell
node scratch/validate_canonical_workbooks.js
node scratch/validate_rentnest_workbooks.js
node scratch/audit_30_defects.js
```
* **What they do:**
  1. `validate_canonical_workbooks.js`: Verifies 100% row-for-row and column-for-column equality between the master workbook and all 5 member workbooks, verifying exactly 150 rows, 105 Pass, 45 Not Run, 0 blank required cells, and 0 placeholders.
  2. `validate_rentnest_workbooks.js`: Validates that all 6 workbooks contain all 7 standardized RentNest sheets and exact 14-column headers.
  3. `audit_30_defects.js`: Validates all 30 defect records (12 Application Defects, 12 Test Setup Failures, 6 Suspected Infrastructure Blockers).
* **Expected Output:**
  ```text
  PASS: Exact 105 Pass and 45 Not Run verified.
  PASS: 0 blank required fields and 0 placeholders.
  ALL CANONICAL WORKBOOKS FULLY VALIDATED AND SOUND!
  ```

---

### D. Viewing the Historical Playwright HTML Report
```powershell
npx playwright show-report playwright-report
```
* **What it does:** Launches Playwright's local web server on port `9323` and automatically opens your default browser displaying the interactive HTML report from previous test runs.
* **Prerequisites:** The folder `playwright-report/index.html` already exists on disk.
* **Note:** This does **not** re-run tests; it presents the historical execution logs, timings, traces, and screenshots safely. Press `Ctrl + C` in PowerShell to stop the server when finished.

---

## 3. Five-Member Demo Test Selection (One per Member)

During the viva, open [tests/phase2a-regression.ts](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts) in VS Code and showcase these five self-contained tests:

| Member & Domain | Selected Test Case | Technique & Routine | Exact Line in `tests/phase2a-regression.ts` | What is Asserted |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1**<br>Catalog & Search | **`M1_TC_010` / `DEF-05`** | Basis Path ($V(G)=7$)<br>`productService.search` | [Lines 903–923](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L903-L923) | Asserts that querying a non-existent category slug returns an empty array `[]` rather than leaking all products. |
| **Member 2**<br>Shopping Cart | **`M2_TC_017`** | Basis Path ($V(G)=3$)<br>`DELETE /api/cart` route | [Lines 820–847](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L820-L847) | Asserts that an authenticated customer invoking the cart clear route receives HTTP 200 with `{ items: [], itemsCount: 0, subtotal: 0 }`. |
| **Member 3**<br>Orders & Reviews | **`M3_TC_009` & `M3_TC_010`** | Boundary Value (BVA)<br>`orderQuerySchema` | [Lines 106–120](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L106-L120) | Asserts that valid enum `status: "Shipped"` passes validation (`success: true`), while invalid enum `"In Transit"` is rejected (`success: false`). |
| **Member 4**<br>Auth & RBAC | **`M4_TC_021`–`023`** | Decision Table & BP ($V(G)=5$)<br>`apiHandler` RBAC | [Lines 721–751](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L721-L751) | Asserts actual production RBAC gate returns HTTP **200** (Admin), HTTP **403** (Customer), and HTTP **401** (Unauthenticated). |
| **Member 5**<br>Checkout & Error Handling | **`M5_TC_012`** | Basis Path ($V(G)=6$)<br>`handleApiError` | [Lines 218–254](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L218-L254) | Asserts malformed JSON `SyntaxError` maps to HTTP **400 Bad Request** with `"Invalid or malformed JSON payload"`. |

---

## 4. Practical 5–10 Minute Classroom Demonstration Plan

### Step 1: Introduction (1 Minute)
* **What to do:** Stand beside your laptop with VS Code open.
* **What to show:** Open [README.md](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/README.md) or the live storefront URL ([https://shopfinity-shop-phi.vercel.app/](https://shopfinity-shop-phi.vercel.app/)).
* **What to say:** Briefly introduce Shopfinity as a full-stack Next.js 16 e-commerce platform and explain the STQA goal: rigorous formal testing across Boundary Value Analysis, Equivalence Partitioning, Decision Tables, and Basis Path Testing.

### Step 2: Open Unified Master Workbook (1.5 Minutes)
* **What to do:** Open [project_final_testcase/STQA_Final_150_Cases.xlsx](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/project_final_testcase/STQA_Final_150_Cases.xlsx) in Excel.
* **What to point to:**
  1. Click through the **7 tabs** matching the RentNest standard (`Overview`, `Test_Cases`, `BVA`, `ECT_DecisionTable`, `Basis_Path`, `Bug_Reports`, `Automation_Coverage`).
  2. Filter `Test_Cases` column B (`Member`) to show exactly 30 cases per member (150 total).
  3. Filter column K (`Status`) to show **105 Pass** and **45 Not Run**.
* **What to say:** Explain that 105 cases have verified execution proof, while 45 cases were intentionally kept as `Not Run` to protect the live production database from corruptive checkout and deletion mutations.

### Step 3: Present Testing Techniques in Concept (1.5 Minutes)
* **What to do:** Switch to the `BVA`, `ECT_DecisionTable`, and `Basis_Path` sheets.
* **What to point to:**
  - `BVA`: Min-1, Min, Nominal, Max, Max+1 boundaries.
  - `Basis_Path`: Cyclomatic Complexity $V(G) = E - N + 2P$ and independent linear execution paths.
* **What to say:** Briefly summarize the four techniques using the Bangla script in Section 5.

### Step 4: Show Selected Test Code in VS Code (2 Minutes)
* **What to do:** Switch to VS Code and open [tests/phase2a-regression.ts](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts).
* **What to point to:**
  - Scroll to **Lines 721–751** (`M4_TC_021`–`M4_TC_023` RBAC Authorization).
  - Point to the input session (`role: "ADMIN"`, `role: "CUSTOMER"`, `session: null`).
  - Point to the assertions: `expect(adminRes.status).toBe(200)`, `expect(custRes.status).toBe(403)`, `expect(unauthRes.status).toBe(401)`.
* **What to say:** Explain that this executes the production authorization logic without mocked illusions, asserting real HTTP response status codes.

### Step 5: Execute the Test Suite Live in PowerShell (1 Minute)
* **What to do:** Open the integrated terminal in VS Code and run:
  ```powershell
  npx tsx tests/phase2a-regression.ts
  ```
* **What to show:** Watch the 71 green `[PASS]` tags scroll and highlight:
  ```text
  === All 71 Tests Executed Successfully (Passed: 71, Failed: 0) ===
  ```
* **What to say:** Emphasize that the suite runs in under 4 seconds, executes completely offline, and safely validates the application logic without risking production data.

### Step 6: Conclude with Defect Tracker and Honest Disclosures (1 Minute)
* **What to do:** Switch to [project_final_testcase/30_Defects_Tracker.xlsx](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/project_final_testcase/30_Defects_Tracker.xlsx) or the `Bug_Reports` sheet.
* **What to point to:** Show the 30 defects categorized into 12 Verified Application Defects, 12 Test Setup Failures, and 6 Suspected Infrastructure Blockers.
* **What to say:** Conclude with the transparent disclosures (e.g., `M5_TC_018` as an in-memory simulation, and the 45 unexecuted cases preserved for data safety).

---

## 5. Complete Bangla Briefing Script (Technical Terms in English)

*Rehearse this natural, spoken script. It uses standard polite presentation Bengali while keeping all technical terms strictly in English.*

---

### পর্ব ১: প্রজেক্ট পরিচিতি ও টেস্টিং উদ্দেশ্য (Introduction & Objective)

> "স্যার, আসসালামু আলাইকুম। আমাদের আজকের প্রেজেন্টেশনটি **Shopfinity E-Commerce Platform**-এর **Software Testing & Quality Assurance (STQA)** প্রজেক্টের ওপর।
>
> Shopfinity একটি modern full-stack web application যা Next.js 16 App Router, React 19, TypeScript, PostgreSQL এবং Prisma ORM দিয়ে তৈরি।
>
> আমাদের মূল উদ্দেশ্য ছিল এই অ্যাপ্লিকেশনটির core business logic, user privacy, inventory bounds এবং checkout flow-কে industry-standard formal testing methodologies দিয়ে thoroughly verify করা।
>
> এই লক্ষ্যে আমাদের ৫ জন টিম মেম্বারের জন্য আমরা সর্বমোট **150 canonical test cases** ডিজাইন করেছি—যেখানে প্রতি মেম্বারের জন্য রয়েছে ঠিক **30টি করে test cases**।"

---

### পর্ব ২: চারটি টেস্টিং টেকনিকের ব্যাখ্যা (Four STQA Techniques)

> "স্যার, আমরা academic rubric অনুযায়ী চারটি formal testing techniques প্রয়োগ করেছি:
>
> ১. **Boundary Value Analysis (BVA):**
> ইনপুটের extreme edges অর্থাৎ সীমানায় ভুল বেশি হয়। তাই আমরা `Min-1`, `Min`, `Nominal`, `Max`, এবং `Max+1` ভ্যালু টেস্ট করেছি। যেমন—Member 2-এর Cart Item Quantity boundary: সর্বনিম্ন 1 এবং সর্বোচ্চ 99। এখানে 0 এবং 100 ইনপুট দিলে validation error (HTTP 400) আসে কি না, তা যাচাই করা হয়েছে।
>
> ২. **Equivalence Class Testing (ECT):**
> আমরা input domain-কে valid এবং invalid equivalence partitions-এ ভাগ করেছি। যেমন—Member 4-এর Password Validation: যেখানে password-এর দৈর্ঘ্য কমপক্ষে ৮ অক্ষর হতে হবে এবং uppercase, lowercase, digit ও special character থাকতে হবে। যেকোনো একটি missing থাকলে তা invalid partition হিসেবে reject হয়।
>
> ৩. **Decision Table Testing (DT):**
> একাধিক complex business conditions যখন একসাথে কাজ করে, তখন আমরা Decision Table ব্যবহার করি। যেমন—Member 5-এর Order Cancellation: অর্ডারটি ডাটাবেজে আছে কি না, বর্তমান status 'CANCELLED' কি না, এবং টার্গেট status 'CANCELLED' কি না—এই ৩টি condition-এর ওপর ভিত্তি করে স্টক restore হবে নাকি 409 Conflict হবে, তা নিয়মমাফিক টেস্ট করা হয়েছে।
>
> ৪. **Basis Path Testing (BP):**
> হোয়াইট-বক্স টেস্টিংয়ের জন্য আমরা সোর্স কোডের Control-Flow Graph (CFG) এঁকে McCabe's Cyclomatic Complexity $V(G) = E - N + 2P$ নির্ণয় করেছি। এর মাধ্যমে প্রতিটি linearly independent path খুঁজে বের করে নিশ্চিত করা হয়েছে যেন কোডের প্রতিটি decision branch অন্তত একবার হলেও execute হয়।"

---

### পর্ব ৩: ওয়ার্কবুক স্ট্রাকচার ও স্ট্যাটাস বিভাজন (Workbook Architecture & Evidence)

> "স্যার, আমাদের টেস্ট ওয়ার্কবুকটি রেফারেন্স **RentNest Standard** অনুযায়ী **৭টি ডেডিকেটেড শিটে** সাজানো: `Overview`, `Test_Cases`, `BVA`, `ECT_DecisionTable`, `Basis_Path`, `Bug_Reports`, এবং `Automation_Coverage`।
>
> আমাদের মোট **150টি টেস্ট কেসের** মধ্যে:
> - **105টি টেস্ট কেস 'Pass'** হিসেবে ভেরিফাইড।
> - **45টি টেস্ট কেস 'Not Run'** হিসেবে সততার সাথে সংরক্ষিত রাখা হয়েছে।
>
> **কেন 45টি টেস্ট কেস Not Run রাখা হয়েছে?**  
> স্যার, আমাদের অ্যাপ্লিকেশনটির লাইভ প্রোডাকশন ডাটাবেজ Supabase ক্লাউডে হোস্ট করা। আমরা যদি লাইভ সাইটে টেস্ট ক্যাশ-অন-ডেলিভারি অর্ডার প্লেস করতাম, ক্যাটাগরি ডিলিট করতাম, অথবা বাল্ক ইউজার রেজিস্ট্রেশন চালাতাম, তবে প্রোডাকশন ডাটাবেজের ইনভেন্টরি ও ডাটা করাপ্ট হয়ে যেত। তাই ডাটাবেজ সেফটি নিশ্চিত করতে আমরা মিউটেটিভ টেস্টগুলোকে কোনো ফেক ডাটা তৈরি না করে সততার সাথে `Not Run` রেখেছি।"

---

### পর্ব ৪: টেস্ট কোড ও লাইভ টার্মিনাল ডেমো (Code Walkthrough & Execution)

> "স্যার, এখন আমি আমাদের automated regression suite-এর কোড এবং এক্সিকিউশন দেখাতে চাই।
>
> *(VS Code-এ `tests/phase2a-regression.ts` ওপেন করে 721 নম্বর লাইনে যান)*  
> স্যার, এখানে Member 4-এর `M4_TC_021` থেকে `M4_TC_023` টেস্ট কেসটি লক্ষ্য করুন। এটি অ্যাডমিন ড্যাশবোর্ড মেট্রিক্সের Role-Based Access Control (RBAC) পরীক্ষা করে।
> - যখন `role: 'ADMIN'` সেশন দেওয়া হয়, তখন assertion যাচাই করে HTTP `200 OK`।
> - যখন `role: 'CUSTOMER'` সেশন দেওয়া হয়, তখন assertion যাচাই করে HTTP `403 Forbidden`।
> - এবং যখন unauthenticated `session: null` দেওয়া হয়, তখন assertion যাচাই করে HTTP `401 Unauthorized`।
>
> *(টার্মিনালে কমান্ডটি রান করুন: `npx tsx tests/phase2a-regression.ts`)*  
> স্যার, কমান্ডটি রান করার পর দেখতে পাচ্ছেন—মাত্র ৩.৫ সেকেন্ডে আমাদের **71টি regression tests-ই সম্পূর্ণ পাস** করেছে (Passed: 71, Failed: 0)। এটি সম্পূর্ণ offline, safe, এবং zero-database mutations নিশ্চিত করে।"

---

### পর্ব ৫: ডিফেক্ট ট্র্যাকিং ও সীমাবদ্ধতার স্পষ্টীকরণ (Defects & Transparency)

> "স্যার, আমরা টেস্টিং চলাকালীন সর্বমোট **30টি ডিফেক্ট** ডকুমেন্ট করেছি আমাদের `30_Defects_Tracker.xlsx`-এ:
> - **12টি Verified Application Defects**: যেমন সার্চ এপিআই আনপাবলিশড ফিল্টার ইগনোর করা (DEF-01), অথবা ইনভ্যালিড প্যারেন্ট ক্যাটাগরিতে 500 ক্র্যাশ (DEF-02)।
> - **12টি Test Setup / Automation Failures**: যেমন Playwright ব্রাউজার লোকেটার টাইমআউট (DEF-10) এবং কোল্ড-স্টার্ট হুক টাইমআউট।
> - **6টি Suspected Infrastructure Blockers**: ক্লাউড এজ রেট লিমিট ব্লক।
>
> এছাড়া একটি গুরুত্বপূর্ণ একাডেমিক সীমাবদ্ধতা আমরা স্পষ্টভাবে জানাতে চাই:  
> Member 5-এর `M5_TC_018` টেস্ট কেসটি একটি **In-Memory Simulation**, কারণ প্রোডাকশন Prisma ক্লায়েন্ট সরাসরি রান করলে লাইভ ডাটাবেজ কানেকশন পুল ট্রিগার করে।
>
> স্যার, এই হলো আমাদের Shopfinity STQA প্রজেক্টের সামগ্রিক উপস্থাপনা। আপনার যেকোনো প্রশ্নের উত্তর দিতে আমরা প্রস্তুত।"

---

## 6. Line-by-Line Explanation of the 5 Selected Demo Tests

### Demo 1: Member 1 — `productService.search` Empty Slug Guard (`M1_TC_010`)
* **File:** [tests/phase2a-regression.ts:903–923](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L903-L923)
* **Code snippet:**
  ```typescript
  test("DEF-05: Non-existent categorySlug queries return empty dataset instead of all products", async () => {
    const result = await productService.search({ categorySlug: "non-existent-xyz" }, mockPrisma);
    expect(result.products).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
  ```
* **Explanation:**
  - **Function under test:** `productService.search`
  - **Input:** `{ categorySlug: "non-existent-xyz" }`
  - **Branch tested:** Path 4 in $V(G)=7$ CFG — Category slug resolution check where database lookup yields `null`.
  - **Assertion:** `expect(result.products).toEqual([])` ensures an invalid slug produces zero products.
  - **What it proves:** Prevents defect `DEF-05`, ensuring users typing invalid URLs don't see unauthorized global product listings.

---

### Demo 2: Member 2 — Cart Deletion Route Handler (`M2_TC_017`)
* **File:** [tests/phase2a-regression.ts:820–847](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L820-L847)
* **Code snippet:**
  ```typescript
  test("Cart Service (M2_TC_017): DELETE /api/cart route logic executes clearCart and returns HTTP 200 with emptied cart", async () => {
    const session = { user: { id: "user-123", email: "customer@example.com" } };
    const mockCart = { id: "cart-1", userId: "user-123", items: [], itemsCount: 0, subtotal: 0 };
    // Invokes route handler logic with authenticated session
    const response = await handleCartDelete(session, mockCartService);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart.itemsCount).toBe(0);
  });
  ```
* **Explanation:**
  - **Function under test:** Route handler `DELETE /api/cart`
  - **Input:** Authenticated customer session and request to wipe cart.
  - **Assertion:** Asserts real HTTP status `200` and emptied cart object.
  - **What it proves:** Verifies the route clears the user's cart without throwing unhandled exceptions.

---

### Demo 3: Member 3 — Order Query Enum & Review Validation (`M3_TC_009` & `M3_TC_010`)
* **File:** [tests/phase2a-regression.ts:106–120](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L106-L120)
* **Code snippet:**
  ```typescript
  test("Order Query Schema (M3_TC_009, M3_TC_010): status filter validates valid and invalid enums", () => {
    const valid = orderQuerySchema.safeParse({ status: "Shipped" });
    expect(valid.success).toBe(true);
    const invalid = orderQuerySchema.safeParse({ status: "In Transit" });
    expect(invalid.success).toBe(false);
  });
  ```
* **Explanation:**
  - **Function under test:** `orderQuerySchema.safeParse`
  - **Input:** Enum `"Shipped"` (valid) vs `"In Transit"` (invalid).
  - **Assertion:** `valid.success === true` and `invalid.success === false`.
  - **What it proves:** Verifies that API query parameters strictly adhere to database `OrderStatus` enum values.

---

### Demo 4: Member 4 — Admin Metrics RBAC Authorization (`M4_TC_021`–`M4_TC_023`)
* **File:** [tests/phase2a-regression.ts:721–751](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L721-L751)
* **Code snippet:**
  ```typescript
  test("Dashboard Metrics RBAC (M4_TC_021 - M4_TC_023): Production authorization logic executes and asserts HTTP 200 (Admin), HTTP 403 (Customer), and HTTP 401 (Unauthenticated)", async () => {
    const adminRes = await evaluateMetricsAuth({ user: { id: "admin-1", role: "ADMIN" } });
    expect(adminRes.status).toBe(200);

    const custRes = await evaluateMetricsAuth({ user: { id: "cust-1", role: "CUSTOMER" } });
    expect(custRes.status).toBe(403);

    const unauthRes = await evaluateMetricsAuth(null);
    expect(unauthRes.status).toBe(401);
  });
  ```
* **Explanation:**
  - **Function under test:** `app/api/admin/metrics/route.ts` authorization guard.
  - **Input:** Three distinct session roles (Admin, Customer, Unauthenticated).
  - **Assertion:** Asserts real HTTP response statuses 200, 403, and 401.
  - **What it proves:** Proves that customer accounts cannot view financial revenue numbers or administrative metrics.

---

### Demo 5: Member 5 — Central Error Handler Malformed JSON Translation (`M5_TC_012`)
* **File:** [tests/phase2a-regression.ts:218–254](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts#L218-L254)
* **Code snippet:**
  ```typescript
  test("Error Handler (M5_TC_012): JSON SyntaxError returns 400 Bad Request", () => {
    const jsonError = new SyntaxError("Unexpected token in JSON at position 0");
    const { status, message } = handleApiError(jsonError);
    expect(status).toBe(400);
    expect(message).toBe("Invalid or malformed JSON payload");
  });
  ```
* **Explanation:**
  - **Function under test:** `handleApiError` (`lib/errors/index.ts`)
  - **Input:** Native JavaScript `SyntaxError` representing corrupted client JSON.
  - **Branch tested:** Path 3 in $V(G)=6$ CFG (`error instanceof SyntaxError && error.message.includes('JSON')`).
  - **Assertion:** Asserts status `400` and sanitized error message.
  - **What it proves:** Proves that broken client HTTP request bodies do not trigger 500 Internal Server crashes.

---

## 7. Viva Questions and Answers (Quick Reference)

### Q1: Why do we need STQA in modern software engineering?
> **Answer:** STQA ensures software meets specified functional requirements, operates reliably under boundary and unexpected conditions, prevents regression defects when code changes, and protects business data integrity.

### Q2: What is the difference between Verification and Validation?
> **Answer:** **Verification** asks *"Are we building the product right?"* (checking that code conforms to specifications via reviews, static analysis, unit tests). **Validation** asks *"Are we building the right product?"* (verifying that the software satisfies the real user's actual needs in a deployed environment).

### Q3: What is Boundary Value Analysis (BVA)?
> **Answer:** BVA is a black-box testing technique that targets values at the extreme boundaries of input partitions (`Min-1`, `Min`, `Nominal`, `Max`, `Max+1`). Defects occur disproportionately at boundary edges due to `<` vs `<=` off-by-one errors.

### Q4: What is Equivalence Class Testing (ECT)?
> **Answer:** ECT divides an input domain into partitions where all values in a partition are assumed to be processed identically by the system. We select one representative test case from each valid and invalid partition to maximize coverage with minimal redundancy.

### Q5: What is Decision Table Testing?
> **Answer:** Decision Table Testing models complex business logic where outcomes depend on combinations of multiple conditional inputs (Boolean flags, status checks). It maps every combination of conditions (inputs) to its corresponding action (output).

### Q6: What is Basis Path Testing and how is it derived?
> **Answer:** Basis Path Testing is a structural white-box testing technique. We represent the program's procedural flow as a Control-Flow Graph (CFG) consisting of nodes (statements) and edges (transfers of control). We compute McCabe's Cyclomatic Complexity to determine the exact number of linearly independent execution paths required to achieve branch coverage.

### Q7: What is Cyclomatic Complexity and what formulas calculate it?
> **Answer:** It measures the structural complexity of a program and the minimum number of test cases needed for complete path coverage. Formulas:
> 1. Edge-Node: $V(G) = E - N + 2P$ (where $E$ = edges, $N$ = nodes, $P = 1$ for single routine).
> 2. Predicate: $V(G) = P_{\text{decisions}} + 1$ (where $P_{\text{decisions}}$ = two-way decision nodes).

### Q8: What does an Assertion do in test automation?
> **Answer:** An assertion is a Boolean check comparing an observed actual outcome against the specified expected outcome. If the condition evaluates to `true`, the test passes; if `false`, the assertion throws an `AssertionError` and halts the test as failed.

### Q9: What is the difference between Unit, Regression, and End-to-End (E2E) testing?
> **Answer:**
> - **Unit Testing:** Tests isolated functions or modules in memory, replacing external dependencies with mocks.
> - **Regression Testing:** Re-runs existing test suites after code changes to verify that existing functionality remains intact.
> - **End-to-End (E2E) Testing:** Tests complete real-world user flows through a browser against live servers and databases.

### Q10: Why are 45 of your test cases marked `Not Run`?
> **Answer:** To prevent database corruption and avoid staging cold-start timeouts. Shopfinity connects to a live production database. Running live checkout, order cancellation, or bulk user deletions would mutate production records. Academic honesty requires marking unexecuted tests as `Not Run` rather than fabricating passing results.

### Q11: What is the difference between a Mock and a Real Database?
> **Answer:** A **real database** executes network transactions, manages connection pools, and commits records to persistent disk storage. A **mock** is an in-memory simulation that returns predetermined responses to allow testing pure business logic quickly without side effects or network latency.

### Q12: How do we know a test actually executed versus merely discovering it?
> **Answer:** Executed tests invoke functions, evaluate assertions, produce duration metrics, and return pass/fail exit codes. Discovery tools (like `playwright test --list`) only parse file ASTs and list test names without evaluating assertions or executing code.

### Q13: How is an Application Defect different from a Test Setup Failure?
> **Answer:** An **application defect** is a bug in the production codebase (e.g., an unhandled 500 error or SQL crash). A **test setup failure** is a flaw in the testing environment (e.g., a Playwright browser locator timing out after 60 seconds because of network latency or a slow cold start).

### Q14: What are the primary limitations of the current test evidence?
> **Answer:**
> 1. `M5_TC_018` is an in-memory simulation of customer isolation logic rather than a full live database integration test.
> 2. 45 mutative operations were deliberately preserved as `Not Run` to protect live data.
> 3. DEF-25 through DEF-30 represent suspected Vercel serverless rate limits observed during automation rather than confirmed source code bugs.

---

## 8. Troubleshooting Checklist (During Demo)

| Potential Issue | What Happened | Immediate Fix |
| :--- | :--- | :--- |
| **`tsx: command not found`** | `tsx` executable is not in the global path. | Use `npx tsx tests/phase2a-regression.ts` instead. |
| **PowerShell execution policy error** | Execution of scripts is restricted by Windows policy. | Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| **Terminal output scrolled too fast** | Professor wants to see line 1 of test output. | Pipe to more: `npx tsx tests/phase2a-regression.ts \| Out-Host -Paging` |
| **Port 9323 already in use** | `show-report` fails because previous server is open. | Run: `npx playwright show-report playwright-report --port 9324` |
| **Excel file is locked** | Excel file won't open or reports lock error. | Close open background Excel instances in Windows Task Manager. |

---

## 9. Final Presentation Checklist

Before you walk into the viva room:

- [x] Laptop charger plugged in.
- [x] VS Code opened directly at `C:\Users\mhd\Desktop\projects\ecommerce-shop`.
- [x] Terminal split ready with PowerShell at root directory.
- [x] Excel opened with [STQA_Final_150_Cases.xlsx](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/project_final_testcase/STQA_Final_150_Cases.xlsx) and [30_Defects_Tracker.xlsx](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/project_final_testcase/30_Defects_Tracker.xlsx).
- [x] [tests/phase2a-regression.ts](file:///c:/Users/mhd/Desktop/projects/ecommerce-shop/tests/phase2a-regression.ts) open at line 721 (RBAC demo test).
- [x] Rehearsed the 5 Bangla briefing sections aloud.
- [x] Ready to articulate the difference between 105 Pass cases, 45 Not Run cases, and the 71-test regression runner.