'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Wallet, 
  DollarSign, 
  SearchX, 
  Calendar, 
  X, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  RefreshCw,
  Edit2,
  ExternalLink,
  Car as CarIcon,
  TrendingDown,
  Filter,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'
import { useState, useMemo } from 'react'

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const { searchQuery } = useSearch()

  // Filter states
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Proof Modal State
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; title: string } | null>(null)

  // Query expenses
  const getExpenses = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/admin/expenses')
      return res.data
    },
  })

  // Delete mutation
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/expenses/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Expense record deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete expense record')
    },
  })

  // Update mutation
  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/admin/expenses/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Expense updated successfully')
      setEditingExpense(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update expense record')
    },
  })

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let data = getExpenses.data?.data || []

    if (searchQuery) {
      const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      data = data.filter((item: any) => {
        const text = [
          item.car?.brand,
          item.car?.modelName,
          item.car?.year,
          item.category,
          item.description,
          item.createdAdmin?.name,
          item.createdAdmin?.email
        ].filter(Boolean).join(' ').toLowerCase()
        return tokens.every(token => text.includes(token))
      })
    }

    if (categoryFilter !== 'ALL') {
      data = data.filter((item: any) => 
        (item.category || '').toLowerCase() === categoryFilter.toLowerCase()
      )
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
  }, [getExpenses.data, searchQuery, categoryFilter, dateFrom, dateTo])

  const openEditModal = (expense: any) => {
    setEditingExpense(expense)
    setEditCategory(expense.category || 'maintenance')
    setEditAmount(String(expense.amount || ''))
    setEditDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : '')
    setEditDescription(expense.description || '')
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return

    const parsedAmount = parseFloat(editAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid expense amount')
      return
    }

    updateExpense.mutate({
      id: editingExpense._id,
      data: {
        category: editCategory,
        amount: parsedAmount,
        date: editDate,
        description: editDescription,
      }
    })
  }

  const clearAllFilters = () => {
    setDateFrom('')
    setDateTo('')
    setCategoryFilter('ALL')
  }

  const getCategoryBadgeClass = (cat: string) => {
    const key = (cat || '').toLowerCase()
    if (key.includes('maintenance')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (key.includes('repair')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    if (key.includes('fuel') || key.includes('gas')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    if (key.includes('insurance')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (key.includes('wash') || key.includes('detail')) return 'bg-teal-500/10 text-teal-400 border-teal-500/20'
    return 'bg-brand-500/10 text-brand-400 border-brand-500/20'
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'car',
      header: 'Vehicle / Target',
      cell: ({ row }: any) => {
        const car = row.original.car
        return car ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center shrink-0">
              {car.images?.[0]?.url ? (
                <img src={car.images[0].url} alt="" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <CarIcon className="h-4 w-4 text-surface-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-surface-50 capitalize text-sm">
                {car.brand} {car.modelName}
              </span>
              <span className="text-[10px] text-surface-500 font-medium">
                Year: {car.year} {car.color ? `• ${car.color}` : ''}
              </span>
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-900 text-surface-400 border border-surface-800">
            General Business Expense
          </span>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => {
        const cat = row.original.category || 'Expense'
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(cat)}`}>
            {cat.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-bold text-rose-400 text-base tracking-tight">
          ${(row.original.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Expense Date',
      cell: ({ row }: any) => {
        const rawDate = row.original.date || row.original.createdAt
        const formatted = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
        return (
          <span className="text-xs text-surface-400 font-medium">
            {formatted}
          </span>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <span className="text-xs text-surface-300 max-w-xs truncate block font-normal" title={row.original.description}>
          {row.original.description || <span className="text-surface-600 italic">No notes provided</span>}
        </span>
      ),
    },
    {
      accessorKey: 'receiptImage',
      header: 'Receipt Proof',
      cell: ({ row }: any) => {
        const receipt = row.original.receiptImage
        if (!receipt?.url) {
          return <span className="text-[10px] text-surface-600 font-medium uppercase tracking-wider">No Receipt</span>
        }
        return (
          <button
            onClick={() => setViewingReceipt({
              url: receipt.url,
              title: `${row.original.category} - $${row.original.amount}`
            })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all border border-brand-500/20"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            View Proof
          </button>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(row.original)}
            className="p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
            title="Edit Expense"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense record?')) {
                deleteExpense.mutate(row.original._id)
              }
            }}
            disabled={deleteExpense.isPending}
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
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
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-surface-400 animate-pulse">Loading expense records...</p>
        </div>
      </div>
    )
  }

  if (getExpenses.isError) {
    const errorMsg = (getExpenses.error as any)?.response?.data?.message || 'Failed to load expense records'
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md bg-card border border-rose-500/20 p-8 rounded-2xl">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">Unable to load expenses</h3>
          <p className="text-sm text-surface-400">{errorMsg}</p>
          <button
            onClick={() => getExpenses.refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = getExpenses.data?.stats || {}
  const totalAmount = stats.totalExpenseAmount || 0
  const thisMonthAmount = stats.thisMonthExpenses || 0
  const totalCount = stats.totalExpensesCount || 0
  const avgExpense = totalCount > 0 ? (totalAmount / totalCount) : 0

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Expenses Management
          </h2>
          <p className="mt-2 text-surface-400 font-medium text-sm">
            Track and manage fleet maintenance, repair, fuel, insurance, and operational costs.
          </p>
        </div>
        <Link
          href="/dashboard/expenses/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Log Expense
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Expenses</p>
          </div>
          <p className="text-3xl font-bold text-rose-400 tracking-tight">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">This Month</p>
          </div>
          <p className="text-3xl font-bold text-amber-400 tracking-tight">
            ${thisMonthAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Records</p>
          </div>
          <p className="text-3xl font-bold text-surface-50 tracking-tight">
            {totalCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Avg. Expense</p>
          </div>
          <p className="text-3xl font-bold text-teal-400 tracking-tight">
            ${avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-surface-800/50 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-surface-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-surface-800 bg-surface-900/80 py-2 px-3 text-xs text-surface-100 font-semibold focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="maintenance">Car Maintenance</option>
              <option value="repair">Car Repair</option>
              <option value="fuel">Fuel / Gas</option>
              <option value="insurance">Insurance</option>
              <option value="wash">Vehicle Wash & Detailing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-surface-500" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="rounded-xl border border-surface-800 bg-surface-900/80 py-2 px-3 text-xs text-surface-100 focus:border-brand-500/50 focus:outline-none transition-all cursor-pointer scheme:dark"
                placeholder="From"
              />
              <span className="text-xs text-surface-600 font-medium">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="rounded-xl border border-surface-800 bg-surface-900/80 py-2 px-3 text-xs text-surface-100 focus:border-brand-500/50 focus:outline-none transition-all cursor-pointer scheme:dark"
                placeholder="To"
              />
            </div>
          </div>

          {(dateFrom || dateTo || categoryFilter !== 'ALL') && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-brand-400">
          Showing {filteredExpenses.length} of {getExpenses.data?.data?.length || 0} record(s)
        </span>
      </div>

      {/* Main Table or Empty State */}
      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4 text-surface-500">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No expense records found</h3>
          <p className="text-surface-500 text-sm mt-1">
            {searchQuery || dateFrom || dateTo || categoryFilter !== 'ALL'
              ? 'No records match your active search or filter criteria.'
              : 'You have not logged any expenses yet. Click "Log Expense" to start.'}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredExpenses} />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-surface-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-surface-800">
              <h3 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-brand-400" />
                Edit Expense Record
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-2 text-surface-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border border-surface-800 bg-surface-900/50 py-2.5 px-4 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-xl border border-surface-800 bg-surface-900/50 py-2.5 px-4 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                  Expense Date *
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border border-surface-800 bg-surface-900/50 py-2.5 px-4 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none cursor-pointer scheme:dark"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-surface-800 bg-surface-900/50 py-2.5 px-4 text-sm text-surface-100 focus:border-brand-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl border border-surface-800 text-surface-300 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateExpense.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {updateExpense.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-surface-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <h3 className="text-sm font-bold text-surface-100 truncate">
                {viewingReceipt.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewingReceipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-surface-400 hover:text-white rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="p-2 text-surface-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={viewingReceipt.url}
                alt="Receipt proof"
                className="max-w-full max-h-[70vh] object-contain rounded-xl border border-surface-800 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
