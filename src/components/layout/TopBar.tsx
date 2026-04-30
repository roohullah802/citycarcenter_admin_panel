'use client'

import { UserButton } from '@clerk/nextjs'
import { Search, Command, X, Menu, ShieldCheck } from 'lucide-react'
import { useSearch } from '@/context/SearchContext'
import { useSidebar } from '@/context/SidebarContext'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function TopBar() {
  const { searchQuery, setSearchQuery } = useSearch()
  const { toggle } = useSidebar()
  const pathname = usePathname()
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  // Sync local search with global search query when it changes elsewhere
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Determine if search bar should be visible
  const searchEnabledRoutes = [
    '/dashboard/users',
    '/dashboard/cars',
    '/dashboard/leases',
    '/dashboard/complaints',
    '/dashboard/documents'
  ]

  const isSearchEnabled = searchEnabledRoutes.some(route => pathname.startsWith(route))

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    setSearchQuery(value)
  }

  const clearSearch = () => {
    setLocalSearch('')
    setSearchQuery('')
  }

  return (
    <div className="sticky top-0 z-30 flex h-20 flex-shrink-0 glass border-b border-surface-800/50 shadow-sm">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          {/* Mobile menu button and Logo */}
          {!isMobileSearchOpen && (
            <div className="flex items-center gap-4 lg:hidden">
              <button
                onClick={toggle}
                className="p-2 -ml-2 text-surface-400 hover:text-white transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">City Car Center</span>
              </div>
            </div>
          )}

          {isSearchEnabled && (
            <>
              {/* Desktop Search */}
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-surface-500" />
                </div>
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-12 py-2.5 border border-surface-800 rounded-xl bg-surface-900/50 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all placeholder:text-surface-600"
                  placeholder={`Search ${pathname.split('/').pop()}...`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {localSearch ? (
                    <button
                      onClick={clearSearch}
                      className="p-1 rounded-md hover:bg-surface-800 text-surface-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-surface-800 bg-surface-900 text-[10px] font-medium text-surface-400 pointer-events-none">
                      <Command className="h-3 w-3" />
                      <span>K</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Search Toggle */}
              <div className="md:hidden flex-1 flex items-center">
                {isMobileSearchOpen ? (
                  <div className="relative w-full flex items-center animate-in slide-in-from-right-4 duration-200">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-surface-500" />
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={localSearch}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-10 py-2 border border-brand-500/50 rounded-xl bg-surface-900 text-sm text-surface-100 focus:outline-none ring-2 ring-brand-500/20"
                      placeholder="Search..."
                    />
                    <button
                      onClick={() => {
                        setIsMobileSearchOpen(false)
                        clearSearch()
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-surface-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="p-2 text-surface-400 hover:text-white"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>
            </>
          )}

          {!isSearchEnabled && !isMobileSearchOpen && <div className="h-10 lg:hidden" />}
        </div>

        {!isMobileSearchOpen && (
          <div className="ml-4 flex items-center gap-2 sm:gap-6">
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
                      userButtonAvatarBox: "h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
