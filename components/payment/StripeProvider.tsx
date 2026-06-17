'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { ReactNode } from 'react'

interface StripeProviderProps {
  clientSecret: string
  children: ReactNode
}

let stripePromise: ReturnType<typeof loadStripe> | null = null

function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (key) {
      stripePromise = loadStripe(key)
    }
  }
  return stripePromise
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const stripe = getStripePromise()

  if (!stripe) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 font-bold text-center">
        Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file.
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4f46e5',
        borderRadius: '12px',
      },
    },
  }

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  )
}
