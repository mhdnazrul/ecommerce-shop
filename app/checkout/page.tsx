'use client'

import { useState, useRef } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/lib/auth-client'
import { useCheckout } from '@/hooks/useOrders'
import { useCreatePaymentIntent } from '@/hooks/usePayment'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/formatters'
import { getFullImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { StripeProvider } from '@/components/payment/StripeProvider'
import { CheckoutPaymentForm } from '@/components/payment/CheckoutPaymentForm'

type Step = 'checkout' | 'payment' | 'complete'

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { items, totalPrice, resetCartCache } = useCart()
  const router = useRouter()

  const formRef = useRef<HTMLFormElement>(null)
  const [notes, setNotes] = useState('')

  const [step, setStep] = useState<Step>('checkout')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const checkoutMutation = useCheckout()
  const paymentIntentMutation = useCreatePaymentIntent()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!authLoading && user && items.length === 0 && step === 'checkout') router.push('/cart')
  }, [user, authLoading, items, router, step])

  if (!user || items.length === 0) return null

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const shippingAddress = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      line1: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
    }

    try {
      const order = await checkoutMutation.mutateAsync({
        shippingAddress: {
          ...shippingAddress,
          country: 'US',
        },
        notes: notes || undefined,
      })
      setOrderId(order.id)
      resetCartCache()

      // Now create PaymentIntent
      const { clientSecret: secret } = await paymentIntentMutation.mutateAsync(order.id)
      setClientSecret(secret)
      setStep('payment')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
    }
  }

  const handlePaymentSuccess = () => {
    setStep('complete')
    toast.success('Payment confirmed!')
    router.push(`/orders/success/${orderId}`)
  }

  const handlePaymentError = (message: string) => {
    toast.error(message)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col md:flex-row gap-16 items-start">
      <div className="flex-1 w-full">
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
          {step === 'payment' ? 'Complete Payment' : step === 'complete' ? 'Order Placed!' : 'Checkout'}
        </h1>

        {step === 'checkout' && (
          <form ref={formRef} onSubmit={handleCheckout} className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 font-medium">{user.email}</div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input required name="firstName" type="text" placeholder="First Name" className="col-span-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full bg-white"/>
                <input required name="lastName" type="text" placeholder="Last Name" className="col-span-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full bg-white"/>
                <input required name="address" type="text" placeholder="Address" className="col-span-2 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full bg-white"/>
                <input required name="city" type="text" placeholder="City" className="col-span-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full bg-white"/>
                <input required name="postalCode" type="text" placeholder="ZIP Code" className="col-span-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full bg-white"/>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for your order..."
                rows={3}
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </section>

            <button
              type="submit"
              disabled={checkoutMutation.isPending || paymentIntentMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-4 text-base font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(checkoutMutation.isPending || paymentIntentMutation.isPending) ? <LoadingSpinner /> : 'Place Order'}
            </button>
          </form>
        )}

        {step === 'payment' && clientSecret && orderId && (
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-sm text-indigo-800 font-bold text-center">
              Secure payment via Stripe
            </div>
            <StripeProvider clientSecret={clientSecret}>
              <CheckoutPaymentForm
                orderId={orderId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </StripeProvider>
          </div>
        )}
      </div>

      <div className="w-full md:w-96 rounded-2xl bg-gray-50 border border-gray-200 p-8 sticky top-24">
        <h2 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-200">In Your Cart</h2>

        <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 p-1 flex-shrink-0 relative overflow-hidden">
                  {(item.product.imageUrl || item.product.images[0]) ? (
                    <Image
                      src={getFullImageUrl(item.product.imageUrl || item.product.images[0])}
                      fill
                      className="object-contain mix-blend-multiply"
                      alt=""
                      sizes="48px"
                      unoptimized={getFullImageUrl(item.product.imageUrl || item.product.images[0]).startsWith('http://localhost') || getFullImageUrl(item.product.imageUrl || item.product.images[0]).startsWith('http://127.0.0.1')}
                    />
                  ) : null}
                </div>
                <span className="text-gray-700 font-medium truncate">{item.product.name} <span className="text-gray-400">×{item.quantity}</span></span>
              </div>
              <span className="text-gray-900 font-bold">{formatPrice(item.quantity * (item.unitPrice ?? item.product.price))}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between font-bold items-center">
            <span className="text-gray-600">Total Due</span>
            <span className="text-gray-900 text-3xl font-black">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
