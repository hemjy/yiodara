import { useQuery } from '@tanstack/react-query';
import { donorService } from '../api/services/donorService';
import { DonorsByCountryParams } from '../types/api';

export const useDonorsByCountry = (params?: DonorsByCountryParams) => {
  return useQuery({
    queryKey: ['donorsByCountry', params],
    queryFn: async () => {
      const response = await donorService.getTotalDonorsByCountry(params);
      return response.data;
    },
    select: (data) => ({
      countries: data.data || [],
      succeeded: data.succeeded,
      message: data.message
    }),
  });
}; 