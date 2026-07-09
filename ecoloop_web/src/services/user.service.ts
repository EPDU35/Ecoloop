import api from './api';
import type { Supplier } from '../models/User';

export interface CurrentUser {
  initials: string;
  name: string;
  company: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await api.get('/users/me');
  const u = res.data;
  return {
    initials: (u.full_name as string).split(' ').map((s: string) => s[0]).join('').substring(0, 2).toUpperCase(),
    name: u.full_name,
    company: u.company || u.role || 'Utilisateur',
  };
}

export async function getSuppliers(): Promise<Supplier[]> {
  const res = await api.get('/suppliers');
  return res.data;
}
