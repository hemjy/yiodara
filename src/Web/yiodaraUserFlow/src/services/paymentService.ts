import api from './api';
import authService from './authService';

export interface CreatePaymentLinkRequest {
  campaignId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  userId: string;
}

export interface PaymentLinkResponse {
  sessionId: string;
  paymentUrl: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}

const paymentService = {
  createPaymentLink: async (request: CreatePaymentLinkRequest): Promise<ApiResponse<PaymentLinkResponse>> => {
    try {
      // Get the authentication token
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Get user info if not provided in the request
      if (!request.userId || !request.customerEmail) {
        const userData = authService.getUserInfo();
        if (userData) {
          request.userId = request.userId || userData.id;
          request.customerEmail = request.customerEmail || userData.email;
        }
      }
      
      // Validate the request
      if (!request.campaignId || !request.amount || !request.currency || 
          !request.customerEmail || !request.userId) {
        throw new Error('Invalid payment request. Missing required fields.');
      }
      
      // Make the API call with the token in the header
      const response = await api.post('/payments/create-payment-link', request, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }
};

export default paymentService; 