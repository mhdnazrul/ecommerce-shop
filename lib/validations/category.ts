import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  parentId: z.string().uuid().optional().nullable(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
