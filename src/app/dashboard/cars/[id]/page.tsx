'use client'

import { useCars } from '@/hooks/useCars'
import { useParams } from 'next/navigation'
import { Loader2, ArrowLeft, CarFront, Fuel, Settings2, Gauge, TrendingUp, History } from 'lucide-react'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default function CarDetailsPage() {
  const params = useParams()
  const { getCarDetails } = useCars()
  const { data, isLoading } = getCarDetails(params.id as string)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Loading vehicle specifications...</p>
        </div>
      </div>
    )
  }

  if (!data?.carDetails) return <div className="text-surface-400 p-12 text-center">Vehicle not found</div>

  const { carDetails, activeLease, totalLeases, totalRevenue } = data

  const leaseColumns = [
    {
      accessorKey: 'user.username',
      header: 'Lessee',
      cell: ({ row }: any) => (
        <Link href={`/dashboard/users/${row.original.user?._id}`} className="font-bold text-surface-50 hover:text-brand-400 transition-colors">
          {row.original.user?.username || 'Unknown'}
        </Link>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: any) => <span className="text-surface-400 text-sm font-medium">{new Date(row.original.startDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: any) => <span className="text-surface-400 text-sm font-medium">{new Date(row.original.endDate).toLocaleDateString()}</span>,
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
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cars" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50 capitalize">
            {carDetails.brand} {carDetails.modelName}
          </h2>
          <p className="text-surface-400 font-medium">{carDetails.year} Model • {carDetails.plateNumber || 'No Plate'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-surface-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-surface-900 border-b border-surface-800">
              {carDetails.images?.[0]?.url ? (
                <img src={carDetails.images[0].url} alt="car" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-700">
                  <CarFront className="h-16 w-16" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${carDetails.available ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                  {carDetails.available ? 'Available' : 'Leased'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-brand-400" />
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Price/Day</dt>
                  <dd className="text-lg font-bold text-emerald-400">${carDetails.pricePerDay}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Transmission</dt>
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.transmission}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Fuel Type</dt>
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.fuelType}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Category</dt>
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.category || 'Standard'}</dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-surface-800/50 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6 flex items-center gap-2">
               <TrendingUp className="h-4 w-4 text-brand-400" />
               Performance Metrics
             </h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                  <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Generated Revenue</span>
                  <span className="font-bold text-emerald-400 text-lg">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                  <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Times Leased</span>
                  <span className="font-bold text-surface-50 text-lg">{totalLeases}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Leases Table */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-surface-50 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
              Rental Activity History
            </h3>
            <DataTable columns={leaseColumns} data={data.activeLease || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
