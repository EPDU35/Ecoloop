export interface MaterialShare {
  name: string;
  percent: number;
  color: string;
}

export interface DailyVolume {
  day: string;
  percent: number;
}

export interface Lot {
  id: string;
  material: string;
  distanceKm: number;
  weightKg: number;
  location: string;
  collector: string;
  pricePerKg: number;
}

export interface WasteLotOut {
  id: string;
  producer_id: string;
  collector_id: string | null;
  category: string;
  description: string;
  weight_kg: number;
  price_per_kg: number;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

export interface ProducerDashboard {
  total_revenue_fcfa: number;
  total_kg_recycled: number;
  collections_count: number;
  level: string;
  points: number;
  co2_avoided_kg: number;
  recent_lots: ProducerLot[];
  price_predictions: Record<string, number[]>;
}

export interface ProducerLot {
  id: string;
  category: string;
  weight_kg: number;
  status: string;
  created_at: string | null;
}

export interface CollectorDashboard {
  reputation_score: number;
  completed_collections: number;
  total_collections: number;
  total_earnings_fcfa: number;
  available_lots: AvailableLot[];
  my_collections: CollectorCollection[];
}

export interface AvailableLot {
  id: string;
  category: string;
  description: string;
  weight_kg: number;
  price_per_kg: number;
  estimated_value: number;
  latitude: number;
  longitude: number;
  created_at: string | null;
}

export interface CollectorCollection {
  id: string;
  waste_lot_id: string;
  status: string;
  actual_weight_kg: number | null;
  reserved_at: string | null;
  validated_at: string | null;
}
