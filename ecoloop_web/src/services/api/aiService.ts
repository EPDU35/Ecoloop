import { apiClient } from './client';

export const aiService = {
  getZonesRisk: async (zoneName: string) => {
    const response = await apiClient.post('/ai/zones-risk', {
      zone: zoneName,
      population: 50000,
      historical_waste_kg: 2000.0
    });
    return response.data;
  },

  getImpact: async (totalRecycledKg: number, months: number, collections: number) => {
    const response = await apiClient.post('/ai/impact', {
      total_recycled_kg: totalRecycledKg,
      participation_months: months,
      collections_count: collections
    });
    return response.data;
  }
};
