import { ApiResponse } from '../types/api';

export function normalizeApiResponse<T>(response: any): ApiResponse<T> {
  // Handle different response structures
  if (response.data?.data) {
    // Handle nested data structure
    return {
      succeeded: response.data.succeeded ?? true,
      message: response.data.message ?? '',
      errors: response.data.errors ?? [],
      data: response.data.data
    };
  } else if (response.data) {
    // Handle direct data structure
    return {
      succeeded: true,
      message: '',
      errors: [],
      data: response.data
    };
  }
  
  // Handle unexpected response
  return {
    succeeded: false,
    message: 'Invalid response format',
    errors: ['Unexpected response structure'],
    data: null
  };
} 