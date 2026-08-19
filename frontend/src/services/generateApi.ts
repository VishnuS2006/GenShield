import { apiClient } from './api';
import { GenerateRequest, GenerateResponse } from '../types/detection';

export const generateApi = {
  generateResponse: async (payload: GenerateRequest): Promise<GenerateResponse> => {
    const response = await apiClient.post<GenerateResponse>('/api/generate', payload);
    return response.data;
  },
};
