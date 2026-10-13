import { prisma } from "@/prisma/client"
import { logger } from "@/lib/logger"
import { NotFoundError, ConflictError } from "@/lib/errors"
import type { CheckoutInput, OrderQueryInput } from "@/lib/validations/order"
import { type Prisma } from "@prisma/client"
import { sendOrderConfirmationEmail } from "@/lib/email/resend"

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomUUID().substring(0, 4).toUpperCase()
  return `ORD-${ts}-${rand}`
}

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  shippingAddress: true,
} satisfies Prisma.OrderInclude

type OrderPayload = Prisma.OrderGetPayload<{ include: typeof orderInclude }>

function mapOrder(order: OrderPayload) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    taxAmount: Number(order.taxAmount),
    discountAmount: Number(order.discountAmount),
    currency: order.currency,
    notes: order.notes,
    shippingAddress: order.shippingAddress
      ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone,
        }
      : null,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? "Unknown",
      productSlug: item.product?.slug ?? null,
      productImage: item.product?.imageUrl ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    paidAt: order.paidAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    cancelReason: order.cancelReason,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const clientKey = input.idempotencyKey?.trim()
    if (clientKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey: clientKey },
        include: orderInclude,
      })
      if (existing) {
        if (existing.userId !== userId) {
          throw new ConflictError("Idempotency key has already been used for a different request")
        }
        return mapOrder(existing)
      }
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
                isDeleted: true,
                isPublished: true,
              },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      throw new NotFoundError("Cart", "empty")
    }

    for (const item of cart.items) {
      if (!item.product || item.product.isDeleted || !item.product.isPublished) {
        throw new NotFoundError("Product", item.productId)
      }
      if (item.product.stockQuantity < item.quantity) {
        throw new ConflictError(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stockQuantity}, requested: ${item.quantity}`
        )
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )

    const orderNumber = generateOrderNumber()
    const idempotencyKey = clientKey || `ord_${cart.id}_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`

    try {
      const order = await prisma.$transaction(async (tx) => {
        let addressId: string | undefined
        if (input.shippingAddress) {
          const address = await tx.address.create({
            data: {
              userId,
              ...input.shippingAddress,
              label: "Shipping",
            },
          })
          addressId = address.id
        }

        const created = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: "Pending",
            subtotal,
            totalAmount: subtotal,
            shippingCost: 0,
            taxAmount: 0,
            discountAmount: 0,
            idempotencyKey,
            notes: input.notes,
            shippingAddressId: addressId,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price,
                totalPrice: Number(item.product.price) * item.quantity,
              })),
            },
          },
          include: orderInclude,
        })

        for (const item of cart.items) {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          })
          if (result.count === 0) {
            throw new ConflictError(`Insufficient stock for product "${item.product.name}"`)
          }
        }

        await tx.inventoryTransaction.createMany({
          data: cart.items.map((item) => ({
            productId: item.productId,
            type: "Sale" as const,
            quantity: -item.quantity,
            stockBefore: item.product.stockQuantity,
            stockAfter: item.product.stockQuantity - item.quantity,
            unitCost: item.product.price,
            reference: orderNumber,
            createdById: userId,
          })),
        })

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        })

        await tx.paymentIntent.create({
          data: {
            orderId: created.id,
            status: "Pending",
            amount: created.totalAmount,
            currency: "usd",
          },
        })

        return created
      })

      // Send confirmation email asynchronously (non-blocking)
      sendConfirmationAfterOrder(userId, order, cart.items).catch((err) => {
        logger.error('Failed to send order confirmation email', { orderId: order.id, orderNumber: order.orderNumber }, err)
      })

      return mapOrder(order)
    } catch (err: any) {
      if (err?.code === "P2002" && clientKey) {
        const target = err?.meta?.target
        const isIdempotencyCollision =
          Array.isArray(target)
            ? target.includes("idempotencyKey")
            : typeof target === "string"
            ? target.includes("idempotencyKey") || target.includes("idempotency_key")
            : false

        if (isIdempotencyCollision) {
          const existing = await prisma.order.findUnique({
            where: { idempotencyKey: clientKey },
            include: orderInclude,
          })
          if (existing) {
            if (existing.userId !== userId) {
              throw new ConflictError("Idempotency key has already been used for a different request")
            }
            return mapOrder(existing)
          }
        }
      }
      throw err
    }
  },

  async getMyOrders(userId: string, query: OrderQueryInput) {
    const where: Prisma.OrderWhereInput = { userId }
    if (query.status) where.status = query.status

    const [items, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      items: items.map(mapOrder),
      totalCount,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalCount / query.limit),
      hasNext: query.page * query.limit < totalCount,
      hasPrev: query.page > 1,
    }
  },

  async getOrder(userId: string, orderId: string, isAdmin = false) {
    const where: Prisma.OrderWhereInput = isAdmin
      ? { id: orderId }
      : { id: orderId, userId }
    const order = await prisma.order.findFirst({
      where,
      include: orderInclude,
    })
    if (!order) throw new NotFoundError("Order", orderId)
    return mapOrder(order)
  },

  async getAllOrders(query: OrderQueryInput) {
    const where: Prisma.OrderWhereInput = {}
    if (query.status) where.status = query.status

    const [items, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      items: items.map(mapOrder),
      totalCount,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalCount / query.limit),
      hasNext: query.page * query.limit < totalCount,
      hasPrev: query.page > 1,
    }
  },

  async updateStatus(orderId: string, status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled") {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundError("Order", orderId)

    if (order.status === "Cancelled" && status !== "Cancelled") {
      throw new ConflictError("Cannot reopen an already cancelled order")
    }

    const now = new Date()

    if (status === "Cancelled" && order.status !== "Cancelled") {
      await prisma.$transaction(async (tx) => {
        // Atomic guard: ensure status wasn't changed to Cancelled concurrently
        const updateCheck = await tx.order.updateMany({
          where: { id: orderId, status: { not: "Cancelled" } },
          data: { status, cancelledAt: now, cancelReason: null },
        })

        if (updateCheck.count === 0) {
          // Already cancelled concurrently; skip stock restoration to prevent duplicate inventory increment
          return
        }

        const items = await tx.orderItem.findMany({ where: { orderId } })

        // Batch-fetch all products
        const productIds = items.map((i) => i.productId)
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stockQuantity: true },
        })
        const productMap = new Map(products.map((p) => [p.id, p]))

        for (const item of items) {
          const product = productMap.get(item.productId)
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            })
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: "Return",
                quantity: item.quantity,
                stockBefore: product.stockQuantity,
                stockAfter: product.stockQuantity + item.quantity,
                unitCost: item.unitPrice,
                reference: order.orderNumber,
              },
            })
          }
        }
      })
    } else {
      const updateData: Prisma.OrderUpdateInput = { status }
      if (status === "Shipped") updateData.shippedAt = now
      if (status === "Delivered") updateData.deliveredAt = now
      if (status === "Cancelled") updateData.cancelledAt = now

      await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      })
    }

    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    })
    return mapOrder(updated!)
  },
}

async function sendConfirmationAfterOrder(
  userId: string,
  order: OrderPayload,
  cartItems: { product: { name: string; price: Prisma.Decimal }; quantity: number }[]
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    })
    if (!user) return

    const items = cartItems.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: Number(i.product.price),
    }))

    await sendOrderConfirmationEmail(
      user.email,
      user.firstName ?? user.email,
      order.orderNumber,
      Number(order.totalAmount),
      items
    )
  } catch (err) {
    logger.error('Failed to send confirmation email in sendConfirmationAfterOrder', { userId, orderNumber: order?.orderNumber }, err)
  }
}
