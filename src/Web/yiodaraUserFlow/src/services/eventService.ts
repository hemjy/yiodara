import api from './api';
import { ApiResponse } from './campaignService';

export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    eventDate: string;
    eventTime: string;
    coverImageUrl: string;
    otherImageUrls: string[];
}

export interface GetEventsParams {
  pageNumber?: number;
  pageSize?: number;
  SearchText?: string;
  StartDate?: string;
  EndDate?: string;
}

export interface VolunteerRegistration {
  email: string;
  eventId: string;
}

const eventService = {
  getAllEvents: async (params: GetEventsParams = {}): Promise<ApiResponse<Event[]>> => {
    const response = await api.get('/Event', { params });
    return response.data;
  },

  registerForEvent: async (data: VolunteerRegistration): Promise<ApiResponse<null>> => {
    // This is a placeholder for the actual API call.
    // The endpoint and request body may need to be adjusted.
    console.log("Registering for event with data:", data);
    // const response = await api.post('/Event/register', data);
    // return response.data;
    
    // Mock successful response
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
      succeeded: true,
      message: "Successfully registered for event (mocked).",
      errors: [],
      data: null,
      pageNumber: 0,
      pageSize: 0,
      total: 0,
      hasPrevious: false,
      hasNext: false,
    };
  },
};

export default eventService; 