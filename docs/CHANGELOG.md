# Changelog

All notable changes to Shopfinity are documented in this file.

---

## Phase 11 — Repository Documentation & Git Hygiene (Current)

### Added
- Production-grade `.gitignore` at repository root with documented sections
- Professional `README.md` with badges, features, tech stack, installation guide
- `docs/` directory with 13 comprehensive documentation files:
  - ARCHITECTURE.md — System overview, request flow, ASCII diagrams
  - API.md — Complete API endpoint reference (40+ endpoints)
  - DATABASE.md — Full schema documentation, ERD relationships, indexes
  - DEPLOYMENT.md — Step-by-step production deployment guide
  - ENVIRONMENT_VARIABLES.md — All 19 env vars with descriptions
  - SECURITY.md — Authentication, CSP, rate limiting, error handling
  - AUTHENTICATION.md — Auth flow, providers, middleware guards
  - PAYMENTS.md — Stripe integration, webhook handling, testing
  - EMAILS.md — Resend integration, templates, async sending
  - UPLOADS.md — Cloudinary integration, validation, API endpoints
  - ADMIN_PANEL.md — Dashboard, CRUD interfaces, RBAC
  - TROUBLESHOOTING.md — Common issues and solutions
  - CHANGELOG.md — This file
  - PROJECT_AUDIT.md — Full repository audit report

---

## Phase 10 — Repository Cleanup

### Removed
- All C# projects (Shopfinity.API, .Application, .Domain, .Infrastructure, .Tests)
- Root-level prisma directory (reference copy — shopfinity-web has its own)
- .agents directory, Shopfinity.sln, plan.md, Complete Folder Structure.md
- Root _config.yml, skills-lock.json, README.md, old .gitignore

### Changed
- Repository structure now contains only `shopfinity-web/` as active project
- New `.gitignore` inside shopfinity-web (Next.js, TS, Prisma, Vercel)

### Verification
- `tsc --noEmit`: 0 errors
- `npm run build`: 43 routes, passed

---

## Phase 9 — Pre-Deployment & Testing

### Added
- E2E Playwright test suite: 58 tests across 10 spec files
- playwright.config.ts, PLAYWRIGHT.md, test helpers
- DEPLOYMENT.md, vercel.json, .env.production.example
- TESTING.md, QA_CHECKLIST.md, PRODUCTION_CHECKLIST.md
- Pre-deployment audit (no console.log, no TODO/FIXME, no test keys)
- Dashboard fix: removed non-existent `dailySales` field

### Changed
- Prisma seed forward env vars for Windows
- CSP headers verified, webhook secret guard added

---

## Phase 8 — Monitoring & Security Hardening

### Added
- Sentry integration (client, server, edge configs)
- Rate limiting: register (5/min), login (10/min), create-intent (3/10s), uploads (20/min)
- Structured logger (lib/logger.ts) replacing all console.error
- `.env.example` updated with AUTH_URL and Sentry vars
- `lib/env.ts` conditional production requirements

### Changed
- All silent `.catch(() => {})` replaced with `logger.error`
- Register route refactored to `apiHandler`
- Webhook route uses `apiHandler`
- Removed `allowDangerousEmailAccountLinking` from Google OAuth

### Security
- CSP headers in next.config.ts
- `handleApiError` masks internal messages in production
- Webhook signature verification

---

## Phase 7 — Frontend Polish & SEO

### Added
- Error boundaries: 13 context-specific error.tsx files
- Loading states: 15 loading.tsx with skeleton loaders
- Dynamic metadata for product + category pages
- sitemap.ts, robots.ts
- Image optimization: unoptimized flag, sizes props

### Changed
- Category pages split into server wrapper + client component

---

## Phase 6 — Admin Dashboard & Checkout

### Added
- Admin dashboard with metrics aggregation
- Checkout form with shipping address + notes
- 2-step checkout page
- Order success page
- Stripe payment integration (create-intent, webhooks)
- Cloudinary upload integration

---

## Phase 5 — Core E-Commerce Features

### Added
- Product CRUD with search, filter, sort, pagination
- Category management with tree structure
- Cart system (authenticated + merge from anonymous)
- Wishlist functionality
- Order management with status workflow
- Review system with ratings

---

## Phase 4 — Service Layer & API Architecture

### Added
- Service layer: cart, category, order, product, review, wishlist services
- Shared helpers: ensureSlugUnique, findByIdOrThrow, findBySlugOrThrow
- Unified API handler with auth guards
- Zod validation schemas for all domains
- Unified response envelope `{ success, data, message, errors? }`
- Error classes: NotFoundError, ConflictError, etc.

---

## Phase 3 — Database & Auth Foundation

### Added
- Full Prisma schema: 22 models, 8 enums, 57 indexes
- Auth system: NextAuth v5 with credentials + Google OAuth
- PrismaAdapter for user/account storage
- JWT session strategy
- Route guarding middleware
- Registration with bcrypt hashing
- Seed script: 3 roles, 120 permissions, test users

---

## Phase 2 — Project Setup

### Added
- Next.js 16 App Router with TypeScript
- Tailwind CSS v4
- Prisma ORM v6 with PostgreSQL
- Project structure: app/, lib/, components/, hooks/, services/
- Root layout with providers (Auth, Query)
- env.ts with Zod validation

---

## Phase 1 — Initial Migration

### Added
- Migration from ASP.NET Core Clean Architecture to Next.js
- Initial project scaffolding
- Basic e-commerce data models
