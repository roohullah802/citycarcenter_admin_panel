'use client'
import { useSession } from 'next-auth/react'

import { useUsers } from '@/hooks/useUsers'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Eye, SearchX, Calendar, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/context/SearchContext'
import { useState, useMemo } from 'react'

export default function UsersPage() {
  const { getUsers, toggleRole } = useUsers()
  const { searchQuery } = useSearch()
  const router = useRouter()
  const { data: session } = useSession()

  // Date filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredUsers = useMemo(() => {
    let users = getUsers.data || []

    // Text search — tokenized to handle multi-word queries
    if (searchQuery) {
      const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      users = users.filter((user: any) =>
        tokens.every(token =>
          user.name?.toLowerCase().includes(token) ||
          user.email?.toLowerCase().includes(token)
        )
      )
    }

    // Date filter
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      users = users.filter((user: any) => new Date(user.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      users = users.filter((user: any) => new Date(user.createdAt) <= to)
    }

    return users
  }, [getUsers.data, searchQuery, dateFrom, dateTo])

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'avatar',
      header: 'User',
      cell: ({ row }) => (
        <div
          onClick={() => router.push(`/dashboard/users/${row.original._id}`)}
          className="flex items-center gap-3 cursor-pointer group/user py-1"
          title="Click to view details"
        >
          <div className="h-10 w-10 rounded-xl bg-surface-800 overflow-hidden flex items-center justify-center border border-surface-700 group-hover/user:border-brand-500/50 transition-colors">
            {row.original.avatar ? (
              <img src={row.original.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-surface-400 font-bold text-xs group-hover/user:text-brand-400 transition-colors">
                {row.original.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-surface-50 group-hover/user:text-brand-400 transition-colors leading-none">
              {row.original.name}
            </span>
            <span className="text-[10px] font-medium text-surface-500 mt-1 uppercase tracking-wider">
              {row.original.role || 'User'}
            </span>
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
        const isAdmin = session?.userRole === 'admin'
        const isSelf = session?.user?.email === row.original.email

        return (
          <div className="flex items-center justify-end space-x-2">
            {isAdmin && !isSelf && (
              <button
                onClick={() => toggleRole.mutate(row.original._id)}
                disabled={toggleRole.isPending}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  row.original.role === 'admin'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                } disabled:opacity-50`}
              >
                {row.original.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
              </button>
            )}
            <button
              onClick={() => router.push(`/dashboard/users/${row.original._id}`)}
              className="p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
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

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-4 bg-card border border-surface-800/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-surface-400">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Filter by Date</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-surface-500">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="rounded-xl border border-surface-800 bg-surface-900/50 py-2 px-3 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all cursor-pointer scheme:dark"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-surface-500">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="rounded-xl border border-surface-800 bg-surface-900/50 py-2 px-3 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all cursor-pointer scheme:dark"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={clearDateFilter}
              className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Clear date filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {(dateFrom || dateTo) && (
          <span className="text-xs text-brand-400 font-medium">
            Showing {filteredUsers.length} user(s)
          </span>
        )}
      </div>

      {filteredUsers.length === 0 && (searchQuery || dateFrom || dateTo) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No users found</h3>
          <p className="text-surface-500 text-sm mt-1">
            {searchQuery
              ? `We couldn't find any users matching "${searchQuery}"`
              : `No users found for the selected date range`}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
        />
      )}
    </div>
  )
}
