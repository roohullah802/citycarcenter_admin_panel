'use client'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Car, Users, ReceiptText, DollarSign, Loader2, ArrowUpRight, ArrowDownRight, LayoutDashboard, ShieldCheck, FileText, Settings, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading workspace...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Users',
      stat: data?.stats?.totalUsers || 0,
      icon: Users,
      change: '+12.5%',
      changeType: 'increase',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      name: 'Total Cars',
      stat: data?.stats?.totalCars || 0,
      icon: Car,
      change: '+3.2%',
      changeType: 'increase',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      name: 'Active Leases',
      stat: data?.stats?.activeLeases || 0,
      icon: ReceiptText,
      change: '-2.1%',
      changeType: 'decrease',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      name: 'Total Revenue',
      stat: `$${(data?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+18.4%',
      changeType: 'increase',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-surface-50">
          Workspace Overview
        </h2>
        <p className="text-surface-400 font-medium">
          Welcome back, Admin. Here's what's happening with your fleet today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-surface-800/50 hover:shadow-md hover:border-brand-500/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} transition-colors group-hover:scale-110 duration-300`}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${item.changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.changeType === 'increase' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {item.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-400 tracking-wide uppercase">{item.name}</p>
              <p className="mt-1 text-3xl font-bold text-surface-50 tracking-tight">{item.stat}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-surface-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-50 text-brand-400 uppercase tracking-widest text-sm">Management Console</h3>
                <p className="text-sm text-surface-400 mt-0.5">Quick access to essential fleet operations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/cars/create" className="group p-5 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-surface-800 text-surface-300 group-hover:text-brand-400 transition-colors">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-100">Add New Vehicle</h4>
                    <p className="text-xs text-surface-500 mt-1">Expand your fleet inventory</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/documents" className="group p-5 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-surface-800 text-surface-300 group-hover:text-brand-400 transition-colors">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-100">Verify Users</h4>
                    <p className="text-xs text-surface-500 mt-1">Review pending documentation</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/content" className="group p-5 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-surface-800 text-surface-300 group-hover:text-brand-400 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-100">Content Manager</h4>
                    <p className="text-xs text-surface-500 mt-1">Manage FAQs and policies</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/complaints" className="group p-5 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-surface-800 text-surface-300 group-hover:text-brand-400 transition-colors">
                    <ReceiptText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-100">Service Requests</h4>
                    <p className="text-xs text-surface-500 mt-1">Address customer complaints</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* System Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-surface-800 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-6">System Health</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-medium text-surface-300">API Gateway</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-medium text-surface-300">Database Cluster</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Synced</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-medium text-surface-300">Asset Storage</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
                </div>
             </div>

             <div className="mt-8 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
                <div className="flex items-center gap-3 text-brand-400 mb-2">
                  <Settings className="h-4 w-4 animate-spin-slow" />
                  <span className="text-xs font-bold uppercase tracking-wider">Environment</span>
                </div>
                <p className="text-[11px] text-surface-500 font-medium leading-relaxed">
                  The dashboard is currently running in production mode. Data sync is established with the primary fleet node.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
