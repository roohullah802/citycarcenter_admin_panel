'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Search, Command } from 'lucide-react'

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 glass border-b border-surface-800/50 shadow-sm">
      <div className="flex flex-1 justify-between px-8">
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-surface-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-2.5 border border-surface-800 rounded-xl bg-surface-900/50 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all placeholder:text-surface-600"
              placeholder="Search anything..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-surface-800 bg-surface-900 text-[10px] font-medium text-surface-400">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center gap-6">
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-200"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface-950" />
          </button>

          <div className="h-8 w-px bg-surface-800 hidden sm:block" />

          {/* Profile dropdown */}
          <div className="relative flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-sm font-semibold text-surface-100 leading-none">Admin User</span>
              <span className="text-[10px] font-medium text-surface-500 mt-1">Super Admin</span>
            </div>
            <div className="p-0.5 rounded-full ring-2 ring-brand-500/20">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 rounded-full"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
