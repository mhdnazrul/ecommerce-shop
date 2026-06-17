export const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return `/${url}`;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateUniqueSlug(text: string, existingSlug?: string): string {
  if (existingSlug) return existingSlug
  return slugify(text)
}

export function formatPageMeta(totalCount: number, page: number, limit: number) {
  const totalPages = Math.ceil(totalCount / limit) || 1
  return {
    totalCount,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function parseSearchParams(searchParams: URLSearchParams): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {}
  for (const [key, value] of searchParams.entries()) {
    result[key] = value
  }
  return result
}
