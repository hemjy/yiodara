import { useState, useEffect } from 'react';
import campaignService, { CampaignCategory as ApiCategory } from '@/services/campaignService';

interface UseCategoriesOptions {
  autoFetch?: boolean;
  includeAll?: boolean;
  onError?: (error: string) => void;
}

interface UseCategoriesReturn {
  categories: string[];
  categoryData: ApiCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { autoFetch = true, includeAll = true, onError } = options;
  const [categoryData, setCategoryData] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getAllCategories();
      
      if (response.succeeded) {
        setCategoryData(response.data);
      } else {
        const errorMessage = response.message || 'Failed to load categories';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while fetching categories';
      
      console.error('Error fetching categories:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch]);

  const categories = [
    ...(includeAll ? ['All'] : []),
    ...categoryData.map(cat => cat.name)
  ];

  return {
    categories,
    categoryData,
    isLoading,
    error,
    refetch: fetchCategories,
    clearError
  };
}; 