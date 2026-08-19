import { apiClient } from './api';
import { DetectRequest, DetectResponse } from '../types/detection';

export const detectApi = {
  detectExfiltration: async (payload: DetectRequest): Promise<DetectResponse> => {
    const response = await apiClient.post<DetectResponse>('/api/detect', payload);
    return response.data;
  },
};
