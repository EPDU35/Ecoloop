import type { Order } from "../models/Transaction";

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
