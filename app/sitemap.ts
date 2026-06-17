import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cart`, lastModified: new Date(), changeFrequency: 'never', priority: 0.3 },
  ]

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${BASE_URL}/api/products?limit=1000`),
      fetch(`${BASE_URL}/api/categories`),
    ])

    const productsJson = await productsRes.json()
    const categoriesJson = await categoriesRes.json()

    const productRoutes: MetadataRoute.Sitemap = (productsJson.data?.items || []).map((p: any) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = (categoriesJson.data || []).map((c: any) => ({
      url: `${BASE_URL}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...productRoutes, ...categoryRoutes]
  } catch {
    return staticRoutes
  }
}
