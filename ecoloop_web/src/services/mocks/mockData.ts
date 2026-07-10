import type { User, WasteLot, CollectionMission, MonitoringZone, RewardItem, ImpactMetrics } from '../../types';

export const MOCK_USERS: Record<string, User> = {
  mairie: {
    id: '1',
    email: 'mairie@abobo.ci',
    full_name: 'Mairie d\'Abobo',
    role: 'mairie',
    phone: '+22500000000',
    is_active: true
  },
  producteur: {
    id: '2',
    email: 'producteur@restaurant.ci',
    full_name: 'Restaurant La Terrasse',
    role: 'producteur',
    phone: '+22511111111',
    is_active: true
  },
  collecteur: {
    id: '3',
    email: 'collecteur@express.ci',
    full_name: 'Koffi Express',
    role: 'collecteur',
    phone: '+22522222222',
    is_active: true
  },
  industriel: {
    id: '4',
    email: 'industriel@plastique.ci',
    full_name: 'Recyclage CI',
    role: 'industriel',
    phone: '+22533333333',
    is_active: true
  }
};

export const MOCK_WASTE_LOTS: WasteLot[] = [
  {
    id: 'lot-1',
    producer_id: '2',
    category: 'PLASTIQUE',
    weight_kg: 150,
    status: 'PENDING',
    price_per_kg: 100,
    latitude: 5.416,
    longitude: -4.015,
    description: 'Bouteilles PET triées',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'lot-2',
    producer_id: '2',
    category: 'CARTON',
    weight_kg: 300,
    status: 'COLLECTED',
    price_per_kg: 50,
    latitude: 5.420,
    longitude: -4.010,
    description: 'Cartons d\'emballage',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'lot-3',
    producer_id: '2',
    category: 'VERRE',
    weight_kg: 50,
    status: 'RECYCLED',
    price_per_kg: 25,
    latitude: 5.418,
    longitude: -4.012,
    description: 'Bouteilles en verre',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

export const MOCK_MISSIONS: CollectionMission[] = [
  {
    id: 'miss-1',
    waste_lot_id: 'lot-1',
    status: 'AVAILABLE',
    reserved_at: new Date().toISOString()
  },
  {
    id: 'miss-2',
    waste_lot_id: 'lot-4',
    status: 'AVAILABLE',
    reserved_at: new Date().toISOString()
  }
];

export const MOCK_ZONES: MonitoringZone[] = [
  {
    id: 'z-abobo',
    name: 'Abobo Centre',
    riskLevel: 'CRITICAL',
    riskScore: 85,
    population: 150000,
    expectedVolumeKg: 5000,
    reasons: ['Accumulation récente signalée', 'Historique de débordement', 'Densité de population élevée'],
    recommendation: 'Déployer 3 camions supplémentaires sous 24h. Contacter les collecteurs indépendants de la zone.'
  },
  {
    id: 'z-yopougon',
    name: 'Yopougon Sicogi',
    riskLevel: 'WARNING',
    riskScore: 60,
    population: 200000,
    expectedVolumeKg: 8000,
    reasons: ['Hausse légère des signalements'],
    recommendation: 'Surveillance préventive.'
  }
];

export const MOCK_IMPACT: ImpactMetrics = {
  totalRecycledKg: 125000,
  co2SavedKg: 45000,
  waterSavedL: 2500000,
  treesEquivalent: 1200,
  activeUsers: 850,
  completedMissions: 3400
};

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Bon d\'achat Supermarché',
    description: 'Bon d\'achat d\'une valeur de 5000 FCFA valable dans tous les magasins partenaires.',
    pointsCost: 5000,
    partnerName: 'Prosuma'
  },
  {
    id: 'rew-2',
    title: 'Recharge Crédit Téléphonique',
    description: 'Recharge de 2000 FCFA sur votre numéro mobile.',
    pointsCost: 2000,
    partnerName: 'Orange CI'
  },
  {
    id: 'rew-3',
    title: 'Don à une ONG Environnementale',
    description: 'EcoLoop reverse l\'équivalent en espèces à une association de reboisement.',
    pointsCost: 10000,
    partnerName: 'Green CI'
  }
];
