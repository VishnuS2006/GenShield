import { apiClient } from './api';
import { HistoryQueryParams, HistoryRecord } from '../types/history';

export const historyApi = {
  getHistory: async (params?: HistoryQueryParams): Promise<HistoryRecord[]> => {
    const response = await apiClient.get<HistoryRecord[]>('/api/history', {
      params,
    });
    return response.data;
  },
};
