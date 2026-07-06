import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardsStorePage } from '../RewardsStorePage';

const mockRedeem = vi.fn();

vi.mock('../../api/wallet.api', () => ({
  useRewards: vi.fn(),
  useMyVouchers: vi.fn(),
  useRedeemReward: () => ({
    mutate: mockRedeem,
    isPending: false,
  }),
  useWalletDashboard: vi.fn(),
}));

import { useRewards, useMyVouchers, useWalletDashboard } from '../../api/wallet.api';

describe('RewardsStorePage Component', () => {
  beforeEach(() => {
    mockRedeem.mockClear();
    (useWalletDashboard as any).mockReturnValue({
      data: { wallet: { pointsBalance: 500 } },
    });
    (useMyVouchers as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('should render catalog items and redeem button correctly', () => {
    (useRewards as any).mockReturnValue({
      data: [
        {
          id: 'reward-1',
          title: 'Whole Foods $10 Voucher',
          description: '$10 off your next organic grocery purchase',
          pointsCost: 400,
          partnerName: 'Whole Foods',
          discountValue: '$10 OFF',
        },
      ],
      isLoading: false,
    });

    render(<RewardsStorePage />);
    expect(screen.getByText('Whole Foods $10 Voucher')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();

    const redeemBtn = screen.getByRole('button', { name: /redeem/i });
    expect(redeemBtn).not.toBeDisabled();

    fireEvent.click(redeemBtn);
    expect(mockRedeem).toHaveBeenCalledWith({ rewardId: 'reward-1' });
  });

  it('should disable redeem button when points cost exceeds balance', () => {
    (useRewards as any).mockReturnValue({
      data: [
        {
          id: 'reward-2',
          title: 'Patagonia $50 Voucher',
          description: '$50 off eco gear',
          pointsCost: 1000,
          partnerName: 'Patagonia',
          discountValue: '$50 OFF',
        },
      ],
      isLoading: false,
    });

    render(<RewardsStorePage />);
    expect(screen.getByText('Patagonia $50 Voucher')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /need points/i });
    expect(btn).toBeDisabled();
  });
});
