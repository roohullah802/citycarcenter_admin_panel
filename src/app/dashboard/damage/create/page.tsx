'use client'

import { useState, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, X, ShieldAlert, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCars } from '@/hooks/useCars'

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!

export default function CreateDamageInspectionPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch cars dynamically from DB
  const { getCars } = useCars()

  // Fetch leases to optionally match car with active lease
  const getLeases = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const res = await api.get('/admin/transactions')
      return res.data
    },
  })

  const todayStr = new Date().toISOString().split('T')[0]

  // Form states
  const [selectedCarId, setSelectedCarId] = useState('')
  const [inspectionDate, setInspectionDate] = useState(todayStr)
  const [licensePlate, setLicensePlate] = useState('')
  const [damageCategory, setDamageCategory] = useState('scratch')
  const [customCategory, setCustomCategory] = useState('')
  const [severity, setSeverity] = useState('minor')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [description, setDescription] = useState('')

  // Images state
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPendingImages(prev => [...prev, ...files])
    e.target.value = ''
  }, [])

  const removeImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadToImageKit = async (file: File): Promise<{ url: string; fileId: string }> => {
    const sigRes = await api.get('/users/signature')
    const { signature, expire, token } = sigRes.data.imagekit_signature

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    formData.append('folder', '/damage_inspections')
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

    if (!selectedCarId) {
      toast.error('Please select a car')
      return
    }

    if (damageCategory === 'other' && !customCategory.trim()) {
      toast.error('Please specify the custom damage category')
      return
    }

    if (!description || description.length < 5) {
      toast.error('Description must be at least 5 characters')
      return
    }
    if (pendingImages.length === 0) {
      toast.error('Please upload at least one photo of the damage')
      return
    }

    // Determine final damage type (custom if 'other' was selected)
    const finalDamageType = damageCategory === 'other' ? customCategory.trim() : damageCategory

    // Find optional lease for selected car if available
    const leasesList = getLeases.data?.data || []
    const matchingLease = leasesList.find((l: any) => l.car?._id === selectedCarId || l.car === selectedCarId)

    setIsSubmitting(true)
    try {
      setUploadProgress(`Uploading damage photos (0/${pendingImages.length})...`)
      const uploadedImages: { url: string; fileId: string }[] = []
      for (let i = 0; i < pendingImages.length; i++) {
        setUploadProgress(`Uploading damage photos (${i + 1}/${pendingImages.length})...`)
        const result = await uploadToImageKit(pendingImages[i])
        uploadedImages.push(result)
      }

      setUploadProgress('Recording inspection...')
      await api.post('/admin/damage-inspections', {
        carId: selectedCarId,
        leaseId: matchingLease?._id,
        licensePlate: licensePlate.trim(),
        inspectionDate,
        damageType: finalDamageType,
        severity,
        estimatedCost: estimatedCost ? (parseFloat(estimatedCost.replace(/[^0-9.]/g, '')) || 0) : 0,
        description,
        images: uploadedImages,
      })

      queryClient.invalidateQueries({ queryKey: ['damage-inspections'] })
      toast.success('Damage inspection recorded successfully')
      router.push('/dashboard/damage')
    } catch (error: any) {
      console.error('Inspection submit error:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to record inspection')
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
        <Link href="/dashboard/damage" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Record Damage Inspection
          </h2>
          <p className="text-surface-400 font-medium">Log vehicle damage reported upon customer return.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Inspection Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            {/* 1st Field: Car Name Dropdown (Dynamic from DB) */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Car Name *</label>
              {getCars.isLoading ? (
                <div className="flex items-center gap-2 text-surface-500 text-sm py-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading cars from database...
                </div>
              ) : (
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select a car from database...</option>
                  {cars.map((car: any) => (
                    <option key={car._id} value={car._id}>
                      {car.brand} {car.modelName} ({car.year}) — {car.color || 'No Color'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2nd Field: Inspection Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Inspection Date *</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                required
              />
            </div>

            {/* 3rd Field: License Number */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">License Number *</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="Enter vehicle license plate..."
                className={inputClass}
                required
              />
            </div>

            {/* 4th Field: Damage Category */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Damage Category *</label>
              <select
                value={damageCategory}
                onChange={(e) => setDamageCategory(e.target.value)}
                className={inputClass}
              >
                <option value="scratch">Scratch</option>
                <option value="dent">Dent</option>
                <option value="broken_part">Broken Part</option>
                <option value="interior">Interior Damage</option>
                <option value="tire">Tire / Wheel Damage</option>
                <option value="glass">Glass / Windshield</option>
                <option value="other">Other</option>
              </select>

              {/* Conditional Manual Field when "Other" is selected */}
              {damageCategory === 'other' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-1.5">Specify Custom Category *</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type custom damage category..."
                    className={inputClass}
                    required
                  />
                </div>
              )}
            </div>

            {/* 5th Field: Severity Level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Severity Level *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={inputClass}
              >
                <option value="minor">Minor (Cosmetic)</option>
                <option value="moderate">Moderate (Repair needed)</option>
                <option value="severe">Severe (Replacement required)</option>
              </select>
            </div>

            {/* 6th Field: Estimated Repair Cost */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Estimated Repair Cost ($)</label>
              <input
                type="text"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="e.g. 250"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Damage Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the damage found during inspection..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>
          </div>
        </div>

        {/* Damage Photos Upload */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6">Damage Photos *</h3>

          <div
            className="relative border-2 border-dashed border-surface-800 rounded-2xl p-10 hover:bg-surface-900/50 hover:border-brand-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner bg-surface-900/20"
            onClick={() => imageInputRef.current?.click()}
          >
            <div className="p-4 rounded-2xl bg-surface-800 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all mb-4 border border-surface-700">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-surface-200">Click to select photos of the damage</p>
            <p className="text-xs text-surface-500 font-medium uppercase tracking-widest">PNG, JPG, WEBP up to 10MB • Select multiple</p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            {pendingImages.map((file, i) => (
              <div key={i} className="relative aspect-square group">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded-xl border border-surface-800 shadow-sm" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-surface-900 rounded-full text-rose-500 p-1 shadow-lg border border-surface-800 hover:bg-rose-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 px-12 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-900/20 transition-all disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {uploadProgress || 'Record Inspection'}
          </button>
        </div>
      </form>
    </div>
  )
}
