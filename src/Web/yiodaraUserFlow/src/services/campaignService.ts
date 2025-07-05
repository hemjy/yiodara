import api from './api';

export interface CampaignCategory {
  id: string;
  name: string;
}

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
  amountRaised: number;
  amountLeft: number;
  isCompleted: boolean;
  coverImageBase64: string;
  otherImagesBase64: string[];
}

export interface FundRaisingStats {
  totalFundsRaised: string;
  monthlyDonors: number;
  successfulCampaigns: number;
  peopleBenefited: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const campaignService = {
  getAllCategories: async (): Promise<ApiResponse<CampaignCategory[]>> => {
    const response = await api.get('/CampaignCategory/get-all');
    return response.data;
  },
  
  getAllCampaigns: async (): Promise<ApiResponse<Campaign[]>> => {
    const response = await api.get('/Campaign/get-all');
    return response.data;
  },

  getCampaignById: async (id: string): Promise<ApiResponse<Campaign>> => {
    const response = await api.get(`/Campaign/get-campaign/${id}`);
    return response.data;
  },

  getFundRaisingStats: async (): Promise<ApiResponse<FundRaisingStats>> => {
    const response = await api.get('/Admin/get-fund-raising-statistics');
    return response.data;
  }
};

export default campaignService; 