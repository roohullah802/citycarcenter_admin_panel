'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthToken } from '@/lib/axios'

export function TokenInitializer() {
  const { getToken } = useAuth()

  useEffect(() => {
    const initToken = async () => {
      try {
        const token = await getToken()

        setAuthToken(token)
      } catch (error) {
        console.error('Failed to initialize auth token:', error)
      }
    }

    initToken()

    const interval = setInterval(initToken, 50000)
    return () => clearInterval(interval)
  }, [getToken])

  return null
}
