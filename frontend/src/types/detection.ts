export type Decision = 'ALLOW' | 'WARN' | 'BLOCK';

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityAnalysis {
  similarity_score: number;
  facts_matched: number;
  facts_total: number;
  factual_overlap_score: number;
  sensitivity?: SensitivityLevel | null;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  decision: Decision;
  matched_source?: string | null;
  lineage_tag?: string | null;
  matched_facts: string[];
}

export interface GenerateRequest {
  prompt: string;
  scenario?: string;
}

export interface GenerateResponse {
  request_id: string;
  prompt: string;
  generated_response: string;
  security_analysis: SecurityAnalysis;
}

export interface DetectRequest {
  generated_response: string;
  document_ids?: number[];
}

export interface DetectResponse {
  request_id: string;
  security_analysis: SecurityAnalysis;
}
