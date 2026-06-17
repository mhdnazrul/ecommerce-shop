import { prisma } from "@/prisma/client"
import { NotFoundError, ConflictError } from "@/lib/errors"

export const wishlistService = {
  async getItems(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            images: true,
            price: true,
            compareAtPrice: true,
            stockQuantity: true,
            isDeleted: true,
            isPublished: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        price: Number(item.product.price),
        compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
        isAvailable: !item.product.isDeleted && item.product.isPublished,
      },
    }))
  },

  async addItem(userId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false, isPublished: true },
      select: { id: true },
    })
    if (!product) throw new NotFoundError("Product", productId)

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })
    if (existing) throw new ConflictError("Product is already in your wishlist")

    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
    })

    return item
  },

  async removeItem(userId: string, itemId: string) {
    const item = await prisma.wishlistItem.findFirst({
      where: { id: itemId, userId },
    })
    if (!item) throw new NotFoundError("WishlistItem", itemId)

    await prisma.wishlistItem.delete({ where: { id: itemId } })
  },

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    })
    return !!item
  },
}
