'use client'

import { useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { Loader2, BookOpen, ShieldCheck } from 'lucide-react'

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'policies'>('faqs')
  
  const { setFAQs, setPolicy } = useContent()

  // Form states
  const [faqQuestion, setFaqQuestion] = useState('')
  const [faqAnswer, setFaqAnswer] = useState('')

  const [policyTitle, setPolicyTitle] = useState('')
  const [policyDesc, setPolicyDesc] = useState('')

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFAQs.mutate({ question: faqQuestion, answer: faqAnswer }, {
      onSuccess: () => {
        setFaqQuestion('')
        setFaqAnswer('')
      }
    })
  }

  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPolicy.mutate({ title: policyTitle, description: policyDesc }, {
      onSuccess: () => {
        setPolicyTitle('')
        setPolicyDesc('')
      }
    })
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Content Management
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Update application documentation, legal policies, and help center resources.
          </p>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-surface-800/50 rounded-2xl overflow-hidden max-w-5xl">
        <div className="border-b border-surface-800/50 bg-surface-900/30">
          <nav className="flex px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center justify-center gap-2 py-5 px-6 border-b-2 font-bold text-sm transition-all ${activeTab === 'faqs' ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-surface-500 hover:text-surface-300'}`}
            >
              <BookOpen className="h-4 w-4" />
              Help Center FAQs
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`flex items-center justify-center gap-2 py-5 px-6 border-b-2 font-bold text-sm transition-all ${activeTab === 'policies' ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-surface-500 hover:text-surface-300'}`}
            >
              <ShieldCheck className="h-4 w-4" />
              Privacy & Legal
            </button>
          </nav>
        </div>

        <div className="p-8 lg:p-12">
          {activeTab === 'faqs' && (
            <form onSubmit={handleFaqSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-surface-200 tracking-wide uppercase">Question</label>
                <input 
                  type="text" 
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  required 
                  className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 shadow-sm focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" 
                  placeholder="e.g. How do I rent a car?"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-surface-200 tracking-wide uppercase">Answer</label>
                <textarea 
                  rows={6} 
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  required 
                  className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 shadow-sm focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700 resize-none"
                  placeholder="Provide a detailed, helpful answer for your users..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={setFAQs.isPending}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  {setFAQs.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Publish Entry
                </button>
              </div>
            </form>
          )}

          {activeTab === 'policies' && (
            <form onSubmit={handlePolicySubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-surface-200 tracking-wide uppercase">Policy Title</label>
                <input 
                  type="text" 
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  required 
                  className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 shadow-sm focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700" 
                  placeholder="e.g. Data Collection Policy"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-surface-200 tracking-wide uppercase">Policy Content</label>
                <textarea 
                  rows={12} 
                  value={policyDesc}
                  onChange={(e) => setPolicyDesc(e.target.value)}
                  required 
                  className="block w-full rounded-xl border border-surface-800 bg-surface-900/50 py-3 px-4 text-surface-100 shadow-sm focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-surface-700 resize-none"
                  placeholder="Draft the full policy content here. Use clear, professional language..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={setPolicy.isPending}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  {setPolicy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Update Policy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
