"use client"
import { useClerk } from '@clerk/nextjs'
import { ShieldAlert } from 'lucide-react'

export default function AccessDenied() {
  const { signOut } = useClerk()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-2xl shadow-2xl border border-surface-800/50 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-surface-50">
            Access Denied
          </h2>
          <p className="mt-4 text-center text-sm text-surface-400 font-medium leading-relaxed">
            You do not have the required administrative privileges to view this application. 
            Please contact the system administrator for access.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 uppercase tracking-wider"
          >
            Sign out and try another account
          </button>
        </div>
      </div>
    </div>
  )
}

