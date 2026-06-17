import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma/client"
import { getStripe } from "@/lib/stripe"
import { apiHandler } from "@/lib/errors/api-handler"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ success: false, message: "Missing stripe-signature" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ success: false, message: "Stripe webhook secret not configured" }, { status: 500 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
  }

  return apiHandler(async () => {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object
        const orderId = pi.metadata?.orderId
        if (!orderId) break

        await prisma.$transaction(async (tx) => {
          const existing = await tx.paymentIntent.findUnique({ where: { orderId } })
          if (existing?.status === "Succeeded") return

          await tx.paymentIntent.update({
            where: { orderId },
            data: {
              status: "Succeeded",
              paidAt: new Date(),
            },
          })
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "Processing",
              paidAt: new Date(),
            },
          })
        })
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object
        const orderId = pi.metadata?.orderId
        if (!orderId) break

        await prisma.$transaction(async (tx) => {
          const existing = await tx.paymentIntent.findUnique({ where: { orderId } })
          if (existing?.status === "Failed") return

          const failureMessage = pi.last_payment_error?.message ?? "Payment failed"

          await tx.paymentIntent.update({
            where: { orderId },
            data: {
              status: "Failed",
              failureMessage,
            },
          })
          await tx.order.update({
            where: { id: orderId },
            data: {
              notes: `Payment failed: ${failureMessage}`,
            },
          })
        })
        break
      }
    }

    return NextResponse.json({ success: true, received: true })
  })
}
