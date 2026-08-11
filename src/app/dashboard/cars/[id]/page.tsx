'use client'

import { useCars } from '@/hooks/useCars'
import { useParams } from 'next/navigation'
import { 
  Loader2, 
  ArrowLeft, 
  CarFront, 
  Settings2, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Images 
} from 'lucide-react'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'
import { useState, useEffect, useCallback } from 'react'

export default function CarDetailsPage() {
  const params = useParams()
  const { getCarDetails } = useCars()
  const { data, isLoading } = getCarDetails(params.id as string)

  // Image Gallery & Lightbox states
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const carDetails = data?.carDetails
  const images = carDetails?.images || []
  const hasMultipleImages = images.length > 1

  // Handle flipping through images
  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (images.length === 0) return
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (images.length === 0) return
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage()
      if (e.key === 'ArrowRight') handleNextImage()
      if (e.key === 'Escape') setIsLightboxOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, handlePrevImage, handleNextImage])

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

  if (!carDetails) return <div className="text-surface-400 p-12 text-center">Vehicle not found</div>

  const { activeLease, totalLeases, totalRevenue } = data

  const leaseColumns = [
    {
      accessorKey: 'user.username',
      header: 'Lessee',
      cell: ({ row }: any) => (
        <Link href={`/dashboard/users/${row.original.user?._id}`} className="font-bold text-surface-50 hover:text-brand-400 transition-colors">
          {row.original.user?.name || row.original.user?.username || 'Unknown'}
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

  const activeImage = images[activeImageIndex]?.url || images[0]?.url

  return (
    <div className="space-y-8 pb-10">
      {/* Top Navigation & Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cars" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50 capitalize">
            {carDetails.brand} {carDetails.modelName}
          </h2>
          <p className="text-surface-400 font-medium">{carDetails.year} Model • {carDetails.licensePlate || carDetails.plateNumber || 'No Plate'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Gallery & Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-surface-800/50 rounded-2xl overflow-hidden shadow-sm">
            {/* Interactive Image Display */}
            <div 
              className="relative aspect-[16/10] bg-surface-950 border-b border-surface-800 group cursor-pointer overflow-hidden"
              onClick={() => activeImage && setIsLightboxOpen(true)}
            >
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={`${carDetails.brand} ${carDetails.modelName}`} 
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-700">
                  <CarFront className="h-16 w-16" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${carDetails.available ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                  {carDetails.available ? 'Available' : 'Leased'}
                </span>
              </div>

              {/* Image Counter & Enlarge Hint */}
              {images.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-black/60 backdrop-blur-md border border-white/10">
                    <Images className="h-3.5 w-3.5 text-brand-400" />
                    {activeImageIndex + 1} / {images.length}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white/80 bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-3 w-3" /> Enlarge
                  </span>
                </div>
              )}

              {/* Prev / Next Flip Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-brand-600 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    title="Previous Image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-brand-600 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    title="Next Image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {hasMultipleImages && (
              <div className="p-4 bg-surface-950/50 border-b border-surface-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[16/10] w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      idx === activeImageIndex 
                        ? 'border-brand-500 ring-2 ring-brand-500/20 scale-105 shadow-lg' 
                        : 'border-surface-800 opacity-60 hover:opacity-100 hover:border-surface-600'
                    }`}
                  >
                    <img src={img.url} alt="" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications Grid */}
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
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.transmission || 'Automatic'}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Fuel Type</dt>
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.fuelType || 'Gasoline'}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Category</dt>
                  <dd className="text-sm font-bold text-surface-200 capitalize">{carDetails.category || 'Standard'}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-card border border-surface-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Generated Revenue</span>
                <span className="font-bold text-emerald-400 text-lg">${(totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/50 border border-surface-800/30">
                <span className="text-surface-400 text-xs font-bold uppercase tracking-wider">Times Leased</span>
                <span className="font-bold text-surface-50 text-lg">{totalLeases || 0}</span>
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
            <DataTable columns={leaseColumns} data={activeLease || []} />
          </div>
        </div>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {isLightboxOpen && activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header Controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-3 bg-surface-900/80 border border-surface-800 px-4 py-2 rounded-2xl backdrop-blur-md pointer-events-auto">
              <span className="text-sm font-bold text-white capitalize">
                {carDetails.brand} {carDetails.modelName}
              </span>
              <span className="text-xs font-medium text-surface-400 border-l border-surface-700 pl-3">
                Image {activeImageIndex + 1} of {images.length}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-3 rounded-2xl bg-surface-900/80 hover:bg-rose-500/20 border border-surface-800 text-surface-300 hover:text-rose-400 transition-all pointer-events-auto shadow-2xl"
              title="Close Fullscreen (Esc)"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Large Image Container */}
          <div 
            className="relative flex items-center justify-center w-full h-full max-w-6xl max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`${carDetails.brand} ${carDetails.modelName}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {/* Prev / Next Controls in Lightbox */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-surface-900/90 hover:bg-brand-600 border border-surface-800 text-white shadow-2xl transition-all hover:scale-110"
                  title="Previous Image (← Key)"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-surface-900/90 hover:bg-brand-600 border border-surface-800 text-white shadow-2xl transition-all hover:scale-110"
                  title="Next Image (→ Key)"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {hasMultipleImages && (
            <div 
              className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-3 z-20 px-6 overflow-x-auto no-scrollbar pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[16/10] w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    idx === activeImageIndex 
                      ? 'border-brand-500 ring-4 ring-brand-500/30 scale-110 shadow-2xl' 
                      : 'border-surface-800 opacity-40 hover:opacity-100 hover:border-surface-600'
                  }`}
                >
                  <img src={img.url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
