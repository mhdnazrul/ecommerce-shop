import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthSessionProvider } from '@/providers/session-provider'
import QueryProvider from '@/providers/QueryProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Shopfinity | Premium Tech Gear',
    template: '%s | Shopfinity',
  },
  description: 'Top-tier laptops, audio, accessories, and mobile hardware. Elevate your setup.',
  openGraph: {
    title: 'Shopfinity | Premium Tech Gear',
    description: 'Top-tier laptops, audio, accessories, and mobile hardware. Elevate your setup.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Shopfinity',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopfinity | Premium Tech Gear',
    description: 'Top-tier laptops, audio, accessories, and mobile hardware. Elevate your setup.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen flex flex-col pt-16`}>
        <AuthSessionProvider>
          <QueryProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
