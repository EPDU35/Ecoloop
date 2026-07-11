import { apiClient } from './client';

export interface ZoneRiskAdapter {
  prediction_id?: string;
  zone: string;
  risk_score: number;
  confidence: number;
  trend: string;
  expected_volume_increase_percent?: number;
  reasons: string[];
  recommendation: { action: string; priority: string; estimated_impact: string | null };
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  all_scores?: Record<string, number>;
  total_items?: number;
  type_dominant?: string;
  resume_quantite?: Record<string, number>;
  items_trouves?: Array<{ type: string; classe_brute: string; confidence: number; box_xywh: number[] }>;
  etat?: string;
  score_qualite?: number;
  poids_estime_kg?: number;
  collectable?: boolean;
  raison_collectabilite?: string;
  recommandations?: string[];
  tips?: string[];
  fallback_used?: boolean;
}

export const aiService = {
  getZonesRisk: async (zoneName: string): Promise<ZoneRiskAdapter | null> => {
    const response = await apiClient.post('/ai/zones-risk', {
      zone: zoneName,
      population: 50000,
      historical_waste_kg: 2000.0,
    });
    const body = response.data;
    return body?.data ?? body ?? null;
  },

  getImpact: async (totalRecycledKg: number, months: number, collections: number) => {
    const response = await apiClient.post('/ai/impact', {
      total_recycled_kg: totalRecycledKg,
      participation_months: months,
      collections_count: collections,
    });
    const body = response.data;
    return body?.data ?? body;
  },

  classifyImage: async (file: File): Promise<ClassificationResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/ai/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  getCategories: async (): Promise<{ categories: any[]; total: number }> => {
    const response = await apiClient.get('/ai/classify/categories');
    return response.data;
  },

  predictPrice: async (material: string, periods = 30): Promise<{ material: string; predictions: any[] }> => {
    const response = await apiClient.post('/ai/predict/price', { material, periods });
    return response.data;
  },

  predictVolume: async (zoneId: number, date: string): Promise<any> => {
    const response = await apiClient.post('/ai/predict/volume', { zone_id: zoneId, date });
    return response.data;
  },

  checkFraud: async (poids: number, prix: number, heure = 12, jourSemaine = 0): Promise<any> => {
    const response = await apiClient.post('/ai/fraud/check', { poids, prix, heure, jour_semaine: jourSemaine });
    return response.data;
  },

  getHealth: async (): Promise<{ status: string; models_loaded: Record<string, boolean> }> => {
    const response = await apiClient.get('/ai/health');
    return response.data;
  },
};