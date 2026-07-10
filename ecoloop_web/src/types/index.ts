export type RoleType = 'ADMIN' | 'PRODUCTEUR' | 'COLLECTEUR' | 'INDUSTRIEL' | 'MAIRIE' | string;

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: RoleType;
  phone: string;
  is_active: boolean;
  is_verified?: boolean;
  created_at?: string;
  avatarUrl?: string;
}

export type WasteStatus = 'PENDING' | 'ACCEPTED' | 'COLLECTED' | 'RECYCLED' | 'CANCELLED';

export interface WasteLot {
  id: string;
  producer_id: string;
  collector_id?: string;
  category: string;
  description?: string;
  weight_kg: number;
  price_per_kg: number;
  photo_url?: string;
  latitude: number;
  longitude: number;
  status: WasteStatus;
  created_at: string;
}

export type MissionStatus = 'AVAILABLE' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export interface CollectionMission {
  id: string;
  waste_lot_id: string;
  collector_id?: string;
  status: MissionStatus;
  actual_weight_kg?: number;
  reserved_at: string;
  validated_at?: string;
}

export type ZoneRiskLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface MonitoringZone {
  id: string;
  name: string;
  riskLevel: ZoneRiskLevel;
  riskScore: number;
  population: number;
  expectedVolumeKg: number;
  reasons: string[];
  recommendation?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  partnerName: string;
}

export interface ImpactMetrics {
  totalRecycledKg: number;
  co2SavedKg: number;
  waterSavedL: number;
  treesEquivalent: number;
  activeUsers: number;
  completedMissions: number;
}
