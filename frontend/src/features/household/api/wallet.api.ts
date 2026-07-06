import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/client";
import { toast } from "@/common/notifications/toast";
import type { WalletSummary } from "./household.api";

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  partnerName: string;
  discountValue: string;
  couponCode: string;
  validUntil: string;
  imageUrl: string;
  isActive: boolean;
  redeemedCount: number;
}

export interface UserRewardItem {
  id: string;
  userId: string;
  rewardId: string;
  redeemedCode: string;
  pointsSpent: number;
  status: string;
  redeemedAt: string;
  usedAt?: string;
  reward?: RewardItem;
}

export interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
}

export interface SubscriptionItem {
  id: string;
  userId: string;
  planName: string;
  priceMonthly: number;
  pickupsPerMonth: number;
  status: string;
  stripeSubId: string;
  currentPeriodEnd: string;
}

export interface WalletDashboardData {
  wallet: WalletSummary;
  activeSubscription: SubscriptionItem | null;
  recentTransactions: any[];
  activeVouchers: UserRewardItem[];
  stats: {
    ecoScore: number;
    carbonSavedKg: number;
    referralCode: string;
  };
}

export const useWalletDashboard = () => {
  return useQuery({
    queryKey: ["wallet", "dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<WalletDashboardData>("/wallet/dashboard");
      return response.data;
    },
    retry: 2,
    staleTime: 30000,
  });
};

export const useRewards = () => {
  return useQuery({
    queryKey: ["wallet", "rewards"],
    queryFn: async () => {
      const response = await apiClient.get<RewardItem[]>("/wallet/rewards");
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useMyVouchers = () => {
  return useQuery({
    queryKey: ["wallet", "my-vouchers"],
    queryFn: async () => {
      const response = await apiClient.get<UserRewardItem[]>("/wallet/rewards/my-vouchers");
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rewardId }: { rewardId: string }) => {
      const response = await apiClient.post("/wallet/rewards/redeem", { rewardId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🎁 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to redeem reward voucher.");
    },
  });
};

export const useWithdrawCash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const response = await apiClient.post("/wallet/withdraw", { amount });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`💸 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process withdrawal.");
    },
  });
};

export const useCoupons = () => {
  return useQuery({
    queryKey: ["wallet", "coupons"],
    queryFn: async () => {
      const response = await apiClient.get<CouponItem[]>("/wallet/coupons");
      return response.data;
    },
    staleTime: 300000,
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const response = await apiClient.post("/wallet/coupons/validate", { code, orderAmount });
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid or expired promo code.");
    },
  });
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ["wallet", "subscription"],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionItem | null>("/wallet/subscriptions/current");
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useSubscribe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planName, paymentMethodId }: { planName: string; paymentMethodId?: string }) => {
      const response = await apiClient.post("/wallet/subscriptions", { planName, paymentMethodId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`👑 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to enroll in subscription.");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reason }: { reason?: string } = {}) => {
      const response = await apiClient.post("/wallet/subscriptions/cancel", { reason });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🚫 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to cancel subscription.");
    },
  });
};

export const useProcessCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { amount: number; currency?: string; pickupRequestId?: string; couponCode?: string }) => {
      const response = await apiClient.post("/wallet/checkout", dto);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`💳 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["pickups"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Payment checkout failed.");
    },
  });
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { transactionId: string; amount: number; reason: string }) => {
      const response = await apiClient.post("/wallet/refund", dto);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🔄 Refund processed successfully ($${data.refundedAmount})`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Refund processing failed.");
    },
  });
};

export const useClaimReferral = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ referralCode }: { referralCode: string }) => {
      const response = await apiClient.post("/wallet/referral/claim", { referralCode });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`🤝 ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to claim referral bonus.");
    },
  });
};
