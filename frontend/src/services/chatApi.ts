import { apiClient } from './api';
import {
  ChatConversation,
  ChatConversationListItem,
  ChatExchangeResponse,
  CreateConversationPayload,
  EditChatMessagePayload,
  SendChatMessagePayload,
  UpdateConversationPayload,
} from '../types/chat';

export const chatApi = {
  listConversations: async (search?: string): Promise<ChatConversationListItem[]> => {
    const response = await apiClient.get<ChatConversationListItem[]>('/api/chat/conversations', {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return response.data;
  },

  createConversation: async (payload?: CreateConversationPayload): Promise<ChatConversation> => {
    const response = await apiClient.post<ChatConversation>('/api/chat/conversations', {
      title: payload?.title || 'New conversation',
    });
    return response.data;
  },

  getConversation: async (conversationId: number): Promise<ChatConversation> => {
    const response = await apiClient.get<ChatConversation>(`/api/chat/conversations/${conversationId}`);
    return response.data;
  },

  updateConversation: async (
    conversationId: number,
    payload: UpdateConversationPayload
  ): Promise<ChatConversation> => {
    const response = await apiClient.patch<ChatConversation>(
      `/api/chat/conversations/${conversationId}`,
      payload
    );
    return response.data;
  },

  deleteConversation: async (conversationId: number): Promise<void> => {
    await apiClient.delete(`/api/chat/conversations/${conversationId}`);
  },

  sendMessage: async (
    conversationId: number,
    payload: SendChatMessagePayload
  ): Promise<ChatExchangeResponse> => {
    const response = await apiClient.post<ChatExchangeResponse>(
      `/api/chat/conversations/${conversationId}/messages`,
      payload
    );
    return response.data;
  },

  regenerateMessage: async (conversationId: number): Promise<ChatExchangeResponse> => {
    const response = await apiClient.post<ChatExchangeResponse>(
      `/api/chat/conversations/${conversationId}/regenerate`
    );
    return response.data;
  },

  editMessage: async (
    conversationId: number,
    messageId: number,
    payload: EditChatMessagePayload
  ): Promise<ChatExchangeResponse> => {
    const response = await apiClient.patch<ChatExchangeResponse>(
      `/api/chat/conversations/${conversationId}/messages/${messageId}`,
      payload
    );
    return response.data;
  },
};
