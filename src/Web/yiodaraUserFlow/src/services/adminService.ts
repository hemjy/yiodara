import api from "./api";

export interface StarContributorData {
  id: string;
  name: string;
  totalDonation: number;
  lastDonationAmount: number;
  lastDonationDate: string;
  firstDonationDate: string;
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

const adminService = {
  getStarContributors: async (): Promise<ApiResponse<StarContributorData[]>> => {
    const response = await api.get("/Admin/get-all-donations-by-users");
    return response.data;
  },
};

export default adminService; 