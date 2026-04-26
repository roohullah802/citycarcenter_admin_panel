import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
export function useDashboardStats() {
  const totalUsers = useQuery({
    queryKey: ['totalUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users as number;
    },
  });

  const totalCars = useQuery({
    queryKey: ['totalCars'],
    queryFn: async () => {
      const res = await api.get('/admin/cars/stats/total');
      return res.data.cars as number;
    },
  });

  const activeLeases = useQuery({
    queryKey: ['activeLeases'],
    queryFn: async () => {
      const res = await api.get('/admin/leases/stats/active');
      return res.data.leases.length as number;
    },
  });

  const transactions = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/admin/transactions');
      return {
        revenue: res.data.totalRevenue as number,
        leases: res.data.leases,
      };
    },
  });

  return {
    totalUsers,
    totalCars,
    activeLeases,
    transactions,
    isLoading: totalUsers.isLoading || totalCars.isLoading || activeLeases.isLoading || transactions.isLoading,
  };
}
