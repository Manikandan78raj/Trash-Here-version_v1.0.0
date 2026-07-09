import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

// ==========================================
// 1. TypeScript Interfaces for Backend DTOs
// ==========================================

export interface UserAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  isDefault: boolean;
}

export interface CreateAddressDto {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
  instructions?: string;
}

export interface CreatePickupItemDto {
  categoryId: string;
  estimatedWeightKg: number;
  photoUrl?: string;
  aiConfidence?: number;
}

export interface CreatePickupDto {
  addressId: string;
  scheduledDate: string;
  items: CreatePickupItemDto[];
  notes?: string;
}

export interface WalletSummary {
  id: string;
  pointsBalance: number;
  cashBalance: number;
  totalPointsEarned: number;
  totalCashEarned: number;
  balance?: number;
  greenPoints?: number;
  lifetimeEarnings?: number;
  lifetimePoints?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  roleId: string;
  ecoScore: number;
  carbonSavedKg: number;
  createdAt: string;
  updatedAt: string;
  role?: { id: string; name: string };
  addresses?: UserAddress[];
  wallet?: WalletSummary;
}

export interface EcoScoreMetrics {
  ecoScore: number;
  carbonSavedKg: number;
  completedPickups: number;
  tierLevel: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: string; // 'EARNED' | 'REDEEMED' | 'WITHDRAWN' | 'BONUS'
  amount: number;
  points: number;
  description: string;
  createdAt: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerKg: number;
  pointsPerKg: number;
  co2SavedPerKg: number;
  iconUrl: string | null;
  isActive: boolean;
}

export interface PickupItem {
  id: string;
  wasteCategoryId: string;
  estimatedWeightKg: number;
  category?: WasteCategory;
}

export interface CollectorVehicle {
  id: string;
  vehicleType: string;
  plateNumber: string;
  capacityKg: number;
}

export interface CollectorProfile {
  id: string;
  rating: number;
  totalCompleted: number;
  user?: {
    firstName: string;
    lastName: string;
    phone?: string;
    photoUrl?: string;
  };
  vehicles?: CollectorVehicle[];
}

export interface PickupRequest {
  id: string;
  userId: string;
  collectorId: string | null;
  status: string; // 'PENDING' | 'ASSIGNED' | 'COLLECTOR_ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'VERIFIED' | 'COMPLETED' | 'CANCELLED'
  scheduledDate: string;
  estimatedWeightKg: number;
  actualWeightKg: number | null;
  qrSecret?: string;
  qrCodeSecret?: string;
  notes: string | null;
  addressId: string;
  estimatedPayout?: number;
  actualPayout?: number | null;
  rewardPoints?: number;
  createdAt: string;
  updatedAt: string;
  address?: {
    label: string;
    street: string;
    city: string;
    state: string;
  };
  items?: PickupItem[];
  collector?: CollectorProfile | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // 'INFO' | 'PICKUP' | 'REWARD' | 'ALERT'
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

// ==========================================
// 2. TanStack Query Hooks with Retry Handling
// ==========================================

/**
 * Fetch current user profile, addresses, and wallet
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiClient.get<{ data: UserProfile }>('/users/profile');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Fetch live Eco Score, tier level, and carbon offset metrics
 */
export const useEcoScore = () => {
  return useQuery({
    queryKey: ['user', 'eco-score'],
    queryFn: async (): Promise<EcoScoreMetrics> => {
      const response = await apiClient.get<{ data: EcoScoreMetrics }>('/users/eco-score');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch wallet points, cash balance, and lifetime stats
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async (): Promise<WalletSummary> => {
      const response = await apiClient.get<{ data: WalletSummary }>('/wallet');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 30000,
  });
};

/**
 * Fetch wallet transaction & reward redemption history
 */
export const useWalletTransactions = () => {
  return useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: async (): Promise<WalletTransaction[]> => {
      const response = await apiClient.get<{ data: WalletTransaction[] }>('/wallet/transactions');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 30000,
  });
};

/**
 * Fetch user notifications
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationItem[]> => {
      const response = await apiClient.get<{ data: NotificationItem[] }>('/users/notifications');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    refetchInterval: 10000,
  });
};

/**
 * Mark notification as read
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/users/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Fetch all waste categories and live pricing
 */
export const useWasteCategories = () => {
  return useQuery({
    queryKey: ['waste-categories'],
    queryFn: async () => {
      const response = await apiClient.get<WasteCategory[]>('/waste-categories');
      return response.data;
    },
    retry: 2,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Fetch all saved addresses for current user
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: async (): Promise<UserAddress[]> => {
      const response = await apiClient.get<{ data: UserAddress[] }>('/users/addresses');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 60000,
  });
};

/**
 * Add a new pickup address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAddressDto) => {
      const response = await apiClient.post<UserAddress>('/users/addresses', dto);
      return response.data;
    },
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success(`Address "${newAddress.label}" saved successfully!`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save address. Please try again.');
    },
  });
};

/**
 * Delete a saved address
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiClient.delete(`/users/addresses/${addressId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Address removed successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete address.');
    },
  });
};

/**
 * Fetch all scheduled and completed pickup requests for current user
 */
export const useMyPickups = () => {
  return useQuery({
    queryKey: ['pickups', 'my'],
    queryFn: async (): Promise<PickupRequest[]> => {
      const response = await apiClient.get<{ data: PickupRequest[] }>('/pickups/my');
      return (response.data as any)?.data || response.data;
    },
    retry: 2,
    staleTime: 30000,
  });
};

/**
 * Schedule a new waste pickup with optimistic UI updates and rollback on failure
 */
export const useCreatePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePickupDto) => {
      const response = await apiClient.post<PickupRequest>('/pickups', dto);
      return response.data;
    },
    onMutate: async (newPickupDto) => {
      // 1. Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['pickups', 'my'] });

      // 2. Snapshot the previous value
      const previousPickups = queryClient.getQueryData<PickupRequest[]>(['pickups', 'my']);

      // 3. Optimistically update the cache with a temporary pickup object
      if (previousPickups) {
        const optimisticPickup: PickupRequest = {
          id: `temp-${Date.now()}`,
          userId: 'current-user',
          collectorId: null,
          status: 'SCHEDULED',
          scheduledDate: newPickupDto.scheduledDate,
          estimatedWeightKg: newPickupDto.items.reduce(
            (sum, item) => sum + item.estimatedWeightKg,
            0,
          ),
          actualWeightKg: null,
          qrSecret: `qr-${Date.now()}`,
          notes: newPickupDto.notes || null,
          addressId: newPickupDto.addressId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: newPickupDto.items.map((it, idx) => ({
            id: `temp-item-${idx}`,
            wasteCategoryId: it.categoryId,
            estimatedWeightKg: it.estimatedWeightKg,
          })),
        };

        queryClient.setQueryData<PickupRequest[]>(
          ['pickups', 'my'],
          [optimisticPickup, ...previousPickups],
        );
      }

      // 4. Return context object with snapshotted value
      return { previousPickups };
    },
    onError: (error: any, _newPickupDto, context) => {
      // Rollback to previous value if mutation fails
      if (context?.previousPickups) {
        queryClient.setQueryData(['pickups', 'my'], context.previousPickups);
      }
      toast.error(
        error?.response?.data?.message || 'Failed to schedule pickup. Rolling back changes.',
      );
    },
    onSuccess: (data) => {
      toast.success(`🎉 Pickup #${data.id.slice(0, 8)} scheduled successfully!`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'eco-score'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Fetch pickup request details by ID including live tracking & collector info
 */
export const usePickupById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['pickups', id],
    queryFn: async (): Promise<PickupRequest> => {
      if (!id) throw new Error('Pickup ID is required');
      const response = await apiClient.get<{ data: PickupRequest }>(`/pickups/${id}`);
      return (response.data as any)?.data || response.data;
    },
    enabled: !!id,
    retry: 2,
    refetchInterval: (query) => {
      // Poll every 5 seconds if pickup is active (not completed or cancelled)
      const status = query.state?.data?.status;
      if (status && ['COMPLETED', 'CANCELLED'].includes(status)) return false;
      return 5000;
    },
  });
};

/**
 * Cancel a scheduled pickup before collector arrives
 */
export const useCancelPickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.patch<PickupRequest>(`/pickups/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🚫 Pickup #${data.id.slice(0, 8)} cancelled successfully.`);
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel pickup.');
    },
  });
};

/**
 * Simulate driver telemetry and status progression for interactive tracking demo
 */
export const useSimulatePickupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch<PickupRequest>(`/pickups/${id}/simulate-status`, {
        status,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🧪 Simulated Status: ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to simulate status.');
    },
  });
};

/**
 * Verify QR code secret and complete pickup (Simulated trigger for demo)
 */
export const useVerifyQrCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrCodeSecret,
      actualWeightKg,
    }: {
      qrCodeSecret: string;
      actualWeightKg: number;
    }) => {
      const response = await apiClient.post('/pickups/verify-qr', { qrCodeSecret, actualWeightKg });
      return response.data;
    },
    onSuccess: () => {
      toast.success('🎉 QR Code verified! Green Points and Cash awarded!');
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to verify QR Code.');
    },
  });
};
