export type UserRole = 'EMPLOYEE' | 'SECURITY_ANALYST' | 'ADMINISTRATOR';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface UserRegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserProfileSummary {
  user: User;
  request_count: number;
  detection_count: number;
  last_activity_at?: string | null;
}

export interface DetectionSettings {
  similarity_warn_threshold: number;
  similarity_block_threshold: number;
  risk_warn_threshold: number;
  risk_block_threshold: number;
  factual_overlap_mode: string;
  embedding_model: string;
}

export interface SettingsResponse {
  account: User;
  security: Record<string, string>;
  detection: DetectionSettings;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
