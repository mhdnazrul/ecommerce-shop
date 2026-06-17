'use client'

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface CheckoutPaymentFormProps {
  orderId: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function CheckoutPaymentForm({ orderId, onSuccess, onError }: CheckoutPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/success/${orderId}`,
      },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message ?? 'Payment failed')
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-4 text-base font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? <LoadingSpinner /> : 'Pay Now'}
      </button>
    </form>
  )
}
