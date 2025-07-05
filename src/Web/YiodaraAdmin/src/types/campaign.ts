// Campaign data types
export interface Campaign {
  id: string;
  title: string;
  description: string;
  campaignCategoryDto: {
    id: string;
    name: string;
  };
  currency: string;
  amount: number;
  isCompleted: boolean;
  isDraft: boolean;
  coverImageBase64: string;
  otherImagesBase64: string[];
}

export interface UpdateCampaignRequest {
  id: string;
  title: string;
  description: string;
  campaignCategoryId: string;
  currency: string;
  amount: number;
  isDraft: boolean;
  coverImageBase64?: string;
  otherImagesBase64?: string[];
  imagesToDelete?: string[];
}

// Campaign response types
export interface CampaignResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Campaign | Campaign[] | string;
  pageNumber?: number;
  pageSize?: number;
  total?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CampaignListResponse extends CampaignResponse {
  data: Campaign[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Campaign request parameters
export interface CampaignParams {
  categoryName?: string;
  pageNumber?: number;
  pageSize?: number;
  id?: string;
  searchText?: string;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

// Create campaign request
export interface CreateCampaignRequest {
  title: string;
  description: string;
  campaignCatergoryId: string; // Note: API has a typo in the field name
  currency: string;
  amount: number;
  coverImageBase64: string;
  otherImagesBase64: string[];
} 