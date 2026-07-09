import api from './api';
import type { Order, Contract } from '../models/Transaction';
import type { Lot } from '../models/Waste';

export async function getRecentOrders(): Promise<Order[]> {
  const res = await api.get('/orders');
  return res.data;
}

export async function getLots(): Promise<Lot[]> {
  const res = await api.get('/available-wastes');
  return (res.data || []).map((w: any) => ({
    id: w.id,
    material: w.category,
    distanceKm: 0,
    weightKg: w.weight_kg,
    location: [w.latitude, w.longitude].filter(Boolean).join(', ') || 'Abidjan',
    collector: w.collector_name || 'Non assigné',
    pricePerKg: w.price_per_kg,
  }));
}

export async function getContracts(): Promise<Contract[]> {
  const res = await api.get('/contracts');
  return res.data;
}

export async function createContract(contract: Omit<Contract, 'id' | 'startDate' | 'suppliedThisMonthKg' | 'status'>): Promise<Contract> {
  const res = await api.post('/contracts', contract);
  return res.data;
}
