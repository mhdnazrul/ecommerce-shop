import { useQuery } from '@tanstack/react-query'

interface DashboardMetrics {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics', {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "Failed to fetch metrics")
      return json.data as DashboardMetrics
    }
  })
}
