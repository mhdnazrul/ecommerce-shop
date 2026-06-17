# Admin Panel

## Overview

The admin panel provides a dashboard and CRUD interfaces for managing the e-commerce platform. Access is restricted to users with the **Admin** role.

## Layout

```
/admin/layout.tsx (Client Component)
├── AdminSidebar (fixed left sidebar)
│   ├── Dashboard (/admin/dashboard)
│   ├── Products (/admin/products)
│   ├── Categories (/admin/categories)
│   └── Orders (/admin/orders)
└── Content Area (scrollable, max-width centered)
```

The admin layout includes:
- **Auth guard** — Uses `useAuth()` hook to verify admin role
- **Loading spinner** — Displayed during auth check
- **Redirect** — Non-admin users are redirected to `/`

## Access Control

### Middleware Level

The middleware (`middleware.ts`) intercepts all `/admin/*` routes:

| Scenario | Action |
|----------|--------|
| Not logged in | Redirect to `/login?callbackUrl=/admin/...` |
| Logged in, not admin | Redirect to `/?error=forbidden` |
| Logged in, admin | Allow access |

### API Level

All admin API routes use `apiHandler` with `requireAdmin: true`:

```typescript
export const GET = apiHandler(async (req) => {
  // Admin-only logic
}, { requireAdmin: true })
```

## Dashboard

### /admin/dashboard

Displays aggregate metrics and recent activity:

| Metric | Description |
|--------|-------------|
| Total Products | Count of non-deleted products |
| Total Orders | Count of all orders |
| Total Revenue | Sum of paid order totals |
| Total Customers | Count of users with Customer role |
| Recent Orders | Last 10 orders with status |
| Low Stock Products | Products with stock < 10 |

API: `GET /api/dashboard/metrics` (admin-only)

## Products Management

### /admin/products

| Feature | Description |
|---------|-------------|
| Product list | Table with image, name, price, stock, category, status |
| Search | Filter by name/sku |
| Create | Full product form with all fields |
| Edit | Pre-filled form for existing product |
| Soft delete | Sets `isDeleted: true` |

### Product Form Fields
- Name, Slug (auto-generated from name)
- Description (text area), Short Description
- Price, Compare-at Price, Cost Price
- Stock Quantity, SKU, Barcode
- Weight
- Image URL, Additional Images
- Tags (comma-separated)
- Featured toggle, Published toggle
- Category (dropdown)

## Categories Management

### /admin/categories

| Feature | Description |
|---------|-------------|
| Category list | Table with name, parent, display order |
| Create | Name, description, parent category, image |
| Edit | Update category details |
| Soft delete | Prevents deletion of categories with products |

### Category Form Fields
- Name, Slug (auto-generated)
- Description
- Parent Category (dropdown, optional)
- Image URL
- Display Order (number)

## Orders Management

### /admin/orders

| Feature | Description |
|---------|-------------|
| Order list | Table with order number, customer, status, total, date |
| Search | Filter by order number or customer |
| Status filter | Filter by order status |
| Status update | Dropdown to change order status |
| Order details | Full order view with items, payment, shipping |

### Order Statuses
- Pending → Processing → Shipped → Delivered
- Any status → Cancelled

## Admin API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/metrics` | GET | Aggregated dashboard data |
| `/api/products` | GET | List all products (including unpublished) |
| `/api/products` | POST | Create product |
| `/api/products/[id]` | PUT | Update product |
| `/api/products/[id]` | DELETE | Soft-delete product |
| `/api/categories` | POST | Create category |
| `/api/categories/[id]` | PUT | Update category |
| `/api/categories/[id]` | DELETE | Soft-delete category |
| `/api/orders/admin` | GET | List all orders |
| `/api/orders/[id]/status` | PATCH | Update order status |
| `/api/uploads` | POST | Upload image |
| `/api/uploads` | DELETE | Delete image |

## UI Components

### AdminSidebar

Navigation sidebar with:
- Logo/branding
- Navigation links with icons
- Active route highlighting

### Loading States

Each admin page has:
- `loading.tsx` — Suspense fallback with skeleton/spinner
- `error.tsx` — Error boundary with "Try Again" button

### Empty States

Tables show "No products yet" / "No orders yet" when data is empty.

## Seed Data

The seed script creates:

- **Admin user:** `admin@shopfinity.com` / `Admin123!`
- **Test customer:** `test@shopfinity.com` / `Password123!`
- **3 roles:** Admin (all 120 permissions), Customer, Manager
- **120 permissions:** 15 resources × 8 actions

## Permission Model

The admin panel uses **role-based access** (not permission-based). The middleware and API handler check for the `Admin` role, not individual permissions. The full permission system is pre-seeded and available for future fine-grained access control.
