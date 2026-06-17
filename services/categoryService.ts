import { apiFetch } from '@/lib/api-client'
import { CategoryDto } from '@/types'

export const categoryService = {
  getAll: () => apiFetch<CategoryDto[]>('/api/categories'),

  create: (dto: any) =>
    apiFetch<CategoryDto>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: any) =>
    apiFetch<CategoryDto>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/categories/${id}`, { method: 'DELETE' }),
}
