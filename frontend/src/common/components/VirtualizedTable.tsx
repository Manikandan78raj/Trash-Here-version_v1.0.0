import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { clsx } from 'clsx';

export interface Column<T> {
  header: string | React.ReactNode;
  accessor: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: string;
  rowHeight?: number;
  className?: string;
  onRowClick?: (item: T) => void;
}

/**
 * High-performance virtualized table component powered by @tanstack/react-virtual.
 * Renders only visible rows in the DOM to handle 10,000+ items smoothly at 60 FPS.
 */
export function VirtualizedTable<T>({
  data,
  columns,
  height = '500px',
  rowHeight = 52,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    initialRect: { width: 800, height: typeof height === 'number' ? height : parseInt(height, 10) || 500 },
  });

  return (
    <div
      ref={parentRef}
      style={{ height, overflow: 'auto' }}
      className={clsx(
        'w-full border border-slate-800/80 rounded-2xl bg-slate-900/40 backdrop-blur-md shadow-inner custom-scrollbar relative',
        className,
      )}
    >
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={clsx(
                  'py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase select-none',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
          className="divide-y divide-slate-800/50"
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <tr
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick && onRowClick(item)}
                className={clsx(
                  'flex items-center transition-colors hover:bg-slate-800/40',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={clsx('py-3 px-4 text-sm text-slate-200 flex-1 truncate', col.className)}
                  >
                    {col.accessor(item, virtualRow.index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
