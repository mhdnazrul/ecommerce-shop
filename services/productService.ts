import { apiFetch } from '@/lib/api-client'
import { ProductResponseDto, PaginatedResponse, ProductSearchDto } from '@/types'

export const productService = {
  search: (params: ProductSearchDto) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.categorySlug) query.set('categorySlug', params.categorySlug)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    return apiFetch<PaginatedResponse<ProductResponseDto>>(`/api/products?${query}`)
  },

  getBySlug: (slug: string) =>
    apiFetch<ProductResponseDto>(`/api/products/slug/${slug}`),

  create: (dto: any) =>
    apiFetch<ProductResponseDto>('/api/products', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: any) =>
    apiFetch<ProductResponseDto>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' }),
}
