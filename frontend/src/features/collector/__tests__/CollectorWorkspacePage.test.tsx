import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollectorWorkspacePage } from '../pages/CollectorWorkspacePage';

const {
  mockAcceptJob,
  mockToggleStatus,
  mockUpdateLocation,
  mockArriveAtStop,
  mockCompleteJob,
  mockRequestPayout,
  mockSocketConnect,
  mockSocketDisconnect,
} = vi.hoisted(() => ({
  mockAcceptJob: vi.fn(),
  mockToggleStatus: vi.fn(),
  mockUpdateLocation: vi.fn(),
  mockArriveAtStop: vi.fn(),
  mockCompleteJob: vi.fn(),
  mockRequestPayout: vi.fn(),
  mockSocketConnect: vi.fn(),
  mockSocketDisconnect: vi.fn(),
}));

vi.mock('../api/collector.api', () => ({
  useCollectorDashboardStats: vi.fn(),
  useAvailableJobs: vi.fn(),
  useAcceptJob: () => ({ mutate: mockAcceptJob, isPending: false }),
  useUpdateLocation: () => ({ mutate: mockUpdateLocation, isPending: false }),
  useToggleOnlineStatus: () => ({ mutate: mockToggleStatus, isPending: false }),
  useAssignedRoute: vi.fn(),
  useArriveAtStop: () => ({ mutate: mockArriveAtStop, isPending: false }),
  useCompletePickupJob: () => ({ mutate: mockCompleteJob, isPending: false }),
  useCollectorPayoutsSummary: vi.fn(),
  useRequestInstantPayout: () => ({ mutate: mockRequestPayout, isPending: false }),
}));

vi.mock('../services/logistics-socket.service', () => ({
  logisticsSocketService: {
    connect: mockSocketConnect,
    disconnect: mockSocketDisconnect,
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  }),
}));

import {
  useCollectorDashboardStats,
  useAvailableJobs,
  useAssignedRoute,
  useCollectorPayoutsSummary,
} from '../api/collector.api';

describe('CollectorWorkspacePage & Tabs TDD Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useCollectorDashboardStats as any).mockReturnValue({
      data: {
        id: 'col-1',
        userId: 'usr-collector',
        vehicleType: 'Electric Eco-Van 3000',
        vehiclePlate: 'GREEN-77',
        maxCapacityKg: 1200,
        currentLat: 37.7749,
        currentLng: -122.4194,
        isOnline: true,
        rating: 4.9,
        totalCompleted: 142,
        totalEarnings: 3550.0,
        activeJob: {
          id: 'job-active-101',
          status: 'ARRIVED',
          estimatedWeightKg: 15.0,
          address: {
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            lat: 37.7749,
            lng: -122.4194,
          },
          user: {
            fullName: 'Homer Simpson',
            phone: '+15557321',
          },
        },
      },
      isLoading: false,
    });

    (useAvailableJobs as any).mockReturnValue({
      data: [
        {
          id: 'job-avail-201',
          userId: 'usr-201',
          status: 'PENDING',
          scheduledDate: '2026-07-10T10:00:00Z',
          estimatedWeightKg: 8.5,
          address: {
            street: '101 Cyber Way',
            city: 'SF',
            state: 'CA',
            lat: 37.78,
            lng: -122.41,
          },
          user: {
            fullName: 'Elon Green',
            phone: '+15559999',
          },
        },
      ],
      isLoading: false,
    });

    (useAssignedRoute as any).mockReturnValue({
      data: {
        collectorId: 'col-1',
        totalWaypoints: 2,
        totalDistanceKm: 14.2,
        totalDurationMin: 32,
        encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
        waypoints: [
          {
            pickupId: 'job-active-101',
            stopNumber: 1,
            status: 'ARRIVED',
            address: {
              street: '742 Evergreen Terrace',
              city: 'Springfield',
              state: 'IL',
              lat: 37.7749,
              lng: -122.4194,
            },
            estimatedWeightKg: 15.0,
            customerName: 'Homer Simpson',
            customerPhone: '+15557321',
          },
          {
            pickupId: 'job-next-102',
            stopNumber: 2,
            status: 'ASSIGNED',
            address: {
              street: '500 Solar Blvd',
              city: 'Springfield',
              state: 'IL',
              lat: 37.785,
              lng: -122.405,
            },
            estimatedWeightKg: 22.0,
            customerName: 'Lisa Simpson',
            customerPhone: '+15558888',
          },
        ],
      },
      isLoading: false,
    });

    (useCollectorPayoutsSummary as any).mockReturnValue({
      data: {
        totalEarnings: 3550.0,
        currentCashBalance: 185.5,
        instantPayoutsEnabled: true,
        bankAccountLast4: '8899',
        stripeConnectId: 'acct_1099GREEN',
        recentPayouts: [
          {
            id: 'po_111',
            amount: 150.0,
            status: 'COMPLETED',
            createdAt: '2026-07-05T14:00:00Z',
            referenceId: 'tr_connect_alpha',
          },
        ],
      },
      isLoading: false,
    });
  });

  it('should render workspace header, live GPS badge, and tab buttons', () => {
    render(<CollectorWorkspacePage />);
    expect(screen.getByText('Collector & Fleet Workspace')).toBeInTheDocument();
    expect(screen.getByText('LIVE FLEET GPS')).toBeInTheDocument();
    expect(screen.getByText('Fleet Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Polyline Route')).toBeInTheDocument();
    expect(screen.getByText('Stripe Payouts')).toBeInTheDocument();
  });

  it('should render Fleet Dashboard by default with vehicle info and nearby jobs', () => {
    render(<CollectorWorkspacePage />);
    expect(screen.getByText(/Vehicle: Electric Eco-Van 3000/i)).toBeInTheDocument();
    expect(screen.getByText(/GREEN-77/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3550.00/i)).toBeInTheDocument();
    expect(screen.getByText('742 Evergreen Terrace, Springfield, IL')).toBeInTheDocument();
    expect(screen.getByText('101 Cyber Way, SF')).toBeInTheDocument();
  });

  it('should trigger accept job mutation when Accept & Route button is clicked', () => {
    render(<CollectorWorkspacePage />);
    const acceptBtns = screen.getAllByText('⚡ Accept & Route');
    fireEvent.click(acceptBtns[0]);
    expect(mockAcceptJob).toHaveBeenCalledWith('job-avail-201');
  });

  it('should switch to Polyline Route tab and display navigation metrics', () => {
    render(<CollectorWorkspacePage />);
    const routeTabBtn = screen.getByText('Polyline Route');
    fireEvent.click(routeTabBtn);

    expect(screen.getByText('Optimized Polyline Navigation')).toBeInTheDocument();
    expect(screen.getByText('14.2 km')).toBeInTheDocument();
    expect(screen.getByText('32 min')).toBeInTheDocument();
    expect(screen.getByText('742 Evergreen Terrace, Springfield, IL')).toBeInTheDocument();
    expect(screen.getByText('500 Solar Blvd, Springfield, IL')).toBeInTheDocument();
  });

  it('should switch to Stripe Payouts tab and display cash balance and transfer history', () => {
    render(<CollectorWorkspacePage />);
    const payoutsTabBtn = screen.getByText('Stripe Payouts');
    fireEvent.click(payoutsTabBtn);

    expect(screen.getByText('Stripe Connect Instant Payouts')).toBeInTheDocument();
    expect(screen.getAllByText('$185.50').length).toBeGreaterThan(0);
    expect(screen.getByText(/Stripe Debit Card •••• 8899/i)).toBeInTheDocument();
    expect(screen.getByText('tr_connect_alpha')).toBeInTheDocument();
  });

  it('should open Geofence QR Scanner modal and validate Haversine distance proximity', async () => {
    render(<CollectorWorkspacePage />);
    // Click "Scan QR & Complete" on active job widget in dashboard
    const scanBtn = screen.getByText('📷 Scan QR & Complete');
    fireEvent.click(scanBtn);

    expect(await screen.findByText('Geofence QR Code Verification')).toBeInTheDocument();
    expect(screen.getByText(/Within Geofence/i)).toBeInTheDocument();
    expect(screen.getByText('742 Evergreen Terrace, Springfield')).toBeInTheDocument();

    // Verify submit button is enabled when within geofence and secret is present
    const submitBtn = screen.getByText('⚡ Verify & Complete Pickup');
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(mockCompleteJob).toHaveBeenCalledWith(
      {
        pickupId: 'job-active-101',
        dto: {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: 'secret-token-123',
          actualWeightKg: 5,
        },
      },
      expect.any(Object),
    );
  });
});
