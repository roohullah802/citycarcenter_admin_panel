'use client'

import { useDocuments } from '@/hooks/useDocuments'
import { Loader2, CheckCircle, XCircle, FileSearch, ExternalLink, Trash2, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useSearch } from '@/context/SearchContext'

export default function DocumentsPage() {
  const { getDocuments, approveDocument, rejectDocument, deleteDocument } = useDocuments()
  const [selectedImage, setSelectedImage] = useState<{ url: string; label: string } | null>(null)
  const { searchQuery } = useSearch()

  if (getDocuments.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <div className="absolute inset-0 blur-xl bg-brand-500/20 animate-pulse rounded-full" />
          </div>
          <p className="text-sm font-medium text-surface-400 animate-pulse tracking-wide">Syncing verification queue...</p>
        </div>
      </div>
    )
  }

  const documents = getDocuments.data || []

  const filteredDocuments = documents.filter((doc: any) =>
    doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProcessedDocs = (doc: any) => {
    const docs: { url: string; label: string; category: 'identity' | 'extra' }[] = []

    if (doc.cnicFront?.url) docs.push({ url: doc.cnicFront.url, label: 'CNIC Front', category: 'identity' })
    if (doc.cnicBack?.url) docs.push({ url: doc.cnicBack.url, label: 'CNIC Back', category: 'identity' })
    if (doc.drivingLicence?.url) docs.push({ url: doc.drivingLicence.url, label: 'Driving Licence', category: 'identity' })

    // Handle Extra Documents (can be array or single object)
    const extraDocs = doc.extraDocuments || doc.extraDocument;
    if (Array.isArray(extraDocs)) {
      extraDocs.forEach((d: any, i: number) => {
        const url = typeof d === 'string' ? d : d?.url;
        if (url) {
          docs.push({
            url,
            label: extraDocs.length > 1 ? `Extra Doc ${i + 1}` : 'Extra Document',
            category: 'extra'
          });
        }
      });
    } else if (extraDocs) {
      const url = typeof extraDocs === 'string' ? extraDocs : extraDocs.url;
      if (url) {
        docs.push({ url, label: 'Extra Document', category: 'extra' });
      }
    }

    // Fallback for legacy data or different backend structure
    if (docs.length === 0 && Array.isArray(doc.images)) {
      const labels = ['CNIC Front', 'CNIC Back', 'Driving Licence', 'Extra Doc']
      doc.images.forEach((url: string, i: number) => {
        docs.push({
          url,
          label: labels[i] || `Document ${i + 1}`,
          category: i < 3 ? 'identity' : 'extra'
        })
      })
    }

    return docs
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-2">
            <FileSearch className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Compliance Center</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Document <span className="text-brand-500">Verification</span>
          </h1>
          <p className="text-surface-400 font-medium max-w-2xl">
            Review and authenticate user identification documents to ensure platform security and regulatory compliance.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-8 px-6 py-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-xl font-black text-amber-500">{documents.filter((d: any) => d.documentStatus === 'pending').length}</p>
          </div>
          <div className="w-px h-8 bg-surface-800" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Processed</p>
            <p className="text-xl font-black text-emerald-500">{documents.filter((d: any) => d.documentStatus === 'approved').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full py-24 text-center glass rounded-3xl flex flex-col items-center gap-6 group">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-surface-900 flex items-center justify-center border border-surface-800 group-hover:scale-110 transition-transform duration-500">
                {searchQuery ? <SearchX className="h-10 w-10 text-surface-600" /> : <CheckCircle className="h-10 w-10 text-brand-500/50" />}
              </div>
              <div className="absolute inset-0 blur-2xl bg-brand-500/10 rounded-full group-hover:bg-brand-500/20 transition-colors" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-surface-100">
                {searchQuery ? `No matches for "${searchQuery}"` : "Verification Queue Empty"}
              </h3>
              <p className="text-surface-500 max-w-xs mx-auto">
                {searchQuery ? "We couldn't find any users matching your current search criteria." : "Great job! All submitted documents have been reviewed and processed."}
              </p>
            </div>
          </div>
        ) : filteredDocuments.map((doc: any) => {
          const userDocs = getProcessedDocs(doc)
          const isPending = doc.documentStatus === 'pending' || !doc.documentStatus

          return (
            <div key={doc.id || doc._id} className="group relative bg-surface-900/40 border border-surface-800/50 rounded-3xl overflow-hidden hover:border-brand-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/5">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-brand-500/5 blur-[80px] rounded-full group-hover:bg-brand-500/10 transition-colors" />

              <div className="p-6 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white truncate leading-tight group-hover:text-brand-400 transition-colors">
                      {doc.name || 'Anonymous User'}
                    </h3>
                    <p className="text-xs font-medium text-surface-500 truncate mt-0.5">{doc.email}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${doc.documentStatus === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : doc.documentStatus === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                    {doc.documentStatus || 'pending'}
                  </div>
                </div>

                {/* Document Grid */}
                <div className="space-y-4">
                  {userDocs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {userDocs.map((item, i) => (
                        <div key={i} className="space-y-1.5">
                          <span className="text-[9px] font-bold text-surface-600 uppercase tracking-widest pl-1">{item.label}</span>
                          <div
                            className="relative aspect-[4/3] rounded-xl overflow-hidden border border-surface-800 bg-surface-950 cursor-pointer group/img"
                            onClick={() => setSelectedImage(item)}
                          >
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-brand-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 scale-75 group-hover/img:scale-100 transition-transform">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 border-2 border-dashed border-surface-800/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-surface-600 italic">
                      <FileSearch className="h-8 w-8 opacity-20" />
                      <p className="text-[10px] font-bold tracking-widest uppercase">No Documents Uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-surface-950/40 border-t border-surface-800/50 flex items-center gap-3">
                <button
                  onClick={() => approveDocument.mutate(doc.id || doc._id)}
                  disabled={doc.documentStatus === 'approved' || approveDocument.isPending}
                  className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
                >
                  {approveDocument.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => rejectDocument.mutate(doc.id || doc._id)}
                  disabled={doc.documentStatus === 'rejected' || rejectDocument.isPending}
                  className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-rose-950/20 active:scale-95"
                >
                  {rejectDocument.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Erase all documents and reset verification state? This action cannot be undone.')) {
                      deleteDocument.mutate(doc.id || doc._id)
                    }
                  }}
                  disabled={deleteDocument.isPending}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-900 border border-surface-800 text-surface-500 hover:text-rose-400 hover:border-rose-500/30 transition-all active:scale-90"
                  title="Purge Data"
                >
                  {deleteDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Image Previewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-xl" />

          <div className="relative max-w-6xl w-full h-full flex flex-col animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="px-4 py-2 rounded-full bg-surface-900 border border-surface-800 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-bold text-surface-200 uppercase tracking-widest">{selectedImage.label}</span>
              </div>
              <button
                className="h-10 w-10 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-400 hover:text-white hover:bg-brand-600 transition-all"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 relative rounded-3xl overflow-hidden bg-surface-900 border border-surface-800/50 shadow-2xl">
              <img
                src={selectedImage.url}
                alt="Document Full View"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-[10px] font-bold text-surface-600 uppercase tracking-[0.2em]">Click outside or use ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
