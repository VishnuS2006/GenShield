import { useState, useEffect, useCallback } from 'react';
import {
  ProtectedDocumentCreate,
  ProtectedDocumentRead,
  ProtectedDocumentUpdate,
} from '../types/documents';
import { documentsApi } from '../services/documentsApi';
import { parseApiError } from '../utils/errorHandler';

export function useDocuments() {
  const [documents, setDocuments] = useState<ProtectedDocumentRead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await documentsApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(parseApiError(err, 'Failed to load protected documents'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (payload: ProtectedDocumentCreate): Promise<ProtectedDocumentRead> => {
    try {
      const created = await documentsApi.createDocument(payload);
      setDocuments((prev) => [...prev, created]);
      return created;
    } catch (err) {
      throw new Error(parseApiError(err, 'Failed to create document'));
    }
  };

  const updateDocument = async (
    id: number,
    payload: ProtectedDocumentUpdate
  ): Promise<ProtectedDocumentRead> => {
    try {
      const updated = await documentsApi.updateDocument(id, payload);
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)));
      return updated;
    } catch (err) {
      throw new Error(parseApiError(err, 'Failed to update document'));
    }
  };

  const deleteDocument = async (id: number): Promise<void> => {
    try {
      await documentsApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      throw new Error(parseApiError(err, 'Failed to delete document'));
    }
  };

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}
