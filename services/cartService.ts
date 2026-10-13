import { apiFetch } from '@/lib/api-client'
import { CartDto, AddToCartDto } from '@/types'

export const cartService = {
  getCart: () => apiFetch<CartDto>('/api/cart'),

  addItem: (dto: AddToCartDto) =>
    apiFetch<CartDto>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateQuantity: (itemId: string, quantity: number) =>
    apiFetch<CartDto>(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    apiFetch<void>(`/api/cart/items/${itemId}`, { method: 'DELETE' }),

  clearCart: () =>
    apiFetch<CartDto>('/api/cart', { method: 'DELETE' }),
}
