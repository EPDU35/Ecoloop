import { apiClient } from './client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },
};
