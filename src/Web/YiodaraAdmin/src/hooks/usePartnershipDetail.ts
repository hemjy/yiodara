import { useQuery } from '@tanstack/react-query';
import { partnershipService } from '../api/services/partnershipService';
import { PartnershipDetailResponse } from '../types/api';

export const usePartnershipDetail = (id: string) => {
  return useQuery<PartnershipDetailResponse, Error>({
    queryKey: ['partnershipDetail', id],
    queryFn: async () => {
      const response = await partnershipService.getPartnershipDetail(id);
      return response.data;
    },
    enabled: !!id, // Only run the query if id is provided
  });
}; 