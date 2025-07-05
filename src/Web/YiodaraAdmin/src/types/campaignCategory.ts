export interface CampaignCategory {
  id: string;
  name: string;
}

export interface CampaignCategoryResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: CampaignCategory | CampaignCategory[] | string;
  pageNumber?: number;
  pageSize?: number;
  total?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CampaignCategoryListResponse extends CampaignCategoryResponse {
  data: CampaignCategory[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CampaignCategoryParams {
  pageNumber?: number;
  pageSize?: number;
  id?: string;
  searchText?: string;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateCampaignCategoryRequest {
  name: string;
}

export interface UpdateCampaignCategoryRequest {
  id: string;
  name: string;
}

export interface DeleteCampaignCategoryRequest {
  id: string;
} 