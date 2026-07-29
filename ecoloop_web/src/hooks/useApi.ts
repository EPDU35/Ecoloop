import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { dashboardService } from '@/services/api/dashboardService';
import { wasteService } from '@/services/api/wasteService';
import { notificationService } from '@/services/api/notificationService';
import { rewardService } from '@/services/api/rewardService';
import { reportService, type CreateReportData } from '@/services/api/reportService';

// ─── Server Health ────────────────────────────────────────────────

export function useServerHealth() {
  const maxRetries = 15;
  const query = useQuery({
    queryKey: queryKeys.serverHealth,
    queryFn: dashboardService.checkHealth,
    retry: maxRetries,
    retryDelay: 5000,
    staleTime: 0,
    gcTime: 0,
  });

  const isWaking = !query.isSuccess && query.failureCount < maxRetries;
  const isError = !query.isSuccess && query.failureCount >= maxRetries;

  return {
    isReady: query.isSuccess,
    isWaking,
    isError,
    retry: query.refetch,
  };
}

// ─── Dashboards ────────────────────────────────────────────────

export function useProducerDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.producerDashboard,
    queryFn: dashboardService.getProducerDashboard,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

export function useCollectorDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.collectorDashboard,
    queryFn: dashboardService.getCollectorDashboard,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

export function useIndustrialDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.industrialDashboard,
    queryFn: dashboardService.getIndustrialDashboard,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

export function useMunicipalityDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.municipalityDashboard,
    queryFn: dashboardService.getMunicipalityDashboard,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

// ─── Wastes ────────────────────────────────────────────────

export function useMyWastes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myWastes,
    queryFn: wasteService.getMyWastes,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

export function useAvailableWastes(category?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.availableWastes(category),
    queryFn: () => wasteService.getAvailableWastes(category),
    staleTime: 15_000,
    gcTime: 2 * 60_000,
    enabled,
  });
}

export function useWasteHistory(enabled = true) {
  return useQuery({
    queryKey: queryKeys.wasteHistory,
    queryFn: wasteService.getHistory,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    enabled,
  });
}

// ─── Notifications ────────────────────────────────────────────────

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationService.getNotifications,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

// ─── Rewards ────────────────────────────────────────────────

export function useMyRewards(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myRewards,
    queryFn: rewardService.getMyRewards,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    enabled,
  });
}

export function usePointsHistory(enabled = true) {
  return useQuery({
    queryKey: queryKeys.pointsHistory,
    queryFn: rewardService.getPointsHistory,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    enabled,
  });
}

// ─── Reports ────────────────────────────────────────────────

export function useMyReports(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myReports,
    queryFn: reportService.getMyReports,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}

// ─── Mutations ────────────────────────────────────────────────

export function useCreateLot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lotData: any) => wasteService.createLot(lotData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myWastes });
      queryClient.invalidateQueries({ queryKey: queryKeys.producerDashboard });
    },
  });
}

export function useReserveCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wasteLotId: string) => wasteService.reserveCollection(wasteLotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availableWastes() });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useValidateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, validationCode, actualWeightKg }: {
      collectionId: string;
      validationCode: string;
      actualWeightKg: number;
    }) => wasteService.validateCollection(collectionId, validationCode, actualWeightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportData) => reportService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReports });
    },
  });
}
