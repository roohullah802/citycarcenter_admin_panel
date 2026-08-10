'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useCars } from '@/hooks/useCars'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, X, Info, Zap, LayoutPanelTop, Image as ImageIcon, Percent, Search, ChevronDown, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

const CAR_BRANDS = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën',
  'Dodge', 'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GMC', 'Honda', 'Hyundai',
  'Infiniti', 'Jaguar', 'Jeep', 'Kia',
  'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln',
  'Lotus', 'Maserati', 'Mazda', 'McLaren',
  'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
  'Pagani', 'Peugeot', 'Porsche', 'Ram',
  'Renault', 'Rolls-Royce', 'Saab', 'Subaru',
  'Suzuki', 'Tesla', 'Toyota', 'Volkswagen',
  'Volvo',
]

interface CarFormValues {
  brand: string
  modelName: string
  year: number
  color: string
  price: number
  passengers: number
  doors: number
  airCondition: boolean
  maxPower: number
  mph: number
  topSpeed: number
  available: boolean
  tax: number
  weeklyRate: number
  monthlyRate: number
  pricePerDay: number
  discountPercentage: number
  discountEnabled: boolean
  initialMileage: number
  allowedMilleage: number
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  description: string
}

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!

export default function CreateCarPage() {
  const router = useRouter()
  const { createCar } = useCars()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CarFormValues>({
    defaultValues: {
      airCondition: false,
      fuelType: 'petrol',
      transmission: 'automatic',
      available: true,
      discountPercentage: 0,
      discountEnabled: false,
    }
  })

  // Brand dropdown state
  const [brandSearch, setBrandSearch] = useState('')
  const [brandOpen, setBrandOpen] = useState(false)
  const selectedBrand = watch('brand')
  const brandRef = useRef<HTMLDivElement>(null)

  const filteredBrands = CAR_BRANDS.filter(b =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  )

  // Image state — store File objects locally, upload on submit
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingBrandImage, setPendingBrandImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const brandInputRef = useRef<HTMLInputElement>(null)

  // Image preview URLs
  const imagePreviewUrls = pendingImages.map(f => URL.createObjectURL(f))
  const brandPreviewUrl = pendingBrandImage ? URL.createObjectURL(pendingBrandImage) : null

  const handleGallerySelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPendingImages(prev => [...prev, ...files])
    e.target.value = '' // reset so same file can be selected again
  }, [])

  const handleBrandImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingBrandImage(file)
    e.target.value = ''
  }, [])

  const removeImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
  }

  // Upload a single file to ImageKit
  const uploadToImageKit = async (file: File, folder: string): Promise<{ url: string; fileId: string }> => {
    // Get signature from backend
    const sigRes = await api.get('/users/signature')
    const { signature, expire, token } = sigRes.data.imagekit_signature

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    formData.append('folder', folder)
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

  const onSubmit = async (data: CarFormValues) => {
    if (pendingImages.length === 0) {
      toast.error('Please add at least one gallery image')
      return
    }

    setIsSubmitting(true)
    try {
      // Step 1: Upload all gallery images
      setUploadProgress(`Uploading images (0/${pendingImages.length})...`)
      const uploadedImages: { url: string; fileId: string }[] = []
      for (let i = 0; i < pendingImages.length; i++) {
        setUploadProgress(`Uploading images (${i + 1}/${pendingImages.length})...`)
        const result = await uploadToImageKit(pendingImages[i], '/cars')
        uploadedImages.push(result)
      }

      // Step 2: Upload brand image if present
      let uploadedBrandImage = null
      if (pendingBrandImage) {
        setUploadProgress('Uploading brand logo...')
        uploadedBrandImage = await uploadToImageKit(pendingBrandImage, '/brands')
      }

      // Step 3: Submit car data with image URLs to backend
      setUploadProgress('Registering vehicle...')
      createCar.mutate(
        {
          ...data,
          images: uploadedImages,
          brandImage: uploadedBrandImage || { url: '', fileId: '' },
          available: true,
        },
        {
          onSuccess: () => {
            router.push('/dashboard/cars')
          },
          onError: () => {
            setIsSubmitting(false)
            setUploadProgress('')
          }
        }
      )
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload images')
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  const inputClass = "block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700"
  const errorInputClass = "block w-full rounded-xl border border-rose-500/50 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-surface-700"

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cars" className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-100 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Create Vehicle
          </h2>
          <p className="text-surface-400 font-medium">Add a new car to your rental fleet.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Basic Info */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <Info className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            {/* Brand Dropdown */}
            <div className="space-y-2 relative" ref={brandRef}>
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Brand *</label>
              <div
                className={`flex items-center gap-2 rounded-xl border ${errors.brand ? 'border-rose-500/50' : 'border-surface-800'} bg-surface-900/50 py-3 px-4 cursor-pointer transition-all hover:border-brand-500/50`}
                onClick={() => setBrandOpen(!brandOpen)}
              >
                <span className={`flex-1 ${selectedBrand ? 'text-surface-100 font-medium' : 'text-surface-700'}`}>
                  {selectedBrand || 'Select a brand...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-surface-400 transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
              </div>
              <input type="hidden" {...register('brand', { required: 'Brand is required' })} />

              {brandOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl max-h-64 overflow-hidden">
                  <div className="p-3 border-b border-surface-800">
                    <div className="flex items-center gap-2 bg-surface-800/50 rounded-lg px-3 py-2">
                      <Search className="h-4 w-4 text-surface-500" />
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="bg-transparent text-sm text-surface-100 placeholder:text-surface-600 outline-none w-full"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {filteredBrands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-500/10 hover:text-brand-400 transition-colors ${selectedBrand === brand ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-surface-300'}`}
                        onClick={() => {
                          setValue('brand', brand, { shouldValidate: true })
                          setBrandOpen(false)
                          setBrandSearch('')
                        }}
                      >
                        {brand}
                      </button>
                    ))}
                    {filteredBrands.length === 0 && (
                      <p className="px-4 py-3 text-sm text-surface-500">No brands found</p>
                    )}
                  </div>
                </div>
              )}
              {errors.brand && <p className="text-xs text-rose-400 font-medium mt-1">{errors.brand.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Model Name *</label>
              <input {...register('modelName', { required: 'Model name is required', minLength: { value: 1, message: 'Required' } })} placeholder="e.g. G-Class" className={errors.modelName ? errorInputClass : inputClass} />
              {errors.modelName && <p className="text-xs text-rose-400 font-medium mt-1">{errors.modelName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Production Year *</label>
              <input type="number" {...register('year', { required: 'Year is required', valueAsNumber: true, min: { value: 1900, message: 'Invalid year' }, max: { value: new Date().getFullYear() + 2, message: 'Year too far ahead' } })} placeholder="2024" className={errors.year ? errorInputClass : inputClass} />
              {errors.year && <p className="text-xs text-rose-400 font-medium mt-1">{errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Exterior Color *</label>
              <input {...register('color', { required: 'Color is required' })} placeholder="Obsidian Black" className={errors.color ? errorInputClass : inputClass} />
              {errors.color && <p className="text-xs text-rose-400 font-medium mt-1">{errors.color.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Usage */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Pricing & Usage</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Market Value ($) *</label>
              <input type="number" {...register('price', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} className={errors.price ? errorInputClass : inputClass} />
              {errors.price && <p className="text-xs text-rose-400 font-medium mt-1">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Daily Rate ($) *</label>
              <input type="number" {...register('pricePerDay', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min $1' } })} className={errors.pricePerDay ? errorInputClass : `${inputClass} border-emerald-500/20`} />
              {errors.pricePerDay && <p className="text-xs text-rose-400 font-medium mt-1">{errors.pricePerDay.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Weekly Rate ($) *</label>
              <input type="number" {...register('weeklyRate', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} className={errors.weeklyRate ? errorInputClass : inputClass} />
              {errors.weeklyRate && <p className="text-xs text-rose-400 font-medium mt-1">{errors.weeklyRate.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Monthly Rate ($) *</label>
              <input type="number" {...register('monthlyRate', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} className={errors.monthlyRate ? errorInputClass : inputClass} />
              {errors.monthlyRate && <p className="text-xs text-rose-400 font-medium mt-1">{errors.monthlyRate.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Current Odometer *</label>
              <input type="number" {...register('initialMileage', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} className={errors.initialMileage ? errorInputClass : inputClass} />
              {errors.initialMileage && <p className="text-xs text-rose-400 font-medium mt-1">{errors.initialMileage.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Daily KM Allowance *</label>
              <input type="number" {...register('allowedMilleage', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} className={errors.allowedMilleage ? errorInputClass : inputClass} />
              {errors.allowedMilleage && <p className="text-xs text-rose-400 font-medium mt-1">{errors.allowedMilleage.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Service Tax (%) *</label>
              <input type="number" {...register('tax', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Min 0%' }, max: { value: 100, message: 'Max 100%' } })} className={errors.tax ? errorInputClass : inputClass} />
              {errors.tax && <p className="text-xs text-rose-400 font-medium mt-1">{errors.tax.message}</p>}
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Percent className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Discount Settings</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Discount Percentage (%)</label>
              <input type="number" {...register('discountPercentage', { valueAsNumber: true, min: { value: 0, message: 'Min 0%' }, max: { value: 100, message: 'Max 100%' } })} placeholder="0" className={inputClass} />
              {errors.discountPercentage && <p className="text-xs text-rose-400 font-medium mt-1">{errors.discountPercentage.message}</p>}
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" {...register('discountEnabled')} className="h-5 w-5 rounded-lg border-surface-800 bg-surface-900 text-amber-600 focus:ring-amber-500/20" />
              <label className="text-sm font-bold text-surface-200">Enable Discount for Customers</label>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Technical Specifications</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Capacity *</label>
              <input type="number" {...register('passengers', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' }, max: { value: 50, message: 'Max 50' } })} placeholder="Seats" className={errors.passengers ? errorInputClass : inputClass} />
              {errors.passengers && <p className="text-xs text-rose-400 font-medium mt-1">{errors.passengers.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Doors *</label>
              <input type="number" {...register('doors', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' }, max: { value: 10, message: 'Max 10' } })} className={errors.doors ? errorInputClass : inputClass} />
              {errors.doors && <p className="text-xs text-rose-400 font-medium mt-1">{errors.doors.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Fuel System *</label>
              <select {...register('fuelType', { required: true })} className={inputClass}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Transmission *</label>
              <select {...register('transmission', { required: true })} className={inputClass}>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 sm:col-span-2">
              <input type="checkbox" {...register('airCondition')} className="h-5 w-5 rounded-lg border-surface-800 bg-surface-900 text-brand-600 focus:ring-brand-500/20" />
              <label className="text-sm font-bold text-surface-200">Air Conditioning Included</label>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">HP / Max Power *</label>
              <input type="number" {...register('maxPower', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Required' } })} className={errors.maxPower ? errorInputClass : inputClass} />
              {errors.maxPower && <p className="text-xs text-rose-400 font-medium mt-1">{errors.maxPower.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">0-100 KM/H (s) *</label>
              <input type="number" {...register('mph', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} step="0.1" className={errors.mph ? errorInputClass : inputClass} />
              {errors.mph && <p className="text-xs text-rose-400 font-medium mt-1">{errors.mph.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Top Speed (KM/H) *</label>
              <input type="number" {...register('topSpeed', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Required' } })} className={errors.topSpeed ? errorInputClass : inputClass} />
              {errors.topSpeed && <p className="text-xs text-rose-400 font-medium mt-1">{errors.topSpeed.message}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6">Vehicle Description *</h3>
          <textarea {...register('description', { required: 'Description is required (min 10 chars)', minLength: { value: 10, message: 'Min 10 characters' }, maxLength: { value: 2000, message: 'Max 2000 characters' } })} rows={6} className={`${errors.description ? errorInputClass : inputClass} resize-none`} placeholder="Provide a premium description for the marketplace..."></textarea>
          {errors.description && <p className="text-xs text-rose-400 font-medium mt-1">{errors.description.message}</p>}
        </div>

        {/* Media Assets — Deferred Upload */}
        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Media Assets</h3>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Gallery Images */}
            <div className="space-y-6">
              <label className="block text-sm font-bold text-surface-200 uppercase tracking-wider">Gallery Images *</label>
              <div
                className="relative border-2 border-dashed border-surface-800 rounded-2xl p-10 hover:bg-surface-900/50 hover:border-brand-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner bg-surface-900/20"
                onClick={() => galleryInputRef.current?.click()}
              >
                <div className="p-4 rounded-2xl bg-surface-800 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all mb-4 border border-surface-700">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-surface-200">Click to select images</p>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-widest">PNG, JPG, WEBP up to 10MB • Multiple</p>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGallerySelect}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {pendingImages.map((file, i) => (
                  <div key={i} className="relative aspect-square group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded-xl border border-surface-800 shadow-sm transition-transform group-hover:scale-105" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-surface-900 rounded-full text-rose-500 p-1 shadow-lg border border-surface-800 hover:bg-rose-500 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Brand Logo */}
            <div className="space-y-6">
              <label className="block text-sm font-bold text-surface-200 uppercase tracking-wider">Brand Logo</label>
              <div
                className="relative border-2 border-dashed border-surface-800 rounded-2xl p-10 hover:bg-surface-900/50 hover:border-brand-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner bg-surface-900/20"
                onClick={() => brandInputRef.current?.click()}
              >
                <div className="p-4 rounded-2xl bg-surface-800 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all mb-4 border border-surface-700">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-surface-200">Click to select brand logo</p>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-widest">PNG, JPG, WEBP up to 10MB</p>
                <input
                  ref={brandInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBrandImageSelect}
                />
              </div>
              {pendingBrandImage && (
                <div className="relative inline-block mt-4 group">
                  <div className="p-4 rounded-xl border border-surface-800 bg-surface-900/50 shadow-sm">
                    <img src={URL.createObjectURL(pendingBrandImage)} alt="brand" className="h-24 w-24 object-contain" />
                  </div>
                  <button type="button" onClick={() => setPendingBrandImage(null)} className="absolute -top-2 -right-2 bg-surface-900 rounded-full text-rose-500 p-1 shadow-lg border border-surface-800 hover:bg-rose-500 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || createCar.isPending}
            className="flex items-center justify-center gap-3 px-12 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-900/20 transition-all disabled:opacity-50"
          >
            {(isSubmitting || createCar.isPending) && <Loader2 className="h-5 w-5 animate-spin" />}
            {uploadProgress || 'Register Vehicle'}
          </button>
        </div>
      </form>
    </div>
  )
}
