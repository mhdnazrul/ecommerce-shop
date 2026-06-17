import { prisma } from "@/prisma/client"
import { NotFoundError, ConflictError } from "@/lib/errors"
import { slugify, formatPageMeta } from "@/lib/utils"
import { ensureSlugUnique, findByIdOrThrow } from "@/lib/services/shared"
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from "@/lib/validations/product"
import type { Prisma } from "@prisma/client"

const defaultInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.ProductInclude

type ProductPayload = Prisma.ProductGetPayload<{ include: typeof defaultInclude }>

function mapProduct(product: ProductPayload) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  }
}

async function validateCategory(categoryId: string): Promise<void> {
  await findByIdOrThrow(prisma.category, categoryId, "Category")
}

async function validateSku(sku: string | null | undefined, excludeId?: string): Promise<void> {
  if (!sku) return
  const existing = await prisma.product.findFirst({
    where: { sku, isDeleted: false, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true },
  })
  if (existing) throw new ConflictError(`SKU '${sku}' is already in use`)
}

export const productService = {
  async create(data: CreateProductInput) {
    await validateCategory(data.categoryId)
    await validateSku(data.sku)

    const baseSlug = slugify(data.name)
    const slug = await ensureSlugUnique(prisma.product, baseSlug)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        shortDescription: data.shortDescription ?? null,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        costPrice: data.costPrice ?? null,
        stockQuantity: data.stockQuantity,
        sku: data.sku ?? null,
        barcode: data.barcode ?? null,
        weight: data.weight ?? null,
        imageUrl: data.imageUrl ?? null,
        images: data.images,
        tags: data.tags,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        categoryId: data.categoryId,
      },
      include: defaultInclude,
    })

    return mapProduct(product)
  },

  async update(id: string, data: UpdateProductInput) {
    const existing = await findByIdOrThrow(prisma.product, id, "Product")

    if (data.categoryId !== undefined) {
      await validateCategory(data.categoryId)
    }
    if (data.sku !== undefined) {
      await validateSku(data.sku, id)
    }

    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      const baseSlug = slugify(data.name)
      slug = await ensureSlugUnique(prisma.product, baseSlug, id)
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        slug,
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription ?? null }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice ?? null }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice ?? null }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.sku !== undefined && { sku: data.sku ?? null }),
        ...(data.barcode !== undefined && { barcode: data.barcode ?? null }),
        ...(data.weight !== undefined && { weight: data.weight ?? null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? null }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        rowVersion: { increment: 1 },
      },
      include: defaultInclude,
    })

    return mapProduct(product)
  },

  async delete(id: string) {
    await findByIdOrThrow(prisma.product, id, "Product")
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    })
  },

  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: defaultInclude,
    })
    if (!product) throw new NotFoundError("Product", id)
    return mapProduct(product)
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: defaultInclude,
    })
    if (!product) throw new NotFoundError("Product", slug)
    return mapProduct(product)
  },

  async search(query: ProductQueryInput) {
    const { search, categoryId, categorySlug, minPrice, maxPrice, isFeatured, isPublished, sortBy, sortOrder, page, limit } = query

    const where: Prisma.ProductWhereInput = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ]
    }

    if (categoryId) where.categoryId = categoryId
    if (categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
      if (category) where.categoryId = category.id
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (isFeatured !== undefined) where.isFeatured = isFeatured
    if (isPublished !== undefined) where.isPublished = isPublished

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    }

    const skip = (page - 1) * limit

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: defaultInclude,
      }),
      prisma.product.count({ where }),
    ])

    return {
      items: items.map(mapProduct),
      ...formatPageMeta(totalCount, page, limit),
    }
  },

  async getRelated(productId: string, limit = 4) {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
    })
    if (!product) return []

    const items = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isDeleted: false,
        isPublished: true,
      },
      take: limit,
      include: defaultInclude,
      orderBy: { createdAt: "desc" },
    })

    return items.map(mapProduct)
  },

  async getFeatured(limit = 8) {
    const items = await prisma.product.findMany({
      where: { isFeatured: true, isDeleted: false, isPublished: true },
      take: limit,
      include: defaultInclude,
      orderBy: { createdAt: "desc" },
    })
    return items.map(mapProduct)
  },
}
