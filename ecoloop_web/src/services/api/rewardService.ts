import { apiClient } from './client';

export interface RewardData {
  user_id: string;
  points: number;
  level: string;
  total_kg_recycled: number;
  total_collections: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string;
}

export const rewardService = {
  getMyRewards: async (): Promise<RewardData> => {
    const response = await apiClient.get('/rewards/me');
    return response.data;
  },

  getPointsHistory: async (): Promise<RewardTransaction[]> => {
    const response = await apiClient.get('/rewards/history');
    return response.data;
  },
};
