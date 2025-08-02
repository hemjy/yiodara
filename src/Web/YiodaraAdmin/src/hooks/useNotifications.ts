import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notificationService';
import { ApiResponse, Notification } from '@/types/api';

export const useNotifications = (): UseQueryResult<ApiResponse<Notification[]>> => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });
};
