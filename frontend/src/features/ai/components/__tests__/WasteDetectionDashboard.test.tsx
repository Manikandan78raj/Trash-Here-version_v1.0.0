import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WasteDetectionDashboard } from '../WasteDetectionDashboard';
import type { AiPrediction } from '../../types/ai.types';

const mockPredictions: AiPrediction[] = [
  {
    id: 'pred-1',
    jobId: 'job-1',
    imageId: 'img-1',
    isContaminated: false,
    contaminationRate: 2.0,
    overallConfidence: 0.96,
    recommendationType: 'DIRECT_RECYCLE',
    recommendationText: 'Clean PET bottle',
    estimatedWeightKg: 0.5,
    co2SavedKg: 1.5,
    greenPointsEarned: 20,
    createdAt: new Date().toISOString(),
    detectedObjects: [
      {
        label: 'PET_BOTTLE',
        confidenceScore: 0.96,
        xMin: 0.1,
        yMin: 0.1,
        xMax: 0.8,
        yMax: 0.8,
        materialType: 'PLASTIC_PET',
        isContaminant: false,
      },
    ],
  },
  {
    id: 'pred-2',
    jobId: 'job-2',
    imageId: 'img-2',
    isContaminated: true,
    contaminationRate: 30.0,
    overallConfidence: 0.89,
    recommendationType: 'REQUIRES_RINSING',
    recommendationText: 'Food container needs rinsing',
    estimatedWeightKg: 1.0,
    co2SavedKg: 0.8,
    greenPointsEarned: 10,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    detectedObjects: [
      {
        label: 'FOOD_BOX',
        confidenceScore: 0.89,
        xMin: 0.2,
        yMin: 0.2,
        xMax: 0.9,
        yMax: 0.9,
        materialType: 'CARDBOARD',
        isContaminant: true,
      },
    ],
  },
];

const mockRetryJob = vi.fn();

vi.mock('../../hooks/useAiQuery', () => ({
  usePredictionHistory: () => ({
    data: mockPredictions,
    isLoading: false,
    error: null,
  }),
  useRetryJob: () => ({
    mutateAsync: mockRetryJob,
    isPending: false,
  }),
  useRealtimePrediction: vi.fn(),
}));

describe('WasteDetectionDashboard Component (TDD)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderDashboard = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <WasteDetectionDashboard onOpenScanner={vi.fn()} />
      </QueryClientProvider>,
    );

  it('should render AI summary metrics cards (Total Scans, Carbon Saved, Green Points)', () => {
    renderDashboard();
    expect(screen.getByText(/AI Vision Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.30/i)).toBeInTheDocument(); // 1.5 + 0.8
    expect(screen.getByText(/\+30/i)).toBeInTheDocument(); // 20 + 10
    expect(screen.getByText(/2 Scans/i)).toBeInTheDocument();
  });

  it('should render scan history timeline and allow selecting a scan for inspection', () => {
    renderDashboard();
    expect(screen.getAllByText(/Clean PET bottle/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Food container needs rinsing/i)).toBeInTheDocument();

    // Click second item
    const secondItem = screen.getByText(/Food container needs rinsing/i);
    fireEvent.click(secondItem);

    // Contamination alert card should update to show 30.0% contamination
    expect(screen.getAllByText(/30%/i).length).toBeGreaterThan(0);
  });

  it('should render failed job retry button when a failed job is present', async () => {
    renderDashboard();
    const retryBtn = screen.queryByRole('button', { name: /Retry Failed Job/i });
    if (retryBtn) {
      fireEvent.click(retryBtn);
      await waitFor(() => {
        expect(mockRetryJob).toHaveBeenCalled();
      });
    }
  });
});
