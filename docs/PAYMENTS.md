# Payments

## Overview

Shopfinity uses **Stripe** as its payment processor. The payment flow uses **PaymentIntents** with a two-step confirmation pattern — the server creates the intent, and the client confirms the payment using Stripe Elements.

## Architecture

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  Client  │         │  Next.js     │         │  Stripe  │
│  Browser │         │  Server      │         │  API     │
└────┬─────┘         └──────┬───────┘         └────┬─────┘
     │                      │                      │
     │  1. POST /api/payments/create-intent         │
     │  { orderId }         │                      │
     │─────────────────────►│                      │
     │                      │  2. Get/Create       │
     │                      │  StripeCustomer      │
     │                      │                      │
     │                      │  3. Create           │
     │                      │  PaymentIntent       │
     │                      │─────────────────────►│
     │                      │  4. clientSecret     │
     │                      │◄─────────────────────│
     │  5. { clientSecret } │                      │
     │◄─────────────────────│                      │
     │                      │                      │
     │  6. confirmPayment() │                      │
     │  (PaymentElement)    │                      │
     │─────────────────────────────────────────────►│
     │                      │                      │
     │  7. Redirect/Error   │                      │
     │◄─────────────────────────────────────────────│
     │                      │                      │
     │                      │  8. Webhook          │
     │                      │  payment_intent.*    │
     │                      │◄─────────────────────│
     │                      │                      │
     │                      │  9. Update Order     │
     │                      │  + Send Email        │
     │                      │                      │
```

## Stripe Integration Files

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Server-side Stripe client (lazy singleton) |
| `lib/stripe-client.ts` | Client-side Stripe.js loader |
| `components/payment/StripeProvider.tsx` | React context provider wrapping Stripe Elements |
| `components/payment/CheckoutPaymentForm.tsx` | PaymentElement + confirm button form |
| `app/api/payments/create-intent/route.ts` | API route to create PaymentIntent |
| `app/api/webhooks/stripe/route.ts` | Webhook handler for Stripe events |
| `hooks/usePayment.ts` | Client hook to call create-intent API |

## Server-Side Setup

### Stripe Client (`lib/stripe.ts`)

Uses lazy singleton pattern to avoid build-time failures:

```typescript
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true })
  }
  return stripeInstance
}
```

No `apiVersion` is specified — Stripe's library defaults are used.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_* or sk_test_*) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (whsec_*) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public key for client-side (pk_live_* or pk_test_*) |

## PaymentIntent Creation

### POST /api/payments/create-intent

1. **Auth required** — User must be authenticated
2. **Rate limited** — 3 requests per 10 seconds per user
3. **Get or create StripeCustomer** — Looks up existing customer by userId, creates new if not found
4. **Create PaymentIntent** — With amount, currency, customer ID, and order metadata
5. **Store in database** — Creates PaymentIntent record with Stripe ID and client secret
6. **Return** `{ clientSecret }` to the client

### Database Models

**PaymentIntent** stores:
- Stripe PaymentIntent ID and client secret
- Payment status (tracked through webhooks)
- Amount, currency, failure message
- Refund tracking

**PaymentCharge** stores individual charges:
- Stripe charge ID
- Amount, currency, receipt URL
- Refund status

**StripeCustomer** maps:
- User ID → Stripe Customer ID
- Cached payment methods (JSON)

## Payment Confirmation

### Checkout Payment Form

The `CheckoutPaymentForm` component:

1. Renders Stripe's `PaymentElement` (handles credit card, debit card, and other payment methods)
2. On submit: calls `stripe.confirmPayment()` with `redirect: 'if_required'`
3. On success: redirects to `/orders/success/[id]`
4. On error: displays error message on the form
5. Uses `useStripe()` and `useElements()` hooks from `@stripe/react-stripe-js`

### StripeProvider

The `StripeProvider` component:
1. Loads Stripe.js lazily via `@stripe/stripe-js` loader
2. Configures appearance: indigo primary color (`#4f46e5`), `borderRadius: 12px`
3. Includes runtime guard: if `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing, renders a warning banner instead of crashing

## Webhook Handling

### POST /api/webhooks/stripe

1. **Signature verification** — Raw body is reconstructed from chunks and verified using `stripe.webhooks.constructEvent()`
2. **Event routing** — Dispatched to handlers based on event type
3. **Idempotency** — Checks existing PaymentIntent status before processing to avoid duplicate updates

### Events Handled

**`payment_intent.succeeded`**
- Updates PaymentIntent status to `Succeeded`
- Updates PaymentCharge with successful charge
- Updates Order status to `Processing` (payment confirmed)
- Sets `paidAt` timestamp
- Fires async order confirmation email

**`payment_intent.payment_failed`**
- Updates PaymentIntent status to `Failed`
- Records failure message on PaymentIntent
- Updates Order notes with failure details
- Does NOT delete the order (order remains in pending state for retry)

## Testing

### Test Card Numbers

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

### Webhook Testing (Local)

```bash
# Install Stripe CLI and forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Environment

- Use `sk_test_*` and `pk_test_*` keys for development
- Webhook secrets differ between test and live modes
- Test payments do not use real money

## Refunds

Refunds are handled through the Stripe Dashboard:
1. Navigate to the Stripe Dashboard → Payments
2. Find the payment → Click "Refund"
3. The webhook `charge.refunded` updates the database (if configured)

To add refund functionality to the admin panel, extend the webhook handler to listen for `charge.refunded` events.

## Common Issues

| Issue | Solution |
|-------|----------|
| `clientSecret` is null | Order may not exist or PaymentIntent creation failed. Check server logs |
| Stripe Elements won't load | Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set and valid |
| Webhook returning 400 | Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard |
| Payment succeeds but order not updated | Check webhook endpoint is correctly registered in Stripe Dashboard |
| `redirect: 'if_required'` not redirecting | Ensure return_url is properly set. Check browser console for errors |
