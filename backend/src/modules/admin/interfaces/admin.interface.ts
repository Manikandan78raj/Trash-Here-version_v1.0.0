import { RoleType, DispatchStatus } from '@prisma/client';

export interface AuditEvent {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface SecurityAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface IAdminAuditProvider {
  recordAudit(event: AuditEvent): Promise<void>;
  triggerAlert(alert: SecurityAlert): Promise<boolean>;
}

export interface DispatchScoreInput {
  collectorId: string;
  currentLat: number;
  currentLng: number;
  rating: number;
  isAvailable: boolean;
  maxCapacityKg: number;
  currentLoadKg: number;
  pickupLat: number;
  pickupLng: number;
  estimatedWeightKg: number;
}

export interface DispatchScoreResult {
  collectorId: string;
  score: number;
  distanceKm: number;
  estimatedEtaMinutes: number;
  isEligible: boolean;
  rejectionReason?: string;
}

export interface IAdminDispatchProvider {
  calculateScore(input: DispatchScoreInput): DispatchScoreResult;
  broadcastOffer(orderId: string, collectorId: string): Promise<boolean>;
}

export interface PnLSnapshot {
  period: string;
  grossRevenueUsd: number;
  stripePaymentsUsd: number;
  recyclerInvoicesUsd: number;
  collectorPayoutsUsd: number;
  rewardsLiabilitiesUsd: number;
  netMarginUsd: number;
  totalTransactions: number;
  reconciledAt: Date;
}

export interface IAdminFinanceProvider {
  calculatePnL(startDate: Date, endDate: Date): Promise<PnLSnapshot>;
  reconcileLedgers(): Promise<{ success: boolean; discrepanciesFound: number; details: string[] }>;
}
