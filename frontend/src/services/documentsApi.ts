import { apiClient } from './api';
import {
  ProtectedDocumentCreate,
  ProtectedDocumentRead,
  ProtectedDocumentUpdate,
} from '../types/documents';

export const documentsApi = {
  getDocuments: async (): Promise<ProtectedDocumentRead[]> => {
    const response = await apiClient.get<ProtectedDocumentRead[]>('/api/protected-documents');
    return response.data;
  },

  getDocument: async (id: number): Promise<ProtectedDocumentRead> => {
    const response = await apiClient.get<ProtectedDocumentRead>(`/api/protected-documents/${id}`);
    return response.data;
  },

  createDocument: async (payload: ProtectedDocumentCreate): Promise<ProtectedDocumentRead> => {
    const response = await apiClient.post<ProtectedDocumentRead>('/api/protected-documents', payload);
    return response.data;
  },

  updateDocument: async (
    id: number,
    payload: ProtectedDocumentUpdate
  ): Promise<ProtectedDocumentRead> => {
    const response = await apiClient.put<ProtectedDocumentRead>(
      `/api/protected-documents/${id}`,
      payload
    );
    return response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/protected-documents/${id}`);
  },
};
