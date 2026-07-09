import {
  type NavItem,
  DashboardIcon,
  MarketplaceIcon,
} from '../components/Sidebar';

export const TourIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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
  { key: 'marketplace', label: 'Marketplace', icon: <MarketplaceIcon /> },
  { key: 'tournees', label: 'Tournées', icon: <TourIcon /> },
  { key: 'revenues', label: 'Revenus', icon: <RevenueIcon /> },
];

export const NAV_PATHS: Record<string, string> = {
  dashboard: '/collecteur',
  marketplace: '/collecteur/marketplace',
  tournees: '/collecteur/tournees',
  revenues: '/collecteur/revenus',
};
