import { z } from "zod"

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]).optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>
