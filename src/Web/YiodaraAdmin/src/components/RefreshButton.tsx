import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  queryKeys?: string[];
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  queryKeys = ['donorCount', 'donations', 'volunteerCount', 'donorsByCountry'],
  className = ''
}) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Invalidate all specified queries
      await Promise.all(
        queryKeys.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Add a small delay to make the animation visible
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title="Refresh data"
    >
      <RefreshCw 
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-purple-600' : 'text-gray-600'}`} 
      />
    </button>
  );
};

export default RefreshButton;