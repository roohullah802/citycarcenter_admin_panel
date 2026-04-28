'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCars } from '@/hooks/useCars'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, X, Plus, Info, Zap, LayoutPanelTop, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/cars/ImageUploader'

interface CarFormValues {
  brand: string;
  modelName: string;
  year: number;
  color: string;
  price: number;
  passengers: number;
  doors: number;
  airCondition: boolean;
  maxPower: number;
  mph: number;
  topSpeed: number;
  available: boolean;
  tax: number;
  weeklyRate: number;
  pricePerDay: number;
  initialMileage: number;
  allowedMilleage: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  description: string;
}

export default function CreateCarPage() {
  const router = useRouter()
  const { createCar } = useCars()
  const { register, handleSubmit, formState: { errors } } = useForm<CarFormValues>({
    defaultValues: {
      airCondition: false,
      fuelType: 'petrol',
      transmission: 'automatic',
      available: true
    }
  })
  
  const [images, setImages] = useState<{ url: string; fileId: string }[]>([])
  const [brandImage, setBrandImage] = useState<{ url: string; fileId: string } | null>(null)

  const onSubmit = (data: any) => {
    createCar.mutate(
      { ...data, images, brandImage, available: true },
      {
        onSuccess: () => {
          router.push('/dashboard/cars')
        }
      }
    )
  }

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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Brand</label>
              <input {...register('brand', { required: true })} placeholder="e.g. Mercedes" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Model Name</label>
              <input {...register('modelName', { required: true })} placeholder="e.g. G-Class" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Production Year</label>
              <input type="number" {...register('year', { required: true, valueAsNumber: true })} placeholder="2024" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Exterior Color</label>
              <input {...register('color', { required: true })} placeholder="Obsidian Black" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Pricing & Usage</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Market Value ($)</label>
              <input type="number" {...register('price', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Daily Rate ($)</label>
              <input type="number" {...register('pricePerDay', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Weekly Rate ($)</label>
              <input type="number" {...register('weeklyRate', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Current Odometer</label>
              <input type="number" {...register('initialMileage', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Daily KM Allowance</label>
              <input type="number" {...register('allowedMilleage', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Service Tax (%)</label>
              <input type="number" {...register('tax', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Technical Specifications</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Capacity</label>
              <input type="number" {...register('passengers', { required: true, valueAsNumber: true })} placeholder="Seats" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Doors</label>
              <input type="number" {...register('doors', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Fuel System</label>
              <select {...register('fuelType', { required: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all">
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Transmission</label>
              <select {...register('transmission', { required: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all">
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 sm:col-span-2">
              <input type="checkbox" {...register('airCondition')} className="h-5 w-5 rounded-lg border-surface-800 bg-surface-900 text-brand-600 focus:ring-brand-500/20" />
              <label className="text-sm font-bold text-surface-200">Air Conditioning Included</label>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">HP / Max Power</label>
              <input type="number" {...register('maxPower', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">0-100 KM/H (s)</label>
              <input type="number" {...register('mph', { required: true, valueAsNumber: true })} step="0.1" className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Top Speed (KM/H)</label>
              <input type="number" {...register('topSpeed', { required: true, valueAsNumber: true })} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-surface-100 uppercase tracking-widest mb-6">Vehicle Description</h3>
          <textarea {...register('description', { required: true })} rows={6} className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700 resize-none" placeholder="Provide a premium description for the marketplace..."></textarea>
        </div>

        <div className="bg-card border border-surface-800/50 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-surface-50 tracking-tight">Media Assets</h3>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <label className="block text-sm font-bold text-surface-200 uppercase tracking-wider">Gallery Images</label>
              <ImageUploader onSuccess={(res) => setImages(prev => [...prev, res])} multiple />
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square group">
                    <img src={img.url} alt="car" className="h-full w-full object-cover rounded-xl border border-surface-800 shadow-sm transition-transform group-hover:scale-105" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-surface-900 rounded-full text-rose-500 p-1 shadow-lg border border-surface-800 hover:bg-rose-500 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <label className="block text-sm font-bold text-surface-200 uppercase tracking-wider">Brand Logo</label>
              <ImageUploader onSuccess={(res) => setBrandImage(res)} />
              {brandImage && (
                <div className="relative inline-block mt-4 group">
                  <div className="p-4 rounded-xl border border-surface-800 bg-surface-900/50 shadow-sm">
                    <img src={brandImage.url} alt="brand" className="h-24 w-24 object-contain" />
                  </div>
                  <button type="button" onClick={() => setBrandImage(null)} className="absolute -top-2 -right-2 bg-surface-900 rounded-full text-rose-500 p-1 shadow-lg border border-surface-800 hover:bg-rose-500 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={createCar.isPending}
            className="flex items-center justify-center gap-3 px-12 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-900/20 transition-all disabled:opacity-50"
          >
            {createCar.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
            Register Vehicle
          </button>
        </div>
      </form>
    </div>
  )
}
