import { Decision } from './detection';

export interface RecentDetection {
  request_id: string;
  risk_score: number;
  decision: Decision;
  similarity_score?: number;
  factual_overlap_score?: number;
  facts_matched?: number;
  matched_source?: string;
  lineage_tag?: string;
  matched_facts?: string[];
  created_at: string;
}

export interface DashboardResponse {
  total_requests: number;
  allowed_responses: number;
  warnings: number;
  blocked_responses: number;
  average_risk_score: number;
  protected_sources_count?: number;
  recent_detections: RecentDetection[];
}

export interface StatMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  type: 'total' | 'allowed' | 'warn' | 'block' | 'risk';
}
