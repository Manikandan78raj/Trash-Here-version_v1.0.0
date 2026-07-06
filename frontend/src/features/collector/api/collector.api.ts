import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

// ==========================================
// 1. TypeScript Interfaces for Collector DTOs
// ==========================================

export interface CollectorDashboardStats {
  id: string;
  userId: string;
  vehicleType: string;
  vehiclePlate?: string;
  maxCapacityKg: number;
  currentLat?: number;
  currentLng?: number;
  isOnline: boolean;
  rating: number;
  totalCompleted: number;
  totalEarnings: number;
  activeJob?: {
    id: string;
    status: string;
    estimatedWeightKg: number;
    address: {
      street: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
    };
    user?: {
      fullName: string;
      phone: string;
    };
  };
}

export interface CollectorJob {
  id: string;
  userId: string;
  collectorId?: string;
  status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  estimatedWeightKg: number;
  actualWeightKg?: number;
  qrCodeSecret?: string;
  notes?: string;
  address: {
    id?: string;
    label?: string;
    street: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  user?: {
    fullName: string;
    phone: string;
  };
}

export interface CollectorRouteWaypoint {
  pickupId: string;
  stopNumber: number;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  estimatedWeightKg: number;
  customerName?: string;
  customerPhone?: string;
}

export interface CollectorRoute {
  collectorId: string;
  totalWaypoints: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  encodedPolyline: string;
  waypoints: CollectorRouteWaypoint[];
}

export interface CollectorPayoutsSummary {
  totalEarnings: number;
  currentCashBalance: number;
  instantPayoutsEnabled: boolean;
  bankAccountLast4?: string;
  stripeConnectId?: string;
  recentPayouts: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    referenceId?: string;
  }>;
}

export interface CompleteJobDto {
  lat: number;
  lng: number;
  qrSecret: string;
  actualWeightKg?: number;
}

export interface InstantPayoutDto {
  amount: number;
}

// ==========================================
// 2. TanStack Query Hooks for Collector API
// ==========================================

export const useCollectorDashboardStats = () => {
  return useQuery({
    queryKey: ['collector', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: CollectorDashboardStats }>(
        '/collectors/dashboard',
      );
      return data.data;
    },
    refetchInterval: 30000,
  });
};

export const useAvailableJobs = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['collector', 'jobs', 'available', lat, lng],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lat !== undefined) params.append('lat', lat.toString());
      if (lng !== undefined) params.append('lng', lng.toString());
      const { data } = await apiClient.get<{ success: boolean; data: CollectorJob[] }>(
        `/collectors/jobs/available?${params.toString()}`,
      );
      return data.data;
    },
  });
};

export const useAcceptJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pickupId: string) => {
      const { data } = await apiClient.post(`/collectors/jobs/${pickupId}/accept`);
      return data;
    },
    onSuccess: () => {
      toast.success('Job Accepted!', 'Added to your active navigation route.');
      queryClient.invalidateQueries({ queryKey: ['collector'] });
    },
    onError: (error: any) => {
      toast.error('Failed to accept job', error.response?.data?.message || error.message);
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coords: { lat: number; lng: number }) => {
      const { data } = await apiClient.patch('/collectors/location', coords);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collector', 'dashboard'] });
    },
  });
};

export const useToggleOnlineStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      const { data } = await apiClient.patch('/collectors/status', { isOnline });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables ? 'You are now Online 🟢' : 'You are now Offline ⚪',
        variables
          ? 'Receiving real-time nearby job requests.'
          : 'No longer receiving pickup requests.',
      );
      queryClient.invalidateQueries({ queryKey: ['collector', 'dashboard'] });
    },
    onError: (error: any) => {
      toast.error('Status update failed', error.response?.data?.message || error.message);
    },
  });
};

export const useAssignedRoute = () => {
  return useQuery({
    queryKey: ['collector', 'route'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: CollectorRoute }>(
        '/collectors/route',
      );
      return data.data;
    },
    refetchInterval: 20000,
  });
};

export const useArriveAtStop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pickupId: string) => {
      const { data } = await apiClient.post(`/collectors/jobs/${pickupId}/arrive`);
      return data;
    },
    onSuccess: () => {
      toast.success('Arrived at Stop 📍', 'Customer has been notified via SMS/Push.');
      queryClient.invalidateQueries({ queryKey: ['collector'] });
    },
    onError: (error: any) => {
      toast.error('Failed to mark arrival', error.response?.data?.message || error.message);
    },
  });
};

export const useCompletePickupJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pickupId, dto }: { pickupId: string; dto: CompleteJobDto }) => {
      const { data } = await apiClient.post(`/collectors/jobs/${pickupId}/complete`, dto);
      return data;
    },
    onSuccess: (res: any) => {
      const payout = res?.data?.payout || res?.payout || 0;
      toast.success(
        'Pickup Verified & Completed! ✅',
        `Earned $${Number(payout).toFixed(2)} credited directly to your wallet.`,
      );
      queryClient.invalidateQueries({ queryKey: ['collector'] });
    },
    onError: (error: any) => {
      toast.error('Verification Failed ❌', error.response?.data?.message || error.message);
    },
  });
};

export const useCollectorPayoutsSummary = () => {
  return useQuery({
    queryKey: ['collector', 'payouts', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: CollectorPayoutsSummary }>(
        '/collectors/payouts/summary',
      );
      return data.data;
    },
  });
};

export const useRequestInstantPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: InstantPayoutDto) => {
      const { data } = await apiClient.post('/collectors/payouts/instant', dto);
      return data;
    },
    onSuccess: (res: any) => {
      const transferId = res?.data?.transferId || res?.transferId || 'tr_connect';
      toast.success(
        'Instant Transfer Sent! 💸',
        `Stripe Connect Transfer ${transferId} initiated to your debit card.`,
      );
      queryClient.invalidateQueries({ queryKey: ['collector'] });
    },
    onError: (error: any) => {
      toast.error('Instant Payout Failed', error.response?.data?.message || error.message);
    },
  });
};
