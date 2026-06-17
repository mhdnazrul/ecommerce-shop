# API Reference

Base URL: `http://localhost:3000` (development) or `https://your-domain.vercel.app` (production)

All responses use the unified envelope:
```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "message": "...", "errors": ["..."] }
```

---

## Authentication

### POST /api/auth/register

Register a new user account.

- **Auth:** None
- **Rate Limited:** 5 requests per 60 seconds per IP
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response:** `201`
  ```json
  {
    "success": true,
    "data": { "id": "uuid", "email": "user@example.com", "firstName": "John", "lastName": "Doe" },
    "message": "Registration successful"
  }
  ```
- **Errors:** `400` (validation failed), `409` (email already exists), `429` (rate limited)

### POST /api/auth/[...nextauth]

NextAuth.js handler for sign-in, sign-out, and session management.

- **Auth:** Varies by route
- **Routes:** `/api/auth/signin`, `/api/auth/callback/*`, `/api/auth/session`, `/api/auth/signout`, `/api/auth/csrf`
- **Rate Limited:** Credentials sign-in limited to 10 requests per 60 seconds per IP

---

## Products

### GET /api/products

List products with pagination, filtering, and sorting.

- **Auth:** None
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 12, max 100)
  - `search` (string) — full-text search on name
  - `categoryId` (string) — filter by category
  - `minPrice` / `maxPrice` (number) — price range filter
  - `sortBy` ("price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest")
  - `isFeatured` (boolean)
- **Response:** `200`
  ```json
  {
    "success": true,
    "data": {
      "products": [{ "id": "uuid", "name": "...", "slug": "...", "price": 99.99, "imageUrl": "...", "category": { ... } }],
      "pagination": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
    }
  }
  ```

### GET /api/products/[id]

Get a single product by ID.

- **Auth:** None
- **Response:** `200` with product data
- **Error:** `404` if not found

### GET /api/products/slug/[slug]

Get a single product by URL slug.

- **Auth:** None
- **Response:** `200` with product data (includes category, reviews)
- **Error:** `404` if not found

### POST /api/products

Create a new product.

- **Auth:** Admin required
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Full description",
    "price": 99.99,
    "stockQuantity": 100,
    "categoryId": "uuid",
    ...
  }
  ```
- **Response:** `201` with created product
- **Error:** `400` (validation), `403` (not admin)

### PUT /api/products/[id]

Update a product.

- **Auth:** Admin required
- **Body:** Partial product fields
- **Response:** `200` with updated product

### DELETE /api/products/[id]

Soft-delete a product.

- **Auth:** Admin required
- **Response:** `200` `{ "success": true, "message": "Product deleted successfully" }`

---

## Categories

### GET /api/categories

List all categories.

- **Auth:** None
- **Response:** `200` with array of categories

### GET /api/categories/tree

Get category tree (hierarchical with children).

- **Auth:** None
- **Response:** `200` with nested category tree

### GET /api/categories/[id]

Get a single category by ID.

- **Auth:** None
- **Response:** `200` with category data including product count

### GET /api/categories/slug/[slug]

Get a single category by slug.

- **Auth:** None
- **Response:** `200` with category data including products

### POST /api/categories

Create a new category.

- **Auth:** Admin required
- **Body:** `{ "name": "...", "description": "...", "parentId": "uuid?" }`

### PUT /api/categories/[id]

Update a category.

- **Auth:** Admin required

### DELETE /api/categories/[id]

Soft-delete a category.

- **Auth:** Admin required

---

## Cart

### GET /api/cart

Get the current user's cart with items.

- **Auth:** Required
- **Response:** `200`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "items": [{ "id": "uuid", "product": { ... }, "quantity": 2, "unitPrice": 49.99 }],
      "totalAmount": 99.98
    }
  }
  ```

### POST /api/cart/items

Add an item to the cart.

- **Auth:** Required
- **Body:** `{ "productId": "uuid", "quantity": 1 }`
- **Response:** `201`

### PATCH /api/cart/items/[itemId]

Update cart item quantity.

- **Auth:** Required
- **Body:** `{ "quantity": 3 }`

### DELETE /api/cart/items/[itemId]

Remove an item from the cart.

- **Auth:** Required

### DELETE /api/cart

Clear all items from the cart.

- **Auth:** Required

### POST /api/cart/merge

Merge guest cart (from localStorage) into user cart on login.

- **Auth:** Required
- **Body:** `{ "items": [{ "productId": "uuid", "quantity": 2 }] }`

---

## Orders

### POST /api/orders/checkout

Create an order from the current cart.

- **Auth:** Required
- **Body:**
  ```json
  {
    "shippingAddressId": "uuid",
    "notes": "Optional order notes"
  }
  ```
- **Response:** `201`
  ```json
  {
    "success": true,
    "data": {
      "orderId": "uuid",
      "clientSecret": "pi_..._secret_..."
    }
  }
  ```

### GET /api/orders

Get the current user's orders.

- **Auth:** Required
- **Query:** `?page=1&limit=10`
- **Response:** `200` with paginated orders

### GET /api/orders/[id]

Get a single order by ID.

- **Auth:** Required (own orders) or Admin
- **Response:** `200` with full order details including items and payment

### PATCH /api/orders/[id]/status

Update order status.

- **Auth:** Admin required
- **Body:** `{ "status": "Processing" | "Shipped" | "Delivered" | "Cancelled" }`

### GET /api/orders/admin

Get all orders (admin view).

- **Auth:** Admin required
- **Query:** `?page=1&limit=20&status=Pending&search=...`
- **Response:** `200` with paginated orders including user info

---

## Payments

### POST /api/payments/create-intent

Create a Stripe PaymentIntent for checkout.

- **Auth:** Required
- **Rate Limited:** 3 requests per 10 seconds per user
- **Body:** `{ "orderId": "uuid" }`
- **Response:** `200`
  ```json
  {
    "success": true,
    "data": { "clientSecret": "pi_..._secret_..." }
  }
  ```

### POST /api/webhooks/stripe

Stripe webhook endpoint for payment events.

- **Auth:** None (signature verified)
- **Body:** Stripe webhook event JSON
- **Events Handled:** `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Response:** `200` `{ "received": true }`

---

## Reviews

### GET /api/reviews

Get reviews for a product.

- **Auth:** None
- **Query:** `?productId=uuid&page=1&limit=10`
- **Response:** `200` with paginated reviews

### POST /api/reviews

Create a product review.

- **Auth:** Required
- **Body:**
  ```json
  {
    "productId": "uuid",
    "rating": 5,
    "title": "Great product",
    "comment": "Really happy with this purchase."
  }
  ```
- **Response:** `201`
- **Note:** One review per user per product

---

## Wishlist

### GET /api/wishlist

Get the current user's wishlist items.

- **Auth:** Required
- **Response:** `200` with array of wishlist items

### POST /api/wishlist/items

Add a product to the wishlist.

- **Auth:** Required
- **Body:** `{ "productId": "uuid" }`

### DELETE /api/wishlist/items/[itemId]

Remove an item from the wishlist.

- **Auth:** Required

---

## Uploads

### POST /api/uploads

Upload an image to Cloudinary.

- **Auth:** Admin required
- **Rate Limited:** 20 requests per 60 seconds
- **Body:** FormData with `image` field (JPEG, PNG, or WebP, max 5MB)
- **Response:** `200`
  ```json
  {
    "success": true,
    "data": { "url": "https://res.cloudinary.com/...", "publicId": "..." }
  }
  ```

### DELETE /api/uploads

Delete an image from Cloudinary.

- **Auth:** Admin required
- **Body:** `{ "publicId": "cloudinary_public_id" }`

---

## Dashboard

### GET /api/dashboard/metrics

Get admin dashboard metrics.

- **Auth:** Admin required
- **Response:** `200`
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 150,
      "totalOrders": 320,
      "totalRevenue": 45999.50,
      "totalCustomers": 85,
      "recentOrders": [...],
      "lowStockProducts": [...]
    }
  }
  ```
