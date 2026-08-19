import { apiClient } from './api';
import {
  ChatConversation,
  ChatConversationListItem,
  ChatExchangeResponse,
  CreateConversationPayload,
  SendChatMessagePayload,
} from '../types/chat';

export const chatApi = {
  listConversations: async (): Promise<ChatConversationListItem[]> => {
    const response = await apiClient.get<ChatConversationListItem[]>('/api/chat/conversations');
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
};
