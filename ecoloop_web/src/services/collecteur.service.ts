import api from './api';
import type { CollectorDashboard, WasteLotOut } from '../models/Waste';
import type { TransactionOut } from '../models/Transaction';

export async function getCollectorDashboard(): Promise<CollectorDashboard> {
  const res = await api.get('/dashboard/collector');
  return res.data;
}

export async function getAvailableWastes(): Promise<WasteLotOut[]> {
  const res = await api.get('/available-wastes');
  return res.data || [];
}

export async function reserveWasteLot(wasteLotId: string): Promise<void> {
  await api.post('/reserve', { waste_lot_id: wasteLotId });
}

export async function getTransactionHistory(): Promise<TransactionOut[]> {
  const res = await api.get('/transaction/history');
  return res.data || [];
}
