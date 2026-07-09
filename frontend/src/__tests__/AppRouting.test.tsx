import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock AppLayout to avoid complex auth & navigation tree rendering in routing test
vi.mock('@/common/layouts/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock feature workspace pages to verify route-level code splitting & lazy loading
vi.mock('@/features/recycler/pages/RecyclerWorkspacePage', () => ({
  RecyclerWorkspacePage: () => (
    <div data-testid="recycler-workspace">Recycler Workspace Loaded</div>
  ),
}));

vi.mock('@/features/admin/pages/AdminWorkspacePage', () => ({
  AdminWorkspacePage: () => <div data-testid="admin-workspace">Admin Workspace Loaded</div>,
}));

vi.mock('@/features/ai/pages/AiWorkspacePage', () => ({
  AiWorkspacePage: () => <div data-testid="ai-workspace">AI Workspace Loaded</div>,
}));

vi.mock('@/features/collector/pages/CollectorWorkspacePage', () => ({
  CollectorWorkspacePage: () => (
    <div data-testid="collector-workspace">Collector Workspace Loaded</div>
  ),
}));

vi.mock('@/common/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'test-usr', email: 'test@trashhere.com', role: 'ADMIN', fullName: 'Test Admin' },
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

const renderWithProviders = (initialRoute: string) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('App Route-Level Code Splitting & Lazy Loading (TDD)', () => {
  it('should lazy load and render CollectorWorkspacePage on /collector route', async () => {
    renderWithProviders('/collector');
    await waitFor(() => {
      expect(screen.getByTestId('collector-workspace')).toBeInTheDocument();
    });
  });

  it('should lazy load and render RecyclerWorkspacePage on /recycler route', async () => {
    renderWithProviders('/recycler');
    await waitFor(() => {
      expect(screen.getByTestId('recycler-workspace')).toBeInTheDocument();
    });
  });

  it('should lazy load and render AdminWorkspacePage on /admin route', async () => {
    renderWithProviders('/admin');
    await waitFor(() => {
      expect(screen.getByTestId('admin-workspace')).toBeInTheDocument();
    });
  });

  it('should lazy load and render AiWorkspacePage on /ai route', async () => {
    renderWithProviders('/ai');
    await waitFor(() => {
      expect(screen.getByTestId('ai-workspace')).toBeInTheDocument();
    });
  });
});
