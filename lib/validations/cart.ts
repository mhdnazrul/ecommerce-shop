import { z } from "zod"

export const addCartItemSchema = z.object({
  productId: z.string().uuid("Valid product ID is required"),
  quantity: z.coerce.number().int().min(1, "Minimum 1").max(99, "Maximum 99"),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Minimum 0").max(99, "Maximum 99"),
})

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(0),
})

export type AddCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type MergeCartInput = z.infer<typeof mergeCartSchema>

export const addWishlistItemSchema = z.object({
  productId: z.string().uuid("Valid product ID is required"),
})

export type AddWishlistItemInput = z.infer<typeof addWishlistItemSchema>
