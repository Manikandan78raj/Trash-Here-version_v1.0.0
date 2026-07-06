import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WelcomeBanner } from '../WelcomeBanner';

vi.mock('../../api/household.api', () => ({
  useUserProfile: vi.fn(),
  useEcoScore: vi.fn(),
}));

import { useUserProfile, useEcoScore } from '../../api/household.api';

describe('WelcomeBanner Component', () => {
  it('should render loading skeleton when isLoading is true', () => {
    (useUserProfile as any).mockReturnValue({ isLoading: true, data: null, isError: false });
    (useEcoScore as any).mockReturnValue({ isLoading: true, data: null, isError: false });

    const { container } = render(<WelcomeBanner />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render error state when isError is true and handle retry', () => {
    const refetchProfile = vi.fn();
    const refetchEco = vi.fn();
    (useUserProfile as any).mockReturnValue({
      isLoading: false,
      data: null,
      isError: true,
      refetch: refetchProfile,
    });
    (useEcoScore as any).mockReturnValue({
      isLoading: false,
      data: null,
      isError: true,
      refetch: refetchEco,
    });

    render(<WelcomeBanner />);
    expect(screen.getByText('Unable to load profile data')).toBeInTheDocument();

    const retryBtn = screen.getByText('Retry Connection');
    fireEvent.click(retryBtn);
    expect(refetchProfile).toHaveBeenCalled();
    expect(refetchEco).toHaveBeenCalled();
  });

  it('should render user profile and tier level correctly when loaded', () => {
    (useUserProfile as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { id: 'user-12345678', fullName: 'Alice Smith' },
    });
    (useEcoScore as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { tierLevel: 'Planet Protector' },
    });

    render(<WelcomeBanner />);
    expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Planet Protector')).toBeInTheDocument();
  });
});
