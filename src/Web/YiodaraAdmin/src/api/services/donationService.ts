import { api } from '../client';
import { 
  DonationParams,
  DonorsResponse,
  DonorHistoryParams,
  DonorHistoryResponse
} from '../../types/api';

const DONATIONS_ENDPOINT = '/api/Admin/get-all-donations-by-users';
const DONATION_COUNT_ENDPOINT = '/api/Admin/get-total-donation-count';

export const donationService = {
  /**
   * Get all donations with optional filtering and pagination
   * @param params Optional parameters for filtering and pagination
   */
  getAllDonations: (params?: DonationParams): Promise<{ data: DonorsResponse }> => {
    console.log("Calling API endpoint:", DONATIONS_ENDPOINT, "with params:", params);
    return api.get<DonorsResponse>(DONATIONS_ENDPOINT, { params });
  },
  
  /**
   * Get total donation count
   */
  getTotalDonationCount: (): Promise<{ data: any }> => {
    return api.get(DONATION_COUNT_ENDPOINT);
  },
  
  /**
   * Get donation history for a specific user
  //  * @param id User ID
   */
  // getUserDonationHistory: (id: string) => {
  //   return api.get(`${USER_DONATION_HISTORY_ENDPOINT}/${id}`);
  // },

  /**
   * Get donation history for a specific donor
   */
  getDonorHistory: (params: DonorHistoryParams): Promise<{ data: DonorHistoryResponse }> => {
    return api.get('/api/Admin/get-user-donation-history', {
      params: {
        userId: params.userId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        id: params.id,
        searchText: params.searchText,
        orderBy: params.orderBy,
        descending: params.descending,
        startDate: params.startDate,
        endDate: params.endDate
      }
    });
  },
};