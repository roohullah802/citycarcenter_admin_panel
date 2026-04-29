'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, MessageSquareWarning, Trash2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearch } from '@/context/SearchContext'

export default function ComplaintsPage() {
  const getComplaints = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await api.get('/admin/complaints')
      return res.data.data
    },
  });

  const { searchQuery } = useSearch()

  const filteredComplaints = (getComplaints.data || []).filter((complaint: any) => 
    complaint.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const queryClient = useQueryClient();

  const deleteComplaint = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/complaints/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete complaint');
    },
  });


  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'userId.username',
      header: 'Reported By',
      cell: ({ row }: any) => {
        return (
          <div className="flex flex-col">
            <Link href={`/dashboard/users/${row.original.userId?._id}`} className="text-brand-400 hover:text-brand-300 font-bold transition-colors leading-none">
              {row.original.userId?.name || 'Unknown User'}
            </Link>
            <span className="text-[10px] text-surface-500 font-medium mt-1 uppercase tracking-wider">{row.original.userId?.email || 'No Email'}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'description',
      header: 'Complaint / Issue',
      cell: ({ row }: any) => (
        <div className="max-w-md">
          <p className="text-surface-300 line-clamp-2 leading-relaxed italic">"{row.original.description}"</p>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted On',
      cell: ({ row }: any) => (
        <span className="text-surface-500 font-medium text-xs">
          {new Date(row.original.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this complaint?')) {
                  deleteComplaint.mutate(row.original._id)
                }
              }}
              className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              {deleteComplaint.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        )
      },
    },
  ]

  if (getComplaints.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-surface-500 animate-pulse">Retrieving complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-surface-50">
            User Complaints
          </h2>
          <p className="mt-2 text-surface-400 font-medium">
            Monitor and resolve issues reported by the community.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <MessageSquareWarning className="h-6 w-6 text-amber-500" />
        </div>
      </div>

      {filteredComplaints.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-surface-800/50">
          <div className="p-4 rounded-full bg-surface-900 border border-surface-800 mb-4">
            <SearchX className="h-8 w-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">No complaints found</h3>
          <p className="text-surface-500 text-sm mt-1">We couldn't find any records matching "{searchQuery}"</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredComplaints} />
      )}
    </div>
  )
}
