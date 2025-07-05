import { useQuery } from '@tanstack/react-query';
import { donationService } from '../api/services/donationService';
import { AllDonationsParams } from '../types/api';

export const useAllDonations = (params: AllDonationsParams = {}) => {
  return useQuery({
    queryKey: ['allDonations', params],
    queryFn: async () => {
      const response = await donationService.getAllDonations(params);
      // Return the data property from the response
      return response.data;
    },
    select: (data) => ({
      donations: data.data || [],
      pageNumber: data.pageNumber || 1,
      pageSize: data.pageSize || 10,
      total: data.total || 0,
      hasPrevious: data.hasPrevious || false,
      hasNext: data.hasNext || false,
      succeeded: data.succeeded,
      message: data.message,
    }),
  });
}; 