import { api } from '../client';
import { 
  PartnershipParams, 
  PartnershipsResponse, 
  PartnershipDetailResponse 
} from '../../types/api';

const PARTNERSHIPS_ENDPOINT = '/api/partner/get-partners';
const PARTNERSHIP_DETAIL_ENDPOINT = '/api/partner/get-partner';

export const partnershipService = {
  /**
   * Get all partnerships with optional filtering and pagination
   */
  getAllPartnerships: (params?: PartnershipParams): Promise<{ data: PartnershipsResponse }> => {
    return api.get<PartnershipsResponse>(PARTNERSHIPS_ENDPOINT, { params });
  },
  
  /**
   * Get details for a specific partnership
   */
  getPartnershipDetail: (id: string): Promise<{ data: PartnershipDetailResponse }> => {
    return api.get(`${PARTNERSHIP_DETAIL_ENDPOINT}/${id}`);
  },
  
  /**
   * Confirm a partnership
   */
  confirmPartnership: (id: string): Promise<{ data: any }> => {
    return api.put(`/api/partner/${id}/confirm`);
  }
}; 