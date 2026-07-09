// Types liés aux transactions et aux indicateurs financiers.
// Complète ce fichier avec vos types Transaction existants si vous en avez déjà —
// ces exports s'ajoutent, ils ne remplacent rien.

export type OrderStatus = "delivered" | "in_transit" | "late";

export interface Order {
  reference: string;   // ex: "CMD-2214"
  supplier: string;
  material: string;
  weight: string;      // déjà formaté, ex: "820 kg" ou "1.2 t"
  status: OrderStatus;
}

export interface KpiData {
  id: string;
  label: string;
  value: string;
  deltaLabel: string;
  deltaDirection: "up" | "down";
}
