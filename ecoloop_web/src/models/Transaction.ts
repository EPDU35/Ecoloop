export type OrderStatus = "delivered" | "in_transit" | "late";

export interface Order {
  reference: string;
  supplier: string;
  material: string;
  weight: string;
  status: OrderStatus;
}

export interface KpiData {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  deltaDirection?: "up" | "down";
}

export interface Contract {
  id: string;
  supplier: string;
  material: string;
  monthlyTargetKg: number;
  suppliedThisMonthKg: number;
  pricePerKg: number;
  durationMonths: number;
  startDate: string;
  status: "active" | "suspended" | "expired";
}

export interface TransactionOut {
  id: string;
  collection_id: string;
  producer_id: string;
  collector_id: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}
