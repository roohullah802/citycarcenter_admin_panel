'use client'

import { useUsers } from '@/hooks/useUsers'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function UsersPage() {
  const { getUsers, deleteUser } = useUsers()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'avatar',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface-800 overflow-hidden flex items-center justify-center border border-surface-700">
            {row.original.avatar ? (
              <img src={row.original.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-surface-400 font-bold text-xs">
                {row.original.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-surface-50 leading-none">{row.original.name}</span>
            <span className="text-[10px] font-medium text-surface-500 mt-1 uppercase tracking-wider">{row.original.role || 'User'}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => <span className="text-surface-400 font-medium">{row.original.email}</span>,
    },
    {
      accessorKey: 'documentStatus',
      header: 'Verification',
      cell: ({ row }) => {
        const status = row.original.documentStatus
        let colorClass = 'bg-surface-800 text-surface-400 border-surface-700'
        if (status === 'approved') colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (status === 'pending') colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        if (status === 'rejected') colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20'

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
            {status || 'Not Submitted'}
          </span>
        )
      },
    },
    {
      accessorKey: 'totalLeases',
      header: 'Leases',
      cell: ({ row }) => (
        <span className="font-bold text-surface-200">
          {row.original.totalLeases || 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => (
        <span className="text-surface-500 font-medium text-xs">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end space-x-2">
            <Link
              href={`/dashboard/users/${row.original._id}`}
              className="p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this user? This will also free up any active leases.')) {
                  deleteUser.mutate(row.original._id)
                }
              }}
              className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              {deleteUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        )
      },
    },
  ]

  if (getUsers.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Fetching users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            User Management
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Manage your customer base, verify documents, and track user activity.
          </p>
        </div>
      </div>


      <DataTable columns={columns} data={getUsers.data || []} />
    </div>
  )
}
