# Shopfinity STQA 150-Case Final Test Deliverables

This directory contains the final Software Testing & Quality Assurance (STQA) deliverables for the Shopfinity e-commerce platform. The test cases cover the complete application lifecycle, including product catalog management, category hierarchy traversal, shopping cart operations, Cash on Delivery (COD) checkout, order state transitions, tenant isolation, and administrative dashboard metrics.

---

## 1. File Inventory

| File Name | Purpose | Case Count |
| :--- | :--- | :--- |
| `STQA_Final_150_Cases.xlsx` | **Canonical Master Unified Workbook (Submission Target)** | 150 cases |
| `Member_1_Final_STQA_Test_Cases.xlsx` | **Canonical Member 1 Workbook**: Catalog & Hierarchy | 30 cases |
| `Member_2_Final_STQA_Test_Cases.xlsx` | **Canonical Member 2 Workbook**: Shopping Cart & Stock Bounds | 30 cases |
| `Member_3_Final_STQA_Test_Cases.xlsx` | **Canonical Member 3 Workbook**: Order Lifecycle & Privacy | 30 cases |
| `Member_4_Final_STQA_Test_Cases.xlsx` | **Canonical Member 4 Workbook**: User Registration & Auth | 30 cases |
| `Member_5_Final_STQA_Test_Cases.xlsx` | **Canonical Member 5 Workbook**: COD Checkout & Analytics | 30 cases |
| `30_Defects_Tracker.xlsx` | **30 Documented Project Defects & Environment Issues** (12 Verified Application Defects, 11 Test Setup Failures, 7 Infrastructure Blockers) | 30 entries |
| `STQA_Final_Report.md` | **Comprehensive STQA Final Report** (Objectives, Intro, Modeling, Execution, Outputs, Conclusion, Contributions) | — |
| `STQA_150_Cases_README.md` | **Master Documentation & Evidence Inventory** | — |
| `STQA_Final_150_Cases_v3.xlsx` | Preserved validated v3 master unified workbook | 150 cases |
| `Member_1...v3.xlsx` through `Member_5...v3.xlsx` | Preserved individual v3 member workbooks | 30 cases each |
| `STQA_Final_150_Cases_v2.xlsx` | Preserved v2 master unified workbook | 150 cases |
| `Member_1...v2.xlsx` through `Member_5...v2.xlsx` | Preserved individual v2 member workbooks | 30 cases each |

> **Note on Preservation**: All historical artifacts (`v0`, `v1`, `v2`, `v3`, test suite execution reports, and Playwright spec files) remain completely preserved for audit trace. Redundant temporary generator (`generate-final-excel.js`) has been cleaned.

### Defect Tracker Breakdown (`30_Defects_Tracker.xlsx`)
- **Verified Application Defects (12)**: DEF_01–DEF_06, DEF_09, DEF_11–DEF_15 (Real application bugs in search, category creation, product schema, UI accessibility, and cart quantity validations).
- **Test Setup / Automation Failures (11)**: DEF_07, DEF_08, DEF_16–DEF_24 (Playwright test aborted during hook execution and 60-second `beforeAll` setup timeouts against remote Vercel cold starts).
- **Infrastructure / Rate-Limit Blockers (7)**: DEF_10, DEF_25–DEF_30 (UI search bar locator timeout under network lag and Vercel Edge IP rate-limiting [5 req / 60 sec] blocking repetitive automated auth requests).

---

## 2. Standardized 15-Column Schema

All generated workbooks adhere to the exact 15 columns in the specified order:

1. **Testing Technique**: Boundary Value Analysis (BVA), Basis Path Testing (BP), Equivalence Class Testing (ECT), or Decision Table Testing (DT).
2. **Member**: Responsible team member (`Member 1` through `Member 5`).
3. **Test ID**: Unique sequential identifier (`M1_TC_001` through `M5_TC_030`).
4. **Module**: Realistic Shopfinity module name.
5. **Function / Component**: Specific code function, route handler, or React component.
6. **File Path**: Exact repository source file path.
7. **Test Case Description**: Concise summary of what is being evaluated.
8. **Scenario**: Real-world operational context.
9. **Test Data**: Specific input parameters or boundary payloads.
10. **Pre-Condition**: Necessary environment or state requirements before execution.
11. **Steps for Execution**: Step-by-step instructions to reproduce or execute the test.
12. **Expected Result**: Specific, testable assertion of expected behavior.
13. **Actual Result**: Observed execution result.
14. **Status**: Execution status (`PASS`, `FAIL`, or `Not Run`).
15. **Comment**: Technical rationale, boundary definition, or test suite reference.

---

## 3. ID Convention and Distribution

Each team member is allocated exactly 30 test cases, numbered sequentially from `001` to `030`:

- **Member 1**: `M1_TC_001` to `M1_TC_030` (Catalog, Categories & Search)
- **Member 2**: `M2_TC_001` to `M2_TC_030` (Shopping Cart & Inventory Bounds)
- **Member 3**: `M3_TC_001` to `M3_TC_030` (Order Queries, Reviews & Tenant Privacy)
- **Member 4**: `M4_TC_001` to `M4_TC_030` (Registration, Passwords & Open Redirect Defense)
- **Member 5**: `M5_TC_001` to `M5_TC_030` (Cash on Delivery Checkout, Idempotency & Revenue Analytics)

### Testing Technique Distribution

| Technique | Member 1 | Member 2 | Member 3 | Member 4 | Member 5 | Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Boundary Value Analysis (BVA)** | 5 | 5 | 8 | 8 | 6 | **32** |
| **Basis Path Testing (BP)** | 14 | 12 | 11 | 10 | 12 | **59** |
| **Equivalence Class Testing (ECT)** | 4 | 5 | 6 | 8 | 6 | **29** |
| **Decision Table Testing (DT)** | 7 | 8 | 5 | 4 | 6 | **30** |
| **Total per Member** | **30** | **30** | **30** | **30** | **30** | **150** |

---

## 4. Execution Evidence and Status Convention

In accordance with strict verification rules:
- **Evidence-Backed Execution**: Cases verified via automated test suites (`tests/phase2a-regression.ts`, Playwright e2e runs, or unit tests) reflect actual execution outcomes (`Status: PASS`) and document the verifying suite in the Comment column.
- **Unexecuted Cases**: Any test case not executed in the active verified environment is marked with `Actual Result: Not Run` and `Status: Not Run`, preventing unsupported claims of test execution.
- **Safety**: No synthetic orders were placed on the production website (`https://shopfinity-shop-phi.vercel.app/`), and no destructive operations, writes, or migrations were run against the production database.

---

## 5. Programmatic Validation

All workbooks were validated programmatically via automated scripts (`scratch/validate_v3_workbooks.js`) verifying:
1. Master workbook contains exactly 150 rows.
2. Each member workbook contains exactly 30 rows.
3. All 15 required headers match in exact order.
4. All 150 test IDs are globally unique and sequential per member.
5. Zero missing or placeholder (`N/A`, `See source code`, `TODO`) fields.
6. Row-for-row and column-for-column equality between master and member files.
7. Zero secrets, credentials, or `.env` variables exposed.

---

## 6. Phase 2D.1 Semantic Audit & v2 Workbooks

Following the Phase 2D.1 audit, semantic corrections were implemented in the `_v2` workbooks:
1. **Cart Quantity Boundary Precision (M2_TC_004 & M2_TC_005)**: Refined to Zod schema bounds `max(99)` (nominal max=99, invalid max+1=100).
2. **Order Address & Notes Boundaries (M5_TC_001 to M5_TC_004)**: Refined to explicit Zod schema bounds for `line1` and `notes`.
3. **Execution Evidence Honesty**: Unexecuted test specifications were adjusted to `Not Run`.

---

## 7. Phase 2D.7 Final Forensic Reconciliation & Submission Readiness

Following the Phase 2D.7 audit, the final `_v3` workbooks reflect full empirical execution integrity:

### Final Evidence-Backed Status Breakdown

| Execution Scope | Member 1 | Member 2 | Member 3 | Member 4 | Member 5 | Grand Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Playwright E2E Verified (Live Vercel)** | 15 | 2 | 8 | 0 | 0 | **25 cases** |
| **Automated Unit / Regression Verified** | 3 | 16 | 9 | 20 | 26 | **74 cases** |
| **Total Verified PASS** | **18** | **18** | **17** | **20** | **26** | **99 cases** |
| **Unexecuted / Safety Skipped (`Not Run`)** | **12** | **12** | **13** | **10** | **4** | **51 cases** |
| **Total Test Cases** | **30** | **30** | **30** | **30** | **30** | **150 cases** |

### Evidence Reconciliation Details

#### 1. Member 4 Evidence Correction (10 Cases Retained as `Not Run`)
- `M4_TC_017` to `M4_TC_020` (Category Deletion), `M4_TC_024` to `M4_TC_025` (User Registration), and `M4_TC_027` to `M4_TC_030` (Category Update) were investigated in `project_final_testcase/member4/test_results/vercel-report.json`.
- The saved report was generated with `playwright test ... --list`, which only enumerated the test suite. In the report, all 30 tests have `status: "skipped"` with `results: []`. Zero HTTP requests were transmitted to Vercel, and zero production database writes occurred.
- Because no execution results exist for these 10 mutative operations, they are strictly retained as **`Not Run`** to maintain 100% academic and evidence integrity.
- Member 4's remaining 20 tests (`M4_TC_001–016` Zod registration schema BVA/ECT, `M4_TC_021–023` role metrics access, and `M4_TC_026` DEF-06 open redirect defense) are verified and marked **`PASS`**.

#### 2. Member 2 Test-Title-to-Excel-ID Mapping (`M2_TC_012` & `M2_TC_013`)
- `M2_TC_012` and `M2_TC_013` were genuinely executed against live Vercel in `project_final_testcase/member2/test_cases/m2-bp-merge-cart.spec.ts` and passed (`status: passed`, durations: 10,941ms and 12,947ms).
- Due to a 1-off numbering offset in the test spec titles, the test titled `"M2_TC_011"` proved Excel's `M2_TC_012` (mergeCart empty input $\rightarrow$ HTTP 200), and the test titled `"M2_TC_012"` proved Excel's `M2_TC_013` (mergeCart invalid product $\rightarrow$ HTTP 200). Both are verified and marked **`PASS`** with explicit documentation in their Comment fields.

#### 3. Demotions Retained as `Not Run`
- `M1_TC_018`: Admin DELETE authentication required in Playwright context (documented in `member1/README.md`).
- `M2_TC_014`, `M2_TC_015`, `M2_TC_016`: Remote Chromium 60,000ms locator timeouts on dynamic Vercel hydration (documented in `member2/README.md`).
- `M3_TC_009`, `M3_TC_010`, `M3_TC_013`, `M3_TC_014`: Omitted from Member 3 Vercel test suite (`member3/test_results/vercel-report.json` only executed specs 1–8).

#### 4. Preserved Safety & Scope Cases
- `M1_TC_003`: Kept as `Not Run` because Excel specifies `limit=20`, whereas historical execution ran `limit=12`.
- `M5_TC_012`, `M5_TC_013`, `M5_TC_014`, `M5_TC_030`: Preserved as `Not Run` (marked with `test.skip` in `project_final_testcase/member5/test_cases/`) to strictly comply with safety constraints prohibiting production database order creation and mutations.

