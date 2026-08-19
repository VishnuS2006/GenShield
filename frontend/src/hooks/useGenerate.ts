import { useState } from 'react';
import { GenerateRequest, GenerateResponse } from '../types/detection';
import { generateApi } from '../services/generateApi';
import { parseApiError } from '../utils/errorHandler';

export type GenerationPhase = 'idle' | 'generating' | 'analyzing' | 'evaluating' | 'complete' | 'error';

export function useGenerate() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const generate = async (payload: GenerateRequest): Promise<GenerateResponse | null> => {
    try {
      setError(null);
      setPhase('generating');

      // Subtle phase transition for security UI feedback
      const phaseTimer1 = setTimeout(() => setPhase('analyzing'), 600);
      const phaseTimer2 = setTimeout(() => setPhase('evaluating'), 1200);

      const response = await generateApi.generateResponse(payload);
      
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);

      setResult(response);
      setPhase('complete');
      return response;
    } catch (err) {
      const msg = parseApiError(err, 'Failed to generate and analyze response');
      setError(msg);
      setPhase('error');
      return null;
    }
  };

  const reset = () => {
    setResult(null);
    setPhase('idle');
    setError(null);
  };

  return {
    result,
    phase,
    isLoading: phase === 'generating' || phase === 'analyzing' || phase === 'evaluating',
    error,
    generate,
    reset,
  };
}
