import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WarehouseInventoryMatrix } from '../components/WarehouseInventoryMatrix';
import { ManufacturingQueueBoard } from '../components/ManufacturingQueueBoard';
import * as recyclerApi from '../api/recycler.api';

vi.mock('../api/recycler.api', () => ({
  useRecyclerInventory: vi.fn(),
  useRecyclerBatches: vi.fn(),
  useRecyclerQueue: vi.fn(),
  useCreateBatch: vi.fn(() => ({ mutate: vi.fn() })),
  useStartProcessing: vi.fn(() => ({ mutate: vi.fn() })),
  useCompleteProcessing: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe('Recycler Tables Virtualization Suite (TDD)', () => {
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
              contentRect: { width: 1000, height: 500, top: 0, left: 0, bottom: 500, right: 1000, x: 0, y: 0, toJSON: () => {} },
              borderBoxSize: [{ inlineSize: 1000, blockSize: 500 }],
              contentBoxSize: [{ inlineSize: 1000, blockSize: 500 }],
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
      width: 1000,
      height: 500,
      top: 0,
      left: 0,
      bottom: 500,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  it('should virtualize WarehouseInventoryMatrix lot batches table', async () => {
    const mockBatches = Array.from({ length: 300 }, (_, i) => ({
      id: `batch-${i + 1}`,
      batchNumber: `LOT-2026-${1000 + i}`,
      categoryId: 'cat-pet-1',
      category: { name: 'PET Plastic Bottles' },
      weightKg: 5000 + i * 10,
      purityPercent: 98,
      warehouseLocation: `BAY-A${(i % 10) + 1}`,
      status: 'READY_FOR_SALE',
    }));

    vi.mocked(recyclerApi.useRecyclerInventory).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(recyclerApi.useRecyclerBatches).mockReturnValue({ data: mockBatches, isLoading: false } as any);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <WarehouseInventoryMatrix />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Traceable Material Lot Batches')).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('tbody tr, [data-index]');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(40);
  });

  it('should virtualize ManufacturingQueueBoard active queue list', async () => {
    const mockQueue = Array.from({ length: 200 }, (_, i) => ({
      id: `queue-${i + 1}`,
      machineId: `SHREDDER-LINE-${(i % 5) + 1}`,
      batchId: `batch-${i + 1}`,
      processStage: 'SHREDDING',
      status: i % 2 === 0 ? 'PROCESSING' : 'COMPLETED',
      inputWeightKg: 2000,
      outputWeightKg: 1950,
      wasteLossKg: 50,
      startTime: new Date().toISOString(),
    }));

    vi.mocked(recyclerApi.useRecyclerQueue).mockReturnValue({ data: mockQueue, isLoading: false } as any);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ManufacturingQueueBoard />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Shop-Floor Manufacturing Board')).toBeInTheDocument();
    });

    const items = container.querySelectorAll('[data-testid="queue-item"], [data-index]');
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(40);
  });
});
