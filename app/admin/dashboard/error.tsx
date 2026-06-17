'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Admin dashboard error boundary caught error', {}, error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <span className="text-6xl mb-6 block">📊</span>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Dashboard Error</h2>
        <p className="text-gray-500 mb-8 font-medium">Something went wrong loading the dashboard. Please try again.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Try Again</Button>
          <Link href="/admin/dashboard" className="px-6 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
