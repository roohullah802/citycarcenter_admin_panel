'use client'

import { useCars } from '@/hooks/useCars'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, Edit2, Trash2, Eye, CarFront, SearchX } from 'lucide-react'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'
import Image from 'next/image'

export default function CarsPage() {
  const { getCars, deleteCar } = useCars()
  const { searchQuery } = useSearch()

  const filteredCars = (getCars.data || []).filter((car: any) => 
    car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.modelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'images',
      header: 'Vehicle',
      cell: ({ row }) => {
        const image = row.original.images?.[0]
        return (
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-16 overflow-hidden rounded-xl bg-surface-800 border border-surface-700">
              {image?.url ? (
                <img src={image.url} alt="car" className="object-cover h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-surface-600">
                  <CarFront className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-surface-50 capitalize leading-none">{row.original.brand} {row.original.modelName}</span>
              <span className="text-[10px] font-medium text-surface-500 mt-1 uppercase tracking-wider">{row.original.year} • {row.original.plateNumber || 'No Plate'}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'pricePerDay',
      header: 'Rate/Day',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-emerald-400 font-bold">${row.original.pricePerDay}</span>
          <span className="text-[10px] text-surface-500 font-medium">Daily Base</span>
        </div>
      ),
    },
    {
      accessorKey: 'available',
      header: 'Status',
      cell: ({ row }) => {
        const isAvailable = row.original.available
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isAvailable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {isAvailable ? 'Available' : 'Leased'}
          </span>
        )
      },
    },
    {
      accessorKey: 'totalLeases',
      header: 'Leases',
      cell: ({ row }) => <span className="font-bold text-surface-200">{row.original.totalLeases || 0}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end space-x-2">
            <Link 
              href={`/dashboard/cars/${row.original._id}`} 
              className="p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this car?')) {
                  deleteCar.mutate(row.original._id)
                }
              }}
              className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              {deleteCar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        )
      },
    },
  ]

  if (getCars.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading fleet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Cars Fleet
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Manage your rental inventory, track availability, and update vehicle rates.
          </p>
        </div>
        <Link
          href="/dashboard/cars/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {filteredCars.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No vehicles found</h3>
          <p className="text-surface-500 text-sm mt-1">We couldn't find any vehicles matching "{searchQuery}"</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredCars} />
      )}
    </div>
  )
}
