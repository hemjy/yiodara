import { api } from '../client';
import { DonorCountParams, DonorCountResponse, CountryDonorData, DonorsByCountryParams, ApiResponse } from '../../types/api';

const DONOR_COUNT_ENDPOINT = '/api/Admin/get-total-donors-count';
const DONORS_BY_COUNTRY_ENDPOINT = '/api/Admin/get-donors-by-country';

export const donorService = {
  /**
   * Get total donor count and donation statistics
   * @param params Optional parameters including campaignId
   */
  getTotalDonorCount: (params?: DonorCountParams): Promise<{ data: DonorCountResponse }> => {
    return api.get<DonorCountResponse>(DONOR_COUNT_ENDPOINT, { params });
  },

  getTotalDonorsByCountry: (params?: DonorsByCountryParams): Promise<{ data: ApiResponse<CountryDonorData[]> }> => {
    return api.get<ApiResponse<CountryDonorData[]>>(DONORS_BY_COUNTRY_ENDPOINT, { params });
  },
}; 