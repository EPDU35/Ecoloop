import {
  type NavItem,
  DashboardIcon,
  OrdersIcon,
} from '../components/Sidebar';

export const LotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);

export const RevenueIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const RewardsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'lots', label: 'Mes lots', icon: <LotsIcon /> },
  { key: 'scanner', label: 'Scanner IA 📸', icon: <LotsIcon /> },
  { key: 'nouvelle-collecte', label: 'Nouvelle collecte', icon: <OrdersIcon /> },
  { key: 'revenus', label: 'Revenus', icon: <RevenueIcon /> },
  { key: 'recompenses', label: 'Récompenses', icon: <RewardsIcon /> },
];

export const NAV_PATHS: Record<string, string> = {
  dashboard: '/producteur',
  lots: '/producteur/lots',
  scanner: '/producteur/scanner',
  'nouvelle-collecte': '/producteur/nouvelle-collecte',
  revenus: '/producteur/revenus',
  recompenses: '/producteur/recompenses',
};
