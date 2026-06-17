'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/orderService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/formatters'
import { getFullImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const params = useParams()
  const id = params.id as string

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Order Not Found</h1>
        <Link href="/orders" className="text-indigo-600 font-bold hover:underline">View my orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 font-medium">Your order has been placed successfully.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium">Order Number</p>
            <p className="text-xl font-black text-gray-900">{order.orderNumber}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-black border ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-4 mb-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 p-1 flex-shrink-0 relative overflow-hidden">
                {item.productImage ? (
                  <Image src={getFullImageUrl(item.productImage)} fill className="object-contain mix-blend-multiply" alt="" sizes="64px" unoptimized={getFullImageUrl(item.productImage).startsWith('http://localhost') || getFullImageUrl(item.productImage).startsWith('http://127.0.0.1')} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-black text-gray-900">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">Total Charged</span>
            <span className="text-3xl font-black text-gray-900">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/orders"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-4 px-8 text-base font-bold shadow-lg shadow-indigo-200 transition-all text-center"
        >
          View My Orders
        </Link>
        <Link
          href="/products"
          className="bg-white hover:bg-gray-50 text-gray-900 rounded-full py-4 px-8 text-base font-bold border border-gray-200 transition-all text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
