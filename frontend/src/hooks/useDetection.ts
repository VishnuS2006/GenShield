import { useState } from 'react';
import { DetectRequest, DetectResponse } from '../types/detection';
import { detectApi } from '../services/detectApi';
import { parseApiError } from '../utils/errorHandler';

export function useDetection() {
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const detect = async (payload: DetectRequest): Promise<DetectResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await detectApi.detectExfiltration(payload);
      setResult(response);
      return response;
    } catch (err) {
      const msg = parseApiError(err, 'Failed to perform semantic detection');
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    isLoading,
    error,
    detect,
    reset,
  };
}
