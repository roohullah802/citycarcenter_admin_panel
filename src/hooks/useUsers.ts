"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useUsers() {
  const queryClient = useQueryClient();

  const getUsers = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data;
    },
  });

  const getUserDetails = (id: string) => useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });



  const toggleRole = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post('/admin/roles/toggle', { userId });
      return res.data;
    },
    onSuccess: (data, userId) => {
      toast.success(data.message || 'User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    },
  });

  return {
    getUsers,
    getUserDetails,
    toggleRole,
  };
}
