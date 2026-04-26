'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { api } from '@/lib/axios'

export function TokenInitializer() {
  const { getToken } = useAuth()

  useEffect(() => {
    const initToken = async () => {
      try {
        const token = await getToken()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Failed to initialize auth token:', error)
      }
    }

    initToken()
    
    // Refresh token every 50 seconds (Clerk tokens expire every 60s usually)
    const interval = setInterval(initToken, 50000)
    return () => clearInterval(interval)
  }, [getToken])

  return null
}
