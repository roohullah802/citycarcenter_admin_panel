'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  ReceiptText, 
  FileCheck2, 
  AlertTriangle,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cars Fleet', href: '/dashboard/cars', icon: Car },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Leases & Transactions', href: '/dashboard/leases', icon: ReceiptText },
  { name: 'Document Verification', href: '/dashboard/documents', icon: FileCheck2 },
  { name: 'Complaints', href: '/dashboard/complaints', icon: AlertTriangle },
  { name: 'Content Management', href: '/dashboard/content', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-surface-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface-950 border-r border-surface-800/50 text-surface-300
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-20 shrink-0 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl premium-gradient shadow-lg shadow-brand-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight leading-none">City Car</span>
              <span className="text-[10px] font-medium text-surface-50 uppercase tracking-[0.2em] mt-1">Admin Panel</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={close}
            className="p-2 -mr-2 text-surface-400 hover:text-white lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar px-4 py-4">
          <nav className="flex-1 space-y-1.5">
            <div className="text-[10px] font-bold text-surface-600 uppercase tracking-[0.15em] mb-4 px-4">
              General
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={close}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                      : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-100 border border-transparent'}
                  `}
                >
                  <item.icon
                    className={`
                      mr-3.5 h-5 w-5 transition-colors duration-200
                      ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-auto px-4 py-6">
            <div className="rounded-2xl bg-surface-900 border border-surface-800/50 p-4">
              <p className="text-xs font-medium text-surface-400">System Status</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-surface-100 font-semibold uppercase tracking-wider">All Systems Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
