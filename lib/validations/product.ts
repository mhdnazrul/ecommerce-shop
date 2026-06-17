import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(500),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(300).optional(),
  price: z.coerce.number().min(0.01, "Price must be at least 0.01").max(999999.99),
  compareAtPrice: z.coerce.number().min(0).max(999999.99).optional().nullable(),
  costPrice: z.coerce.number().min(0).max(999999.99).optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  weight: z.coerce.number().min(0).max(99999.99).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string().max(50)).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  categoryId: z.string().uuid("Valid category ID is required"),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
