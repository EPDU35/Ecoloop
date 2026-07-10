import { apiClient } from './client';

export const dashboardService = {
  getMunicipalityOverview: async () => {
    // Dans notre backend actuel, il n'y a pas d'endpoint /dashboard/municipality explicite retournant un object unifié
    // Mais on a /dashboard/system/stats pour l'admin
    const response = await apiClient.get('/dashboard/system/stats');
    return response.data;
  },
};
