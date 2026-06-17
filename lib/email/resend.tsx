import { Resend } from "resend"
import { WelcomeEmail } from "./templates/welcome"
import { OrderConfirmationEmail } from "./templates/order-confirmation"

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set")
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error("EMAIL_FROM environment variable is not set — email not sent")
    return
  }
  return getResend().emails.send({ from, to, subject, react })
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to Shopfinity!",
    react: <WelcomeEmail name={name} />,
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  items: { name: string; quantity: number; price: number }[]
) {
  return sendEmail({
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    react: <OrderConfirmationEmail name={name} orderNumber={orderNumber} totalAmount={totalAmount} items={items} />,
  })
}
