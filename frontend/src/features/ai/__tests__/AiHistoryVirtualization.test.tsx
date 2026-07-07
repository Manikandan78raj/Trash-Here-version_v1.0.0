import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WasteDetectionDashboard } from '../components/WasteDetectionDashboard';
import * as aiQuery from '../hooks/useAiQuery';

vi.mock('../hooks/useAiQuery', () => ({
  usePredictionHistory: vi.fn(),
  useRealtimePrediction: vi.fn(),
  useRetryJob: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

describe('WasteDetectionDashboard Virtualization Suite (TDD)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    class MockResizeObserver {
      callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 400, height: 500, top: 0, left: 0, bottom: 500, right: 400, x: 0, y: 0, toJSON: () => {} },
              borderBoxSize: [{ inlineSize: 400, blockSize: 500 }],
              contentBoxSize: [{ inlineSize: 400, blockSize: 500 }],
            } as any,
          ],
          this as any,
        );
      }
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = MockResizeObserver as any;

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 50000 });
    Element.prototype.getBoundingClientRect = () => ({
      width: 400,
      height: 500,
      top: 0,
      left: 0,
      bottom: 500,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  it('should virtualize AI Scan History timeline for 400+ past predictions', async () => {
    const mockPredictions = Array.from({ length: 400 }, (_, i) => ({
      id: `pred-${i + 1}`,
      jobId: `job-uuid-${i + 1}`,
      recommendationText: `Analysis ${i + 1}`,
      recommendationType: 'MANUAL_SORTING_REQUIRED',
      rawPayload: '{"imageUrl": "/test.jpg"}',
      createdAt: new Date().toISOString(),
      contaminationRate: i % 10 === 0 ? 25 : 2,
      isContaminated: i % 10 === 0,
      co2SavedKg: 12.5,
      greenPointsEarned: 50,
      detectedObjects: [],
    }));

    vi.mocked(aiQuery.usePredictionHistory).mockReturnValue({
      data: mockPredictions,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <WasteDetectionDashboard onOpenScanner={vi.fn()} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Scan History Timeline')).toBeInTheDocument();
    });

    const historyItems = container.querySelectorAll('[data-testid="scan-history-item"], [data-index]');
    expect(historyItems.length).toBeGreaterThan(0);
    expect(historyItems.length).toBeLessThan(40);
  });
});
