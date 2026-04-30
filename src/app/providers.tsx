'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { SearchProvider } from '@/context/SearchContext'
import { SidebarProvider } from '@/context/SidebarContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </SearchProvider>
    </QueryClientProvider>
  )
}
