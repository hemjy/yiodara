import { useQuery } from '@tanstack/react-query';
import { donationService } from '../api/services/donationService';
import { DonationParams, ApiDonor, DonorsResponse, DonationsResult } from '../types/api';


export const useDonations = (params?: DonationParams) => {
  return useQuery<DonorsResponse, Error, DonationsResult>({
    queryKey: ['donations', params],
    queryFn: async () => {
      const response = await donationService.getAllDonations(params);
      return response.data;
    },
    select: (apiResponse: DonorsResponse) => {
      const donations = Array.isArray(apiResponse.data) 
        ? apiResponse.data.map((donor: ApiDonor) => ({
            id: donor.id,
            donorName: donor.name,
            amount: donor.lastDonationAmount,
            totalDonation: donor.totalDonation,
            date: donor.lastDonationDate
          }))
        : [];
      
      return {
        donations,
        pageNumber: apiResponse.pageNumber,
        pageSize: apiResponse.pageSize,
        total: apiResponse.total,
        hasPrevious: apiResponse.hasPrevious,
        hasNext: apiResponse.hasNext,
        message: apiResponse.message,
        succeeded: apiResponse.succeeded,
      };
    },
  });
}; 