import { apiFetch } from '@/lib/api-client'
import { WishlistItemDto, AddWishlistItemDto } from '@/types'

export const wishlistService = {
  getMyWishlist: () =>
    apiFetch<WishlistItemDto[]>('/api/wishlist'),

  add: (dto: AddWishlistItemDto) =>
    apiFetch<WishlistItemDto>('/api/wishlist/items', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  remove: (itemId: string) =>
    apiFetch<void>(`/api/wishlist/items/${itemId}`, { method: 'DELETE' }),
}
