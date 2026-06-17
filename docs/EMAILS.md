# Emails

## Overview

Shopfinity uses **Resend** for transactional email delivery. Emails are sent using React Email templates rendered server-side with the Resend SDK.

## Architecture

```
┌────────────┐     ┌──────────────────┐     ┌──────────┐
│  Business  │     │  lib/email/      │     │  Resend  │
│  Event     │     │  resend.tsx      │     │  API     │
└──────┬─────┘     └────────┬─────────┘     └────┬─────┘
       │                    │                     │
       │  Registration      │                     │
       │───────────────────►│                     │
       │                    │  sendWelcomeEmail() │
       │                    │────────────────────►│
       │  (fire-and-forget) │                     │
       │                    │                     │
       │  Order Placed      │                     │
       │───────────────────►│                     │
       │                    │ sendOrderConfirmation│
       │                    │────────────────────►│
       │  (fire-and-forget) │                     │
       │                    │                     │
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Production | Resend API key for sending emails |
| `EMAIL_FROM` | Always | Verified sender email address |

### Lazy Initialization

The Resend client uses lazy singleton initialization to prevent build-time failures:

```typescript
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured")
    }
    resendInstance = new Resend(env.RESEND_API_KEY)
  }
  return resendInstance
}
```

## Email Functions

### sendEmail

```typescript
sendEmail({ to: string, subject: string, react: React.ReactElement })
```

Generic email sender that requires `EMAIL_FROM` to be configured. All specific email functions use this internally.

### sendWelcomeEmail

```typescript
sendWelcomeEmail(to: string, name: string)
```

**Triggered by:** User registration (`POST /api/auth/register`)

**Template:** `lib/email/templates/welcome.tsx`
- Indigo header with "Welcome to Shopfinity"
- Personalized greeting with user's first name
- Brief introduction to the platform
- "Start Shopping" CTA button linking to `/products`

### sendOrderConfirmationEmail

```typescript
sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
)
```

**Triggered by:** Successful payment webhook (`payment_intent.succeeded`)

**Template:** `lib/email/templates/order-confirmation.tsx`
- Indigo header with "Order Confirmed"
- Order number prominently displayed
- Item table with columns: Product Name, Quantity, Price
- Total row showing the order total
- "View Order" CTA button linking to `/orders`

## Asynchronous Sending

All email sending is **fire-and-forget** (non-blocking):

```typescript
// In the API route handler
sendWelcomeEmail(user.email, user.firstName).catch((err) => {
  logger.error("Failed to send welcome email", { userId: user.id }, err)
})

// Primary response is returned immediately, not waiting for email
return NextResponse.json({ success: true, data: user }, { status: 201 })
```

Key design decisions:
- Primary request flow is **never blocked** by email sending
- Failed emails are logged with `logger.error` but do **not** cause the operation to fail
- Email failures are visible in server logs and Sentry

## Email Templates

Templates are React components located in `lib/email/templates/`:

```
lib/email/templates/
├── welcome.tsx              # Welcome email template
└── order-confirmation.tsx   # Order confirmation template
```

Both templates use:
- HTML table-based layout for email client compatibility
- Inline styles (no CSS-in-JS or external stylesheets)
- Responsive design for mobile email clients
- Consistent indigo (`#4f46e5`) branding color
- Proper `<html>`, `<head>`, and `<body>` structure

## Adding a New Email

1. Create a template in `lib/email/templates/` (React component with inline styles)
2. Add a sender function in `lib/email/resend.tsx`
3. Call the function fire-and-forget from the relevant business logic

```typescript
// Step 1: Create template
export function MyEmail({ name }: { name: string }) {
  return (
    <Html><Body>
      <Heading>Hello {name}</Heading>
      <Text>This is a custom email.</Text>
    </Body></Html>
  )
}

// Step 2: Add sender function
export async function sendMyEmail(to: string, name: string) {
  return sendEmail({ to, subject: "Custom Email", react: <MyEmail name={name} /> })
}

// Step 3: Call from business logic
sendMyEmail(user.email, user.name).catch((err) => logger.error("...", {}, err))
```

## Testing

| Scenario | Method |
|----------|--------|
| View email template rendering | Render component in a test or storybook |
| Test email delivery in dev | Set `RESEND_API_KEY` to a test key, use Resend test mode |
| Debug email sending issues | Check server logs for `logger.error` output |

## Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify a domain (or use Resend's testing domain)
3. Create an API key
4. Set `RESEND_API_KEY` in environment
5. Set `EMAIL_FROM` to your verified sender

## Limitations

- **Fire-and-forget**: Emails are not retried on failure. For production, consider a queue system (e.g., Bull with Redis) for reliable delivery
- **No unsubscribe**: Email templates don't include unsubscribe links. Add if required for compliance
- **No batch sending**: Each email is sent individually. For bulk campaigns, consider a dedicated email service
