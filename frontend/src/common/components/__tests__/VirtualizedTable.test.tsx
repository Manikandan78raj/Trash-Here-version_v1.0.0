import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualizedTable } from '../VirtualizedTable';

interface TestItem {
  id: number;
  name: string;
  status: string;
}

describe('VirtualizedTable Component (TDD Suite)', () => {
  beforeEach(() => {
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
              contentRect: { width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800, x: 0, y: 0, toJSON: () => {} },
              borderBoxSize: [{ inlineSize: 800, blockSize: 400 }],
              contentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
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
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 40000,
    });
    Element.prototype.getBoundingClientRect = () => ({
      width: 800,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  const mockData: TestItem[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'ACTIVE' : 'PENDING',
  }));

  const columns = [
    { header: 'ID', accessor: (item: TestItem) => item.id },
    { header: 'Name', accessor: (item: TestItem) => item.name },
    { header: 'Status', accessor: (item: TestItem) => item.status },
  ];

  it('should render table headers correctly', () => {
    render(<VirtualizedTable data={mockData} columns={columns} height="400px" rowHeight={40} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should virtualize rows and only render visible DOM nodes out of 1000 items', () => {
    const { container } = render(<VirtualizedTable data={mockData} columns={columns} height="400px" rowHeight={40} />);
    // With 400px height and 40px rowHeight, only ~10-20 rows should be rendered in the DOM, NOT 1000
    const renderedRows = container.querySelectorAll('tbody tr');
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(50);
  });
});
