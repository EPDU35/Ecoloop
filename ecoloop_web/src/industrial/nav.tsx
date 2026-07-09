import {
  type NavItem,
  DashboardIcon,
  MarketplaceIcon,
  SuppliersIcon,
  ContractsIcon,
  OrdersIcon,
  ReportsIcon,
} from '../components/Sidebar';

export const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'marketplace', label: 'Marketplace', icon: <MarketplaceIcon /> },
  { key: 'suppliers', label: 'Fournisseurs', icon: <SuppliersIcon /> },
  { key: 'contracts', label: 'Contrats', icon: <ContractsIcon /> },
  { key: 'orders', label: 'Commandes', icon: <OrdersIcon /> },
  { key: 'reports', label: 'Rapports', icon: <ReportsIcon /> },
  { key: 'historique', label: 'Historique achats', icon: <HistoryIcon /> },
];

/** Associe chaque clé de menu à sa route réelle — utilisé par onSelect pour naviguer. */
export const NAV_PATHS: Record<string, string> = {
  dashboard: '/industrial',
  marketplace: '/industrial/marketplace',
  suppliers: '/industrial/suppliers',
  contracts: '/industrial/contracts',
  orders: '/industrial/orders',
  reports: '/industrial/reports',
  historique: '/industrial/historique',
};
