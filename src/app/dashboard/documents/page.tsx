'use client'

import { useDocuments } from '@/hooks/useDocuments'
import { Loader2, CheckCircle, XCircle, FileSearch, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function DocumentsPage() {
  const { getDocuments, approveDocument, rejectDocument, deleteDocument } = useDocuments()
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
  console.log("docs ", documents);


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
              <div className="min-w-0 flex-1 mr-4">
                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest leading-none">User Identity</span>
                <p className="text-sm font-bold text-surface-100 truncate mt-1">
                  {doc.name || 'Unknown User'}
                </p>
                <p className="text-[10px] text-surface-500 truncate font-medium">{doc.email}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border ${doc.documentStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : doc.documentStatus === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {doc.documentStatus || 'pending'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 bg-surface-950/20">
              {doc.images && doc.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {doc.images.map((img: string, i: number) => {
                    console.log("imm ", img);

                    const labels = ['CNIC Front', 'CNIC Back', 'Driving Licence', 'Extra Doc']
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-surface-600 uppercase tracking-widest px-1">{labels[i] || `Document ${i + 1}`}</span>
                        <div
                          className="relative aspect-[4/3] rounded-xl overflow-hidden border border-surface-800 cursor-pointer group/img bg-surface-900"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img
                            src={img}
                            alt={labels[i] || `Document ${i + 1}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.img-error')) {
                                const el = document.createElement('div');
                                el.className = 'img-error flex flex-col items-center justify-center h-full w-full text-surface-600 absolute inset-0';
                                el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Failed to Load</span>';
                                parent.appendChild(el);
                              }
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-brand-950/60 transition-opacity">
                            <ExternalLink className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-surface-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  <p className="text-xs font-medium italic">No documents uploaded yet.</p>
                </div>
              )}
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
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete these documents and reset verification?')) {
                    deleteDocument.mutate(doc.id)
                  }
                }}
                disabled={deleteDocument.isPending}
                className="flex justify-center items-center p-2.5 rounded-xl text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-all border border-transparent hover:border-rose-500/20"
                title="Delete Documents & Reset"
              >
                {deleteDocument.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
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
