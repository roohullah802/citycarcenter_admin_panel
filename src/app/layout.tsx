import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Admin Panel | City Car Center',
    template: " %s | City Car Center Admin"
  },
  description: 'Premium administration panel for City Car Center',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning>
        <body className={`${inter.className} h-full`} suppressHydrationWarning>
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
