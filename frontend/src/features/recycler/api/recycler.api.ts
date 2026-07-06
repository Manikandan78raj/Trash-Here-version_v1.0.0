import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

// ==========================================
// 1. TypeScript Interfaces for Recycler DTOs
// ==========================================

export interface ScaleRecordDto {
  id: string;
  loadId: string;
  scaleId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  weighInTimestamp: string;
  weighOutTimestamp?: string;
  weighmasterName: string;
  digitalSeal: string;
}

export interface ContaminationFlagDto {
  id: string;
  contaminantType: string;
  severity: string;
  estimatedWeightKg: number;
  actionTaken: string;
  photoUrl?: string;
}

export interface QualityInspectionDto {
  id: string;
  loadId: string;
  inspectorName: string;
  overallGrade: string;
  moisturePercent: number;
  contaminationRate: number;
  notes?: string;
  contaminationFlags?: ContaminationFlagDto[];
}

export interface IncomingLoadDto {
  id: string;
  recyclerId: string;
  collectorId?: string;
  truckPlate: string;
  driverName: string;
  sourceType: string;
  manifestNumber: string;
  status: 'ARRIVED' | 'WEIGHING_IN' | 'INSPECTING' | 'UNLOADING' | 'WEIGHING_OUT' | 'ACCEPTED' | 'REJECTED' | 'CONTAMINATED';
  scheduledArrival: string;
  actualArrival: string;
  departedAt?: string;
  scaleRecord?: ScaleRecordDto;
  qualityInspection?: QualityInspectionDto;
}

export interface MaterialBatchDto {
  id: string;
  batchNumber: string;
  recyclerId: string;
  loadId?: string;
  categoryId: string;
  weightKg: number;
  purityPercent: number;
  status: string;
  warehouseLocation?: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface WarehouseInventoryDto {
  id: string;
  recyclerId: string;
  categoryId: string;
  totalWeightKg: number;
  availableWeightKg: number;
  allocatedWeightKg: number;
  averagePurity: number;
  lastAuditedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProcessingQueueItemDto {
  id: string;
  recyclerId: string;
  batchId: string;
  machineId: string;
  processStage: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  inputWeightKg: number;
  outputWeightKg?: number;
  wasteLossKg?: number;
  operatorName?: string;
  startedAt?: string;
  completedAt?: string;
  batch?: MaterialBatchDto;
}

export interface EsgReportDto {
  id: string;
  reportNumber: string;
  recyclerId: string;
  reportingPeriod: string;
  startDate: string;
  endDate: string;
  totalIntakeKg: number;
  totalProcessedKg: number;
  totalRecycledKg: number;
  landfillDiversionRate: number;
  co2OffsetKg: number;
  energySavedKwh: number;
  waterSavedLiters: number;
  complianceStatus: string;
  generatedBy: string;
  createdAt: string;
}

export interface PdfManifestDto {
  id: string;
  manifestNumber: string;
  recyclerId: string;
  loadId?: string;
  esgReportId?: string;
  manifestType: string;
  fileUrl: string;
  fileSizeBytes: number;
  sha256Hash: string;
  issuedTo: string;
  issuedAt: string;
}

// ==========================================
// 2. TanStack Query Hooks for Recycler Portal
// ==========================================

export const useRecyclerLoads = (status?: string) => {
  return useQuery({
    queryKey: ['recycler-loads', status],
    queryFn: async () => {
      const url = status ? `/recycler/intake/loads?status=${status}` : '/recycler/intake/loads';
      const response = await apiClient.get<{ data: IncomingLoadDto[] }>(url);
      return response.data.data;
    },
    refetchInterval: 10000, // 10s auto refresh for live weighbridge monitoring
  });
};

export const useCheckInLoad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { truckPlate: string; driverName: string; sourceType?: string }) => {
      const response = await apiClient.post<{ data: IncomingLoadDto }>('/recycler/intake/check-in', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Vehicle checked in successfully at gate!');
      queryClient.invalidateQueries({ queryKey: ['recycler-loads'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to check in vehicle.');
    },
  });
};

export const useRecordWeighIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loadId, scaleId }: { loadId: string; scaleId: string }) => {
      const response = await apiClient.post(`/recycler/intake/${loadId}/weigh-in`, { scaleId });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Gross weight recorded & HMAC digital seal generated!');
      queryClient.invalidateQueries({ queryKey: ['recycler-loads'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Scale reading unstable or failed.');
    },
  });
};

export const useRecordInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      loadId,
      data,
    }: {
      loadId: string;
      data: { overallGrade: string; moisturePercent: number; contaminationRate: number; notes?: string };
    }) => {
      const response = await apiClient.post(`/recycler/intake/${loadId}/inspect`, data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Quality inspection grading recorded!');
      queryClient.invalidateQueries({ queryKey: ['recycler-loads'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record inspection.');
    },
  });
};

export const useRecordWeighOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loadId, scaleId }: { loadId: string; scaleId: string }) => {
      const response = await apiClient.post(`/recycler/intake/${loadId}/weigh-out`, { scaleId });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Tare weigh-out completed & net weight verified!');
      queryClient.invalidateQueries({ queryKey: ['recycler-loads'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-inventory'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record tare weigh-out.');
    },
  });
};

export const useRecyclerInventory = () => {
  return useQuery({
    queryKey: ['recycler-inventory'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WarehouseInventoryDto[] }>('/recycler/inventory');
      return response.data.data;
    },
  });
};

export const useRecyclerBatches = (status?: string) => {
  return useQuery({
    queryKey: ['recycler-batches', status],
    queryFn: async () => {
      const url = status ? `/recycler/inventory/batches?status=${status}` : '/recycler/inventory/batches';
      const response = await apiClient.get<{ data: MaterialBatchDto[] }>(url);
      return response.data.data;
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { categoryId: string; weightKg: number; warehouseLocation?: string; loadId?: string }) => {
      const response = await apiClient.post<{ data: any }>('/recycler/inventory/batches', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Traceable material lot batch created & warehouse stock updated!');
      queryClient.invalidateQueries({ queryKey: ['recycler-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-batches'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create material lot batch.');
    },
  });
};

export const useRecyclerQueue = (status?: string) => {
  return useQuery({
    queryKey: ['recycler-queue', status],
    queryFn: async () => {
      const url = status ? `/recycler/processing/queue?status=${status}` : '/recycler/processing/queue';
      const response = await apiClient.get<{ data: ProcessingQueueItemDto[] }>(url);
      return response.data.data;
    },
    refetchInterval: 5000, // 5s refresh for active manufacturing shop-floor lines
  });
};

export const useStartProcessing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { batchId: string; machineId: string; processStage: string; inputWeightKg: number }) => {
      const response = await apiClient.post('/recycler/processing/start', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Shop-floor manufacturing machine process started!');
      queryClient.invalidateQueries({ queryKey: ['recycler-queue'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-batches'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start machine process.');
    },
  });
};

export const useCompleteProcessing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ queueId, data }: { queueId: string; data: { outputWeightKg: number; wasteLossKg: number } }) => {
      const response = await apiClient.post(`/recycler/processing/${queueId}/complete`, data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Machine process completed & yield / waste loss recorded!');
      queryClient.invalidateQueries({ queryKey: ['recycler-queue'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['recycler-batches'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete machine process.');
    },
  });
};

export const useRecyclerEsgReports = () => {
  return useQuery({
    queryKey: ['recycler-esg-reports'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EsgReportDto[] }>('/recycler/esg/reports');
      return response.data.data;
    },
  });
};

export const useRecyclerManifests = (loadId?: string) => {
  return useQuery({
    queryKey: ['recycler-manifests', loadId],
    queryFn: async () => {
      const url = loadId ? `/recycler/esg/manifests?loadId=${loadId}` : '/recycler/esg/manifests';
      const response = await apiClient.get<{ data: PdfManifestDto[] }>(url);
      return response.data.data;
    },
  });
};

export const useGenerateEsgReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reportingPeriod: string; startDate: string; endDate: string }) => {
      const response = await apiClient.post<{ data: EsgReportDto }>('/recycler/esg/generate', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('ESG Sustainability Report generated with carbon offset metrics!');
      queryClient.invalidateQueries({ queryKey: ['recycler-esg-reports'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate ESG report.');
    },
  });
};

export const useIssueManifest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { loadId?: string; esgReportId?: string; manifestType: string; issuedTo: string }) => {
      const response = await apiClient.post<{ data: PdfManifestDto }>('/recycler/esg/manifests/issue', data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Tamper-proof SHA-256 PDF manifest issued!');
      queryClient.invalidateQueries({ queryKey: ['recycler-manifests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to issue PDF manifest.');
    },
  });
};
