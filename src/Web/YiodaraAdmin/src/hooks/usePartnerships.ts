import { useQuery } from '@tanstack/react-query';
import { partnershipService } from '../api/services/partnershipService';
import { PartnershipParams, PartnershipsResponse } from '../types/api';

export interface PartnershipsResult {
  partnerships: {
    id: string;
    companyName: string;
    campaignName: string;
    email: string;
    industry: string;
    supportType: string;
    campaignCategory: string;
    date: string;
  }[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  succeeded: boolean;
}

export const usePartnerships = (params?: PartnershipParams) => {
  return useQuery<PartnershipsResponse, Error, PartnershipsResult>({
    queryKey: ['partnerships', params],
    queryFn: async () => {
      const response = await partnershipService.getAllPartnerships(params);
      return response.data;
    },
    select: (apiResponse) => {
      const partnerships = Array.isArray(apiResponse.data) 
        ? apiResponse.data.map(partnership => ({
            id: partnership.id,
            companyName: partnership.companyName,
            campaignName: partnership.campaignName,
            email: partnership.email,
            industry: partnership.industry,
            supportType: partnership.supportType,
            campaignCategory: partnership.campaignCategory,
            date: new Date(partnership.dateCreated).toLocaleDateString(),
          }))
        : [];
      
      return {
        partnerships,
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