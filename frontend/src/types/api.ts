export interface BackendErrorObject {
  code: string;
  message: string;
}

export interface BackendErrorResponse {
  error?: BackendErrorObject;
  detail?: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface HealthResponse {
  status: string;
  database: string;
  service: string;
}
