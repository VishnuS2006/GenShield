import axios from 'axios';
import { BackendErrorResponse } from '../types/api';

export function parseApiError(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  if (axios.isAxiosError(error)) {
    // 1. Network connectivity / server down
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return 'Request timed out. Please check your network connection and retry.';
      }
      return 'Unable to connect to GenShield Backend. Ensure the API server is running.';
    }

    const { status, data } = error.response;
    const errorData = data as BackendErrorResponse | undefined;

    // 2. Custom backend error format: { error: { code, message } }
    if (errorData?.error?.message) {
      return errorData.error.message;
    }

    // 3. FastAPI standard detail format: { detail: string | Array }
    if (errorData?.detail) {
      if (typeof errorData.detail === 'string') {
        return errorData.detail;
      }
      if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        // Validation error
        const firstError = errorData.detail[0];
        const field = firstError.loc ? firstError.loc[firstError.loc.length - 1] : 'Field';
        return `${field}: ${firstError.msg}`;
      }
    }

    // 4. HTTP Status Code specific fallbacks
    switch (status) {
      case 400:
        return 'Invalid request parameters. Please verify your input.';
      case 401:
        return 'Invalid credentials or session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource or email may already exist.';
      case 422:
        return 'Validation error. Please check the submitted data.';
      case 500:
        return 'GenShield service encountered an internal error. Please try again later.';
      case 503:
        return 'GenShield database or service is temporarily unavailable.';
      default:
        return `Server returned status ${status}.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
