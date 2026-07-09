// Types liés aux utilisateurs.
// Complète ce fichier avec vos types User existants si vous en avez déjà —
// ces exports s'ajoutent, ils ne remplacent rien.

export interface IndustrialUser {
  initials: string;   // ex: "FD"
  name: string;
  company: string;
}

export interface Supplier {
  id: string;
  name: string;
  zone: string;
  mainMaterials: string[];
  totalSuppliedKg: number;
  rating: number;
  status: "active" | "inactive";
}

