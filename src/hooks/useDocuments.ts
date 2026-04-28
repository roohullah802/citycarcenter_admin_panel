import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useDocuments() {
  const queryClient = useQueryClient();

  const getDocuments = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/admin/users/documents');
      return res.data.data;
    },
  });

  const approveDocument = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/users/documents/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document approved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve document');
    },
  });

  const rejectDocument = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/users/documents/${id}/reject`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document rejected');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reject document');
    },
  });

  return {
    getDocuments,
    approveDocument,
    rejectDocument,
  };
}
