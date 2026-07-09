import api from './api';
import type { ProducerDashboard, WasteLotOut } from '../models/Waste';
import type { TransactionOut } from '../models/Transaction';

export async function getProducerDashboard(): Promise<ProducerDashboard> {
  const res = await api.get('/dashboard/producer');
  return res.data;
}

export async function getMyWastes(): Promise<WasteLotOut[]> {
  const res = await api.get('/my-wastes');
  return res.data || [];
}

export async function createWasteLot(data: {
  category: string;
  description: string;
  weight_kg: number;
  price_per_kg: number;
  latitude: number;
  longitude: number;
}): Promise<WasteLotOut> {
  const res = await api.post('/wastes', data);
  return res.data;
}

export async function getTransactionHistory(): Promise<TransactionOut[]> {
  const res = await api.get('/transaction/history');
  return res.data || [];
}
