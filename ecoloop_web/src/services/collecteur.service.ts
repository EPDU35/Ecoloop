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

export async function validateCollection(
  transactionId: string,
  data: { actual_weight_kg: number; photos: File[]; latitude?: number; longitude?: number }
): Promise<TransactionOut> {
  const formData = new FormData();
  formData.append('actual_weight_kg', String(data.actual_weight_kg));
  if (data.latitude != null) formData.append('latitude', String(data.latitude));
  if (data.longitude != null) formData.append('longitude', String(data.longitude));
  data.photos.forEach(photo => formData.append('photos', photo));

  const res = await api.post(`/transaction/${transactionId}/validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
