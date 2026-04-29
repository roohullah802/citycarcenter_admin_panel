import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useContent() {
  const queryClient = useQueryClient();

  const getFAQs = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await api.get('/admin/faqs');
      return res.data.data;
    },
  });

  const getPolicies = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await api.get('/admin/policies');
      return res.data.data;
    },
  });

  const setFAQs = useMutation({
    mutationFn: async (data: { question: string, answer: string }) => {
      const res = await api.post('/admin/faqs', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add FAQ');
    },
  });

  const setPolicy = useMutation({
    mutationFn: async (data: { title: string, description: string }) => {
      const res = await api.post('/admin/policies', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Privacy policy added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add Privacy Policy');
    },
  });

  const deleteFAQ = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/faqs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete FAQ');
    },
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/policies/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete Policy');
    },
  });

  return {
    getFAQs,
    setFAQs,
    deleteFAQ,
    getPolicies,
    setPolicy,
    deletePolicy,
  };
}
