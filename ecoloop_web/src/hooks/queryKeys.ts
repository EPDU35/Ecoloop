/**
 * Centralized React Query keys.
 * Prevents typos and makes invalidation refactor-safe.
 */
export const queryKeys = {
  serverHealth: ['server-health'] as const,

  // Dashboards
  producerDashboard: ['dashboard', 'producer'] as const,
  collectorDashboard: ['dashboard', 'collector'] as const,
  industrialDashboard: ['dashboard', 'industrial'] as const,
  municipalityDashboard: ['dashboard', 'municipality'] as const,

  // Wastes
  myWastes: ['my-wastes'] as const,
  availableWastes: (category?: string) =>
    category ? ['available-wastes', category] as const : ['available-wastes'] as const,
  wasteHistory: ['waste-history'] as const,

  // Notifications
  notifications: ['notifications'] as const,

  // Rewards
  myRewards: ['rewards', 'me'] as const,
  pointsHistory: ['rewards', 'history'] as const,

  // Reports
  myReports: ['reports'] as const,
} as const;
