'use client'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Car, Users, ReceiptText, DollarSign, Loader2, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { totalUsers, totalCars, activeLeases, transactions, isLoading } = useDashboardStats()

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
      stat: totalUsers.data || 0, 
      icon: Users, 
      change: '+12.5%', 
      changeType: 'increase',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      name: 'Total Cars', 
      stat: totalCars.data || 0, 
      icon: Car, 
      change: '+3.2%', 
      changeType: 'increase',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    { 
      name: 'Active Leases', 
      stat: activeLeases.data || 0, 
      icon: ReceiptText, 
      change: '-2.1%', 
      changeType: 'decrease',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    { 
      name: 'Total Revenue', 
      stat: `$${(transactions.data?.revenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      change: '+18.4%', 
      changeType: 'increase',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
  ]

  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 4890 },
    { name: 'Jun', revenue: 6390 },
    { name: 'Jul', revenue: 7490 },
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-card p-8 shadow-sm border border-surface-800/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-surface-50">Revenue Performance</h3>
              <p className="text-sm font-medium text-surface-400 mt-1">Monthly revenue growth and projections</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
              <MoreHorizontal className="h-5 w-5 text-surface-400" />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  dx={-10} 
                  tickFormatter={(val) => `$${val}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111114',
                    borderRadius: '12px', 
                    border: '1px solid #1f1f23', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 600, fontSize: '14px', color: '#fafafa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#111114' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-card p-8 shadow-sm border border-surface-800/50 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-surface-50">Recent Leases</h3>
            <button className="text-xs font-bold text-brand-400 hover:text-brand-300 tracking-tight uppercase">View All</button>
          </div>
          <div className="flex-1 space-y-6">
            {(transactions.data?.leases || []).slice(0, 6).map((lease: any) => (
              <div key={lease._id} className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-surface-800/50 flex items-center justify-center border border-surface-700 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-colors duration-200">
                  <ReceiptText className="h-5 w-5 text-surface-500 group-hover:text-brand-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-surface-50 truncate">
                    {lease.user?.username || 'Unknown User'}
                  </p>
                  <p className="text-xs font-medium text-surface-500 mt-0.5">
                    {lease.car?.brand} {lease.car?.modelName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    +${lease.totalAmount}
                  </p>
                  <p className="text-[10px] font-medium text-surface-400 uppercase mt-0.5">
                    {new Date(lease.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!transactions.data?.leases || transactions.data.leases.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="h-16 w-16 rounded-full bg-surface-50 flex items-center justify-center mb-4">
                  <ReceiptText className="h-8 w-8 text-surface-200" />
                </div>
                <p className="text-sm font-medium text-surface-400">No recent transactions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
