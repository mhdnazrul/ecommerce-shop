# Environment Variables

## Overview

Shopfinity uses 19 environment variables for configuration. Variables are validated at startup using a Zod schema (`lib/env.ts`). Some variables are only required in production mode.

## File-based Configuration

| File | Purpose |
|------|---------|
| `.env` | Default values checked into repo |
| `.env.local` | Local overrides (gitignored) |
| `.env.production` | Production values (gitignored) |
| `.env.example` | Template with placeholders (committed) |
| `.env.production.example` | Production template (committed) |

## Variable Reference

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Always | — | PostgreSQL connection string (pooled for Neon). Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?pgbouncer=true&sslmode=require` |
| `DIRECT_URL` | Always | — | Direct PostgreSQL connection (bypasses pooler for migrations). Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require` |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_SECRET` | Always | — | NextAuth.js JWT encryption secret. Min 32 characters. Generate: `openssl rand -base64 32` |
| `AUTH_URL` | Production | `http://localhost:3000` | Canonical URL of the application. Must match the deployment domain |
| `AUTH_GOOGLE_ID` | Optional | — | Google OAuth 2.0 client ID from Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Optional | — | Google OAuth 2.0 client secret from Google Cloud Console |

### Stripe

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Production | — | Stripe secret key (`sk_live_*` or `sk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | Production | — | Stripe webhook signing secret (`whsec_*`). Required for webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production | — | Stripe publishable key (`pk_live_*` or `pk_test_*`). Public, used client-side |

### Cloudinary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Production | — | Cloudinary cloud name (e.g., `djxsmpl9h`) |
| `CLOUDINARY_API_KEY` | Production | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Production | — | Cloudinary API secret |

### Email (Resend)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Production | — | Resend API key for sending transactional emails |
| `EMAIL_FROM` | Always | — | Sender email address. Must be a verified domain in Resend. Example: `noreply@shopfinity.com` |

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | Optional | `http://localhost:3000` | Public-facing application URL. Used in emails and redirects |
| `NODE_ENV` | Always | `development` | Environment mode. Values: `development`, `production`, `test` |

### Sentry

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | Optional | — | Sentry DSN for error tracking. Omit or leave empty to disable Sentry |
| `SENTRY_ORG` | Optional | — | Sentry organization slug |
| `SENTRY_PROJECT` | Optional | — | Sentry project slug |

## Production `.env.production.example`

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"

# Auth
AUTH_SECRET="your-32-char-base64-secret"
AUTH_URL="https://shopfinity.vercel.app"

# Google OAuth (optional)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@shopfinity.com"

# App
NEXT_PUBLIC_APP_URL="https://shopfinity.vercel.app"
NODE_ENV="production"

# Sentry (optional)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_ORG="shopfinity"
SENTRY_PROJECT="shopfinity-web"
```

## Validation Rules

Variables marked "Production only" are validated with `.min(1)` when `NODE_ENV === "production"`. In development, defaults or empty values are accepted:

```
STRIPE_SECRET_KEY       → refined().string().min(1)  [production only]
STRIPE_WEBHOOK_SECRET   → refined().string().min(1)  [production only]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → refined().string().min(1)  [production only]
CLOUDINARY_CLOUD_NAME   → refined().string().min(1)  [production only]
CLOUDINARY_API_KEY      → refined().string().min(1)  [production only]
CLOUDINARY_API_SECRET   → refined().string().min(1)  [production only]
RESEND_API_KEY          → refined().string().min(1)  [production only]
```

## Environment Validation

The app validates environment variables at import time using Zod. If required variables are missing in production, the app will throw a clear error with details of which variables failed validation.
