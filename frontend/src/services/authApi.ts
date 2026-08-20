import { apiClient } from './api';
import {
  SettingsResponse,
  TokenResponse,
  User,
  UserLoginPayload,
  UserProfileSummary,
  UserRegisterPayload,
} from '../types/auth';

export const authApi = {
  login: async (credentials: UserLoginPayload): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: UserRegisterPayload): Promise<User> => {
    const response = await apiClient.post<User>('/api/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  getProfileSummary: async (): Promise<UserProfileSummary> => {
    const response = await apiClient.get<UserProfileSummary>('/api/auth/profile-summary');
    return response.data;
  },

  getSettings: async (): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>('/api/auth/settings');
    return response.data;
  },
};
