import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsPage } from '../pages/NotificationsPage';

const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockDelete = vi.fn();

vi.mock('../api/hub.api', () => ({
  useNotifications: vi.fn(),
  useMarkRead: () => ({ mutate: mockMarkRead, isPending: false }),
  useMarkAllRead: () => ({ mutate: mockMarkAllRead, isPending: false }),
  useDeleteNotification: () => ({ mutate: mockDelete, isPending: false }),
}));

vi.mock('../services/socket.service', () => ({
  socketService: {
    markReadSocket: vi.fn(),
  },
}));

import { useNotifications } from '../api/hub.api';

describe('NotificationsPage Component TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notification feed with unread indicators', () => {
    (useNotifications as any).mockReturnValue({
      data: {
        items: [
          {
            id: 'notif-1',
            title: 'Collector En Route',
            message: 'Driver Alex is approaching for pickup #8821.',
            category: 'PICKUP',
            priority: 'HIGH',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'notif-2',
            title: 'Reward Voucher Issued',
            message: 'You earned 500 points for organic waste recycling.',
            category: 'REWARD',
            priority: 'NORMAL',
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
    });

    render(<NotificationsPage />);
    expect(screen.getByText('Notification Center')).toBeInTheDocument();
    expect(screen.getByText('Collector En Route')).toBeInTheDocument();
    expect(screen.getByText('Reward Voucher Issued')).toBeInTheDocument();
  });

  it('should trigger mark all as read when button is clicked', () => {
    (useNotifications as any).mockReturnValue({
      data: {
        items: [
          {
            id: 'notif-1',
            title: 'Test Alert',
            message: 'Unread alert',
            category: 'SYSTEM',
            priority: 'NORMAL',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
    });

    render(<NotificationsPage />);
    const markAllBtn = screen.getByRole('button', { name: /Mark All As Read/i });
    fireEvent.click(markAllBtn);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('should render empty state when no notifications match filter', () => {
    (useNotifications as any).mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
    });

    render(<NotificationsPage />);
    expect(screen.getByText('No Notifications Found')).toBeInTheDocument();
  });
});
