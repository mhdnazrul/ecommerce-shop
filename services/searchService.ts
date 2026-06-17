import { apiFetch } from '@/lib/api-client'

export async function fetchSearchSuggestions(query: string) {
  return apiFetch<Array<{ id: string; name: string; price: number; imageUrl?: string; slug: string }>>(
    `/api/products?search=${encodeURIComponent(query)}&limit=5`
  )
}
