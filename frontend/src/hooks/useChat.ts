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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshConversations = useCallback(async (query?: string) => {
    const effectiveQuery = typeof query === 'string' ? query : searchQuery;
    const items = await chatApi.listConversations(effectiveQuery);
    setConversations(items);
    return items;
  }, [searchQuery]);

  const loadConversation = useCallback(async (conversationId: number) => {
    const conversation = await chatApi.getConversation(conversationId);
    setActiveConversation(conversation);
    return conversation;
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await refreshConversations('');
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
      setSearchQuery('');
      await refreshConversations('');
    } catch (err) {
      setError(parseApiError(err, 'Failed to create conversation'));
    }
  };

  const renameConversation = async (conversationId: number, title: string) => {
    try {
      setError(null);
      const updated = await chatApi.updateConversation(conversationId, { title });
      if (activeConversation?.id === conversationId) {
        setActiveConversation(updated);
      }
      await refreshConversations();
    } catch (err) {
      setError(parseApiError(err, 'Failed to rename conversation'));
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      setError(null);
      setIsDeleting(true);
      const wasActive = activeConversation?.id === conversationId;
      const previousActiveId = activeConversation?.id ?? null;

      setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
      if (wasActive) {
        setActiveConversation(null);
      }

      await chatApi.deleteConversation(conversationId);

      const remaining = await refreshConversations();
      if (wasActive) {
        if (remaining.length > 0) {
          await loadConversation(remaining[0].id);
        } else {
          const created = await chatApi.createConversation();
          setActiveConversation(created);
          setSearchQuery('');
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
      } else if (previousActiveId !== null) {
        const stillExists = remaining.some((conversation) => conversation.id === previousActiveId);
        if (!stillExists) {
          if (remaining.length > 0) {
            await loadConversation(remaining[0].id);
          } else {
            setActiveConversation(null);
          }
        }
      }
    } catch (err) {
      setError(parseApiError(err, 'Failed to delete conversation'));
      await refreshConversations();
    }
    finally {
      setIsDeleting(false);
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

  const regenerateMessage = async (): Promise<ChatExchangeResponse | null> => {
    if (!activeConversation || isSending) {
      return null;
    }
    try {
      setError(null);
      setIsSending(true);
      const exchange = await chatApi.regenerateMessage(activeConversation.id);
      setActiveConversation(exchange.conversation);
      await refreshConversations();
      return exchange;
    } catch (err) {
      setError(parseApiError(err, 'Failed to regenerate response'));
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const searchConversations = async (query: string) => {
    try {
      setError(null);
      setSearchQuery(query);
      const items = await chatApi.listConversations(query);
      setConversations(items);
    } catch (err) {
      setError(parseApiError(err, 'Failed to search conversations'));
    }
  };

  const editMessage = async (
    conversationId: number,
    messageId: number,
    content: string
  ): Promise<ChatExchangeResponse | null> => {
    if (isSending) {
      return null;
    }
    try {
      setError(null);
      setIsSending(true);
      const exchange = await chatApi.editMessage(conversationId, messageId, { content });
      setActiveConversation(exchange.conversation);
      await refreshConversations();
      return exchange;
    } catch (err) {
      setError(parseApiError(err, 'Failed to edit message'));
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
    isDeleting,
    error,
    selectConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    regenerateMessage,
    editMessage,
    searchConversations,
    refetch: bootstrap,
  };
}
