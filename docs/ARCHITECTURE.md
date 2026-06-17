# Architecture

## System Overview

Shopfinity is a full-stack e-commerce platform built with Next.js 16 (App Router), TypeScript, and PostgreSQL. It follows a **service-oriented architecture** with clear separation between API routes, business logic services, data access (Prisma ORM), and presentation (React Server Components + Client Components).

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Next.js  │  │ React    │  │ TanStack │  │ Stripe     │ │
│  │ Pages    │  │ Hook Form│  │ Query    │  │ Elements   │ │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────┬─────┘ │
└───────┼────────────────────────────────────────────┼───────┘
        │                                            │
┌───────┼────────────────────────────────────────────┼───────┐
│       ▼                                            ▼       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Route Handlers                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ Auth     │ │ Products │ │ Orders   │ │ Cart   │  │  │
│  │  │ /api/auth│ │ /api/prod│ │ /api/ord │ │ /api/ca│  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ Wishlist │ │ Reviews  │ │ Uploads  │ │Payments│  │  │
│  │  │ /api/wis │ │ /api/rev │ │ /api/upl │ │ /api/pa│  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │  │
│  └───────┼────────────┼────────────┼────────────┼────────┘  │
│          ▼            ▼            ▼            ▼           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Service Layer (lib/services/)          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ Cart     │ │ Category │ │ Order    │ │ Product│  │  │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service│  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │  │
│  │  │ Review   │ │ Wishlist │ │ Shared (helpers)     │  │  │
│  │  │ Service  │ │ Service  │ │ (slug, find, cache)  │  │  │
│  │  └────┬─────┘ └────┬─────┘ └──────────────────────┘  │  │
│  └───────┼────────────┼──────────────────────────────────┘  │
│          ▼            ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Access Layer (Prisma)               │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │              PostgreSQL (Neon)                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              External Services                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ Stripe   │ │Cloudinary│ │  Resend  │ │ Sentry │  │  │
│  │  │ Payments │ │  Images  │ │  Emails  │ │Monitor │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                    Next.js Server                          │
└────────────────────────────────────────────────────────────┘
```

## Request Flow

### Authenticated API Request

```
1. Browser → Next.js Server
2. Middleware checks route permissions (see AUTHENTICATION.md)
3. Route Handler receives request
4. apiHandler wrapper validates auth (if requireAuth/requireAdmin)
5. Zod schema validation via validateSchema()
6. Service layer executes business logic
7. Prisma queries PostgreSQL
8. Structured response: { success, data, message, errors? }
9. Error → handleApiError() masks internals in production
```

### Public API Request

```
1. Browser → Next.js Server
2. Middleware allows public routes through
3. Route Handler processes public request
4. Service layer executes read/write
5. Structured response returned
```

## Authentication Flow

```
                    ┌───────────────┐
                    │  Login Page   │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Credentials  │  Google OAuth
                    │  or Google    │──────────────┐
                    └───────┬───────┘              │
                            │                      │
                    ┌───────▼───────┐     ┌────────▼────────┐
                    │  Credentials  │     │  Google OAuth    │
                    │  authorize()  │     │  callback        │
                    │  bcrypt check │     │  account linking │
                    │  rate limited │     │  role assignment │
                    └───────┬───────┘     └────────┬────────┘
                            │                      │
                    ┌───────▼──────────────────────▼────────┐
                    │         JWT Created / Updated          │
                    │  { id, email, name, image, roles[] }  │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │     Session Callback (each request)    │
                    │  JWT → token.id, token.roles           │
                    │  JWT → session.user.id, session.roles  │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │   Middleware checks session cookie     │
                    │   Routes protected/redirected          │
                    └───────────────────────────────────────┘
```

## Checkout Flow

```
                    ┌───────────────┐
                    │  Cart Page    │
                    └───────┬───────┘
                            │ "Proceed to Checkout"
                    ┌───────▼───────┐
                    │  Checkout     │ (auth required)
                    │  Page         │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼────────┐   │   ┌─────────▼────────┐
    │ Shipping Address │   │   │  Order Notes     │
    │ Form             │   │   │  (optional)      │
    └─────────┬────────┘   │   └──────────────────┘
              │             │
    ┌─────────▼─────────────▼──────────────────────┐
    │         POST /api/orders/checkout             │
    │  Creates Order (Pending), PaymentIntent       │
    │  Returns { orderId, clientSecret }            │
    └─────────────────────┬────────────────────────┘
                          │
    ┌─────────────────────▼────────────────────────┐
    │         Stripe PaymentElement                 │
    │  Client confirms payment with Stripe.js       │
    │  Stripe processes card / payment method       │
    └──────────┬────────────────────────┬───────────┘
               │                        │
    ┌──────────▼──────────┐  ┌─────────▼──────────┐
    │  Payment Succeeded  │  │  Payment Failed     │
    │  redirect →          │  │  stay on checkout  │
    │  /orders/success/:id │  │  show error        │
    └─────────────────────┘  └────────────────────┘
               │
    ┌──────────▼──────────────────────────┐
    │  POST /api/webhooks/stripe          │
    │  payment_intent.succeeded event     │
    │  → status: Succeeded, order: Paid   │
    │  → send order confirmation email    │
    └─────────────────────────────────────┘
```

## Payment Flow

```
PaymentIntent Creation:
  1. Client requests POST /api/payments/create-intent
  2. Rate limited (3 req/10s per user)
  3. Creates Stripe Customer (if not exists)
  4. Creates Stripe PaymentIntent with amount, currency, metadata
  5. Stores PaymentIntent record in database
  6. Returns clientSecret to client

Payment Confirmation (client-side):
  1. StripeProvider wraps PaymentElement
  2. User submits card details
  3. stripe.confirmPayment() called with return_url
  4. Stripe processes payment
  5. On success: redirect to /orders/success/:id
  6. On failure: show error on checkout page

Payment Webhook (server-side):
  1. Stripe sends webhook event
  2. Signature verified via STRIPE_WEBHOOK_SECRET
  3. payment_intent.succeeded → update PaymentIntent status, order status
  4. payment_intent.payment_failed → update PaymentIntent status, record failure
  5. Idempotent: checks existing status before processing
  6. Sends order confirmation email on success
```

## Email Flow

```
Email sending is asynchronous and non-blocking:

  1. Business event occurs (registration, order placed)
  2. Email function is called without await
  3. If Resend API call fails, error is logged via logger.error
  4. Primary request flow is never blocked by email

  Registration → sendWelcomeEmail()  (fire-and-forget)
  Order placed → sendOrderConfirmationEmail()  (fire-and-forget)
```

## Upload Flow

```
1. Admin uploads image via ImageUpload component
2. Client-side: validates type (JPEG/PNG/WebP) and size (max 5MB)
3. POST /api/uploads (admin-only, rate limited 20 req/min)
4. Server-side: validates again, uploads to Cloudinary
5. Returns { url, publicId }
6. Admin uses URL in product/category forms

Delete:
1. DELETE /api/uploads with { publicId } in body
2. Admin-only, destroys image on Cloudinary
```

## Service Layer

Each domain has a service module in `lib/services/` that encapsulates all database operations:

| Service | File | Key Operations |
|---------|------|----------------|
| Cart | `cart-service.ts` | getCart, addItem, updateItem, removeItem, clearCart, mergeCart, getCartCount |
| Category | `category-service.ts` | getAll, getById, getBySlug, create, update, softDelete, getTree |
| Order | `order-service.ts` | createOrder, getUserOrders, getAllOrders, getOrderById, updateStatus, cancelOrder |
| Product | `product-service.ts` | getAll, getById, getBySlug, create, update, softDelete, search |
| Review | `review-service.ts` | getProductReviews, create, getReviewById |
| Wishlist | `wishlist-service.ts` | getWishlist, addItem, removeItem |

**Shared helpers** (`lib/services/shared.ts`):
- `ensureSlugUnique(model, slug, id?)` — generates unique slugs
- `findByIdOrThrow(model, id)` — finds by ID or throws NotFoundError
- `findBySlugOrThrow(model, slug)` — finds by slug or throws NotFoundError

## API Architecture

All API routes follow a consistent pattern:

```typescript
// Pattern for all API routes
import { NextRequest } from "next/server"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"
import { mySchema } from "@/lib/validations/my"

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validateSchema(mySchema, body)
  
  const result = await myService.create(data)
  
  return NextResponse.json(
    { success: true, data: result, message: "Created successfully" },
    { status: 201 }
  )
}, { requireAuth: true })
```

### Unified Response Envelope

All API responses follow this structure:

```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, message: string, errors?: string[] }
```

HTTP status codes carry the real status; `statusCode` is NOT duplicated in the response body.

## External Service Initialization

All external API clients use **lazy singleton initialization** to prevent build-time failures:

```typescript
// Pattern for all external clients
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true })
  }
  return stripeInstance
}
```

This ensures that missing environment variables during build do not crash the application. Services throw only when actually called at runtime.
