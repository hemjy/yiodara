import { useQuery } from '@tanstack/react-query';
import { volunteerService } from '../api/services/volunteerService';


export const useVolunteerCount = () => {
  return useQuery({
    queryKey: ['volunteerCount'],
    queryFn: async () => {
      const response = await volunteerService.getTotalVolunteerCount();
      return response.data;
    },
    select: (data) => ({
      totalVolunteers: data.data?.totalVolunteers || 0
    }),
  });
}; 