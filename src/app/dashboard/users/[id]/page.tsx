'use client'

import { useUsers } from '@/hooks/useUsers'
import { useParams } from 'next/navigation'
import { Loader2, ArrowLeft, UserCircle2, Wallet, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default function UserDetailsPage() {
  const params = useParams()
  const { getUserDetails } = useUsers()
  const { data, isLoading } = getUserDetails(params.id as string)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading profile details...</p>
        </div>
      </div>
    )
  }

  if (!data?.user) return <div className="text-surface-400 p-12 text-center">User not found</div>

  const { user, totalPaid, activeLeases, completedLeases } = data

  const leaseColumns = [
    {
      accessorKey: 'car.brand',
      header: 'Vehicle',
      cell: ({ row }: any) => (
        <Link href={`/dashboard/cars/${row.original.car?._id}`} className="font-bold text-brand-400 hover:text-brand-300 transition-colors capitalize">
          {row.original.car?.brand} {row.original.car?.modelName}
        </Link>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: any) => <span className="text-surface-400">{new Date(row.original.startDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: any) => <span className="text-surface-400">{new Date(row.original.endDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }: any) => <span className="text-emerald-400 font-bold">${row.original.totalAmount}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status
        const isActive = status === 'active'
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-surface-800 text-surface-500 border-surface-700'}`}>
            {status}
          </span>
        )
      },
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            User Profile
          </h2>
          <p className="text-surface-400 font-medium">Detailed view of customer account and history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-surface-800/50 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-600 via-brand-400 to-brand-600" />
            <div className="mx-auto h-24 w-24 rounded-2xl bg-surface-800 flex items-center justify-center overflow-hidden mb-6 border border-surface-700 shadow-xl group cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="h-full w-full bg-brand-500/10 flex items-center justify-center text-3xl font-bold text-brand-400 uppercase">
                  {(user.name || user.username || '?').charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-surface-50 tracking-tight">{user.username}</h3>
            <p className="text-brand-400 font-medium mt-1">{user.email}</p>
            <p className="text-sm text-surface-500 mt-2 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Member since {new Date(user.createdAt).getFullYear()}
            </p>
          </div>

          <div className="bg-card border border-surface-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">LTD Spend</span>
                </div>
                <span className="font-bold text-emerald-400 text-lg">${totalPaid.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Active Rentals</span>
                </div>
                <span className="font-bold text-surface-50 text-lg">{activeLeases?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Status <pre>  </pre></span>
                </div>
                <span className={`font-bold text-xs uppercase tracking-widest ${user.documentStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {user.documentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leases Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-surface-50 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
              Active Leases
            </h3>
            <DataTable columns={leaseColumns} data={activeLeases || []} />
          </div>
          <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-surface-400">
              <span className="w-1.5 h-6 bg-surface-700 rounded-full" />
              Rental History
            </h3>
            <DataTable columns={leaseColumns} data={completedLeases || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
