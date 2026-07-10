import { apiClient } from './client';
import type { WasteLot } from '@/types';

export const wasteService = {
  // Producteur
  createLot: async (lotData: any): Promise<WasteLot> => {
    const response = await apiClient.post('/wastes', lotData);
    return response.data;
  },
  
  uploadPhoto: async (lotId: string, file: File): Promise<WasteLot> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/wastes/${lotId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getMyWastes: async (): Promise<WasteLot[]> => {
    const response = await apiClient.get('/my-wastes');
    return response.data;
  },

  getHistory: async (): Promise<WasteLot[]> => {
    const response = await apiClient.get('/history');
    return response.data;
  },

  // Collecteur / Industriel
  getAvailableWastes: async (category?: string): Promise<WasteLot[]> => {
    const url = category ? `/available-wastes?category=${category}` : '/available-wastes';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Collecteur
  reserveCollection: async (wasteLotId: string): Promise<any> => {
    const response = await apiClient.post('/reserve', { waste_lot_id: wasteLotId });
    return response.data;
  },

  validateCollection: async (collectionId: string, validationCode: string, actualWeightKg: number): Promise<any> => {
    const response = await apiClient.post(`/validate-collection/${collectionId}`, {
      validation_code: validationCode,
      actual_weight_kg: actualWeightKg,
    });
    return response.data;
  },
};
