import { Skeleton } from '@/components/ui/Skeleton'

export default function CheckoutLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col md:flex-row gap-16 items-start">
      <div className="flex-1 w-full">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-12">
          <section>
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </section>
          <section>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl col-span-2" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </section>
          <section>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </section>
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
      <div className="w-full md:w-96 rounded-2xl bg-gray-50 border border-gray-200 p-8 sticky top-24">
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="space-y-4 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-px w-full bg-gray-200" />
        <div className="flex justify-between items-center pt-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  )
}
