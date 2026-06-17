import { prisma } from "@/prisma/client"
import { NotFoundError, ConflictError } from "@/lib/errors"
import type { CreateReviewInput, ReviewQueryInput } from "@/lib/validations/review"
import type { Prisma } from "@prisma/client"

type ReviewPrisma = Prisma.ProductReviewGetPayload<object>

function mapReview(review: ReviewPrisma) {
  return {
    id: review.id,
    userId: review.userId,
    userName: review.userName,
    productId: review.productId,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  }
}

export const reviewService = {
  async getByProduct(query: ReviewQueryInput) {
    const reviews = await prisma.productReview.findMany({
      where: { productId: query.productId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    })
    return reviews.map(mapReview)
  },

  async create(userId: string, userName: string, input: CreateReviewInput) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, isDeleted: false, isPublished: true },
      select: { id: true },
    })
    if (!product) throw new NotFoundError("Product", input.productId)

    const existing = await prisma.productReview.findUnique({
      where: { userId_productId: { userId, productId: input.productId } },
    })
    if (existing) throw new ConflictError("You have already reviewed this product")

    const review = await prisma.productReview.create({
      data: {
        userId,
        userName,
        productId: input.productId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
      },
    })

    return mapReview(review)
  },
}
