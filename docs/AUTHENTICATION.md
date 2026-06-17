# Authentication

## Overview

Shopfinity uses **NextAuth.js v5 (Auth.js)** with a **JWT session strategy**. Authentication is handled through:

- **Credentials provider** — Email + password with bcryptjs hashing
- **Google OAuth provider** — Social login via Google

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NextAuth.js Config                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  auth.ts                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │  Credentials │  │  Google      │  │ Prisma     │ │   │
│  │  │  Provider    │  │  OAuth       │  │ Adapter    │ │   │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │   │
│  │         │                 │                 │        │   │
│  │  ┌──────▼─────────────────▼─────────────────▼──────┐ │   │
│  │  │              JWT Callbacks                       │ │   │
│  │  │  signIn → jwt → session → middleware             │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  auth.config.ts (Edge-safe, used by middleware)       │   │
│  │  - pages: signIn, error                              │   │
│  │  - callbacks: session (edge-safe subset)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Files

| File | Purpose |
|------|---------|
| `auth.ts` | Main NextAuth config — providers, adapter, callbacks, events |
| `auth.config.ts` | Edge-compatible subset — used by middleware (no Prisma adapter, no bcrypt) |
| `middleware.ts` | Route protection based on auth state and roles |

## Session Strategy

**JWT strategy** is used (not database sessions):

- Tokens are stored in HTTP-only cookies (`next-auth.session-token`)
- JWT max age: **24 hours**
- Session user includes: `{ id, name, email, image, roles[] }`

## Route Protection (Middleware)

The middleware (`middleware.ts`) applies the following rules:

| Route Pattern | Access |
|---------------|--------|
| `/`, `/login`, `/register`, `/products`, `/categories` | Public |
| `/api/auth/*`, `/api/webhooks/*` | Public |
| `/api/products/*`, `/api/categories/*` | Public (read) |
| `/cart`, `/checkout`, `/orders`, `/wishlist` | Authenticated only |
| `/admin/*` | Admin role only |
| `/api/*` (other API routes) | Authenticated (returns 401 JSON) |

Unauthenticated users accessing protected routes are redirected to `/login?callbackUrl=...`.

Non-admin users accessing `/admin/*` are redirected to `/?error=forbidden`.

## Registration Flow

```
1. User submits registration form (POST /api/auth/register)
2. Rate limited: 5 requests per 60 seconds per IP
3. Zod validation (email format, password strength, name required)
4. Check for existing email → 409 Conflict if exists
5. Hash password with bcryptjs (12 salt rounds)
6. Create user in database with "customer" role
7. Return 201 with user data (no session token — user must log in)
8. Fire-and-forget: send welcome email via Resend
```

## Sign-In Flow

### Credentials

```
1. User submits email + password
2. Rate limited: 10 requests per 60 seconds per IP
3. Look up user by email (include roles)
4. Compare password hash with bcryptjs.compare()
5. Check user.isActive flag
6. Update lastLoginAt (fire-and-forget)
7. NextAuth creates JWT with { id, email, name, image, roles }
```

### Google OAuth

```
1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. On callback:
   a. If user exists with same email → link account (no allowDangerousEmailAccountLinking)
   b. If new user → create account, assign "customer" role
4. JWT created with user data
```

## JWT Callback Flow

```
signIn() → jwt() → session() → middleware.session()

jwt() callback:
  - On sign-in: adds user.id and user.roles[] to token
  - On subsequent requests: returns existing token

session() callback:
  - Copies token.id and token.roles to session.user
  - Ensures session.user.roles is always an array
```

## Type Augmentation

TypeScript types are augmented in `types/next-auth.d.ts`:

```typescript
declare module "next-auth" {
  interface User { roles?: string[] }
  interface Session {
    user: { id: string; roles: string[] } & DefaultSession["user"]
  }
}
declare module "next-auth/jwt" {
  interface JWT { id: string; roles: string[] }
}
```

## Security Measures

- **Rate limiting** on login (10/min/IP) and registration (5/min/IP)
- **bcryptjs** with 12 salt rounds for password hashing
- **JWT encryption** via `AUTH_SECRET` (min 32 characters)
- **No `allowDangerousEmailAccountLinking`** — prevents Google account hijacking
- **Session cookies** are HTTP-only, secure in production
- **API routes** return 401 JSON (not redirect) for clean API error handling
- **Inactive users** (`isActive: false`) cannot log in

## Client-Side Hooks

### useAuth()

```typescript
// lib/auth-client.ts
const { data: session, status, update } = useSession()

// Returns:
{ session, isLoading: status === "loading", isAuthenticated: !!session, user: session?.user }
```

### Cart Merge on Login

When a user logs in, any existing anonymous cart (stored in localStorage) is merged into their account cart via `POST /api/cart/merge`. This happens in the `useCart` hook's `resetCartCache()` after login.
