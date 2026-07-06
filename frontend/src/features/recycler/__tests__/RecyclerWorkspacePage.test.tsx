import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecyclerWorkspacePage } from '../pages/RecyclerWorkspacePage';

const {
  mockCheckInLoad,
  mockRecordWeighIn,
  mockRecordInspection,
  mockRecordWeighOut,
  mockCreateBatch,
  mockStartProcessing,
  mockCompleteProcessing,
  mockGenerateEsgReport,
  mockIssueManifest,
} = vi.hoisted(() => ({
  mockCheckInLoad: vi.fn(),
  mockRecordWeighIn: vi.fn(),
  mockRecordInspection: vi.fn(),
  mockRecordWeighOut: vi.fn(),
  mockCreateBatch: vi.fn(),
  mockStartProcessing: vi.fn(),
  mockCompleteProcessing: vi.fn(),
  mockGenerateEsgReport: vi.fn(),
  mockIssueManifest: vi.fn(),
}));

vi.mock('../api/recycler.api', () => ({
  useRecyclerLoads: vi.fn(),
  useCheckInLoad: () => ({ mutate: mockCheckInLoad, isPending: false }),
  useRecordWeighIn: () => ({ mutate: mockRecordWeighIn, isPending: false }),
  useRecordInspection: () => ({ mutate: mockRecordInspection, isPending: false }),
  useRecordWeighOut: () => ({ mutate: mockRecordWeighOut, isPending: false }),
  useRecyclerInventory: vi.fn(),
  useRecyclerBatches: vi.fn(),
  useCreateBatch: () => ({ mutate: mockCreateBatch, isPending: false }),
  useRecyclerQueue: vi.fn(),
  useStartProcessing: () => ({ mutate: mockStartProcessing, isPending: false }),
  useCompleteProcessing: () => ({ mutate: mockCompleteProcessing, isPending: false }),
  useRecyclerEsgReports: vi.fn(),
  useRecyclerManifests: vi.fn(),
  useGenerateEsgReport: () => ({ mutate: mockGenerateEsgReport, isPending: false }),
  useIssueManifest: () => ({ mutate: mockIssueManifest, isPending: false }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  }),
}));

import {
  useRecyclerLoads,
  useRecyclerInventory,
  useRecyclerBatches,
  useRecyclerQueue,
  useRecyclerEsgReports,
  useRecyclerManifests,
} from '../api/recycler.api';

describe('RecyclerWorkspacePage & Portal TDD Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useRecyclerLoads as any).mockReturnValue({
      data: [
        {
          id: 'load-uuid-1',
          manifestNumber: 'LD-2026-0001',
          truckPlate: 'TRK-9988',
          driverName: 'John Collector',
          status: 'ARRIVED',
          scheduledArrival: new Date().toISOString(),
          actualArrival: new Date().toISOString(),
        },
        {
          id: 'load-uuid-2',
          manifestNumber: 'LD-2026-0002',
          truckPlate: 'ECO-1122',
          driverName: 'Alice Green',
          status: 'INSPECTING',
          scheduledArrival: new Date().toISOString(),
          actualArrival: new Date().toISOString(),
          scaleRecord: {
            id: 'scale-uuid-2',
            grossWeightKg: 14500,
            tareWeightKg: 0,
            netWeightKg: 0,
            weighInTimestamp: new Date().toISOString(),
            weighmasterName: 'Weighmaster Bob',
            digitalSeal: 'hmac-sha256-seal-sample',
          },
        },
      ],
      isLoading: false,
    });

    (useRecyclerInventory as any).mockReturnValue({
      data: [
        {
          id: 'inv-uuid-1',
          categoryId: 'cat-pet-1',
          totalWeightKg: 25000,
          availableWeightKg: 15000,
          allocatedWeightKg: 10000,
          averagePurity: 98.5,
          lastAuditedAt: new Date().toISOString(),
          category: { name: 'PET Plastics' },
        },
      ],
      isLoading: false,
    });

    (useRecyclerBatches as any).mockReturnValue({
      data: [
        {
          id: 'batch-uuid-1',
          batchNumber: 'BAT-2026-PET-001',
          categoryId: 'cat-pet-1',
          weightKg: 5000,
          purityPercent: 99.0,
          status: 'READY_FOR_PROCESSING',
          warehouseLocation: 'BAY-A1',
          createdAt: new Date().toISOString(),
          category: { name: 'PET Plastics' },
        },
      ],
      isLoading: false,
    });

    (useRecyclerQueue as any).mockReturnValue({
      data: [
        {
          id: 'queue-uuid-1',
          batchId: 'batch-uuid-1',
          machineId: 'SHREDDER-LINE-01',
          processStage: 'SHREDDING',
          status: 'IN_PROGRESS',
          inputWeightKg: 5000,
          batch: { batchNumber: 'BAT-2026-PET-001' },
        },
      ],
      isLoading: false,
    });

    (useRecyclerEsgReports as any).mockReturnValue({
      data: [
        {
          id: 'rep-uuid-1',
          reportNumber: 'ESG-2026-Q1',
          reportingPeriod: '2026-Q1',
          totalIntakeKg: 100000,
          totalProcessedKg: 96400,
          totalRecycledKg: 96400,
          landfillDiversionRate: 96.4,
          co2OffsetKg: 241000,
          energySavedKwh: 501200,
          waterSavedLiters: 1446000,
        },
      ],
      isLoading: false,
    });

    (useRecyclerManifests as any).mockReturnValue({
      data: [
        {
          id: 'man-uuid-1',
          manifestNumber: 'MAN-2026-9988',
          manifestType: 'ESG_COMPLIANCE_MANIFEST',
          fileUrl: 'https://cdn.trashhere.com/manifests/man-1.pdf',
          fileSizeBytes: 102400,
          sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          issuedTo: 'City EPA Compliance',
          issuedAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
  });

  it('1. Renders enterprise B2B header and navigation tabs', () => {
    render(<RecyclerWorkspacePage />);
    expect(screen.getByText(/Recycler Hub/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Weighbridge Intake/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Warehouse Stock & Lots/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shop-Floor Manufacturing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ESG & Legal Manifests/i })).toBeInTheDocument();
  });

  it('2. Renders Weighbridge Intake tab by default and displays active facility loads', () => {
    render(<RecyclerWorkspacePage />);
    expect(screen.getByText('LD-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('TRK-9988')).toBeInTheDocument();
    expect(screen.getByText('LD-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('14,500 kg')).toBeInTheDocument();
  });

  it('3. Triggers weigh-in mutation when clicking Weigh In Gross on arrived load', () => {
    render(<RecyclerWorkspacePage />);
    const weighInBtn = screen.getByText('Weigh In Gross');
    fireEvent.click(weighInBtn);
    expect(mockRecordWeighIn).toHaveBeenCalledWith({ loadId: 'load-uuid-1', scaleId: 'SCALE-01' });
  });

  it('4. Triggers weigh-out mutation when clicking Weigh Out Tare & Net on inspecting load', () => {
    render(<RecyclerWorkspacePage />);
    const weighOutBtn = screen.getByText('Weigh Out Tare & Net');
    fireEvent.click(weighOutBtn);
    expect(mockRecordWeighOut).toHaveBeenCalledWith({ loadId: 'load-uuid-2', scaleId: 'SCALE-01' });
  });

  it('5. Switches to Warehouse Stock & Lots tab and displays aggregated inventory and lot batches', () => {
    render(<RecyclerWorkspacePage />);
    fireEvent.click(screen.getByRole('button', { name: /Warehouse Stock & Lots/i }));

    expect(screen.getByText('25.0 Tons')).toBeInTheDocument();
    expect(screen.getByText('15.0 Tons')).toBeInTheDocument();
    expect(screen.getByText('10.0 Tons')).toBeInTheDocument();
    expect(screen.getByText('BAT-2026-PET-001')).toBeInTheDocument();
  });

  it('6. Switches to Shop-Floor Manufacturing tab and displays queue items with completion action', () => {
    render(<RecyclerWorkspacePage />);
    fireEvent.click(screen.getByRole('button', { name: /Shop-Floor Manufacturing/i }));

    expect(screen.getByText('SHREDDING')).toBeInTheDocument();
    expect(screen.getByText('SHREDDER-LINE-01')).toBeInTheDocument();
    expect(screen.getByText(/Complete Run & Record Yield/i)).toBeInTheDocument();
  });

  it('7. Switches to ESG & Legal Manifests tab and displays LCA metrics and SHA-256 PDF manifests', () => {
    render(<RecyclerWorkspacePage />);
    fireEvent.click(screen.getByRole('button', { name: /ESG & Legal Manifests/i }));

    expect(screen.getByText('96.4%')).toBeInTheDocument();
    expect(screen.getByText('241.0t')).toBeInTheDocument();
    expect(screen.getByText('MAN-2026-9988')).toBeInTheDocument();
    expect(screen.getByText(/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/i)).toBeInTheDocument();
  });
});
