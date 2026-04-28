'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Trash2, ReceiptText, TrendingUp, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LeasesPage() {
  const queryClient = useQueryClient()

  const getLeases = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const res = await api.get('/admin/transactions')
      return res.data
    },
  })

  const deleteLease = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/leases/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      toast.success('Lease deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete lease')
    },
  })

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'car.brand',
      header: 'Vehicle',
      cell: ({ row }: any) => (
        <Link href={`/dashboard/cars/${row.original.car?._id}`} className="text-brand-400 hover:text-brand-300 font-bold transition-colors capitalize">
          {row.original.car?.brand} {row.original.car?.modelName}
        </Link>
      ),
    },
    {
      accessorKey: 'user.username',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <Link href={`/dashboard/users/${row.original.user?._id}`} className="text-surface-50 hover:text-brand-400 font-bold transition-colors">
            {row.original.user?.username || 'Unknown'}
          </Link>
          <span className="text-[10px] text-surface-500 font-medium tracking-wider uppercase">{row.original.user?.email || 'No Email'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="flex flex-col text-xs font-medium text-surface-400">
          <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
          <span className="text-[10px] opacity-50">to {new Date(row.original.endDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Paid',
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
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this lease record?')) {
                deleteLease.mutate(row.original._id)
              }
            }}
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            {deleteLease.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ]

  if (getLeases.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Syncing transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Leases & Transactions
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Monitor fleet utilization and track historical revenue performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
            <TrendingUp className="h-24 w-24 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-4xl font-bold text-emerald-400 tracking-tight">${(getLeases.data?.stats?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
            <CreditCard className="h-24 w-24 text-brand-400" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Total Transactions</p>
          </div>
          <p className="text-4xl font-bold text-surface-50 tracking-tight">{(getLeases.data?.stats?.totalTransactions || 0).toLocaleString()}</p>
        </div>
      </div>

      <DataTable columns={columns} data={getLeases.data?.data || []} />
    </div>
  )
}
