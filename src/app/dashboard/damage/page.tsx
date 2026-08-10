'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, Trash2, ShieldAlert, DollarSign, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'
import { useMemo } from 'react'

export default function DamageInspectionsPage() {
  const queryClient = useQueryClient()
  const { searchQuery } = useSearch()

  const getInspections = useQuery({
    queryKey: ['damage-inspections'],
    queryFn: async () => {
      const res = await api.get('/admin/damage-inspections')
      return res.data
    },
  })

  const deleteInspection = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/damage-inspections/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-inspections'] })
      toast.success('Inspection record deleted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete record')
    },
  })

  const filteredInspections = useMemo(() => {
    const data = getInspections.data?.data || []
    if (!searchQuery) return data
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    return data.filter((item: any) => {
      const text = [
        item.car?.brand,
        item.car?.modelName,
        item.user?.name,
        item.user?.email,
        item.damageType,
        item.severity,
        item.description,
      ].filter(Boolean).join(' ').toLowerCase()
      return tokens.every(token => text.includes(token))
    })
  }, [getInspections.data, searchQuery])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'car',
      header: 'Vehicle',
      cell: ({ row }: any) => {
        const car = row.original.car
        return (
          <div className="flex flex-col">
            <span className="font-bold text-surface-50 capitalize">
              {car?.brand} {car?.modelName}
            </span>
            <span className="text-[10px] text-surface-500 font-medium">
              {car?.year}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-surface-50">
            {row.original.user?.name || 'Unknown User'}
          </span>
          <span className="text-[10px] text-surface-500 font-medium">
            {row.original.user?.email || 'No Email'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'damageType',
      header: 'Damage Type',
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-800 text-surface-300 border border-surface-700">
          {row.original.damageType?.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => {
        const sev = row.original.severity
        let color = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        if (sev === 'severe') color = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        if (sev === 'minor') color = 'bg-blue-500/10 text-blue-400 border-blue-500/20'

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${color}`}>
            {sev}
          </span>
        )
      },
    },
    {
      accessorKey: 'estimatedCost',
      header: 'Est. Cost',
      cell: ({ row }: any) => (
        <span className="font-bold text-rose-400">
          ${row.original.estimatedCost || 0}
        </span>
      ),
    },
    {
      accessorKey: 'images',
      header: 'Photos',
      cell: ({ row }: any) => {
        const images = row.original.images || []
        return (
          <div className="flex items-center gap-1">
            {images.slice(0, 3).map((img: any, i: number) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                <img src={img.url} alt="damage" className="h-8 w-8 object-cover rounded-lg border border-surface-700 hover:scale-110 transition-transform" />
              </a>
            ))}
            {images.length > 3 && (
              <span className="text-xs text-surface-500 font-bold">+{images.length - 3}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Reported Date',
      cell: ({ row }: any) => (
        <span className="text-xs text-surface-500 font-medium">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this inspection record?')) {
                deleteInspection.mutate(row.original._id)
              }
            }}
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            {deleteInspection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ]

  if (getInspections.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading damage reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Damage Inspections
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Record and manage vehicle damage reports upon customer returns (Admin panel only).
          </p>
        </div>
        <Link
          href="/dashboard/damage/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Inspection
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Reports</p>
          </div>
          <p className="text-3xl font-bold text-surface-50 tracking-tight">{(getInspections.data?.stats?.totalInspections || 0).toLocaleString()}</p>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Estimated Damage Cost</p>
          </div>
          <p className="text-3xl font-bold text-amber-400 tracking-tight">${(getInspections.data?.stats?.totalDamageCost || 0).toLocaleString()}</p>
        </div>
      </div>

      {filteredInspections.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No damage reports found</h3>
          <p className="text-surface-500 text-sm mt-1">We couldn't find any records matching "{searchQuery}"</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredInspections} />
      )}
    </div>
  )
}
