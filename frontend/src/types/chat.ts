import { Decision, SecurityAnalysis } from './detection';

export type MessageRole = 'USER' | 'ASSISTANT';

export interface ChatConversationListItem {
  id: number;
  title: string;
  last_message_preview?: string | null;
  last_decision?: Decision | null;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  role: MessageRole;
  content: string;
  request_id?: string | null;
  decision?: Decision | null;
  risk_score?: number | null;
  similarity_score?: number | null;
  matched_source?: string | null;
  lineage_tag?: string | null;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface CreateConversationPayload {
  title?: string;
}

export interface SendChatMessagePayload {
  prompt: string;
}

export interface ChatExchangeResponse {
  conversation: ChatConversation;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  security_analysis: SecurityAnalysis;
}
