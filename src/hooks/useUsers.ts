"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useUsers() {
  const queryClient = useQueryClient();

  const getUsers = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/admin/users/stats/total');
      return res.data.users;
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

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    },
  });

  return {
    getUsers,
    getUserDetails,
    deleteUser,
  };
}
