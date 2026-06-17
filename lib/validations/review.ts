import { z } from "zod"

export const createReviewSchema = z.object({
  productId: z.string().uuid("Valid product ID is required"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z.string().min(1, "Title is required").max(100),
  comment: z.string().min(1, "Comment is required").max(2000),
})

export const reviewQuerySchema = z.object({
  productId: z.string().uuid("Valid product ID is required"),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>
