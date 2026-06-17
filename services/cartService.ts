import { apiFetch } from '@/lib/api-client'
import { CartDto, AddToCartDto } from '@/types'

export const cartService = {
  getCart: () => apiFetch<CartDto>('/api/cart'),

  addItem: (dto: AddToCartDto) =>
    apiFetch<CartDto>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  removeItem: (itemId: string) =>
    apiFetch<void>(`/api/cart/items/${itemId}`, { method: 'DELETE' }),

  clearCart: () =>
    apiFetch<void>('/api/cart/items', { method: 'DELETE' }),
}
