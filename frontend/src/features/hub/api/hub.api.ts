import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

// ==========================================
// 1. NOTIFICATION INTERFACES & HOOKS
// ==========================================
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category:
    | 'PICKUP'
    | 'PAYMENT'
    | 'WALLET'
    | 'REWARD'
    | 'SUBSCRIPTION'
    | 'SECURITY'
    | 'SYSTEM'
    | 'PROMOTION';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationQueryParams {
  isRead?: string;
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useNotifications = (params: NotificationQueryParams = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: PaginatedNotifications }>(
        '/notifications',
        {
          params,
        },
      );
      return response.data.data;
    },
    staleTime: 15000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: { unreadCount: number } }>(
        '/notifications/unread-count',
      );
      return response.data.data.unreadCount;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isRead = true }: { id: string; isRead?: boolean }) => {
      const response = await apiClient.patch(`/notifications/${id}/read`, { isRead });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update notification status');
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || 'All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark all as read');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Notification removed');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete notification');
    },
  });
};

// ==========================================
// 2. PROFILE INTERFACES & HOOKS
// ==========================================
export interface UserProfileData {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  roleId: string;
  role?: { id: string; name: string; description?: string };
  ecoScore: number;
  carbonSavedKg: number;
  referralCode: string;
  isVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  wallet?: { id: string; balance: number; greenPoints: number; currency: string };
  settings?: UserSettingsData;
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: UserProfileData }>('/profile');
      return response.data.data;
    },
    staleTime: 60000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
    }) => {
      const response = await apiClient.patch<{ message: string; data: UserProfileData }>(
        '/profile',
        dto,
      );
      return response.data;
    },
    onSuccess: (res) => {
      toast.success('✨ ' + (res.message || 'Profile updated successfully'));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (dto: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.patch('/profile/password', dto);
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success('🔒 ' + (res.message || 'Password updated successfully'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Password update failed');
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { newEmail: string; password: string }) => {
      const response = await apiClient.patch('/profile/email', dto);
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success('📧 ' + (res.message || 'Email address updated'));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update email address');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiClient.post<{ message: string; data: { avatarUrl: string } }>(
        '/profile/avatar',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return response.data;
    },
    onSuccess: (res) => {
      toast.success('📸 ' + (res.message || 'Avatar uploaded successfully'));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar');
    },
  });
};

export interface GdprExportResponse {
  exportId: string;
  status: string;
  message: string;
}

export const useRequestGdprExport = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string; data: GdprExportResponse }>(
        '/profile/export',
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success('📦 ' + data.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to initiate GDPR data export');
    },
  });
};

// ==========================================
// 3. SETTINGS INTERFACES & HOOKS
// ==========================================
export interface UserSettingsData {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  pickupAlerts: boolean;
  rewardAlerts: boolean;
  securityAlerts: boolean;
  marketingAlerts: boolean;
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  locationSharing: boolean;
  dataCollectionConsent: boolean;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeoutMinutes: number;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: UserSettingsData }>(
        '/settings',
      );
      return response.data.data;
    },
    staleTime: 60000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<UserSettingsData>) => {
      const response = await apiClient.patch<{ message: string; data: UserSettingsData }>(
        '/settings',
        dto,
      );
      return response.data;
    },
    onSuccess: (res) => {
      toast.success('⚙️ ' + (res.message || 'Settings saved'));
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    },
  });
};
