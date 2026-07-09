import api from './api';

export interface PricePrediction {
  date: string;
  price: number;
  price_min?: number;
  price_max?: number;
}

export interface ClassificationResult {
  category: string;
  confidence: number;
}

export async function getHealth(): Promise<{ status: string }> {
  const res = await api.get('/ai/health');
  return res.data;
}

export async function getPriceSuggestions(): Promise<Record<string, PricePrediction[]>> {
  const res = await api.get('/dashboard/producer');
  return res.data?.price_predictions || {};
}

export async function predictPrice(material: string, periods = 30): Promise<PricePrediction[]> {
  const res = await api.post('/ai/predict/price', { material, periods });
  return res.data?.predictions || [];
}

export async function getCategories(): Promise<string[]> {
  const res = await api.get('/ai/classify/categories');
  return res.data?.categories || [];
}

export async function getPriceSuggestion(category: string): Promise<{ suggested_price_per_kg: number; category: string }> {
  const res = await api.get(`/price-suggestion?category=${category}`);
  return res.data;
}

export async function classifyImage(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/ai/classify', formData, {
    headers: {
      'Content-Type': 'multipart/form-tdata',
    },
  });
  return res.data;
}

