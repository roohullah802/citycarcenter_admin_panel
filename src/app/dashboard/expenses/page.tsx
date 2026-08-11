'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, Trash2, Wallet, DollarSign, SearchX, Calendar, X, FileText, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'
import { useState, useMemo } from 'react'

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const { searchQuery } = useSearch()

  // Date filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const getExpenses = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/admin/expenses')
      return res.data
    },
  })

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/expenses/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      toast.success('Expense record deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete expense record')
    },
  })

  const filteredExpenses = useMemo(() => {
    let data = getExpenses.data?.data || []

    if (searchQuery) {
      const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      data = data.filter((item: any) => {
        const text = [
          item.car?.brand,
          item.car?.modelName,
          item.category,
          item.description,
          item.createdAdmin?.name,
        ].filter(Boolean).join(' ').toLowerCase()
        return tokens.every(token => text.includes(token))
      })
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      data = data.filter((item: any) => new Date(item.date || item.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      data = data.filter((item: any) => new Date(item.date || item.createdAt) <= to)
    }

    return data
  }, [getExpenses.data, searchQuery, dateFrom, dateTo])

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'car',
      header: 'Vehicle / Target',
      cell: ({ row }: any) => {
        const car = row.original.car
        return car ? (
          <div className="flex flex-col">
            <span className="font-bold text-surface-50 capitalize">
              {car.brand} {car.modelName}
            </span>
            <span className="text-[10px] text-surface-500 font-medium">
              {car.year}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-800 text-surface-400 border border-surface-700">
            General Business Expense
          </span>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
          {row.original.category?.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-bold text-rose-400 text-base">
          ${(row.original.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Expense Date',
      cell: ({ row }: any) => (
        <span className="text-xs text-surface-400 font-medium">
          {new Date(row.original.date || row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <span className="text-xs text-surface-400 max-w-xs truncate block">
          {row.original.description || 'No description provided'}
        </span>
      ),
    },
    {
      accessorKey: 'receiptImage',
      header: 'Receipt Proof',
      cell: ({ row }: any) => {
        const receipt = row.original.receiptImage
        return receipt?.url ? (
          <a
            href={receipt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all border border-brand-500/20"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Receipt
          </a>
        ) : (
          <span className="text-[10px] text-surface-600 font-medium uppercase tracking-wider">No Receipt</span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense record?')) {
                deleteExpense.mutate(row.original._id)
              }
            }}
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Delete Expense"
          >
            {deleteExpense.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ]

  if (getExpenses.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading vehicle expenses...</p>
        </div>
      </div>
    )
  }

  const stats = getExpenses.data?.stats || {}

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Expenses Management
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Log and track vehicle maintenance, fuel, insurance, and operational costs.
          </p>
        </div>
        <Link
          href="/dashboard/expenses/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Recorded Expenses</p>
          </div>
          <p className="text-3xl font-bold text-rose-400 tracking-tight">${(stats.totalExpenseAmount || 0).toLocaleString()}</p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Expenses This Month</p>
          </div>
          <p className="text-3xl font-bold text-amber-400 tracking-tight">${(stats.thisMonthExpenses || 0).toLocaleString()}</p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Expense Items</p>
          </div>
          <p className="text-3xl font-bold text-surface-50 tracking-tight">{(stats.totalExpensesCount || 0).toLocaleString()}</p>
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
            Showing {filteredExpenses.length} record(s)
          </span>
        )}
      </div>

      {filteredExpenses.length === 0 && (searchQuery || dateFrom || dateTo) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No expense records found</h3>
          <p className="text-surface-500 text-sm mt-1">We couldn't find any records matching your filter criteria.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredExpenses} />
      )}
    </div>
  )
}
