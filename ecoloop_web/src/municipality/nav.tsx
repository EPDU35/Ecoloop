import {
  type NavItem,
  DashboardIcon,
  ReportsIcon,
} from '../components/Sidebar';

export const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

export const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ImpactIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22V12m0 0a5 5 0 10-5-5M12 12a5 5 0 115-5" />
  </svg>
);

export const PreventifIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22V12m0 0a5 5 0 10-5-5M12 12a5 5 0 115-5" />
    <path d="M8 14h8M8 18h8" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'carte', label: 'Carte des déchets', icon: <MapIcon /> },
  { key: 'alertes', label: 'Signalements', icon: <AlertIcon /> },
  { key: 'impact', label: 'Impact RSE', icon: <ImpactIcon /> },
  { key: 'reports', label: 'Rapports', icon: <ReportsIcon /> },
  { key: 'preventif', label: 'Système préventif', icon: <PreventifIcon /> },
];

export const NAV_PATHS: Record<string, string> = {
  dashboard: '/mairie',
  carte: '/mairie/carte',
  alertes: '/mairie/alertes',
  impact: '/mairie/impact',
  reports: '/mairie/rapports',
  preventif: '/mairie/preventif',
};
