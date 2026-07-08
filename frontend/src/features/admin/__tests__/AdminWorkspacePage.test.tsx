import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminWorkspacePage } from '../pages/AdminWorkspacePage';

const {
  mockReassignRoute,
  mockReconcileLedgers,
  mockStartImpersonation,
  mockStopImpersonation,
  mockUpdateConfig,
} = vi.hoisted(() => ({
  mockReassignRoute: vi.fn(),
  mockReconcileLedgers: vi.fn(),
  mockStartImpersonation: vi.fn(),
  mockStopImpersonation: vi.fn(),
  mockUpdateConfig: vi.fn(),
}));

vi.mock('../api/admin.api', () => ({
  useAdminFleetMap: vi.fn(),
  useAdminPnL: vi.fn(),
  useAdminAuditLogs: vi.fn(),
  useAdminConfigs: vi.fn(),
  useAdminReassignRoute: () => ({ mutate: mockReassignRoute, isPending: false }),
  useAdminReconcileLedgers: () => ({ mutate: mockReconcileLedgers, isPending: false }),
  useAdminStartImpersonation: () => ({ mutate: mockStartImpersonation, isPending: false }),
  useAdminStopImpersonation: () => ({ mutate: mockStopImpersonation, isPending: false }),
  useAdminUpdateConfig: () => ({ mutate: mockUpdateConfig, isPending: false }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  }),
}));

import {
  useAdminFleetMap,
  useAdminPnL,
  useAdminAuditLogs,
  useAdminConfigs,
} from '../api/admin.api';

describe('AdminWorkspacePage & Tabs TDD Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAdminFleetMap as any).mockReturnValue({
      data: {
        activeCollectors: [
          {
            id: 'col-fleet-1',
            userId: 'usr-col-1',
            fullName: 'Alex EcoDriver',
            phone: '+15550192',
            vehicleType: 'Electric Van',
            vehiclePlate: 'GREEN-01',
            capacityKg: 1000,
            currentLat: 37.7749,
            currentLng: -122.4194,
            isOnline: true,
            rating: 4.9,
            activeJobsCount: 1,
          },
        ],
        unassignedJobsCount: 3,
        inProgressJobsCount: 5,
        completedTodayCount: 42,
        timestamp: '2026-07-07T00:00:00Z',
      },
      isLoading: false,
    });

    (useAdminPnL as any).mockReturnValue({
      data: {
        periodStart: '2026-01-01T00:00:00Z',
        periodEnd: '2026-12-31T23:59:59Z',
        grossRevenueUsd: 15500.0,
        stripePaymentsUsd: 5500.0,
        recyclerInvoicesUsd: 10000.0,
        collectorPayoutsUsd: 4200.0,
        rewardsLiabilitiesUsd: 300.0,
        netMarginUsd: 11000.0,
        currency: 'USD',
        calculatedAt: '2026-07-07T00:00:00Z',
      },
      isLoading: false,
    });

    (useAdminAuditLogs as any).mockReturnValue({
      data: [
        {
          id: 'audit-1',
          actorId: 'usr-admin-default',
          action: 'DISPATCH_REASSIGNED',
          entity: 'PickupRequest',
          entityId: 'pickup-101',
          oldValue: 'col-old',
          newValue: 'col-new',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Chrome',
          severity: 'WARNING',
          timestamp: '2026-07-07T00:10:00Z',
        },
        {
          id: 'audit-2',
          actorId: 'usr-anon',
          action: 'LOGIN_FAILED_MULTIPLE',
          entity: 'User',
          entityId: 'usr-target',
          ipAddress: '10.0.0.99',
          userAgent: 'Python-urllib',
          severity: 'CRITICAL',
          timestamp: '2026-07-07T00:05:00Z',
        },
      ],
      isLoading: false,
    });

    (useAdminConfigs as any).mockReturnValue({
      data: [
        {
          id: 'cfg-1',
          key: 'BASE_PICKUP_FEE_USD',
          value: '4.99',
          description: 'Base fee charged to users for scheduled pickups',
          updatedBy: 'usr-admin-default',
          updatedAt: '2026-07-01T12:00:00Z',
        },
        {
          id: 'cfg-2',
          key: 'GREEN_POINT_VALUE_USD',
          value: '0.01',
          description: 'Redemption liability value per green point',
          updatedBy: 'usr-admin-default',
          updatedAt: '2026-07-01T12:00:00Z',
        },
      ],
      isLoading: false,
    });
  });

  it('1. should render Admin Workspace header, system health indicator, and tab navigation', () => {
    render(<AdminWorkspacePage />);

    expect(screen.getByText(/Enterprise Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/SOC 2 Type II Certified/i)).toBeInTheDocument();
    expect(screen.getByText(/System Health: Optimal/i)).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /Fleet & Dispatch Map/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Financial P&L & Ledgers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Audit Logs & Security/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Platform Configuration/i })).toBeInTheDocument();
  });

  it('2. should display Live Fleet Map by default with collector status cards and active dispatch counts', () => {
    render(<AdminWorkspacePage />);

    expect(screen.getByText(/Live Fleet Telemetry & Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex EcoDriver/i)).toBeInTheDocument();
    expect(screen.getByText(/GREEN-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Unassigned Jobs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/3/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
    expect(screen.getAllByText(/5/i).length).toBeGreaterThan(0);
  });

  it('3. should allow dispatcher to trigger manual route reassignment', () => {
    render(<AdminWorkspacePage />);

    const reassignBtn = screen.getByRole('button', { name: /Reassign Route/i });
    fireEvent.click(reassignBtn);

    const inputJobId = screen.getByPlaceholderText(/e.g. pickup-job-101/i);
    const inputColId = screen.getByPlaceholderText(/e.g. col-fleet-2/i);
    const inputReason = screen.getByPlaceholderText(/e.g. Vehicle breakdown/i);

    fireEvent.change(inputJobId, { target: { value: 'pickup-job-101' } });
    fireEvent.change(inputColId, { target: { value: 'col-fleet-2' } });
    fireEvent.change(inputReason, { target: { value: 'Driver requested emergency break' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Reassignment/i });
    fireEvent.click(confirmBtn);

    expect(mockReassignRoute).toHaveBeenCalledWith(
      {
        pickupRequestId: 'pickup-job-101',
        newCollectorId: 'col-fleet-2',
        reason: 'Driver requested emergency break',
      },
      expect.any(Object),
    );
  });

  it('4. should switch to Financial P&L tab and display Stripe captures, recycler invoices, and net margin', () => {
    render(<AdminWorkspacePage />);

    const pnlTab = screen.getByRole('tab', { name: /Financial P&L & Ledgers/i });
    fireEvent.click(pnlTab);

    expect(screen.getByText(/Stripe Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5,500\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Recycler B2B Invoices/i)).toBeInTheDocument();
    expect(screen.getByText(/\$10,000\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Collector Payouts/i)).toBeInTheDocument();
    expect(screen.getByText(/\$4,200\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Margin/i)).toBeInTheDocument();
    expect(screen.getByText(/\$11,000\.00/i)).toBeInTheDocument();
  });

  it('5. should trigger ledger reconciliation when clicking Reconcile Ledgers button', () => {
    render(<AdminWorkspacePage />);

    const pnlTab = screen.getByRole('tab', { name: /Financial P&L & Ledgers/i });
    fireEvent.click(pnlTab);

    const reconcileBtn = screen.getByRole('button', { name: /Reconcile Ledgers/i });
    fireEvent.click(reconcileBtn);

    expect(mockReconcileLedgers).toHaveBeenCalled();
  });

  it('6. should switch to Audit Logs & Security tab and display immutable events with severity badges', () => {
    render(<AdminWorkspacePage />);

    const auditTab = screen.getByRole('tab', { name: /Audit Logs & Security/i });
    fireEvent.click(auditTab);

    expect(screen.getByText(/Immutable Security Audit Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/DISPATCH_REASSIGNED/i)).toBeInTheDocument();
    expect(screen.getByText(/LOGIN_FAILED_MULTIPLE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CRITICAL/i).length).toBeGreaterThan(0);
  });

  it('7. should open Support Impersonation modal, validate reason, and trigger startImpersonation mutation', () => {
    render(<AdminWorkspacePage />);

    const auditTab = screen.getByRole('tab', { name: /Audit Logs & Security/i });
    fireEvent.click(auditTab);

    const impersonateBtn = screen.getByRole('button', { name: /Launch Impersonation/i });
    fireEvent.click(impersonateBtn);

    const inputUserId = screen.getByPlaceholderText(/e.g. usr-household-123/i);
    const inputReason = screen.getByPlaceholderText(
      /e.g. Ticket #4012 - Debugging wallet balance/i,
    );

    fireEvent.change(inputUserId, { target: { value: 'usr-household-123' } });
    fireEvent.change(inputReason, { target: { value: 'Ticket #4012 - Debugging wallet balance' } });

    const startBtn = screen.getByRole('button', { name: /Start Secure Session/i });
    fireEvent.click(startBtn);

    expect(mockStartImpersonation).toHaveBeenCalledWith(
      {
        targetUserId: 'usr-household-123',
        reason: 'Ticket #4012 - Debugging wallet balance',
      },
      expect.any(Object),
    );
  });

  it('8. should switch to Platform Configuration tab and trigger updateConfig mutation when editing economic parameters', () => {
    render(<AdminWorkspacePage />);

    const configTab = screen.getByRole('tab', { name: /Platform Configuration/i });
    fireEvent.click(configTab);

    expect(screen.getByText(/Dynamic Platform Economic Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/BASE_PICKUP_FEE_USD/i)).toBeInTheDocument();

    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editBtns[0]);

    const inputVal = screen.getByDisplayValue('4.99');
    fireEvent.change(inputVal, { target: { value: '5.49' } });

    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(mockUpdateConfig).toHaveBeenCalledWith(
      {
        key: 'BASE_PICKUP_FEE_USD',
        value: '5.49',
        description: 'Base fee charged to users for scheduled pickups',
      },
      expect.any(Object),
    );
  });
});
