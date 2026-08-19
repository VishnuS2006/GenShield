import { useState, useEffect, useCallback } from 'react';
import { HistoryQueryParams, HistoryRecord } from '../types/history';
import { historyApi } from '../services/historyApi';
import { parseApiError } from '../utils/errorHandler';
import { Decision } from '../types/detection';

export function useHistory(initialParams?: HistoryQueryParams) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<Decision | undefined>(initialParams?.decision);
  const [limit] = useState<number>(initialParams?.limit || 50);
  const [offset, setOffset] = useState<number>(initialParams?.offset || 0);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await historyApi.getHistory({
        limit,
        offset,
        decision: decisionFilter,
      });
      setRecords(data);
    } catch (err) {
      setError(parseApiError(err, 'Failed to load audit history'));
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, decisionFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const setFilter = (decision?: Decision) => {
    setDecisionFilter(decision);
    setOffset(0);
  };

  return {
    records,
    isLoading,
    error,
    decisionFilter,
    setFilter,
    offset,
    setOffset,
    limit,
    refetch: fetchHistory,
  };
}
