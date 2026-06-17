import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch<{ clientSecret: string }>('/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      }),
  })
}
