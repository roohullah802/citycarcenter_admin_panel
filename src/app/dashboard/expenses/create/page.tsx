'use client'

import { useState, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, X, Wallet, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCars } from '@/hooks/useCars'

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!

export default function CreateExpensePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch cars dynamically from DB
  const { getCars } = useCars()

  const todayStr = new Date().toISOString().split('T')[0]

  // Form states
  const [selectedCarId, setSelectedCarId] = useState('')
  const [expenseDate, setExpenseDate] = useState(todayStr)
  const [category, setCategory] = useState('maintenance')
  const [customCategory, setCustomCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  // Receipt image state
  const [pendingReceipt, setPendingReceipt] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingReceipt(file)
    }
    e.target.value = ''
  }, [])

  const removeReceipt = () => {
    setPendingReceipt(null)
  }

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

    const uploadRes = await fetch(`${urlEndpoint}/api/v1/files/upload`, {
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

    if (category === 'other' && !customCategory.trim()) {
      toast.error('Please specify the custom expense category')
      return
    }

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid expense amount')
      return
    }

    const finalCategory = category === 'other' ? customCategory.trim() : category

    setIsSubmitting(true)
    try {
      let uploadedReceipt: { url: string; fileId: string } | undefined = undefined

      if (pendingReceipt) {
        setUploadProgress('Uploading receipt proof...')
        uploadedReceipt = await uploadToImageKit(pendingReceipt)
      }

      setUploadProgress('Saving expense...')
      await api.post('/admin/expenses', {
        carId: selectedCarId || undefined,
        category: finalCategory,
        amount: parsedAmount,
        date: expenseDate,
        description: description.trim(),
        receiptImage: uploadedReceipt,
      })

      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      toast.success('Expense logged successfully')
      router.push('/dashboard/expenses')
    } catch (error: any) {
      console.error('Expense submit error:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to log expense')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  const inputClass = "block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700"

  const cars = getCars.data || []

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Log New Expense
          </h2>
          <p className="text-surface-400 font-medium">Record vehicle maintenance, repairs, fuel, or business operational costs.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Expense Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            {/* 1st Field: Vehicle Selection */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Vehicle (Optional)</label>
              {getCars.isLoading ? (
                <div className="flex items-center gap-2 text-surface-500 text-sm py-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading cars from database...
                </div>
              ) : (
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">General Business Expense (Non-Vehicle Specific)</option>
                  {cars.map((car: any) => (
                    <option key={car._id} value={car._id}>
                      {car.brand} {car.modelName} ({car.year}) — {car.color || 'No Color'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2nd Field: Expense Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Expense Date *</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                required
              />
            </div>

            {/* 3rd Field: Expense Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="maintenance">Car Maintenance</option>
                <option value="repair">Car Repair</option>
                <option value="fuel">Fuel / Gas</option>
                <option value="insurance">Insurance</option>
                <option value="wash">Vehicle Wash & Detailing</option>
                <option value="other">Other</option>
              </select>

              {/* Conditional Manual Field when "Other" is selected */}
              {category === 'other' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-1.5">Specify Custom Category *</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type custom expense category..."
                    className={inputClass}
                    required
                  />
                </div>
              )}
            </div>

            {/* 4th Field: Expense Amount */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Amount ($) *</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150.00"
                className={inputClass}
                required
              />
            </div>

            {/* 5th Field: Description */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Description / Notes</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about this expense (e.g. Oil change and brake pad replacement)..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Receipt Proof Upload (Optional) */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6">Receipt / Invoice Proof (Optional)</h3>

          <div
            className="relative border-2 border-dashed border-surface-800 rounded-2xl p-8 hover:bg-surface-900/50 hover:border-brand-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner bg-surface-900/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-4 rounded-2xl bg-surface-800 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all mb-3 border border-surface-700">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-surface-200">Click to upload receipt photo or PDF</p>
            <p className="text-xs text-surface-500 font-medium uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {pendingReceipt && (
            <div className="mt-6 flex items-center justify-between p-4 bg-surface-900 border border-surface-800 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={URL.createObjectURL(pendingReceipt)} alt="receipt preview" className="h-12 w-12 object-cover rounded-lg border border-surface-700" />
                <div className="truncate">
                  <p className="text-sm font-bold text-surface-100 truncate">{pendingReceipt.name}</p>
                  <p className="text-xs text-surface-500">{(pendingReceipt.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button type="button" onClick={removeReceipt} className="p-2 text-surface-400 hover:text-rose-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 px-12 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-900/20 transition-all disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {uploadProgress || 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
