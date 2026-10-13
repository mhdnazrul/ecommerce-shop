# Shopfinity STQA 150-Case Final Test Deliverables

This directory contains the final Software Testing & Quality Assurance (STQA) deliverables for the Shopfinity e-commerce platform. The test cases cover the complete application lifecycle, including product catalog management, category hierarchy traversal, shopping cart operations, Cash on Delivery (COD) checkout, order state transitions, tenant isolation, and administrative dashboard metrics.

---

## 1. File Inventory

| File Name | Purpose | Case Count |
| :--- | :--- | :--- |
| `STQA_Final_150_Cases.xlsx` | **Canonical Master Unified Workbook (RentNest Multi-Sheet Standard)** | 150 cases |
| `Member_1_Final_STQA_Test_Cases.xlsx` | **Canonical Member 1 Workbook**: Catalog & Hierarchy (7 Sheets) | 30 cases |
| `Member_2_Final_STQA_Test_Cases.xlsx` | **Canonical Member 2 Workbook**: Shopping Cart & Stock Bounds (7 Sheets) | 30 cases |
| `Member_3_Final_STQA_Test_Cases.xlsx` | **Canonical Member 3 Workbook**: Order Lifecycle & Privacy (7 Sheets) | 30 cases |
| `Member_4_Final_STQA_Test_Cases.xlsx` | **Canonical Member 4 Workbook**: User Registration & Auth (7 Sheets) | 30 cases |
| `Member_5_Final_STQA_Test_Cases.xlsx` | **Canonical Member 5 Workbook**: COD Checkout & Analytics (7 Sheets) | 30 cases |
| `STQA_Code_Walkthrough_and_Basis_Path_Guide.md` | **Complete Basis Path Coverage, 5-Member Code Walkthrough & Run Guide** (ASCII CFGs, Line-by-Line Viva Guides, Bangla Scripts) | — |
| `30_Defects_Tracker.xlsx` | **30 Documented Project Defects & Environment Issues** (12 Verified Application Defects, 12 Test Setup / Automation Failures, 6 Suspected Infrastructure / Rate-Limit Blockers) | 30 entries |
| `STQA_Final_Report.md` | **Comprehensive STQA Final Report** (Objectives, Intro, Modeling, Execution, Outputs, Conclusion, Contributions) | — |
| `STQA_150_Cases_README.md` | **Master Documentation & Evidence Inventory** | — |
| `STQA_Final_150_Cases_v3.xlsx` | Preserved validated v3 master unified workbook | 150 cases |
| `Member_1...v3.xlsx` through `Member_5...v3.xlsx` | Preserved individual v3 member workbooks | 30 cases each |
| `STQA_Final_150_Cases_v2.xlsx` | Preserved v2 master unified workbook | 150 cases |
| `Member_1...v2.xlsx` through `Member_5...v2.xlsx` | Preserved individual v2 member workbooks | 30 cases each |

> **Workbook Architecture**: Following the RentNest STQA reference standard, the master workbook and all five member workbooks feature **7 dedicated sheets**:
> 1. `Overview`: Project summary, team and module mapping, STQA concepts index, and execution notes.
> 2. `Test_Cases`: 150 test cases (master) / 30 test cases (member) adhering to the 14 standardized RentNest columns (`TC_ID`, `Member`, `Module`, `Technique`, `Title`, `Preconditions`, `Steps`, `Test_Data`, `Expected_Result`, `Actual_Result`, `Status`, `Priority`, `Automated_By`, `Defect_Ref`).
> 3. `BVA`: Complete boundary value analysis tables covering `min-1`, `min`, `min+1`, `max-1`, `max`, and `max+1` positions per member module.
> 4. `ECT_DecisionTable`: Equivalence class partitions across 12 input domains plus 4 formal decision tables (Cart Operations, Product Creation, Password Rules, Order Lifecycle).
> 5. `Basis_Path`: Structured Basis Path documentation covering 25 procedural routine allocations (5 per member), cyclomatic complexity $V(G)=3\text{--}6$, independent paths, and full disclosure of the 3 cross-member shared routines.
> 6. `Bug_Reports`: 30 defect reports structured into RentNest's 12 standardized columns (`Bug_ID`, `Module`, `Summary`, `Steps`, `Expected`, `Actual`, `Severity`, `Priority`, `Status`, `Reported_By`, `Found_Via`, `Related_TC`).
> 7. `Automation_Coverage`: Two-part automation index linking 71 unit tests (`tests/phase2a-regression.ts`) and Playwright E2E/API test suites under `tests/`.

---

## 2. Standardized 14-Column Test Case Schema

All workbooks adhere to the 14 standardized columns matching the RentNest reference standard:

1. **TC_ID**: Unique sequential identifier (`M1_TC_001` through `M5_TC_030`).
2. **Member**: Responsible team member (`Member 1` through `Member 5`).
3. **Module**: Realistic Shopfinity subsystem or functional domain.
4. **Technique**: Testing technique (`BVA`, `ECT`, `Decision Table`, `Basis Path`).
5. **Title**: Concise summary of the tested scenario.
6. **Preconditions**: Environment prerequisites and initial database/session state.
7. **Steps**: Numbered, reproducible execution steps.
8. **Test_Data**: Exact input parameters, query parameters, or payload bodies.
9. **Expected_Result**: Specific, testable assertion of expected behavior.
10. **Actual_Result**: Observed execution result (*"As expected"*, specific status message, or defect finding).
11. **Status**: Execution outcome (`Pass` or `Not Run`).
12. **Priority**: Risk-based prioritization (`High`, `Medium`, or `Low`).
13. **Automated_By**: Precise automated script path and test case reference.
14. **Defect_Ref**: Cross-reference to the defect tracker (`DEF-01` to `DEF-30` or `-`).

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
| **Basis Path Testing (BP)** | 17 | 12 | 16 | 14 | 12 | **71** |
| **Equivalence Class Testing (ECT)** | 4 | 5 | 4 | 6 | 6 | **25** |
| **Decision Table Testing (DT)** | 4 | 8 | 2 | 2 | 6 | **22** |
| **Total per Member** | **30** | **30** | **30** | **30** | **30** | **150** |

---

## 4. Execution Evidence and Status Convention

In accordance with strict verification rules:
- **Evidence-Backed Execution**: Cases verified via automated test suites (`tests/phase2a-regression.ts`, Playwright e2e runs, or unit tests) reflect actual execution outcomes (`Status: PASS`) and document the verifying suite in the Comment column.
- **Unexecuted Cases**: Any test case not executed in the active verified environment is marked with `Actual Result: Not Run` and `Status: Not Run`, preventing unsupported claims of test execution.
- **Safety**: No synthetic orders were placed on the production website (`https://shopfinity-shop-phi.vercel.app/`), and no destructive operations, writes, or migrations were run against the production database.

---

## 5. Safe Automated Verification & Reproduction Instructions

All project deliverables and test cases can be safely validated offline without mutating the live production database or sending unauthorized external requests:

1. **RentNest-Standard Multi-Sheet Workbook Validation**:
   ```bash
   node scratch/validate_rentnest_workbooks.js
   ```
   Validates that the master workbook and all 5 member workbooks contain all 7 standardized RentNest sheets, exactly 150 test cases (30 per member), the 14-column schema, exact status counts (105 Pass, 45 Not Run), and 30 documented defects.

2. **Canonical Alignment & Parity Verification**:
   ```bash
   node scratch/validate_canonical_workbooks.js
   ```
   Verifies 100% row-for-row and column-for-column parity between master slices and individual member workbooks, with zero blank required fields and zero placeholder text.

3. **30-Defects Tracker Audit**:
   ```bash
   node scratch/audit_30_defects.js
   ```
   Audits the 30 documented defect records across 12 Verified Application Defects, 12 Test Setup / Automation Failures, and 6 Suspected Infrastructure / Rate-Limit Blockers.

4. **TypeScript Strict Type Check**:
   ```bash
   npx tsc --noEmit
   ```
   Confirms zero compilation or type errors across the entire codebase.

5. **Safe Automated Regression & Logic Suite (71 Tests)**:
   ```bash
   npx tsx tests/phase2a-regression.ts
   ```
   Executes the 71-test automated unit and business logic regression suite offline (0 database writes, 0 network calls). Covers Zod schema validation bounds, error handler mapping, sliding-window rate limiting, cart route logic, RBAC metrics authorization, and in-memory multi-tenant privacy simulations.

6. **Git Diff and Status Inspection**:
   ```bash
   git diff --check
   git status --short
   ```
   Verifies clean diffs without syntax markers and confirms zero staged or uncommitted alterations to repository branches.

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

| Member | Total Verified PASS | Unexecuted / Safety Skipped (`Not Run`) | Total Test Cases | Primary Evidence Sources |
| :--- | :---: | :---: | :---: | :--- |
| **Member 1** | **18** | **12** | **30** | Playwright E2E (`vercel-report.json`) & Regression Suite |
| **Member 2** | **18** | **12** | **30** | Playwright E2E (`m2-bp-merge-cart.spec.ts`) & Regression Suite |
| **Member 3** | **21** | **9** | **30** | Playwright E2E (`vercel-report.json`) & Regression Suite |
| **Member 4** | **20** | **10** | **30** | Offline Unit & Regression Suite (`phase2a-regression.ts`) |
| **Member 5** | **28** | **2** | **30** | Automated Unit (`test-report.json`) & Regression Suite / Simulation |
| **Grand Total** | **105** | **45** | **150** | Reconciled Multi-Tier Automated & Historical Evidence |

> **Traceability Note**: Exactly 105 canonical test cases are marked Pass based on the documented evidence mapping across the test suites, while the automated regression suite separately reports 71 passing automated tests and the historical Member 5 unit report reports 26 tests. Test runner counts and canonical test-case counts evaluate multi-boundary and procedural logic without assuming an artificial one-to-one mapping. `M5_TC_018` is explicitly evaluated via an in-memory customer isolation simulation.

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
- `M3_TC_009`, `M3_TC_010`, `M3_TC_013`, `M3_TC_014`: Promoted to `PASS` following offline verification against production schemas (`orderQuerySchema` status filter and `createReviewSchema` UUID/rating boundaries) in `tests/phase2a-regression.ts`.

#### 4. Preserved Safety & Scope Cases
- `M1_TC_003`: Kept as `Not Run` because Excel specifies `limit=20`, whereas historical execution ran `limit=12`.
- `M5_TC_014`, `M5_TC_030`: Preserved as `Not Run` to strictly comply with safety constraints prohibiting production database order creation and mutations. `M5_TC_012` is verified passing via unit regression suite `tests/phase2a-regression.ts:218–223` (SyntaxError payload mapping to 400 Bad Request) and `M5_TC_013` is verified passing via `tests/phase2a-regression.ts:1002–1016` (rateLimit sliding window quota and rejection).
- `M5_TC_018`: Documented and evaluated via an in-memory tenant isolation simulation in `tests/phase2a-regression.ts:543–572` (Behavior 6) to avoid live Prisma connection pool initialization against Supabase during offline testing.

