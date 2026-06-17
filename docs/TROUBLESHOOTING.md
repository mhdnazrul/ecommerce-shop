# Troubleshooting

## Build Issues

### `prisma generate` fails during build

**Error:** `prisma: command not found` or `Generate failed`

**Solutions:**
```bash
# Ensure Prisma is installed
npm install prisma @prisma/client

# Run generate manually
npx prisma generate

# Check DATABASE_URL is accessible (needed for introspection)
# Actually prisma generate only needs the schema file, not DB connection
```

### TypeScript errors after Prisma schema change

**Error:** Property `x` does not exist on type

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
Ctrl+Shift+P → TypeScript: Restart TS server
```

### Build fails with "Module not found"

**Solutions:**
```bash
# Check that the import path uses @/ alias (not relative parent path)
# Verify the file exists at the expected path
# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

---

## Database Issues

### Migration fails

**Error:** `Migration failed to apply`

**Solutions:**
```bash
# Reset database (DESTRUCTIVE — deletes all data)
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name fix_issue

# If migration is stuck, check the _prisma_migrations table
```

### Connection refused

**Error:** `Can't reach database server`

**Solutions:**
- Check that PostgreSQL is running: `Get-Service postgresql*`
- Verify `DATABASE_URL` and `DIRECT_URL` are correct in `.env`
- For Neon: ensure IP is allowed in Neon dashboard
- Check network connectivity: `ping ep-xxx.region.aws.neon.tech`

### Seed fails

**Error:** `Unique constraint failed on the fields: (\`email\`)`

**Solutions:**
```bash
# This is expected if users already exist — seed once per environment
# To re-seed cleanly:
npx prisma migrate reset --force
npx prisma db seed
```

---

## Authentication Issues

### Cannot log in

**Troubleshooting steps:**
1. Check `AUTH_SECRET` is set (min 32 characters)
2. Verify user is active (`isActive: true` in database)
3. Check rate limiting — wait 60 seconds if too many attempts
4. For Google OAuth: verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
5. Check browser console for CSP errors blocking redirects

### "Too many requests" error

**Solutions:**
- Wait 60 seconds for rate limit to reset
- Rate limits reset on server restart (development only)
- In production, rate limits are in-memory per-server instance

### Google OAuth redirect loop

**Solutions:**
1. Ensure `AUTH_URL` matches the deployment domain exactly
2. Check Google Cloud Console → Authorized redirect URI matches:
   `https://your-domain/api/auth/callback/google`
3. Clear browser cookies and try again

---

## Payment Issues

### Stripe PaymentIntent creation fails

**Error:** `Invalid API Key` or similar

**Solutions:**
- Verify `STRIPE_SECRET_KEY` is set and valid
- Ensure Stripe account is active
- Check that amount is valid (minimum $0.50 USD)

### Webhook returning 400

**Error:** `No signatures found matching the expected signature`

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint secret in Stripe Dashboard
2. Ensure the webhook URL is correct: `https://your-domain/api/webhooks/stripe`
3. Re-register the webhook endpoint if the secret was rotated

### Payment confirmed but order not updated

**Troubleshooting steps:**
1. Check Stripe Dashboard → Events → payment_intent.succeeded was sent
2. Check webhook endpoint returns 200
3. Check server logs for webhook handler errors
4. Verify `STRIPE_WEBHOOK_SECRET` is correct

### Stripe Elements won't load

**Solutions:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser CSP doesn't block Stripe CDN
- Check browser console for script loading errors
- Ensure `StripeProvider` has a valid `clientSecret`

---

## Upload Issues

### Image upload fails

**Solutions:**
- Check file type (JPEG, PNG, WebP only)
- Check file size (max 5MB)
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Check Cloudinary dashboard for account limits

### 429 Too Many Requests on upload

**Solutions:**
- Wait 60 seconds for rate limit to reset
- Reduce upload frequency

---

## Email Issues

### Emails not sending

**Solutions:**
- Verify `RESEND_API_KEY` is set and valid
- Check `EMAIL_FROM` is a verified domain in Resend
- Check Resend dashboard for delivery status
- Look for `logger.error` logs indicating send failure

### Emails going to spam

**Solutions:**
- Configure SPF, DKIM, and DMARC DNS records for your domain
- Use a dedicated subdomain for transactional emails
- Verify domain in Resend dashboard

---

## Vercel Deployment Issues

### Build fails on Vercel

**Solutions:**
1. Check Vercel build logs for error details
2. Ensure all environment variables are set in Vercel Dashboard
3. Verify `DATABASE_URL` uses connection pooling (Neon with `?pgbouncer=true`)
4. Check that `postinstall` script runs `prisma generate`

### 500 Error on Vercel

**Solutions:**
1. Check Vercel Function logs in Vercel Dashboard
2. Verify Sentry is capturing errors (if configured)
3. Check that lazy-initialized services have proper env vars

### Images not loading on production

**Solutions:**
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check `next.config.ts` remotePatterns includes all image hosts
- Ensure Cloudinary URLs are using `res.cloudinary.com`

---

## Performance Issues

### Slow page loads

**Solutions:**
- Check database query performance (N+1 queries)
- Verify Prisma queries include proper `include`/`select`
- Ensure pagination is used on list pages
- Check if images are optimized

### High memory usage

**Solutions:**
- Verify in-memory rate limiter Map doesn't grow unbounded
- Check Prisma connection pool settings
- Review large dataset queries

---

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| `Cannot read properties of null (reading 'id')` | Session not found or expired | Re-login |
| `Unique constraint failed` | Duplicate email/slug/SKU | Use unique values |
| `Foreign key constraint failed` | Referenced entity doesn't exist | Check related entity exists |
| `connect ECONNREFUSED` | Database not accessible | Check DB connection |
| `Invalid `prisma.$transaction()` invocation` | Transaction error | Check transaction logic |
| `Cannot find module '@/...'` | Import path incorrect | Use correct path or `@/` alias |

---

## Debugging Tips

### Enable verbose logging

```bash
# Set environment variable for Prisma queries
$env:PRISMA_LOG_QUERIES="true"

# Or use Next.js debug mode
npm run dev -- --debug
```

### Check database state

```bash
# Open Prisma Studio
npx prisma studio

# Direct database query
npx prisma db execute --stdin <<< "SELECT * FROM users;"
```

### Test API endpoints

```bash
# Use curl to test endpoints
curl http://localhost:3000/api/products
curl -H "Content-Type: application/json" http://localhost:3000/api/categories/tree
```
