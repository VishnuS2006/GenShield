import { Decision } from './detection';

export interface HistoryRecord {
  request_id: string;
  prompt: string;
  generated_response: string;
  risk_score: number;
  decision: Decision;
  created_at: string;
}

export interface HistoryQueryParams {
  limit?: number;
  offset?: number;
  decision?: Decision;
}
