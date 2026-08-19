import { apiClient } from './api';
import { DashboardResponse } from '../types/dashboard';

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/api/dashboard');
    return response.data;
  },
};
