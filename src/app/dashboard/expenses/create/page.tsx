'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  ArrowLeft,
  Loader2,
  Car,
  ImagePlus,
  X,
  UploadCloud,
  FileText,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const EXPENSE_CATEGORIES = [
  'MAINTENANCE',
  'REPAIR',
  'FUEL',
  'INSURANCE',
  'OFFICE',
  'OTHER'
]

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!

export default function CreateExpensePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Form State
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [repairDetails, setRepairDetails] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [selectedCarId, setSelectedCarId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  // Image State
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // Fetch cars for dropdown
  const { data: carsData, isLoading: isLoadingCars, isError: isErrorCars } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const res = await api.get('/admin/cars/stats')
      return res.data.cars
    },
  })

  // Handle Image Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }

    setReceiptImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Upload to ImageKit
  const uploadToImageKit = async (file: File): Promise<{ url: string; fileId: string }> => {
    const sigRes = await api.get('/users/signature')
    const { signature, expire, token } = sigRes.data.imagekit_signature

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    formData.append('folder', '/expenses')
    formData.append('publicKey', publicKey)
    formData.append('signature', signature)
    formData.append('expire', String(expire))
    formData.append('token', token)
    formData.append('useUniqueFileName', 'true')

    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    })

    if (!uploadRes.ok) {
      throw new Error(`ImageKit upload failed: ${uploadRes.statusText}`)
    }

    const data = await uploadRes.json()
    return { url: data.url, fileId: data.fileId }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!description.trim() || description.length < 3) {
      toast.error("Description must be at least 3 characters")
      return
    }

    if (!selectedCarId) {
      toast.error("Please select a vehicle")
      return
    }

    setIsSubmitting(true)
    try {
      let receiptData = null
      
      if (receiptImage) {
        setUploadProgress('Uploading receipt image...')
        receiptData = await uploadToImageKit(receiptImage)
      }

      setUploadProgress('Saving expense record...')
      await api.post('/admin/expenses', {
        amount: amount,
        description: description.trim(),
        repair: repairDetails.trim(),
        category,
        carId: selectedCarId,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        images: receiptData ? [receiptData] : [],
      })

      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Expense recorded successfully')
      router.push('/dashboard/expenses')
    } catch (error: any) {
      console.error('Expense submit error:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to record expense')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/expenses"
          className="p-2 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-brand-400" />
            Record Expense
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Log a new expense and upload a receipt
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Details */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-surface-800/50 bg-surface-900/50 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-brand-400" />
                  Amount (USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-surface-500 font-bold">$</span>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-400" />
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  minLength={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. Monthly Office Supplies, Oil Change..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-400" />
                  Repair Details
                </label>
                <textarea
                  rows={4}
                  disabled={isSubmitting}
                  value={repairDetails}
                  onChange={(e) => setRepairDetails(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Describe the repair details in depth..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-brand-400" />
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={isSubmitting}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-surface-900">
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-400" />
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  disabled={isSubmitting}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

            </div>
          </div>

          {/* Right Column - Related To & Receipt */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-surface-800/50 bg-surface-900/50 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <Car className="h-4 w-4 text-brand-400" />
                  Vehicle Name <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={isSubmitting || isLoadingCars}
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-medium appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingCars ? (
                    <option value="" disabled className="bg-surface-900 text-surface-500">
                      Loading vehicles...
                    </option>
                  ) : isErrorCars ? (
                    <option value="" disabled className="bg-surface-900 text-rose-500">
                      Failed to load vehicles
                    </option>
                  ) : (
                    <>
                      <option value="" disabled className="bg-surface-900 text-surface-500">
                        -- Select Vehicle --
                      </option>
                      {carsData?.map((car: any) => (
                        <option key={car._id} value={car._id} className="bg-surface-900">
                          {car.year} {car.brand} {car.modelName} ({car.color})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-surface-200 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-brand-400" />
                  Receipt / Image Upload (Optional)
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-2xl border border-surface-800 overflow-hidden bg-surface-950">
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      className="w-full h-48 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptImage(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500/80 text-white rounded-lg backdrop-blur-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input
                      type="file"
                      disabled={isSubmitting}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-700 rounded-2xl bg-surface-950/50 group-hover:bg-surface-900 group-hover:border-brand-500/50 transition-all">
                      <div className="h-12 w-12 rounded-xl bg-surface-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-brand-500/20">
                        <UploadCloud className="h-6 w-6 text-surface-400 group-hover:text-brand-400" />
                      </div>
                      <p className="text-sm font-bold text-surface-200">
                        Click or drag image here
                      </p>
                      <p className="text-xs text-surface-500 mt-1">
                        PNG, JPG or WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-6 rounded-2xl border border-surface-800/50 bg-surface-900/50 backdrop-blur-xl shadow-2xl">
          <Link
            href="/dashboard/expenses"
            className={`w-full sm:w-auto px-6 py-3 bg-surface-800 text-white font-bold rounded-xl transition-colors text-center ${
              isSubmitting ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-700'
            }`}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadProgress || 'Saving...'}
              </>
            ) : (
              'Save Expense'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
