import { api } from '../client';
import { ApiResponse, Notification } from '../../types/api';

const NOTIFICATIONS_ENDPOINT = '/Api/Notification';

export const notificationService = {
  /**
   * Get all notifications
   */
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>(NOTIFICATIONS_ENDPOINT);
    return response.data;
  },
};
