import { useQuery } from '@tanstack/react-query';
import { donorService } from '../api/services/donorService';
import { DonorCountParams, DonorCountResponse } from '../types/api';

export interface DonorCountResult {
  totalDonors: number;
  totalDonations: number;
  donationsToday: number;
  todayDonationsCount: number;
  campaignName: string;
  succeeded: boolean;
}

export const useDonorCount = (params?: DonorCountParams) => {
  return useQuery<DonorCountResponse, Error, DonorCountResult>({
    queryKey: ['donorCount', params],
    queryFn: async () => {
      const response = await donorService.getTotalDonorCount(params);
      return response.data;
    },
    select: (apiResponse) => ({
      totalDonors: apiResponse.data?.totalDonors || 0,
      totalDonations: apiResponse.data?.totalDonations || 0,
      donationsToday: apiResponse.data?.donationsToday || 0,
      todayDonationsCount: apiResponse.data?.todayDonationsCount || 0,
      campaignName: apiResponse.data?.campaignName || 'All Campaigns',
      succeeded: apiResponse.succeeded,
    }),
  });
}; 