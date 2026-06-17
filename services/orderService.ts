import { apiFetch } from '@/lib/api-client'
import { OrderResponseDto, PaginatedResponse, UpdateOrderStatusDto } from '@/types'

export const orderService = {
  getMyOrders: () =>
    apiFetch<PaginatedResponse<OrderResponseDto>>('/api/orders').then(r => r.items),

  getOrder: (id: string) =>
    apiFetch<OrderResponseDto>(`/api/orders/${id}`),

  getAllOrders: () =>
    apiFetch<PaginatedResponse<OrderResponseDto>>('/api/orders/admin').then(r => r.items),

  checkout: (dto?: Record<string, unknown>) =>
    apiFetch<OrderResponseDto>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(dto ?? {}),
    }),

  updateStatus: (id: string, dto: UpdateOrderStatusDto) =>
    apiFetch<OrderResponseDto>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
}
