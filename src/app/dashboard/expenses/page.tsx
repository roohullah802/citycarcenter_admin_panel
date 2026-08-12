'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, Trash2, Wallet, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'
import { useMemo } from 'react'

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const { searchQuery } = useSearch()

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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Expense record deleted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete record')
    },
  })

  const filteredExpenses = useMemo(() => {
    const data = getExpenses.data?.expenses || []
    if (!searchQuery) return data
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    return data.filter((item: any) => {
      const text = [
        item.description,
        item.category,
        item.carId?.brand,
        item.carId?.modelName,
        item.carId?.year,
      ].filter(Boolean).join(' ').toLowerCase()
      return tokens.every(token => text.includes(token))
    })
  }, [getExpenses.data, searchQuery])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <span className="font-bold text-surface-50">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-800 text-surface-300 border border-surface-700">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => {
        const amt = parseFloat(String(row.original.amount || '0').replace(/[^0-9.]/g, ''));
        return (
          <span className="font-bold text-rose-400">
            ${isNaN(amt) ? '0.00' : amt.toFixed(2)}
          </span>
        )
      },
    },
    {
      accessorKey: 'carId',
      header: 'Vehicle (Optional)',
      cell: ({ row }: any) => {
        const car = row.original.carId
        if (!car) return <span className="text-surface-500 italic text-xs">None</span>
        
        return (
          <div className="flex flex-col">
            <span className="font-bold text-surface-50 capitalize">
              {car.brand} {car.modelName}
            </span>
            <span className="text-[10px] text-surface-500 font-medium">
              {car.year} {car.color ? `• ${car.color}` : ''}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'images',
      header: 'Receipt',
      cell: ({ row }: any) => {
        const images = row.original.images
        if (!images || images.length === 0) return <span className="text-surface-500 italic text-xs">No receipt</span>
        const url = images[0].url
        
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img src={url} alt="receipt" className="h-8 w-8 object-cover rounded-lg border border-surface-700 hover:scale-110 transition-transform" />
          </a>
        )
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => {
        const dateVal = row.original.date
        return (
          <span className="text-xs text-surface-500 font-medium">
            {new Date(dateVal).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense?')) {
                deleteExpense.mutate(row.original._id)
              }
            }}
            disabled={deleteExpense.isPending}
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (getExpenses.isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-brand-400" />
            Expenses Tracking
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage operational expenses, maintenance costs, and bills.
          </p>
        </div>
        <Link 
          href="/dashboard/expenses/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          <Plus className="h-4 w-4" />
          Record Expense
        </Link>
      </div>

      {filteredExpenses.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No expenses found</h3>
          <p className="text-surface-500 text-sm mt-1">We couldn't find any records matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-800/50 bg-surface-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/20">
          <DataTable columns={columns} data={filteredExpenses} />
        </div>
      )}
    </div>
  )
}
