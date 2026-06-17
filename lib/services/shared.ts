import { prisma } from "@/prisma/client"
import { NotFoundError } from "@/lib/errors"

type SlugModel = { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> }

export async function ensureSlugUnique(
  model: SlugModel,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await model.findUnique({ where: { slug } })
    if (!existing || (excludeId && existing.id === excludeId)) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function findByIdOrThrow<T>(
  model: { findFirst: (args: { where: Record<string, unknown> }) => Promise<T | null> },
  id: string,
  resource: string,
  extraWhere?: Record<string, unknown>
): Promise<T> {
  const record = await model.findFirst({
    where: { id, isDeleted: false, ...extraWhere },
  })
  if (!record) throw new NotFoundError(resource, id)
  return record
}

export async function findBySlugOrThrow<T>(
  model: { findFirst: (args: { where: Record<string, unknown> }) => Promise<T | null> },
  slug: string,
  resource: string,
  extraWhere?: Record<string, unknown>
): Promise<T> {
  const record = await model.findFirst({
    where: { slug, isDeleted: false, ...extraWhere },
  })
  if (!record) throw new NotFoundError(resource, slug)
  return record
}
