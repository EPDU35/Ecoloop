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
