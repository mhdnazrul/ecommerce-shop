# Security

## Overview

Shopfinity implements multiple layers of security covering authentication, authorization, data validation, rate limiting, and secure communication.

---

## Authentication Security

### Password Hashing
- **Algorithm:** bcryptjs with 12 salt rounds
- Passwords are hashed before storage; plaintext is never persisted
- Comparison uses bcryptjs.compare() (constant-time comparison)

### JWT Security
- **Algorithm:** HS256 (default by NextAuth.js)
- **Secret:** 32+ character base64 string (`AUTH_SECRET`)
- **Token storage:** HTTP-only cookies (not accessible via JavaScript)
- **Max age:** 24 hours
- **Session strategy:** JWT (not database sessions) — no server-side session store

### OAuth Security
- Google OAuth uses standard OAuth 2.0 flow
- `allowDangerousEmailAccountLinking` is **not enabled** — prevents account hijacking where an attacker creates a Google account matching an existing email
- New Google users are assigned the minimal "customer" role

### Rate Limiting (Authentication)
| Endpoint | Limit |
|----------|-------|
| Registration (`/api/auth/register`) | 5 requests per 60 seconds per IP |
| Credentials login (via NextAuth) | 10 requests per 60 seconds per IP |

---

## Authorization

### Role-Based Access Control (RBAC)

Three roles are seeded:
| Role | Permissions |
|------|-------------|
| **Admin** | All 120 permissions across all 15 resources |
| **Customer** | Read on products/categories, write on cart/wishlist/reviews/orders |
| **Manager** | Reserved for future use |

### Middleware Guards

- **Admin routes** (`/admin/*`): Requires authenticated session with `roles` array containing "Admin"
- **Protected user routes** (`/cart`, `/checkout`, `/orders`, `/wishlist`): Requires any authenticated session
- **API routes**: Most require authentication via the `apiHandler` wrapper with `requireAuth: true` or `requireAdmin: true`

### API Handler Guards

```typescript
// Authenticated endpoint
apiHandler(handler, { requireAuth: true })

// Admin-only endpoint
apiHandler(handler, { requireAdmin: true })
```

---

## Input Validation

### Server-Side (Zod)
- All API inputs are validated with Zod schemas
- `validateSchema(schema, data)` throws `ValidationError` on failure with all error messages
- Validation covers: email format, password strength, required fields, number ranges, string lengths

### Client-Side (React Hook Form + Zod)
- Forms validate on submit (and optionally on change)
- Client-side validation mirrors server-side rules
- Server-side validation is final — client validation is for UX only

---

## Content Security Policy (CSP)

CSP headers are applied globally via `next.config.ts`:

| Directive | Sources |
|-----------|---------|
| `default-src` | `'self'` |
| `script-src` | `'self'`, `'unsafe-eval'`, `'unsafe-inline'`, Stripe CDN, Google Maps |
| `style-src` | `'self'`, `'unsafe-inline'`, Google Fonts |
| `img-src` | `'self'`, `data:`, `blob:`, `https:`, `http://localhost:*` |
| `font-src` | `'self'`, Google Fonts |
| `frame-src` | `'self'`, Stripe |
| `connect-src` | `'self'`, Stripe, Cloudinary, Resend, Sentry |
| `worker-src` | `'self'`, `blob:` |

---

## Stripe Webhook Verification

- All incoming Stripe webhooks are verified using `stripe.webhooks.constructEvent()`
- Requires `STRIPE_WEBHOOK_SECRET` to be configured (throws at runtime if missing)
- Signature verification happens **before** any business logic, in a raw body handler
- Verified events:
  - `payment_intent.succeeded` — marks order as paid, sends confirmation email
  - `payment_intent.payment_failed` — marks payment as failed, records error

---

## Error Handling

### Production Error Masking
- `handleApiError()` in `lib/errors/index.ts` uses a **production-safe handler**
- Internal error messages are replaced with "Internal server error" when `NODE_ENV === "production"`
- Stack traces are only logged server-side, never sent to the client
- Structured errors return: `{ success: false, message: "..." }`

### Application Error Classes
| Class | Status | Usage |
|-------|--------|-------|
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate resource |
| `UnauthorizedError` | 401 | Missing authentication |
| `ForbiddenError` | 403 | Insufficient permissions |
| `ValidationError` | 400 | Invalid input data |

---

## Rate Limiting

### Architecture
- **Storage:** In-memory `Map<string, Entry>` (token bucket algorithm)
- **Cleanup:** `setInterval` every 60 seconds removes expired entries
- **Keying:** By IP address for auth/upload endpoints, by userId for payment endpoints
- **Limitation:** In-memory — resets on server restart. Acceptable for single-region Vercel deployment

### Rate Limits by Endpoint
| Endpoint | Limit | Key |
|----------|-------|-----|
| POST /api/auth/register | 5 per 60s | IP |
| Credentials login | 10 per 60s | IP |
| POST /api/payments/create-intent | 3 per 10s | User ID |
| POST /api/uploads | 20 per 60s | IP |

### Response
Rate-limited requests receive:
- **Status:** `429 Too Many Requests`
- **Header:** `Retry-After: <seconds>`
- **Body:** `{ "success": false, "message": "Too many requests. Please try again later." }`

---

## Data Protection

### Soft Deletes
- `isDeleted: boolean` on User, Product, Category, Address, ProductReview models
- Queries always filter `isDeleted: false` (handled in service layer)
- Hard deletes are never used for business data

### Input Sanitization
- Product name, description, and other text fields are validated for length
- Image uploads are validated for type (JPEG/PNG/WebP only) and size (max 5MB)
- URLs are generated server-side (from Cloudinary), never accepted from user input

### Database
- PostgreSQL connection uses SSL (enforced by Neon)
- Connection pooling via PgBouncer for production
- Prisma prepared statements prevent SQL injection

---

## Dependency Security

- All dependencies are specified with exact or caret ranges in `package.json`
- TypeScript strict mode enabled
- Regular `npm audit` recommended as part of CI/CD pipeline
- No deprecated packages with known CVEs are used

---

## Monitoring

- **Sentry:** Captures unhandled exceptions, API errors, and performance data
- **Logger:** Structured logging (`lib/logger.ts`) with timestamp, level, and context
- **Global handlers:** `unhandledRejection` and `uncaughtException` are caught in `instrumentation.ts`
- **CORS:** Not applicable — same-origin architecture (no separate API server)

---

## Security Checklist

- [x] Password hashing with bcrypt (12 rounds)
- [x] JWT with strong secret (32+ chars)
- [x] Rate limiting on auth endpoints
- [x] CSP headers configured
- [x] Stripe webhook signature verification
- [x] Input validation on all API endpoints
- [x] Production error masking
- [x] Role-based access control
- [x] HTTP-only session cookies
- [x] No dangerous email account linking
- [x] PostgreSQL SSL connection
- [x] Prepared statements (Prisma)
- [x] Image upload type/size validation
- [x] Unhandled rejection/exception handlers
- [x] Sentry error monitoring
