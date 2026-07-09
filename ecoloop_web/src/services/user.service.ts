import type { IndustrialUser } from "../models/User";

// Complète ce fichier avec vos fonctions user.service existantes si vous
// en avez déjà — cet export s'ajoute, il ne remplace rien.
//
// Donnée statique pour l'instant, à remplacer par un fetch() vers
// /users/me côté backend FastAPI (probablement en réutilisant le token
// déjà géré par auth.service.ts).

export async function getCurrentUser(): Promise<IndustrialUser> {
  return { initials: "FD", name: "Fatou Diabaté", company: "Industriel — SIVOP" };
}
