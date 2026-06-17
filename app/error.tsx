'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Root error boundary caught error', {}, error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 p-10">
        <span className="text-6xl block mb-6">⚠️</span>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Something went wrong!</h2>
        <p className="text-gray-500 mb-8 font-medium">
          We hit a snag trying to load this page. This could be a temporary issue or a broken link.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => reset()}>Try Again</Button>
          <Link href="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
