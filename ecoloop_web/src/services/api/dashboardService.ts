import { apiClient } from './client';

export interface ProducerDashboardData {
  total_revenue_fcfa: number;
  total_kg_recycled: number;
  collections_count: number;
  level: string;
  points: number;
  co2_avoided_kg: number;
  recent_lots: Array<{
    id: string;
    category: string;
    weight_kg: number;
    status: string;
    created_at: string | null;
  }>;
  price_predictions: Record<string, Array<{ date: string; price: number }>>;
}

export interface CollectorDashboardData {
  reputation_score: number;
  completed_collections: number;
  total_collections: number;
  total_earnings_fcfa: number;
  available_lots: Array<{
    id: string;
    category: string;
    description: string | null;
    weight_kg: number;
    price_per_kg: number;
    estimated_value: number;
    latitude: number;
    longitude: number;
    created_at: string | null;
  }>;
  my_collections: Array<{
    id: string;
    waste_lot_id: string;
    status: string;
    actual_weight_kg: number | null;
    reserved_at: string | null;
    validated_at: string | null;
  }>;
}

export interface IndustrialDashboardData {
  available_by_category_kg: Record<string, number>;
  available_lots: Array<{
    id: string;
    category: string;
    description: string | null;
    weight_kg: number;
    price_per_kg: number;
    estimated_total: number;
    latitude: number;
    longitude: number;
    created_at: string | null;
  }>;
  top_producers: Array<{
    name: string;
    total_kg_recycled: number;
  }>;
}

export interface MunicipalityDashboardData {
  total_weight_kg: number;
  by_category_kg: Record<string, number>;
  total_paid_amount_fcfa: number;
  active_users: number;
  validated_collections: number;
  co2_avoided_kg: number;
  weekly_activity: Array<{ date: string; collections: number }>;
  categories_disponibles: string[];
}

export const dashboardService = {
  getProducerDashboard: async (): Promise<ProducerDashboardData> => {
    const response = await apiClient.get('/dashboard/producer');
    return response.data;
  },

  getCollectorDashboard: async (): Promise<CollectorDashboardData> => {
    const response = await apiClient.get('/dashboard/collector');
    return response.data;
  },

  getIndustrialDashboard: async (): Promise<IndustrialDashboardData> => {
    const response = await apiClient.get('/dashboard/industrial');
    return response.data;
  },

  getMunicipalityDashboard: async (): Promise<MunicipalityDashboardData> => {
    const response = await apiClient.get('/dashboard/municipality');
    return response.data;
  },

  checkHealth: async (): Promise<{ status: string }> => {
    const baseURL = import.meta.env.VITE_API_URL || 'https://ecoloop-backend-s1vd.onrender.com/api/v1';
    const rootURL = baseURL.replace(/\/api\/v1$/, '');
    
    // Plain fetch without credentials/auth headers to avoid unnecessary preflights during cold start
    try {
      const res = await fetch(`${rootURL}/health`, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Server status: ${res.status}`);
    } catch (e) {
      // Fallback try with /api/v1 prefix
      try {
        const res2 = await fetch(`${baseURL}/health`, { method: 'GET', cache: 'no-store' });
        if (res2.ok) {
          return await res2.json();
        }
      } catch (_) {}
      throw e;
    }
  },
};
