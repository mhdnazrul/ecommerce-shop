# Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Server)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js App (shopfinity-web)                   │   │
│  │  - Server Components (Edge/Serverless)          │   │
│  │  - API Routes (Serverless Functions)            │   │
│  │  - Static Assets (CDN)                          │   │
│  └────────────┬─────────────────────┬──────────────┘   │
│               │                     │                   │
└───────────────┼─────────────────────┼───────────────────┘
                │                     │
       ┌────────▼────────┐   ┌───────▼────────┐
       │  Neon PostgreSQL │   │  Stripe API    │
       │  (Serverless DB) │   │  Payments      │
       └─────────────────┘   └────────────────┘
                │                     │
       ┌────────▼────────┐   ┌───────▼────────┐
       │  Cloudinary     │   │  Resend API    │
       │  Image Storage  │   │  Emails        │
       └─────────────────┘   └────────────────┘
                │                     │
       ┌────────▼────────┐   ┌───────▼────────┐
       │  Google OAuth   │   │  Sentry        │
       │  Authentication │   │  Monitoring    │
       └─────────────────┘   └────────────────┘
```

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **PostgreSQL** database (Neon recommended)
- **Stripe** account
- **Cloudinary** account
- **Resend** account
- **Google Cloud Console** project (for OAuth)
- **Sentry** account (optional)
- **Vercel** account (for hosting)

---

## Step 1: Database (Neon)

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection strings:
   - **Pooled connection** (for application): `DATABASE_URL`
   - **Direct connection** (for migrations): `DIRECT_URL`
4. Set environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?pgbouncer=true&sslmode=require"
   DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
   ```

### Verification
```bash
npx prisma migrate dev
npx prisma db seed
```

---

## Step 2: Vercel

### Setup
1. Push code to GitHub/GitLab
2. Import repository in Vercel Dashboard
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `shopfinity-web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Node.js Version:** 20.x

### Environment Variables
Set all 19 environment variables in Vercel Dashboard → Project Settings → Environment Variables. See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for the complete list.

### Region
Set to `iad1` (US East) in `vercel.json`:
```json
{
  "regions": ["iad1"],
  "functions": {
    "memory": 512,
    "maxDuration": 10
  }
}
```

### Verification
```bash
# Check deployment status
vercel logs <deployment-url>
# Visit the deployed URL
curl https://shopfinity.vercel.app
```

---

## Step 3: Stripe

### Setup
1. Create a Stripe account
2. Navigate to Dashboard → Developers → API Keys
3. Copy **Publishable key** (`pk_live_*`) and **Secret key** (`sk_live_*`)
4. Set environment variables

### Webhook Configuration
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events to listen:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy **Signing secret** (`whsec_*`) — displayed once after creation

### Verification
```bash
# Test with Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
# Check server logs for "Webhook received: payment_intent.succeeded"
```

---

## Step 4: Cloudinary

### Setup
1. Create a Cloudinary account
2. Navigate to Dashboard
3. Copy **Cloud name**, **API Key**, **API Secret**
4. Set environment variables

### Verification
```bash
# Test upload via admin panel
# Login as admin → Navigate to Products → Create → Upload image
# Or use curl:
curl -F "image=@test.jpg" \
  -H "Cookie: <session-cookie>" \
  https://your-domain.vercel.app/api/uploads
```

---

## Step 5: Resend

### Setup
1. Create account at [resend.com](https://resend.com)
2. Verify a domain (DNS records: SPF, DKIM, DMARC)
3. Create an API key
4. Set environment variables:
   ```
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@your-domain.com"
   ```

### Verification
```bash
# Trigger a welcome email by registering a new user
# Or check Resend Dashboard → Logs for delivery status
```

---

## Step 6: Google OAuth

### Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add Authorized Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy **Client ID** and **Client Secret**
7. Set environment variables

### Verification
```bash
# Visit login page and click "Sign in with Google"
# Complete OAuth flow
# Check that user is created with "customer" role
```

---

## Step 7: Sentry (Optional)

### Setup
1. Create a Sentry account
2. Create a new project (Next.js)
3. Copy the DSN
4. Set environment variables:
   ```
   SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
   SENTRY_ORG="your-org"
   SENTRY_PROJECT="shopfinity-web"
   ```

### Verification
```bash
# Trigger an error and check Sentry dashboard
# Or use the Sentry debug endpoint
```

---

## Step 8: Run Migrations

```bash
# Apply migrations to production database
npx prisma migrate deploy

# Seed production database
npx prisma db seed
```

---

## Step 9: Deploy to Vercel

```bash
# Deploy via Vercel CLI
vercel --prod

# Or push to the connected Git branch (auto-deploy)
git push origin main
```

---

## Post-Deployment Checklist

- [ ] Visit homepage — loads correctly
- [ ] Register a new account — email sent
- [ ] Login with credentials — session works
- [ ] Login with Google OAuth — redirect works
- [ ] Browse products — images load, pagination works
- [ ] Search products — results accurate
- [ ] Add to cart — items persist
- [ ] Complete checkout — Stripe payment form loads
- [ ] Make test payment — order created, confirmation email sent
- [ ] View order in admin panel — data accurate
- [ ] Upload image — Cloudinary integration works
- [ ] Check Sentry dashboard — no errors
- [ ] Run Lighthouse audit — score acceptable
- [ ] Test on mobile — responsive layout

---

## Rollback Plan

```bash
# Vercel: Rollback to previous deployment
vercel rollback <deployment-id>

# Database: Rollback migration
npx prisma migrate resolve --rolled-back <migration-name>

# Stripe: Refund any incorrectly processed payments via Dashboard
```

---

## Monitoring

- **Sentry:** Monitor errors and performance
- **Vercel Dashboard:** Monitor function invocations, duration, and errors
- **Stripe Dashboard:** Monitor payment activity and disputes
- **Neon Dashboard:** Monitor database connections and performance
- **Resend Dashboard:** Monitor email delivery rates and bounces

---

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common deployment issues and solutions.
