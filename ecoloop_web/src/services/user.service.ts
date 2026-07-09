import type { IndustrialUser, Supplier } from "../models/User";

// Complète ce fichier avec vos fonctions user.service existantes si vous
// en avez déjà — cet export s'ajoute, il ne remplace rien.
//
// Donnée statique pour l'instant, à remplacer par un fetch() vers
// /users/me côté backend FastAPI (probablement en réutilisant le token
// déjà géré par auth.service.ts).

export async function getCurrentUser(): Promise<IndustrialUser> {
  return { initials: "FD", name: "Fatou Diabaté", company: "Industriel — SIVOP" };
}

export async function getSuppliers(): Promise<Supplier[]> {
  return [
    {
      id: "SUP-001",
      name: "Collecte Koumassi",
      zone: "Koumassi, Abidjan",
      mainMaterials: ["PET", "Carton"],
      totalSuppliedKg: 12500,
      rating: 4.8,
      status: "active",
    },
    {
      id: "SUP-002",
      name: "EcoTri Yopougon",
      zone: "Yopougon, Abidjan",
      mainMaterials: ["PET", "HDPE"],
      totalSuppliedKg: 8400,
      rating: 4.5,
      status: "active",
    },
    {
      id: "SUP-003",
      name: "Bassam Recyclage",
      zone: "Grand-Bassam",
      mainMaterials: ["Verre"],
      totalSuppliedKg: 4200,
      rating: 4.2,
      status: "active",
    },
  ];
}

