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

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'lots', label: 'Mes lots', icon: <LotsIcon /> },
  { key: 'collectes', label: 'Collectes', icon: <OrdersIcon /> },
  { key: 'revenues', label: 'Revenus', icon: <RevenueIcon /> },
];

export const NAV_PATHS: Record<string, string> = {
  dashboard: '/producteur',
  lots: '/producteur/lots',
  collectes: '/producteur/collectes',
  revenues: '/producteur/revenus',
};
