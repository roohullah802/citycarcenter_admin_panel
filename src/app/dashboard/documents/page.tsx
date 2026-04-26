'use client'

import { useDocuments } from '@/hooks/useDocuments'
import { Loader2, CheckCircle, XCircle, FileSearch, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function DocumentsPage() {
  const { getDocuments, approveDocument, rejectDocument } = useDocuments()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (getDocuments.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Syncing document queue...</p>
        </div>
      </div>
    )
  }

  const documents = getDocuments.data || []

  return (
    <div className="space-y-8 pb-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            Document Verification
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Review and authenticate user identification for security compliance.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <FileSearch className="h-6 w-6 text-brand-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full py-20 text-center text-surface-500 bg-card rounded-2xl border border-surface-800/50 shadow-sm flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-surface-800/50 flex items-center justify-center">
               <CheckCircle className="h-8 w-8 text-surface-700" />
            </div>
            <p className="text-lg font-bold text-surface-300">All caught up!</p>
            <p className="text-sm font-medium">No pending documents to review at this time.</p>
          </div>
        ) : documents.map((doc: any) => (
          <div key={doc.id} className="bg-card rounded-2xl border border-surface-800/50 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-5 border-b border-surface-800/50 bg-surface-900/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest leading-none">User Identity</span>
                <p className="text-sm font-bold text-surface-100 truncate w-32 mt-1" title={doc.id}>{doc.id}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border ${doc.documentStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : doc.documentStatus === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {doc.documentStatus || 'pending'}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 bg-surface-950/20">
              <div className="grid grid-cols-2 gap-3">
                {doc.images && doc.images.length > 0 ? doc.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-surface-800 cursor-pointer group/img" onClick={() => setSelectedImage(img)}>
                    <img src={img} alt="Document" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-brand-950/60 transition-opacity">
                      <ExternalLink className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )) : (
                   <p className="text-xs text-surface-600 italic col-span-2 py-4">No images uploaded.</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-surface-800/50 bg-surface-900/30 flex gap-3">
               <button
                  onClick={() => approveDocument.mutate(doc.id)}
                  disabled={doc.documentStatus === 'approved' || approveDocument.isPending}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-900/20"
               >
                 {approveDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                 Approve
               </button>
               <button
                  onClick={() => rejectDocument.mutate(doc.id)}
                  disabled={doc.documentStatus === 'rejected' || rejectDocument.isPending}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-rose-900/20"
               >
                 {rejectDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                 Reject
               </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/95 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full">
            <button 
              className="absolute -top-12 right-0 text-surface-400 hover:text-surface-50 font-bold text-sm flex items-center gap-2"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle className="h-5 w-5" />
              Close Preview
            </button>
            <div className="rounded-2xl overflow-hidden border border-surface-800 shadow-2xl">
              <img src={selectedImage} alt="Document Full" className="w-full max-h-[80vh] object-contain bg-surface-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
