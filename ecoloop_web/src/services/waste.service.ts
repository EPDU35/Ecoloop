import type { Order, Contract } from "../models/Transaction";
import type { Lot } from "../models/Waste";

// Complète ce fichier avec vos fonctions waste.service existantes si vous
// en avez déjà — cet export s'ajoute, il ne remplace rien.
//
// Donnée statique pour l'instant, à remplacer par un fetch() vers
// /wastes ou /collections côté backend FastAPI.

export async function getRecentOrders(): Promise<Order[]> {
  return [
    { reference: "CMD-2214", supplier: "Collecte Koumassi", material: "PET", weight: "820 kg", status: "delivered" },
    { reference: "CMD-2213", supplier: "EcoTri Yopougon", material: "Carton", weight: "1.2 t", status: "in_transit" },
    { reference: "CMD-2212", supplier: "Bassam Recyclage", material: "HDPE", weight: "540 kg", status: "delivered" },
    { reference: "CMD-2211", supplier: "Collecte Koumassi", material: "Verre", weight: "960 kg", status: "late" },
    { reference: "CMD-2210", supplier: "EcoTri Yopougon", material: "PET", weight: "1.4 t", status: "delivered" },
  ];
}

export async function getLots(): Promise<Lot[]> {
  return [
    {
      id: "LOT-001",
      material: "PET",
      distanceKm: 1.2,
      weightKg: 850,
      location: "Koumassi, Abidjan",
      collector: "Collecte Koumassi",
      pricePerKg: 150,
    },
    {
      id: "LOT-002",
      material: "HDPE",
      distanceKm: 3.5,
      weightKg: 420,
      location: "Yopougon, Abidjan",
      collector: "EcoTri Yopougon",
      pricePerKg: 120,
    },
    {
      id: "LOT-003",
      material: "Carton",
      distanceKm: 0.8,
      weightKg: 1200,
      location: "Marcory, Abidjan",
      collector: "Collecte Koumassi",
      pricePerKg: 80,
    },
    {
      id: "LOT-004",
      material: "Verre",
      distanceKm: 5.1,
      weightKg: 650,
      location: "Grand-Bassam",
      collector: "Bassam Recyclage",
      pricePerKg: 60,
    },
  ];
}

// Contrats industriels mockés réutilisables
let mockContracts: Contract[] = [
  {
    id: "CTR-101",
    supplier: "Collecte Koumassi",
    material: "PET",
    monthlyTargetKg: 5000,
    suppliedThisMonthKg: 3200,
    pricePerKg: 150,
    durationMonths: 6,
    startDate: "01/05/2026",
    status: "active",
  },
  {
    id: "CTR-102",
    supplier: "EcoTri Yopougon",
    material: "Carton",
    monthlyTargetKg: 10000,
    suppliedThisMonthKg: 8500,
    pricePerKg: 80,
    durationMonths: 12,
    startDate: "15/04/2026",
    status: "active",
  },
  {
    id: "CTR-103",
    supplier: "Bassam Recyclage",
    material: "HDPE",
    monthlyTargetKg: 3000,
    suppliedThisMonthKg: 1100,
    pricePerKg: 120,
    durationMonths: 6,
    startDate: "01/06/2026",
    status: "active",
  },
];

export async function getContracts(): Promise<Contract[]> {
  return mockContracts;
}

export async function createContract(
  contract: Omit<Contract, "id" | "startDate" | "suppliedThisMonthKg" | "status">
): Promise<Contract> {
  const newContract: Contract = {
    ...contract,
    id: `CTR-${Math.floor(100 + Math.random() * 900)}`,
    startDate: new Date().toLocaleDateString("fr-FR"),
    suppliedThisMonthKg: 0,
    status: "active",
  };
  mockContracts = [newContract, ...mockContracts];
  return newContract;
}


