import { useQuery } from '@tanstack/react-query';
import donationService, { GetDonationHistoryParams, DonationHistoryResponse } from '../services/donationService';

export const useDonationHistory = (params: GetDonationHistoryParams) => {
  const { 
    userId, 
    pageNumber, 
    pageSize, 
    startDate, 
    endDate 
  } = params;

  return useQuery<DonationHistoryResponse, Error>({
    queryKey: ['donationHistory', userId, pageNumber, pageSize, startDate, endDate],
    queryFn: () => donationService.getDonationHistory({ 
      userId, 
      pageNumber, 
      pageSize, 
      startDate, 
      endDate 
    }),
    enabled: !!userId, // Only run the query if the userId is available
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Useful for pagination to avoid flickering
  });
}; 