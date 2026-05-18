import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Modern Bazaar — Curated Commerce',
    template: '%s | Modern Bazaar',
  },
  description:
    'Discover premium kitchen appliances, food products, kids toys, watches, and earbuds at Modern Bazaar. Modern commerce, elevated.',
  keywords: ['ecommerce', 'kitchen appliances', 'watches', 'earbuds', 'toys', 'shopping'],
  authors: [{ name: 'Modern Bazaar' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://modernbazaar.com',
    siteName: 'Modern Bazaar',
    title: 'Modern Bazaar — Curated Commerce',
    description: 'Discover premium products at Modern Bazaar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modern Bazaar',
    description: 'Curated Commerce, elevated.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
