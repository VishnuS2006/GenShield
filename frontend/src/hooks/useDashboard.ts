import { useState, useEffect, useCallback } from 'react';
import { DashboardResponse } from '../types/dashboard';
import { dashboardApi } from '../services/dashboardApi';
import { parseApiError } from '../utils/errorHandler';

export function useDashboard(autoRefresh = false, refreshIntervalMs = 15000) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardApi.getDashboardData();
      setData(response);
    } catch (err) {
      setError(parseApiError(err, 'Failed to load dashboard metrics'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchDashboard, autoRefresh, refreshIntervalMs]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
