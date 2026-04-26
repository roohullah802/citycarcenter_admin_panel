import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useContent() {
  const setFAQs = useMutation({
    mutationFn: async (data: { question: string, answer: string }) => {
      const res = await api.post('/admin/faqs', data);
      return res.data;
    },
    onSuccess: () => {
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
      toast.success('Privacy policy added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add Privacy Policy');
    },
  });

  return {
    setFAQs,
    setPolicy,
  };
}
