import api from './api';
import type { KpiData } from '../models/Transaction';
import type { DailyVolume, MaterialShare } from '../models/Waste';

export async function getKpis(): Promise<KpiData[]> {
  const res = await api.get('/analytics/kpis');
  return res.data;
}

export async function getWeeklyVolume(): Promise<DailyVolume[]> {
  const res = await api.get('/analytics/volume');
  return res.data;
}

export async function getMaterialShares(): Promise<MaterialShare[]> {
  const res = await api.get('/analytics/materials');
  return res.data;
}

export async function getMairieKpis(): Promise<KpiData[]> {
  const res = await api.get('/analytics/mairie/kpis');
  return res.data;
}

export async function getMairieWeeklyVolume(): Promise<DailyVolume[]> {
  const res = await api.get('/analytics/mairie/volume');
  return res.data;
}

export async function getMairieMaterialShares(): Promise<MaterialShare[]> {
  const res = await api.get('/analytics/mairie/materials');
  return res.data;
}

export interface MairieAlert {
  id: string;
  date: string;
  zone: string;
  description: string;
  weightEstimate: string;
  status: 'reported' | 'in_progress' | 'resolved';
}

export async function getMairieAlerts(): Promise<MairieAlert[]> {
  const res = await api.get('/notifications');
  return res.data;
}

export async function getAdminKpis(): Promise<KpiData[]> {
  const res = await api.get('/admin/stats');
  return res.data;
}

export interface PlatformActivity {
  id: string;
  time: string;
  description: string;
  type: 'user' | 'collection' | 'contract' | 'payment';
}

export async function getAdminActivity(): Promise<PlatformActivity[]> {
  const res = await api.get('/admin/activity');
  return res.data;
}

export interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'Producteur' | 'Collecteur' | 'Industriel' | 'Mairie' | 'Admin';
  status: 'active' | 'pending' | 'suspended';
  isVerified: boolean;
}

const ROLE_LABELS: Record<string, PlatformUser['role']> = {
  PRODUCTEUR: 'Producteur',
  COLLECTEUR: 'Collecteur',
  INDUSTRIEL: 'Industriel',
  MAIRIE: 'Mairie',
  ADMIN: 'Admin',
};

export async function getAdminUsers(): Promise<PlatformUser[]> {
  // Le backend renvoie { total, limit, offset, users: [...] } avec des champs
  // en snake_case et un rôle en MAJUSCULES. On adapte au format de l'UI.
  const res = await api.get('/admin/users');
  const rows = Array.isArray(res.data) ? res.data : res.data?.users ?? [];
  return rows.map((u: any): PlatformUser => ({
    id: String(u.id),
    name: u.full_name ?? u.name ?? '—',
    phone: u.phone ?? '',
    email: u.email ?? '',
    role: ROLE_LABELS[String(u.role || '').toUpperCase()] ?? 'Producteur',
    status: u.is_active ? 'active' : 'pending',
    isVerified: Boolean(u.is_verified),
  }));
}

export async function validatePlatformUser(id: string): Promise<void> {
  await api.patch(`/admin/users/${id}/validate`);
}

export async function suspendPlatformUser(id: string): Promise<void> {
  await api.patch(`/admin/users/${id}/suspend`);
}

export async function rejectPlatformUser(id: string): Promise<void> {
  await api.patch(`/admin/users/${id}/reject`);
}

export interface PlatformTransaction {
  id: string;
  date: string;
  producer: string;
  collector: string;
  material: string;
  weightKg: number;
  amount: number;
  commission: number;
  status: 'completed' | 'pending';
}

export async function getAdminTransactions(): Promise<PlatformTransaction[]> {
  const res = await api.get('/admin/transactions');
  return res.data;
}

export interface PlatformPayment {
  id: string;
  beneficiary: string;
  phone: string;
  provider: 'Orange Money' | 'Wave' | 'MTN';
  amount: number;
  status: 'pending' | 'paid' | 'failed';
}

export async function getAdminPayments(): Promise<PlatformPayment[]> {
  const res = await api.get('/admin/payments');
  return res.data;
}

export async function processPayment(id: string): Promise<void> {
  await api.post(`/admin/payments/${id}/process`);
}
