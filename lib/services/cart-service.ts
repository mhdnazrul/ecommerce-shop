import { prisma } from "@/prisma/client"
import { NotFoundError } from "@/lib/errors"
import { findBySlugOrThrow } from "@/lib/services/shared"
import { logger } from "@/lib/logger"
import type { AddCartItemInput, UpdateCartItemInput, MergeCartInput } from "@/lib/validations/cart"
import type { Prisma } from "@prisma/client"

const cartItemInclude = {
  product: true,
} satisfies Prisma.CartItemInclude

type CartItemPrisma = Prisma.CartItemGetPayload<{ include: typeof cartItemInclude }>
type CartPrisma = Prisma.CartGetPayload<{
  include: {
    items: { include: { product: true }; orderBy: { createdAt: "asc" } }
  }
}>

function mapCartItem(item: CartItemPrisma) {
  return {
    ...item,
    unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
    product: {
      ...item.product,
      price: Number(item.product.price),
      compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
      isAvailable: !item.product.isDeleted && item.product.isPublished,
    },
  }
}

function cartResponse(cart: CartPrisma) {
  const items = cart.items.map(mapCartItem)
  const subtotal = items.reduce(
    (sum: number, i) => sum + i.quantity * (i.unitPrice ?? Number(i.product.price)),
    0
  )
  const itemsCount = items.reduce((sum: number, i) => sum + i.quantity, 0)

  return {
    id: cart.id,
    items,
    itemsCount,
    subtotal,
  }
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } },
    })
  }

  return cart
}

async function validateProductForCart(productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId },
    select: {
      id: true,
      price: true,
      isDeleted: true,
      isPublished: true,
      name: true,
      slug: true,
      imageUrl: true,
      stockQuantity: true,
    },
  })
  if (!product || product.isDeleted || !product.isPublished) {
    throw new NotFoundError("Product", productId)
  }
  return product
}

export const cartService = {
  async getCart(userId: string) {
    const cart = await getOrCreateCart(userId)
    return cartResponse(cart)
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const product = await validateProductForCart(input.productId)
    const cart = await getOrCreateCart(userId)

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: input.productId },
      },
      create: {
        cartId: cart.id,
        productId: input.productId,
        quantity: input.quantity,
        unitPrice: product.price,
      },
      update: {
        quantity: { increment: input.quantity },
      },
      include: cartItemInclude,
    })

    return mapCartItem(item)
  },

  async updateQuantity(userId: string, itemId: string, input: UpdateCartItemInput) {
    const cart = await getOrCreateCart(userId)

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    })
    if (!item) throw new NotFoundError("CartItem", itemId)

    if (input.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } })
      const updatedCart = await getOrCreateCart(userId)
      return cartResponse(updatedCart)
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
      include: cartItemInclude,
    })

    return mapCartItem(updated)
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await getOrCreateCart(userId)

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    })
    if (!item) throw new NotFoundError("CartItem", itemId)

    await prisma.cartItem.delete({ where: { id: itemId } })
  },

  async clearCart(userId: string) {
    const cart = await getOrCreateCart(userId)

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return cartResponse({ ...cart, items: [] })
  },

  async mergeCart(userId: string, input: MergeCartInput) {
    const cart = await getOrCreateCart(userId)
    const incomingProductIds = input.items.map((i) => i.productId)

    if (incomingProductIds.length === 0) {
      const updatedCart = await getOrCreateCart(userId)
      return cartResponse(updatedCart)
    }

    // Batch-validate all products in one query
    const products = await prisma.product.findMany({
      where: {
        id: { in: incomingProductIds },
        isDeleted: false,
        isPublished: true,
      },
      select: {
        id: true,
        price: true,
        name: true,
        slug: true,
        imageUrl: true,
        stockQuantity: true,
      },
    })

    const validProductMap = new Map(products.map((p) => [p.id, p]))
    const validProductIds = new Set(products.map((p) => p.id))

    for (const incoming of input.items) {
      if (!validProductIds.has(incoming.productId)) {
        logger.warn('Skipping product in cart merge — not found or unavailable', { productId: incoming.productId })
        continue
      }

      await prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: incoming.productId },
        },
        create: {
          cartId: cart.id,
          productId: incoming.productId,
          quantity: incoming.quantity,
          unitPrice: validProductMap.get(incoming.productId)!.price,
        },
        update: {
          quantity: incoming.quantity,
        },
      })
    }

    const updatedCart = await getOrCreateCart(userId)
    return cartResponse(updatedCart)
  },
}
