import { api as apiClient } from './client';
import {
  Campaign,
  CampaignListResponse,
  CampaignParams,
  CampaignResponse,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@/types/campaign';

const BASE_URL = '/api/Campaign';

export const campaignService = {
  // Get all campaigns with optional filtering and pagination
  getAll: async (params: CampaignParams = {}): Promise<CampaignListResponse> => {
    // Create a new params object with non-empty values only
    const queryParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value;
      }
    });
    
    const response = await apiClient.get<CampaignListResponse>(
      `${BASE_URL}/get-all`, 
      { params: queryParams }
    );
    return response.data;
  },
  
  getAllDrafts: async (params: CampaignParams = {}): Promise<CampaignListResponse> => {
    const response = await apiClient.get<CampaignListResponse>(
      `${BASE_URL}/get-all-draft-campaigns`,
      { params }
    );
    return response.data;
  },
  
  // Alias for getAll to match the function name used in Campaigns.tsx
  getAllCampaigns: async (searchText?: string): Promise<CampaignListResponse> => {
    return campaignService.getAll({ searchText });
  },

  // Get a single campaign by ID
  getById: async (id: string): Promise<CampaignResponse> => {
    const response = await apiClient.get<CampaignResponse>(`${BASE_URL}/get-campaign/${id}`);
    return response.data;
  },

  // Create a new campaign
  create: async (data: CreateCampaignRequest): Promise<CampaignResponse> => {
    try {
      const response = await apiClient.post<CampaignResponse>(`${BASE_URL}/create-campaign`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw error; // Let the component handle validation errors
      }
      throw new Error('Failed to create campaign');
    }
  },

  // Delete a campaign
  deleteCampaign: async (id: string) => {
    const response = await apiClient.delete('/api/Campaign/delete-campaign', {
      data: { id }
    });
    return response.data;
  },

  // Update a campaign
  update: async (data: UpdateCampaignRequest) => {
    const response = await apiClient.put(`${BASE_URL}/update-campaign`, data);
    return response.data;
  },
};