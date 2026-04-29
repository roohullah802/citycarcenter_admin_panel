import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return {
        stats: res.data.stats,
        recentActivity: res.data.recentActivity,
        chartData: res.data.chartData,
      };
    },
  });
}
