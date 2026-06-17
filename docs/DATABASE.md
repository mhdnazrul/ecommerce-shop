# Database Schema

**Database:** PostgreSQL (via Neon)  
**ORM:** Prisma 6.19.3  
**Naming Convention:** snake_case (table names), camelCase (model names)

---

## Enums

### OrderStatus
| Value | Description |
|-------|-------------|
| `Pending` | Order created, awaiting payment |
| `Processing` | Payment confirmed, preparing shipment |
| `Shipped` | Dispatched to customer |
| `Delivered` | Received by customer |
| `Cancelled` | Order cancelled |

### PaymentStatus
| Value | Description |
|-------|-------------|
| `Pending` | Initial state |
| `RequiresPayment` | Awaiting payment method |
| `RequiresConfirmation` | Awaiting confirmation |
| `RequiresAction` | Additional authentication needed (e.g., 3D Secure) |
| `Processing` | Payment being processed |
| `Succeeded` | Payment successful |
| `Failed` | Payment failed |
| `Refunded` | Fully refunded |
| `PartiallyRefunded` | Partially refunded |
| `Canceled` | Payment cancelled |

### PaymentProvider
| Value | Description |
|-------|-------------|
| `Stripe` | Stripe payment processor |
| `PayPal` | PayPal (reserved for future use) |

### InventoryTransactionType
| Value | Description |
|-------|-------------|
| `Purchase` | Stock inbound from supplier |
| `Sale` | Stock outbound to customer |
| `Adjustment` | Manual stock correction |
| `Return` | Customer return |
| `Transfer` | Between warehouses |
| `WriteOff` | Damaged/lost stock |

### AuditAction
| Value | Description |
|-------|-------------|
| `Create`, `Update`, `Delete`, `Restore` | CRUD operations |
| `Login`, `Logout`, `FailedLogin` | Authentication events |
| `PasswordChange`, `StatusChange` | Account changes |
| `Export`, `Import` | Data operations |
| `AssignRole`, `RevokeRole`, `PermissionChange` | RBAC changes |

### PermissionResource
| Value | Description |
|-------|-------------|
| `Product`, `Category`, `Order`, `User`, `Role`, `Permission` | Core entities |
| `Cart`, `Wishlist`, `Review`, `Upload` | Feature entities |
| `Inventory`, `Settings`, `Dashboard`, `AuditLog`, `Payment` | System entities |

### PermissionAction
| Value | Description |
|-------|-------------|
| `Create`, `Read`, `Update`, `Delete` | Basic CRUD |
| `Manage`, `Approve`, `Export`, `Import` | Extended actions |

---

## Models

### User (`users`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default uuid_generate_v4() | Primary key |
| `email` | String | Unique, not null | User email address |
| `emailVerified` | DateTime? | Nullable | Email verification timestamp |
| `passwordHash` | String? | Nullable | bcrypt hash (null for OAuth-only users) |
| `firstName` | String(100) | Not null | First name |
| `lastName` | String(100) | Not null | Last name |
| `image` | String? | Nullable | Profile image URL |
| `phoneNumber` | String(20)? | Nullable | Phone number |
| `isActive` | Boolean | Default true | Account active flag |
| `isDeleted` | Boolean | Default false | Soft delete flag |
| `lastLoginAt` | DateTime? | Nullable | Last successful login |
| `createdAt` | DateTime | Default now() | Creation timestamp |
| `updatedAt` | DateTime | Auto updated | Last update timestamp |

**Indexes:** `email` (unique), `isActive`, `isDeleted`  
**Relations:** Accounts, Sessions, UserRoles, Addresses, Carts, Orders, WishlistItems, Reviews, RefreshTokens, AuditLogs, InventoryTransactions, StripeCustomer

### Account (`accounts`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `type` | String | Not null |
| `provider` | String | Not null |
| `providerAccountId` | String | Not null |
| `refresh_token` | String? | |
| `access_token` | String? | |
| `expires_at` | Int? | |
| `token_type` | String? | |
| `scope` | String? | |
| `id_token` | String? | |
| `session_state` | String? | |

**Indexes:** `userId`, unique on `[provider, providerAccountId]`

### Session (`sessions`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `sessionToken` | String | Unique |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `expires` | DateTime | Not null |

### VerificationToken (`verification_tokens`)

| Column | Type | Constraints |
|--------|------|-------------|
| `identifier` | String | Not null |
| `token` | String | Unique |
| `expires` | DateTime | Not null |

**Indexes:** Unique on `[identifier, token]`

### Role (`roles`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `name` | String(50) | Unique |
| `slug` | String(50) | Unique |
| `description` | String(200)? | |
| `isSystem` | Boolean | Default false |
| `createdAt` | DateTime | Default now() |
| `updatedAt` | DateTime | Auto updated |

**Relations:** UserRoles, RolePermissions

### UserRole (`user_roles`)

| Column | Type | Constraints |
|--------|------|-------------|
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `roleId` | String | FK → roles.id, onDelete: Cascade |
| `assignedAt` | DateTime | Default now() |
| `assignedBy` | String? | |

**Indexes:** Composite PK `[userId, roleId]`, `roleId`

### Permission (`permissions`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `resource` | PermissionResource enum | Not null |
| `action` | PermissionAction enum | Not null |
| `description` | String(200)? | |
| `createdAt` | DateTime | Default now() |

**Indexes:** Unique on `[resource, action]`, `resource`

### RolePermission (`role_permissions`)

| Column | Type | Constraints |
|--------|------|-------------|
| `roleId` | String | FK → roles.id, onDelete: Cascade |
| `permissionId` | String | FK → permissions.id, onDelete: Cascade |
| `createdAt` | DateTime | Default now() |

**Indexes:** Composite PK `[roleId, permissionId]`, `permissionId`

### RefreshToken (`refresh_tokens`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `token` | String(500) | Unique |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `family` | String(100) | Refresh token family |
| `expiresAt` | DateTime | Not null |
| `isRevoked` | Boolean | Default false |
| `deviceInfo` | String(500)? | |
| `ipAddress` | String(45)? | |
| `createdAt` | DateTime | Default now() |
| `revokedAt` | DateTime? | |

**Indexes:** `userId`, `token`, `family`, `expiresAt`

### Address (`addresses`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `label` | String(50)? | e.g., "Home", "Office" |
| `firstName` | String(100) | |
| `lastName` | String(100) | |
| `line1` | String(255) | Street address |
| `line2` | String(255)? | Apartment, suite, etc. |
| `city` | String(100) | |
| `state` | String(100) | |
| `postalCode` | String(20) | |
| `country` | String(2) | Default "US", ISO 3166-1 alpha-2 |
| `phone` | String(20)? | |
| `isDefault` | Boolean | Default false |
| `isDeleted` | Boolean | Default false |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `userId`, `isDefault`

### Category (`categories`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | String(100) | |
| `slug` | String(150) | Unique |
| `description` | Text? | |
| `imageUrl` | String? | |
| `displayOrder` | Int | Default 0 |
| `parentId` | UUID? | Self FK → categories.id |
| `isDeleted` | Boolean | Default false |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `slug` (unique), `parentId`, `displayOrder`  
**Relations:** Parent/children (self-relation), Products

### Product (`products`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | String(500) | |
| `slug` | String(500) | Unique |
| `description` | Text? | |
| `shortDescription` | String(300)? | |
| `price` | Decimal(18,2) | |
| `compareAtPrice` | Decimal(18,2)? | Original/comparison price |
| `costPrice` | Decimal(18,2)? | Cost for margin calculation |
| `stockQuantity` | Int | Default 0 |
| `sku` | String(100) | Unique |
| `barcode` | String(100)? | |
| `weight` | Decimal(10,2)? | |
| `imageUrl` | String? | Primary image |
| `images` | String[] | All product images |
| `tags` | String[] | Search/filter tags |
| `isFeatured` | Boolean | Default false |
| `isPublished` | Boolean | Default true |
| `isDeleted` | Boolean | Default false |
| `rowVersion` | Int | Default 1, optimistic concurrency |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `categoryId` | UUID | FK → categories.id |

**Indexes:** `name`, `categoryId`, `slug` (unique), `price`, `sku` (unique), `isPublished`, `isFeatured`, `isDeleted`  
**Relations:** Category, CartItems, OrderItems, WishlistItems, Reviews, InventoryTransactions

### Cart (`carts`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | Unique, FK → users.id, onDelete: Cascade |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations:** User (one-to-one), CartItems

### CartItem (`cart_items`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `cartId` | UUID | FK → carts.id, onDelete: Cascade |
| `productId` | UUID | FK → products.id |
| `quantity` | Int | Default 1 |
| `unitPrice` | Decimal(18,2) | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** Unique on `[cartId, productId]`, `productId`

### Order (`orders`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `orderNumber` | String(50) | Unique |
| `userId` | UUID | FK → users.id |
| `status` | OrderStatus | Default Pending |
| `totalAmount` | Decimal(18,2) | |
| `subtotal` | Decimal(18,2) | |
| `shippingCost` | Decimal(18,2) | Default 0 |
| `taxAmount` | Decimal(18,2) | Default 0 |
| `discountAmount` | Decimal(18,2) | Default 0 |
| `currency` | String(3) | Default "USD" |
| `idempotencyKey` | String(100) | Unique |
| `notes` | Text? | |
| `shippingAddressId` | UUID? | FK → addresses.id |
| `paidAt` | DateTime? | |
| `shippedAt` | DateTime? | |
| `deliveredAt` | DateTime? | |
| `cancelledAt` | DateTime? | |
| `cancelReason` | String(500)? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `userId`, `status`, `orderNumber` (unique), `createdAt`  
**Relations:** User, ShippingAddress, OrderItems, PaymentIntent

### OrderItem (`order_items`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `orderId` | UUID | FK → orders.id, onDelete: Cascade |
| `productId` | UUID | FK → products.id, onDelete: Restrict |
| `quantity` | Int | |
| `unitPrice` | Decimal(18,2) | |
| `totalPrice` | Decimal(18,2) | |
| `createdAt` | DateTime | |

**Indexes:** `orderId`, `productId`

### PaymentIntent (`payment_intents`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `orderId` | UUID | Unique, FK → orders.id |
| `stripePaymentIntentId` | String(100) | Unique |
| `stripeClientSecret` | String(255) | |
| `provider` | PaymentProvider | Default Stripe |
| `status` | PaymentStatus | Default Pending |
| `amount` | Decimal(18,2) | |
| `currency` | String(3) | Default "usd" |
| `metadata` | Json? | Stripe metadata |
| `failureMessage` | String(500)? | |
| `paidAt` | DateTime? | |
| `refundedAt` | DateTime? | |
| `refundAmount` | Decimal(18,2)? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `stripePaymentIntentId` (unique), `status`  
**Relations:** Order, PaymentCharges

### PaymentCharge (`payment_charges`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `paymentIntentId` | String | FK → payment_intents.id, onDelete: Cascade |
| `stripeChargeId` | String(100) | Unique |
| `amount` | Decimal(18,2) | |
| `currency` | String(3) | Default "usd" |
| `description` | String(255)? | |
| `receiptUrl` | String(500)? | |
| `refunded` | Boolean | Default false |
| `refundAmount` | Decimal(18,2)? | |
| `status` | String(50) | |
| `failureCode` | String(100)? | |
| `failureMessage` | String(500)? | |
| `createdAt` | DateTime | |

**Indexes:** `paymentIntentId`, `stripeChargeId` (unique)

### StripeCustomer (`stripe_customers`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `userId` | UUID | Unique, FK → users.id, onDelete: Cascade |
| `stripeCustomerId` | String(100) | Unique |
| `paymentMethods` | Json? | Cached payment methods |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

### WishlistItem (`wishlist_items`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `productId` | UUID | FK → products.id |
| `createdAt` | DateTime | |

**Indexes:** Unique on `[userId, productId]`, `productId`

### ProductReview (`product_reviews`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → users.id, onDelete: Cascade |
| `userName` | String(100) | |
| `productId` | UUID | FK → products.id |
| `rating` | SmallInt | 1-5 |
| `title` | String(100)? | |
| `comment` | String(2000)? | |
| `isVerifiedPurchase` | Boolean | Default false |
| `isDeleted` | Boolean | Default false |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** Unique on `[userId, productId]`, `productId`, `rating`

### InventoryTransaction (`inventory_transactions`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `productId` | UUID | FK → products.id |
| `type` | InventoryTransactionType | |
| `quantity` | Int | |
| `reference` | String(100)? | |
| `reason` | String(500)? | |
| `stockBefore` | Int | |
| `stockAfter` | Int | |
| `unitCost` | Decimal(18,2)? | |
| `createdById` | UUID? | FK → users.id |
| `createdAt` | DateTime | |

**Indexes:** `productId`, `type`, `createdAt`, `reference`

### AuditLog (`audit_logs`)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | String | PK (cuid) |
| `userId` | UUID? | FK → users.id (affected user) |
| `actorId` | UUID? | FK → users.id (who performed action) |
| `action` | AuditAction | |
| `resource` | String(50) | |
| `resourceId` | String(100)? | |
| `description` | Text? | |
| `changes` | Json? | Before/after diff |
| `ipAddress` | String(45)? | |
| `userAgent` | String(500)? | |
| `metadata` | Json? | |
| `severity` | String(20) | Default "info" |
| `createdAt` | DateTime | |

**Indexes:** `userId`, `actorId`, `action`, `resource`, `resourceId`, `createdAt`, `severity`

---

## Entity Relationship Summary

```
User ──1:N── Address
User ──1:N── Order
User ──1:1── Cart
User ──1:N── WishlistItem
User ──1:N── ProductReview
User ──1:N── RefreshToken
User ──1:N── AuditLog (as user or actor)
User ──1:1── StripeCustomer
User ──1:N── Account
User ──1:N── Session
User ──N:M── Role (via UserRole)
Role ──N:M── Permission (via RolePermission)

Category ──1:N── Product
Category ──1:N── Category (self: parent/children)

Product ──1:N── CartItem
Product ──1:N── OrderItem
Product ──1:N── WishlistItem
Product ──1:N── ProductReview
Product ──1:N── InventoryTransaction

Cart ──1:N── CartItem
Order ──1:N── OrderItem
Order ──1:1── PaymentIntent
Order ──N:1── Address (as shipping address)

PaymentIntent ──1:N── PaymentCharge
```

## Key Design Decisions

1. **UUID primary keys** — Compatible with ASP.NET Identity GUIDs for migration scenarios
2. **Soft deletes** — `isDeleted: false` on User, Product, Category, Address, Review. No Prisma middleware needed
3. **CUID for system tables** — Role, Permission, Account, Session, RefreshToken, PaymentIntent, PaymentCharge, StripeCustomer, AuditLog use cuid() for shorter IDs where UUID is unnecessary
4. **57 indexes** — Optimized for query patterns including search, filtering, sorting, and relationship traversal
5. **Cascade deletes** — Owned entities (cart items, order items, addresses) cascade. Products use Restrict to prevent accidental deletion of ordered products
6. **Optimistic concurrency** — Product has `rowVersion` field for conflict detection
7. **Idempotency** — Order has `idempotencyKey` (unique) to prevent duplicate order creation
