import { useQuery } from '@tanstack/react-query';
import { donationService } from '../api/services/donationService';

// Parameters for the donor history API
export interface DonorHistoryParams {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  id?: string;
  searchText?: string;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

// Individual donation in the history
export interface DonationItem {
  campaignName: string;
  campaignCategoryName: string;
  amount: number;
  donationDate: string;
}

// Donor profile with donations
export interface DonorProfile {
  username: string;
  email: string;
  totalDonations: number;
  currency: string | null;
  donations: DonationItem[];
}

// Complete response from the API
export interface DonorHistoryResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: DonorProfile;
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const useDonorHistory = (params: DonorHistoryParams) => {
  return useQuery<DonorHistoryResponse, Error>({
    queryKey: ['donorHistory', params],
    queryFn: async () => {
      const response = await donationService.getDonorHistory(params);
      return response.data;
    },
    enabled: !!params.userId, // Only run the query if userId is provided
  });
}; 