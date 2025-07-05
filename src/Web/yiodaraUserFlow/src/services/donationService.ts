import api from "./api";
import { format } from 'date-fns';

// Types based on the API response
export interface Donation {
  campaignName: string;
  campaignCategoryName: string;
  amount: number;
  donationDate: string;
}

export interface DonationHistoryData {
  username: string;
  email: string;
  totalDonations: number;
  currency: string | null;
  donations: Donation[];
}

export interface DonationHistoryResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: DonationHistoryData;
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetDonationHistoryParams {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

const donationService = {
  /**
   * Fetches the donation history for a specific user.
   */
  getDonationHistory: async ({
    userId,
    pageNumber = 1,
    pageSize = 6,
    startDate,
    endDate,
  }: GetDonationHistoryParams): Promise<DonationHistoryResponse> => {
    
    const params = new URLSearchParams({
      UserId: userId,
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (startDate) {
      params.append('StartDate', format(startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
    if (endDate) {
      params.append('EndDate', format(endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }

    const response = await api.get(`/Admin/get-user-donation-history`, { params });
    
    return response.data;
  },
};

export default donationService; 