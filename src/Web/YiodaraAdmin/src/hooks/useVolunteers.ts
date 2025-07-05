import { useQuery } from '@tanstack/react-query';
import { volunteerService } from '../api/services/volunteerService';
import { VolunteerParams, VolunteersResponse, Volunteer } from '../types/api';

export const useVolunteers = (params?: VolunteerParams) => {
  return useQuery<VolunteersResponse, Error, { volunteers: Volunteer[], pagination: any, message: string, succeeded: boolean }>({
    queryKey: ['volunteers', params],
    queryFn: async () => {
      const response = await volunteerService.getAllVolunteers(params);
      return response.data;
    },
    select: (apiResponse) => {
      const volunteers = Array.isArray(apiResponse.data) 
        ? apiResponse.data.map(volunteer => ({
            id: volunteer.userId,
            name: volunteer.fullName,
            email: volunteer.email,
            phoneNumber: volunteer.phoneNumber,
            userName: volunteer.userName
          }))
        : [];
      
      return {
        volunteers,
        pagination: {
          pageNumber: apiResponse.pageNumber,
          pageSize: apiResponse.pageSize,
          total: apiResponse.total,
          hasPrevious: apiResponse.hasPrevious,
          hasNext: apiResponse.hasNext,
        },
        message: apiResponse.message,
        succeeded: apiResponse.succeeded,
      };
    },
  });
}; 