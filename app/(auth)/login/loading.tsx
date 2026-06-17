import { Skeleton } from '@/components/ui/Skeleton'

export default function LoginLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="text-center mb-8">
            <Skeleton className="h-7 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <div className="space-y-5">
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="relative my-6">
            <Skeleton className="h-px w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl mb-6" />
          <div className="text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
