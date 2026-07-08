import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuditLogPage } from '../components/AdminAuditLogPage';
import * as adminApi from '../api/admin.api';

vi.mock('../api/admin.api', () => ({
  useAdminAuditLogs: vi.fn(),
  useAdminStartImpersonation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('AdminAuditLogPage Virtualization Suite (TDD)', () => {
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
              contentRect: {
                width: 1000,
                height: 600,
                top: 0,
                left: 0,
                bottom: 600,
                right: 1000,
                x: 0,
                y: 0,
                toJSON: () => {},
              },
              borderBoxSize: [{ inlineSize: 1000, blockSize: 600 }],
              contentBoxSize: [{ inlineSize: 1000, blockSize: 600 }],
            } as any,
          ],
          this as any,
        );
      }
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = MockResizeObserver as any;

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 60000,
    });
    Element.prototype.getBoundingClientRect = () => ({
      width: 1000,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  it('should virtualize 500+ audit logs and render only visible rows in DOM', async () => {
    const mockLogs = Array.from({ length: 500 }, (_, i) => ({
      id: `log-${i + 1}`,
      timestamp: new Date().toISOString(),
      actorId: `admin-${i + 1}@trashhere.com`,
      action: 'UPDATE_SYSTEM_CONFIG',
      entity: 'SystemConfig',
      entityId: `cfg-${i + 1}`,
      oldValue: 'false',
      newValue: 'true',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
      severity: i % 5 === 0 ? 'CRITICAL' : 'INFO',
    }));

    vi.mocked(adminApi.useAdminAuditLogs).mockReturnValue({
      data: mockLogs,
      isLoading: false,
    } as any);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AdminAuditLogPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Immutable Security Audit Ledger')).toBeInTheDocument();
    });

    // Check that we virtualized the rows: out of 500 logs, only a fraction should be in the DOM
    const logItems = container.querySelectorAll(
      '[data-testid="audit-log-row"], tbody tr, [data-index]',
    );
    expect(logItems.length).toBeGreaterThan(0);
    expect(logItems.length).toBeLessThan(50);
  });
});
