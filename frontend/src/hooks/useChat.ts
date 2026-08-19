import { useCallback, useEffect, useState } from 'react';
import { chatApi } from '../services/chatApi';
import {
  ChatConversation,
  ChatConversationListItem,
  ChatExchangeResponse,
} from '../types/chat';
import { parseApiError } from '../utils/errorHandler';

export function useChat() {
  const [conversations, setConversations] = useState<ChatConversationListItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversations = useCallback(async () => {
    const items = await chatApi.listConversations();
    setConversations(items);
    return items;
  }, []);

  const loadConversation = useCallback(async (conversationId: number) => {
    const conversation = await chatApi.getConversation(conversationId);
    setActiveConversation(conversation);
    return conversation;
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await refreshConversations();
      if (items.length > 0) {
        await loadConversation(items[0].id);
      } else {
        const created = await chatApi.createConversation();
        setActiveConversation(created);
        setConversations([
          {
            id: created.id,
            title: created.title,
            updated_at: created.updated_at,
            last_message_preview: null,
            last_decision: null,
          },
        ]);
      }
    } catch (err) {
      setError(parseApiError(err, 'Failed to load chatbot workspace'));
    } finally {
      setIsLoading(false);
    }
  }, [loadConversation, refreshConversations]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const selectConversation = async (conversationId: number) => {
    try {
      setError(null);
      await loadConversation(conversationId);
    } catch (err) {
      setError(parseApiError(err, 'Failed to load conversation'));
    }
  };

  const createConversation = async () => {
    try {
      setError(null);
      const created = await chatApi.createConversation();
      setActiveConversation(created);
      await refreshConversations();
    } catch (err) {
      setError(parseApiError(err, 'Failed to create conversation'));
    }
  };

  const sendMessage = async (prompt: string): Promise<ChatExchangeResponse | null> => {
    if (!activeConversation || isSending) {
      return null;
    }
    try {
      setError(null);
      setIsSending(true);
      const exchange = await chatApi.sendMessage(activeConversation.id, { prompt });
      setActiveConversation(exchange.conversation);
      await refreshConversations();
      return exchange;
    } catch (err) {
      setError(parseApiError(err, 'Failed to send message'));
      return null;
    } finally {
      setIsSending(false);
    }
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    isSending,
    error,
    selectConversation,
    createConversation,
    sendMessage,
    refetch: bootstrap,
  };
}
