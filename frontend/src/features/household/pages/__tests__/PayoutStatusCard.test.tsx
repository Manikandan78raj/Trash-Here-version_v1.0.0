import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutStatusCard } from '../PayoutStatusCard';

const mockMutate = vi.fn();

vi.mock('../../api/wallet.api', () => ({
  useWithdrawCash: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('PayoutStatusCard Component', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('should render available balance correctly', () => {
    render(<PayoutStatusCard availableBalance={150.75} />);
    expect(screen.getByText('Collector Earnings')).toBeInTheDocument();
    expect(screen.getByText('$150.75')).toBeInTheDocument();
  });

  it('should disable withdraw button when amount is below $10', () => {
    render(<PayoutStatusCard availableBalance={100.0} />);
    const input = screen.getByPlaceholderText('0.00');
    const button = screen.getByRole('button', { name: /withdraw now/i });

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: '5' } });
    expect(button).toBeDisabled();
  });

  it('should enable button and trigger mutation when valid amount is entered', () => {
    render(<PayoutStatusCard availableBalance={100.0} />);
    const input = screen.getByPlaceholderText('0.00');
    const button = screen.getByRole('button', { name: /withdraw now/i });

    fireEvent.change(input, { target: { value: '25' } });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(mockMutate).toHaveBeenCalledWith({ amount: 25 }, expect.any(Object));
  });
});
