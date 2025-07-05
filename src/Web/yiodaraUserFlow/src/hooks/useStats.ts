import { useState, useEffect } from 'react';
import campaignService, { FundRaisingStats } from '@/services/campaignService';

interface UseStatsReturn {
  stats: FundRaisingStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<FundRaisingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campaignService.getFundRaisingStats();
      if (response.succeeded && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchStats };
}; 