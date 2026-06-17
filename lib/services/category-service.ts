import { prisma } from "@/prisma/client"
import { NotFoundError, ConflictError } from "@/lib/errors"
import { slugify, formatPageMeta } from "@/lib/utils"
import { ensureSlugUnique, findByIdOrThrow, findBySlugOrThrow } from "@/lib/services/shared"
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category"
import type { Prisma } from "@prisma/client"

const defaultSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  displayOrder: true,
  parentId: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect

async function validateParent(parentId: string | null | undefined): Promise<void> {
  if (!parentId) return
  const parent = await prisma.category.findFirst({
    where: { id: parentId, isDeleted: false },
    select: { id: true },
  })
  if (!parent) throw new NotFoundError("Category", parentId)
}

export const categoryService = {
  async create(data: CreateCategoryInput) {
    await validateParent(data.parentId)

    const baseSlug = slugify(data.name)
    const slug = await ensureSlugUnique(prisma.category, baseSlug)

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        displayOrder: data.displayOrder,
        parentId: data.parentId ?? null,
      },
      select: defaultSelect,
    })

    return category
  },

  async update(id: string, data: UpdateCategoryInput) {
    const existing = await findByIdOrThrow(prisma.category, id, "Category")

    if (data.parentId !== undefined) {
      if (data.parentId === id) throw new ConflictError("Category cannot be its own parent")
      await validateParent(data.parentId)
    }

    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      const baseSlug = slugify(data.name)
      slug = await ensureSlugUnique(prisma.category, baseSlug, id)
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        slug,
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? null }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.parentId !== undefined && { parentId: data.parentId ?? null }),
      },
      select: defaultSelect,
    })

    return category
  },

  async delete(id: string) {
    await findByIdOrThrow(prisma.category, id, "Category")

    const [hasChildren, hasProducts] = await Promise.all([
      prisma.category.count({ where: { parentId: id, isDeleted: false } }),
      prisma.product.count({ where: { categoryId: id, isDeleted: false } }),
    ])

    if (hasChildren > 0) {
      throw new ConflictError("Cannot delete category with subcategories. Remove or reassign children first.")
    }

    if (hasProducts > 0) {
      throw new ConflictError(
        `Cannot delete category with ${hasProducts} product(s). Reassign products first.`
      )
    }

    await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    })
  },

  async getById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, isDeleted: false },
      select: defaultSelect,
    })
    if (!category) throw new NotFoundError("Category", id)
    return category
  },

  async getBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, isDeleted: false },
      select: {
        ...defaultSelect,
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isDeleted: false },
          select: { id: true, name: true, slug: true, displayOrder: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    })
    if (!category) throw new NotFoundError("Category", slug)
    return category
  },

  async list() {
    const items = await prisma.category.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        displayOrder: true,
        parentId: true,
        createdAt: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    })
    return items
  },

  async getTree() {
    const all = await prisma.category.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        displayOrder: true,
        parentId: true,
        _count: { select: { products: { where: { isDeleted: false } } } },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    })

    type TreeNode = (typeof all)[number] & { children: TreeNode[] }
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    for (const cat of all) {
      map.set(cat.id, { ...cat, children: [] })
    }

    for (const cat of all) {
      const node = map.get(cat.id)!
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  },

  async getProductsBySlug(slug: string, page = 1, limit = 12) {
    const category = await findBySlugOrThrow(prisma.category, slug, "Category", { select: { id: true } })

    const skip = (page - 1) * limit

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id, isDeleted: false, isPublished: true },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          imageUrl: true,
          images: true,
          stockQuantity: true,
          isFeatured: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: { categoryId: category.id, isDeleted: false, isPublished: true },
      }),
    ])

    return {
      category: await categoryService.getBySlug(slug),
      products: items.map((p) => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      })),
      ...formatPageMeta(totalCount, page, limit),
    }
  },
}
