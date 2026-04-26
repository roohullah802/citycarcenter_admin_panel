import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useCars() {
  const queryClient = useQueryClient();

  const getCars = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const res = await api.get('/admin/cars/stats');
      return res.data.totalCarsWithTotalLeases || res.data.cars;
    },
  });

  const getCarDetails = (id: string) => useQuery({
    queryKey: ['car', id],
    queryFn: async () => {
      const res = await api.get(`/admin/cars/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const deleteCar = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/cars/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('Car deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete car');
    },
  });

  const createCar = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/cars/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('Car created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create car');
    },
  });

  const updateCar = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.patch(`/admin/cars/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('Car updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update car');
    },
  });

  return {
    getCars,
    getCarDetails,
    deleteCar,
    createCar,
    updateCar,
  };
}
