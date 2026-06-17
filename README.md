# Shopfinity

![Next.js](https://img.shields.io/badge/Next.js-16.2.2-000000?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=flat&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-22.2.1-008CDD?style=flat&logo=stripe)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

A modern full-stack e-commerce platform built with Next.js 16, TypeScript, and PostgreSQL. Features Stripe payments, Cloudinary image management, Resend email delivery, and Sentry monitoring.

---

## Features

- **Product Catalog** — Browsing, search, filtering, sorting, and pagination
- **Category Management** — Hierarchical categories with tree structure
- **Shopping Cart** — Authenticated cart with anonymous-to-logged-in merge
- **Wishlist** — Save products for later
- **Checkout** — Stripe PaymentElement integration with 3D Secure support
- **Order Management** — Full order lifecycle (Pending → Processing → Shipped → Delivered)
- **User Authentication** — Email/password (bcrypt) + Google OAuth via NextAuth.js v5
- **Role-Based Access** — Admin and Customer roles with middleware enforcement
- **Admin Dashboard** — Metrics, product/category/order CRUD, image uploads
- **Product Reviews** — Star ratings with verified purchase tracking
- **Responsive Design** — Tailwind CSS v4, mobile-first layout
- **Email Notifications** — Welcome emails and order confirmations via Resend
- **Error Monitoring** — Sentry integration for errors and performance
- **Rate Limiting** — In-memory token bucket on auth, payment, and upload endpoints
- **SEO Optimized** — Dynamic metadata, sitemap, robots.txt, Open Graph tags
- **Security** — CSP headers, webhook verification, production error masking

---

## Tech Stack

### Framework & Language
- **Next.js 16.2.2** (App Router, React Server Components)
- **TypeScript 5** (strict mode)
- **React 19** with Server Components

### Database & ORM
- **PostgreSQL** via Neon (serverless)
- **Prisma 6.19.3** (ORM with migrations)

### Authentication
- **NextAuth.js v5** (Auth.js beta)
- Credentials provider (bcryptjs)
- Google OAuth provider
- JWT session strategy

### Frontend
- **Tailwind CSS v4** (utility-first CSS)
- **React Hook Form** (form state management)
- **Zod v4** (schema validation)
- **TanStack React Query** (server state)
- **React Hot Toast** (notifications)

### Payments
- **Stripe** (PaymentIntents + PaymentElement)
- Stripe webhooks for payment confirmation

### External Services
- **Cloudinary** (image upload and delivery)
- **Resend** (transactional emails)
- **Sentry** (error monitoring)

### Testing
- **Playwright** (E2E tests — 58 tests across 10 suites)

---

## Architecture

```
Shopfinity/
└── shopfinity-web/          ← Complete Next.js application
    ├── app/                  ← App Router (pages + API routes)
    ├── components/           ← React components
    ├── hooks/                ← Custom React hooks
    ├── lib/                  ← Server libraries (services, validations, errors)
    ├── prisma/               ← Database schema & migrations
    ├── providers/            ← React context providers
    ├── services/             ← Client-side API wrappers
    ├── tests/                ← E2E test suite
    ├── types/                ← TypeScript type definitions
    └── docs/                 ← Documentation
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture diagrams and request flow.

---

## Screenshots

<!-- Add screenshots here -->
<!-- 
![Homepage](screenshots/homepage.png)
![Product Detail](screenshots/product.png)
![Cart](screenshots/cart.png)
![Checkout](screenshots/checkout.png)
![Admin Dashboard](screenshots/admin.png)
-->

---

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+ or **pnpm** 8+
- **PostgreSQL** database (Neon recommended for production)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/shopfinity.git
cd shopfinity/shopfinity-web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# See docs/ENVIRONMENT_VARIABLES.md for all variables
```

---

## Environment Setup

Copy `.env.example` to `.env.local` and configure the following:

```bash
# Required — Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Required — Auth
AUTH_SECRET="your-32-char-base64-secret"

# Optional — Google OAuth
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Optional (required in production) — Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Optional (required in production) — Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Optional (required in production) — Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@example.com"

# Optional — Sentry
SENTRY_DSN="..."
```

See [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for full documentation.

---

## Database Setup

### Initial Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (creates roles, permissions, test users)
npx prisma db seed
```

### Prisma Commands

```bash
npm run prisma:generate    # Generate Prisma client after schema changes
npm run prisma:migrate     # Create and apply a new migration
npm run prisma:push        # Push schema changes without migration
npm run prisma:seed        # Seed the database
npm run prisma:studio      # Open Prisma Studio (GUI database browser)
```

See [docs/DATABASE.md](docs/DATABASE.md) for full schema documentation.

---

## Running Locally

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopfinity.com | Admin123! |
| Customer | test@shopfinity.com | Password123! |

---

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a complete step-by-step deployment guide covering:

1. **Neon** — Database provisioning
2. **Vercel** — Application hosting
3. **Stripe** — Payment setup with webhooks
4. **Cloudinary** — Image storage
5. **Resend** — Email delivery
6. **Google OAuth** — Social login
7. **Sentry** — Error monitoring

---

## Stripe Setup

1. Create a Stripe account
2. Get API keys from Dashboard → Developers → API Keys
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Listen for events: `payment_intent.succeeded`, `payment_intent.payment_failed`

See [docs/PAYMENTS.md](docs/PAYMENTS.md).

---

## Cloudinary Setup

1. Create a Cloudinary account
2. Get Cloud name, API Key, and API Secret from Dashboard
3. Configure upload settings (allowed formats: JPEG, PNG, WebP)

See [docs/UPLOADS.md](docs/UPLOADS.md).

---

## Resend Setup

1. Create a Resend account
2. Verify your domain (SPF, DKIM, DMARC)
3. Create an API key

See [docs/EMAILS.md](docs/EMAILS.md).

---

## Google OAuth Setup

1. Create a project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `https://your-domain.com/api/auth/callback/google`

---

## Testing

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with debug
npm run test:e2e:debug
```

### Manual Testing

See [TESTING.md](TESTING.md) for 15+ manual QA scenarios.  
See [QA_CHECKLIST.md](QA_CHECKLIST.md) for 133 comprehensive test cases.  
See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for deployment sign-off.

---

## Security

- **Password hashing**: bcryptjs with 12 salt rounds
- **JWT encryption**: 32+ character secret, HTTP-only cookies
- **Rate limiting**: Auth (5/min register, 10/min login), payments (3/10s), uploads (20/min)
- **CSP headers**: Strict policy allowing only trusted origins
- **Webhook verification**: Stripe signature verification on all webhooks
- **Error masking**: Internal errors hidden in production
- **RBAC**: Admin middleware guards on all protected routes

See [docs/SECURITY.md](docs/SECURITY.md) for full details.

---

## Performance Optimizations

- React Server Components (minimal client JS)
- Static page generation for public routes
- Dynamic metadata for SEO
- Image optimization (sizes props, remote patterns)
- Skeleton loading states (15 loading.tsx files)
- Error boundaries (13 error.tsx files)
- React Query caching (60s staleTime)
- Stripe loaded only on checkout page
- N+1 query prevention in cart and order services

---

## API Overview

All API routes follow a unified pattern:

```json
// Success response
{ "success": true, "data": { ... }, "message": "..." }

// Error response
{ "success": false, "message": "...", "errors": [...] }
```

**40+ API endpoints** covering:
- Authentication (register, login, session)
- Products (CRUD, search, filter, pagination)
- Categories (CRUD, tree, slug lookup)
- Cart (CRUD, merge guest cart)
- Orders (checkout, status management)
- Wishlist (add, remove, list)
- Reviews (create, list by product)
- Payments (create intent, webhooks)
- Uploads (admin image management)
- Dashboard (admin metrics)

See [docs/API.md](docs/API.md) for the complete API reference.

---

## Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| `prisma generate` fails | Run `npx prisma generate` manually |
| Database connection refused | Check `DATABASE_URL` in `.env.local` |
| Stripe Elements won't load | Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Cannot log in | Check `AUTH_SECRET`, rate limits, user `isActive` |
| Emails not sending | Verify `RESEND_API_KEY` and domain verification |

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for comprehensive troubleshooting.

---

## Project Status

```
Production Readiness:      ████████████░░  90%
Documentation Coverage:    ██████████████  100%
Test Coverage (E2E):       ██████████░░░░  58 tests
Security Posture:          ████████████░░  95%
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code patterns and conventions
- All API routes must use `apiHandler` wrapper
- All inputs must use Zod validation
- Add loading.tsx and error.tsx for new pages
- Maintain the unified response envelope
- Use lazy initialization for external service clients

---

## Documentation Structure

```
docs/
├── ARCHITECTURE.md          # System architecture & request flow
├── API.md                   # Complete API reference (40+ endpoints)
├── DATABASE.md              # Schema, models, relationships, indexes
├── DEPLOYMENT.md            # Production deployment guide
├── ENVIRONMENT_VARIABLES.md  # All 19 environment variables
├── SECURITY.md              # Security measures & best practices
├── AUTHENTICATION.md        # Auth flow, providers, middleware
├── PAYMENTS.md              # Stripe integration details
├── EMAILS.md                # Resend email integration
├── UPLOADS.md               # Cloudinary image management
├── ADMIN_PANEL.md           # Admin dashboard & CRUD interfaces
├── TROUBLESHOOTING.md       # Common issues & solutions
├── CHANGELOG.md             # Full project changelog
└── PROJECT_AUDIT.md         # Complete repository audit
```

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — Framework
- [Prisma](https://prisma.io/) — Database ORM
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [Stripe](https://stripe.com/) — Payments
- [Cloudinary](https://cloudinary.com/) — Image management
- [Resend](https://resend.com/) — Email delivery
- [Sentry](https://sentry.io/) — Error monitoring
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [React Query](https://tanstack.com/query/) — Data fetching
- [Neon](https://neon.tech/) — Serverless PostgreSQL
