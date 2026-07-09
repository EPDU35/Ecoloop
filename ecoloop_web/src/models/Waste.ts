// Types liés aux déchets et à leur suivi.
// Complète ce fichier avec vos types Waste existants si vous en avez déjà —
// ces exports s'ajoutent, ils ne remplacent rien.

export interface MaterialShare {
  name: string;       // ex: "PET"
  percent: number;    // ex: 42
  color: string;       // couleur hex utilisée dans le donut chart
}

export interface DailyVolume {
  day: string;        // ex: "Lun"
  percent: number;    // hauteur relative de la barre, 0-100
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

