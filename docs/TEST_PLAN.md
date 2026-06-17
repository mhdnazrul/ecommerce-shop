# Test Plan

## Overview

This test plan covers all functional areas of Shopfinity. Testing is divided into E2E (Playwright browser tests) and API integration tests. The total test suite comprises **99 tests** across **19 spec files**.

---

## Test Strategy

| Layer | Tool | Tests | Scope |
|-------|------|-------|-------|
| E2E | Playwright | 66 | Browser-level user flows |
| API | Playwright APIRequestContext | 33 | Direct API endpoint testing |
| **Total** | | **99** | Full functional coverage |

### Test Environments
- **Local:** `http://localhost:3000` (Playwright auto-starts dev server)
- **CI:** `BASE_URL` env var for deployment URL
- **Database:** PostgreSQL seeded with test data via Playwright global setup

---

## E2E Test Coverage (66 tests, 13 spec files)

### Authentication (auth.spec.ts — 10 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Show login/register links when logged out | P0 | ✅ |
| 2 | Register a new user successfully | P0 | ✅ |
| 3 | Show validation errors on empty registration | P0 | ✅ |
| 4 | Reject weak passwords | P0 | ✅ |
| 5 | Reject duplicate email registration | P0 | ✅ |
| 6 | Login with valid credentials | P0 | ✅ |
| 7 | Show error on invalid login | P0 | ✅ |
| 8 | Logout successfully | P0 | ✅ |
| 9 | Redirect unauthenticated users to login (orders) | P0 | ✅ |
| 10 | Redirect unauthenticated users from wishlist | P0 | ✅ |

### Product Catalog (catalog.spec.ts — 8 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display product grid | P0 | ✅ |
| 2 | Navigate to product detail page | P0 | ✅ |
| 3 | Show product price and stock on detail page | P0 | ✅ |
| 4 | Show out of stock status | P0 | ✅ |
| 5 | Search products by name | P0 | ✅ |
| 6 | Show no results for unmatched search | P1 | ✅ |
| 7 | Filter products by category | P0 | ✅ |
| 8 | Sort products by price low to high | P1 | ✅ |

### Cart (cart.spec.ts — 5 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Add product to cart from detail page | P0 | ✅ |
| 2 | Display cart with added items | P0 | ✅ |
| 3 | Remove item from cart | P0 | ✅ |
| 4 | Show empty cart state | P0 | ✅ |
| 5 | Proceed to checkout from cart | P0 | ✅ |

### Wishlist (wishlist.spec.ts — 3 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Show empty wishlist state | P1 | ✅ |
| 2 | Add and remove items from wishlist | P1 | ✅ |
| 3 | Navigate to product from wishlist | P1 | ✅ |

### Checkout & Payment (checkout.spec.ts — 5 tests, checkout-stripe.spec.ts — 3 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display checkout page with cart items | P0 | ✅ |
| 2 | Fill shipping form and proceed to payment | P0 | ✅ |
| 3 | Redirect to cart if empty | P0 | ✅ |
| 4 | Show order summary on checkout page | P0 | ✅ |
| 5 | Redirect unauthenticated users from checkout | P0 | ✅ |
| 6 | Process Stripe payment with 4242 card | P0 | ⚠️ (iframe) |
| 7 | Show Stripe payment form on checkout | P0 | ✅ |
| 8 | Show PaymentElement on checkout page | P0 | ✅ |

### Order History (orders.spec.ts — 4 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Show empty orders state | P1 | ✅ |
| 2 | Display order with correct structure | P1 | ✅ |
| 3 | Show order items with quantities | P1 | ✅ |
| 4 | Show formatted order date | P2 | ✅ |

### Admin — Dashboard (admin-dashboard.spec.ts — 4 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display admin dashboard metrics | P0 | ✅ |
| 2 | Show admin sidebar navigation | P0 | ✅ |
| 3 | Navigate between admin sections | P0 | ✅ |
| 4 | Restrict admin panel for non-admin users | P0 | ✅ |

### Admin — Products (admin-products.spec.ts — 6 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display product list | P0 | ✅ |
| 2 | Open create product form | P0 | ✅ |
| 3 | Validate required fields on create | P0 | ✅ |
| 4 | Filter products by search | P0 | ✅ |
| 5 | Show empty state when no products match search | P1 | ✅ |
| 6 | Restrict access for non-admins | P0 | ✅ |

### Admin — Categories (admin-categories.spec.ts — 6 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display category list | P0 | ✅ |
| 2 | Open create category form | P0 | ✅ |
| 3 | Create a new category | P0 | ✅ |
| 4 | Validate required category name | P0 | ✅ |
| 5 | Show edit button on category cards | P0 | ✅ |
| 6 | Restrict category management for non-admins | P0 | ✅ |

### Admin — Orders (admin-orders.spec.ts — 7 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Display order management page | P0 | ✅ |
| 2 | Show order count badge | P1 | ✅ |
| 3 | Display order cards with status dropdown | P0 | ✅ |
| 4 | Have all order status options | P1 | ✅ |
| 5 | Show order items list | P0 | ✅ |
| 6 | Show empty state when no orders exist | P1 | ✅ |
| 7 | Redirect non-admin users | P0 | ✅ |

### Stripe Payment (checkout-stripe.spec.ts — 3 tests)
| # | Test | Priority | Automatable |
|---|------|----------|-------------|
| 1 | Process Stripe payment with 4242 card | P0 | ✅ |
| 2 | Show Stripe payment form on checkout | P0 | ✅ |
| 3 | Show PaymentElement on checkout after order placement | P0 | ✅ |

---

## API Integration Test Coverage (33 tests, 7 spec files)

### Auth API (api-auth.spec.ts — 7 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Register a new user (201) | P0 |
| 2 | Reject duplicate email (409) | P0 |
| 3 | Reject weak password (400) | P0 |
| 4 | Reject missing email (400) | P0 |
| 5 | Return session for authenticated user | P0 |
| 6 | Reject missing firstName (400) | P1 |
| 7 | Reject missing lastName (400) | P1 |

### Products API (api-products.spec.ts — 9 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Return paginated products (200) | P0 |
| 2 | Respect page and limit params | P0 |
| 3 | Filter by search query | P0 |
| 4 | Filter by categoryId | P0 |
| 5 | Sort by price ascending | P1 |
| 6 | Sort by price descending | P1 |
| 7 | Filter by featured | P1 |
| 8 | Return product by slug (200) | P0 |
| 9 | Return 404 for invalid slug | P0 |

### Categories API (api-categories.spec.ts — 5 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Return all categories (200) | P0 |
| 2 | Return hierarchical tree (200) | P0 |
| 3 | Return category by slug (200) | P0 |
| 4 | Return 404 for invalid slug | P0 |
| 5 | Return categories with product count | P1 |

### Cart API (api-cart.spec.ts — 5 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Return empty cart for new user | P0 |
| 2 | Add item to cart (201) | P0 |
| 3 | Show cart with items after add | P0 |
| 4 | Return 401 without auth | P0 |
| 5 | Return 401 for unauthenticated add | P0 |

### Orders API (api-orders.spec.ts — 4 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Return orders list (200) | P0 |
| 2 | Return 401 without auth | P0 |
| 3 | Return 400 for checkout with empty cart | P0 |
| 4 | Return orders with pagination metadata | P1 |

### Uploads API (api-uploads.spec.ts — 5 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Reject unauthenticated upload (401) | P0 |
| 2 | Reject upload without file (400) | P0 |
| 3 | Reject unauthenticated delete (401) | P0 |
| 4 | Reject invalid file type (400) | P0 |
| 5 | Reject non-admin delete (403) | P0 |

### Payments API (api-payments.spec.ts — 4 tests)
| # | Test | Priority |
|---|------|----------|
| 1 | Reject create-intent without auth (401) | P0 |
| 2 | Reject create-intent for non-existent order (404) | P0 |
| 3 | Reject empty webhook body (400) | P0 |
| 4 | Reject invalid webhook signature (400) | P0 |

---

## Priority Definitions

| Priority | Definition | Target Coverage |
|----------|------------|-----------------|
| **P0** | Critical path — must pass before launch | 100% |
| **P1** | Important — should pass before launch | 90%+ |
| **P2** | Nice to have — can be deferred | 70%+ |

## Test Execution

```bash
# Run all E2E tests
npm run test:e2e

# Run all tests (E2E + API)
npx playwright test

# Run a specific test file
npx playwright test tests/auth.spec.ts

# Run API tests only
npx playwright test tests/api-*.spec.ts

# Run with debug
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report
```

## Pre-Launch Gate

Before production launch, the following must pass:
- [ ] All P0 E2E tests pass (30+ tests)
- [ ] All P0 API tests pass (20+ tests)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript check passes (`npx tsc --noEmit`)
- [ ] No console errors on critical pages
- [ ] Stripe test payment completes successfully
