import type { KpiData } from "../models/Transaction";
import type { DailyVolume, MaterialShare } from "../models/Waste";

// ------------------------------------------------------------------
// Fonctions d'analytics pour le dashboard industriel.
// Données statiques pour l'instant (identiques à la maquette) pour que
// l'UI soit testable seule. Remplace le corps de chaque fonction par un
// vrai fetch() vers le backend FastAPI quand les routes seront prêtes —
// les composants qui consomment ce service n'auront rien à changer.
// ------------------------------------------------------------------

export async function getKpis(): Promise<KpiData[]> {
  return [
    { id: "volume", label: "Volume acheté ce mois", value: "48.2 t", deltaLabel: "+12% vs mois dernier", deltaDirection: "up" },
    { id: "lots", label: "Lots disponibles", value: "312", deltaLabel: "+28 aujourd'hui", deltaDirection: "up" },
    { id: "suppliers", label: "Fournisseurs actifs", value: "64", deltaLabel: "+3 cette semaine", deltaDirection: "up" },
    { id: "spend", label: "Dépense du mois", value: "2.9 M FCFA", deltaLabel: "-4% vs mois dernier", deltaDirection: "down" },
  ];
}

export async function getWeeklyVolume(): Promise<DailyVolume[]> {
  return [
    { day: "Lun", percent: 43 },
    { day: "Mar", percent: 65 },
    { day: "Mer", percent: 54 },
    { day: "Jeu", percent: 89 },
    { day: "Ven", percent: 78 },
    { day: "Sam", percent: 100 },
    { day: "Dim", percent: 27 },
  ];
}

export async function getMaterialShares(): Promise<MaterialShare[]> {
  return [
    { name: "PET", percent: 42, color: "#3fa34d" },
    { name: "Carton", percent: 27, color: "#d9a441" },
    { name: "HDPE", percent: 18, color: "#6b8f79" },
    { name: "Verre", percent: 13, color: "#b4522f" },
  ];
}

export async function getMairieKpis(): Promise<KpiData[]> {
  return [
    { id: "tons", label: "Tonnes collectées", value: "124.8 t", deltaLabel: "+14% vs mois dernier", deltaDirection: "up" },
    { id: "districts", label: "Quartiers nettoyés", value: "18", deltaLabel: "+3 ce mois-ci", deltaDirection: "up" },
    { id: "active_users", label: "Utilisateurs actifs", value: "2 450", deltaLabel: "+120 cette semaine", deltaDirection: "up" },
    { id: "co2", label: "CO2 évité", value: "46.2 t", deltaLabel: "+8% vs mois dernier", deltaDirection: "up" },
  ];
}

export async function getMairieWeeklyVolume(): Promise<DailyVolume[]> {
  return [
    { day: "Yopougon", percent: 100 },
    { day: "Koumassi", percent: 82 },
    { day: "Marcory", percent: 64 },
    { day: "Cocody", percent: 75 },
    { day: "Bassam", percent: 43 },
  ];
}

export async function getMairieMaterialShares(): Promise<MaterialShare[]> {
  return [
    { name: "PET (Plastique)", percent: 48, color: "#3fa34d" },
    { name: "Carton / Papier", percent: 30, color: "#d9a441" },
    { name: "HDPE", percent: 12, color: "#6b8f79" },
    { name: "Verre", percent: 10, color: "#b4522f" },
  ];
}

export interface MairieAlert {
  id: string;
  date: string;
  zone: string;
  description: string;
  weightEstimate: string;
  status: "reported" | "in_progress" | "resolved";
}

export async function getMairieAlerts(): Promise<MairieAlert[]> {
  return [
    {
      id: "ALT-881",
      date: "09/07/2026",
      zone: "Yopougon, Selmer",
      description: "Accumulation de bouteilles en plastique et sachets près du grand canal.",
      weightEstimate: "180 kg",
      status: "reported",
    },
    {
      id: "ALT-880",
      date: "08/07/2026",
      zone: "Koumassi, Soweto",
      description: "Dépôt sauvage de cartons d'emballage derrière l'école primaire publique.",
      weightEstimate: "320 kg",
      status: "in_progress",
    },
    {
      id: "ALT-879",
      date: "06/07/2026",
      zone: "Marcory, Sans-Fil",
      description: "Déchets métalliques et plastiques divers abandonnés sur le trottoir.",
      weightEstimate: "95 kg",
      status: "resolved",
    },
  ];
}

export async function getAdminKpis(): Promise<KpiData[]> {
  return [
    { id: "users", label: "Utilisateurs inscrits", value: "3 450", deltaLabel: "+180 ce mois-ci", deltaDirection: "up" },
    { id: "volume", label: "Volume total transité", value: "198.5 t", deltaLabel: "+24 t cette semaine", deltaDirection: "up" },
    { id: "commissions", label: "Revenus (Commissions)", value: "2.1 M FCFA", deltaLabel: "+12% vs mois dernier", deltaDirection: "up" },
    { id: "pending_payouts", label: "Paiements en attente", value: "12", deltaLabel: "-5 depuis hier", deltaDirection: "down" },
  ];
}

export interface PlatformActivity {
  id: string;
  time: string;
  description: string;
  type: "user" | "collection" | "contract" | "payment";
}

export async function getAdminActivity(): Promise<PlatformActivity[]> {
  return [
    { id: "1", time: "Il y a 10 min", description: "Nouveau lot de 150 kg de PET publié par Ménage Koffi.", type: "collection" },
    { id: "2", time: "Il y a 45 min", description: "Virement Mobile Money de 15 000 FCFA effectué à Collecte Koumassi.", type: "payment" },
    { id: "3", time: "Il y a 2 heures", description: "Nouveau collecteur certifié : EcoTri Yopougon.", type: "user" },
    { id: "4", time: "Il y a 5 heures", description: "Contrat de 5 tonnes signé entre SIVOP et Collecte Koumassi.", type: "contract" },
  ];
}

export interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  role: "Producteur" | "Collecteur" | "Recycleur" | "Mairie";
  status: "active" | "pending" | "suspended";
}

let mockPlatformUsers: PlatformUser[] = [
  { id: "USR-001", name: "Ménage Koffi", phone: "+225 07 01 02 03", role: "Producteur", status: "active" },
  { id: "USR-002", name: "Collecte Koumassi", phone: "+225 05 11 12 13", role: "Collecteur", status: "active" },
  { id: "USR-003", name: "Industriel - SIVOP", phone: "+225 01 21 22 23", role: "Recycleur", status: "active" },
  { id: "USR-004", name: "Mairie d'Abidjan", phone: "+225 07 41 42 43", role: "Mairie", status: "active" },
  { id: "USR-005", name: "Resto Cocody", phone: "+225 05 51 52 53", role: "Producteur", status: "pending" },
  { id: "USR-006", name: "EcoTri Yopougon", phone: "+225 01 61 62 63", role: "Collecteur", status: "pending" },
];

export async function getAdminUsers(): Promise<PlatformUser[]> {
  return mockPlatformUsers;
}

export async function validatePlatformUser(id: string): Promise<void> {
  mockPlatformUsers = mockPlatformUsers.map(u => u.id === id ? { ...u, status: "active" } : u);
}

export async function suspendPlatformUser(id: string): Promise<void> {
  mockPlatformUsers = mockPlatformUsers.map(u => u.id === id ? { ...u, status: "suspended" } : u);
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
  status: "completed" | "pending";
}

export async function getAdminTransactions(): Promise<PlatformTransaction[]> {
  return [
    { id: "TXN-9901", date: "09/07/2026", producer: "Ménage Koffi", collector: "Collecte Koumassi", material: "PET", weightKg: 100, amount: 15000, commission: 1000, status: "completed" },
    { id: "TXN-9902", date: "08/07/2026", producer: "Resto Cocody", collector: "EcoTri Yopougon", material: "Carton", weightKg: 200, amount: 16000, commission: 1200, status: "completed" },
    { id: "TXN-9903", date: "07/07/2026", producer: "Ménage Koffi", collector: "Collecte Koumassi", material: "PET", weightKg: 80, amount: 12000, commission: 800, status: "completed" },
    { id: "TXN-9904", date: "06/07/2026", producer: "Bassam Recyclage", collector: "Bassam Recyclage", material: "Verre", weightKg: 300, amount: 18000, commission: 1500, status: "pending" },
  ];
}

export interface PlatformPayment {
  id: string;
  beneficiary: string;
  phone: string;
  provider: "Orange Money" | "Wave" | "MTN";
  amount: number;
  status: "pending" | "paid" | "failed";
}

let mockPlatformPayments: PlatformPayment[] = [
  { id: "PAY-501", beneficiary: "Collecte Koumassi", phone: "+225 05 11 12 13", provider: "Wave", amount: 4000, status: "pending" },
  { id: "PAY-502", beneficiary: "Ménage Koffi", phone: "+225 07 01 02 03", provider: "Orange Money", amount: 10000, status: "pending" },
  { id: "PAY-503", beneficiary: "EcoTri Yopougon", phone: "+225 01 61 62 63", provider: "MTN", amount: 12000, status: "paid" },
];

export async function getAdminPayments(): Promise<PlatformPayment[]> {
  return mockPlatformPayments;
}

export async function processPayment(id: string): Promise<void> {
  mockPlatformPayments = mockPlatformPayments.map(p => p.id === id ? { ...p, status: "paid" } : p);
}


