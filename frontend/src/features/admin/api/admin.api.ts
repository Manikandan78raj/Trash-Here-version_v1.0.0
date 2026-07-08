import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

// ==========================================
// 1. TypeScript Interfaces for Admin DTOs
// ==========================================

export interface CollectorFleetItem {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  capacityKg: number;
  currentLat: number;
  currentLng: number;
  isOnline: boolean;
  rating: number;
  activeJobsCount: number;
}

export interface LiveFleetMapResponse {
  activeCollectors: CollectorFleetItem[];
  unassignedJobsCount: number;
  inProgressJobsCount: number;
  completedTodayCount: number;
  timestamp: string;
}

export interface PnLSnapshotDto {
  periodStart: string;
  periodEnd: string;
  grossRevenueUsd: number;
  stripePaymentsUsd: number;
  recyclerInvoicesUsd: number;
  collectorPayoutsUsd: number;
  rewardsLiabilitiesUsd: number;
  netMarginUsd: number;
  currency: string;
  calculatedAt: string;
}

export interface LedgerReconcileResultDto {
  success: boolean;
  checkedWalletsCount: number;
  discrepanciesFound: number;
  details: string[];
  reconciledAt: string;
}

export interface AuditLogItemDto {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

export interface ImpersonationLogDto {
  id: string;
  adminId: string;
  targetUserId: string;
  targetRole: string;
  reason: string;
  ipAddress: string;
  startedAt: string;
  endedAt?: string;
  tokenExpiresAt: string;
}

export interface SystemConfigDto {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

// ==========================================
// 2. TanStack Query Hooks for Admin Features
// ==========================================

export const useAdminFleetMap = () => {
  return useQuery<LiveFleetMapResponse>({
    queryKey: ['admin', 'fleet', 'map'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/fleet/map');
      return res.data.data;
    },
    refetchInterval: 10000,
  });
};

export const useAdminReassignRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      pickupRequestId: string;
      newCollectorId: string;
      reason: string;
    }) => {
      const res = await apiClient.put('/admin/dispatch/reassign', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Route successfully reassigned to new collector');
      queryClient.invalidateQueries({ queryKey: ['admin', 'fleet', 'map'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reassign route');
    },
  });
};

export const useAdminPnL = (startDate?: string, endDate?: string) => {
  return useQuery<PnLSnapshotDto>({
    queryKey: ['admin', 'finance', 'pnl', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await apiClient.get(`/admin/finance/pnl?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminReconcileLedgers = () => {
  const queryClient = useQueryClient();
  return useMutation<LedgerReconcileResultDto>({
    mutationFn: async () => {
      const res = await apiClient.post('/admin/finance/reconcile');
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.discrepanciesFound === 0) {
        toast.success(`Ledgers reconciled! ${data.checkedWalletsCount} wallets verified clean.`);
      } else {
        toast.error(`Warning: ${data.discrepanciesFound} ledger discrepancies found!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'pnl'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Reconciliation failed');
    },
  });
};

export const useAdminAuditLogs = (action?: string, severity?: string) => {
  return useQuery<AuditLogItemDto[]>({
    queryKey: ['admin', 'audit', 'logs', action, severity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (action) params.append('action', action);
      if (severity) params.append('severity', severity);
      const res = await apiClient.get(`/admin/audit/logs?${params.toString()}`);
      return res.data.data || [];
    },
  });
};

export const useAdminStartImpersonation = () => {
  const queryClient = useQueryClient();
  return useMutation<ImpersonationLogDto, Error, { targetUserId: string; reason: string }>({
    mutationFn: async (dto) => {
      const res = await apiClient.post('/admin/impersonate/start', dto);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Started impersonation session for user ${data.targetUserId}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit', 'logs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start impersonation');
    },
  });
};

export const useAdminStopImpersonation = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { impersonationLogId: string }>({
    mutationFn: async (dto) => {
      const res = await apiClient.post('/admin/impersonate/stop', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Impersonation session terminated securely');
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit', 'logs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to stop impersonation');
    },
  });
};

export const useAdminConfigs = () => {
  return useQuery<SystemConfigDto[]>({
    queryKey: ['admin', 'config'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/config');
      return res.data.data || [];
    },
  });
};

export const useAdminUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<SystemConfigDto, Error, { key: string; value: string; description?: string }>({
    mutationFn: async (dto) => {
      const res = await apiClient.put('/admin/config', dto);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Updated config setting: ${data.key}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit', 'logs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update config');
    },
  });
};
