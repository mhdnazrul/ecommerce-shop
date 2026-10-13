import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma/client"
import { apiHandler, validateSchema } from "@/lib/errors/api-handler"
import { getStripe } from "@/lib/stripe"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { z } from "zod"
import { NotFoundError, ConflictError, AppError } from "@/lib/errors"

const createIntentSchema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  return apiHandler(async (session) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    const { allowed, resetIn } = rateLimit(`payment:${session.user.id}`, { interval: 10_000, maxRequests: 3 })
    if (!allowed) return rateLimitResponse(resetIn)

    const body = await req.json()
    const { orderId } = validateSchema(createIntentSchema, body)

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: { paymentIntent: true },
    })
    if (!order) throw new NotFoundError("Order", orderId)
    if (order.status !== "Pending") {
      throw new ConflictError(`Cannot create payment intent for order with status '${order.status}'`)
    }

    // Reuse existing PaymentIntent if already created with Stripe
    const existing = order.paymentIntent
    if (existing?.stripePaymentIntentId && existing?.stripeClientSecret) {
      return NextResponse.json({
        success: true,
        data: { clientSecret: existing.stripeClientSecret },
      })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError(
        "Stripe payment gateway is not configured. Set STRIPE_SECRET_KEY in your environment.",
        503,
        "GATEWAY_UNAVAILABLE"
      )
    }

    // Ensure Stripe customer exists
    const stripe = getStripe()
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    })

    let customerId = stripeCustomer?.stripeCustomerId

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
      } catch (err: any) {
        if (err?.code === "resource_missing" || err?.statusCode === 404) {
          customerId = undefined
        } else {
          throw err
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await prisma.stripeCustomer.upsert({
        where: { userId: session.user.id },
        update: { stripeCustomerId: customer.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customer.id,
        },
      })
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: "usd",
      customer: customerId,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
      },
    })

    // Upsert PaymentIntent record in database
    const updated = await prisma.paymentIntent.upsert({
      where: { orderId: order.id },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret ?? undefined,
        status: "RequiresPayment",
      },
      create: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret ?? undefined,
        status: "RequiresPayment",
        amount: order.totalAmount,
        currency: "usd",
      },
    })

    return NextResponse.json({
      success: true,
      data: { clientSecret: updated.stripeClientSecret },
    })
  }, { requireAuth: true })
}
