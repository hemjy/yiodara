import { api as apiClient } from './client';
import {
  CampaignCategory,
  CampaignCategoryListResponse,
  CampaignCategoryParams,
  CampaignCategoryResponse,
  CreateCampaignCategoryRequest,
  DeleteCampaignCategoryRequest,
  UpdateCampaignCategoryRequest,
} from '@/types/campaignCategory';

const BASE_URL = '/api/CampaignCategory';

export const campaignCategoryService = {
  // Get all campaign categories with optional filtering and pagination
  getAll: async (params: CampaignCategoryParams = {}): Promise<CampaignCategoryListResponse> => {
    const response = await apiClient.get<CampaignCategoryListResponse>(`${BASE_URL}/get-all`, { params });
    return response.data;
  },

  // Get a single campaign category by ID
  getById: async (id: string): Promise<CampaignCategoryResponse> => {
    const response = await apiClient.get<CampaignCategoryResponse>(`${BASE_URL}/get-campaign-category/${id}`);
    return response.data;
  },

  // Create a new campaign category
  create: async (data: CreateCampaignCategoryRequest): Promise<CampaignCategoryResponse> => {
    const response = await apiClient.post<CampaignCategoryResponse>(`${BASE_URL}/create-campaign-category`, data);
    return response.data;
  },

  // Update an existing campaign category
  update: async (data: UpdateCampaignCategoryRequest): Promise<CampaignCategoryResponse> => {
    const response = await apiClient.put<CampaignCategoryResponse>(`${BASE_URL}/update-campaign-category`, data);
    return response.data;
  },

  // Delete a campaign category
  delete: async (data: DeleteCampaignCategoryRequest): Promise<CampaignCategoryResponse> => {
    const response = await apiClient.delete<CampaignCategoryResponse>(`${BASE_URL}/delete-campaign-category`, { 
      data 
    });
    return response.data;
  },
}; 