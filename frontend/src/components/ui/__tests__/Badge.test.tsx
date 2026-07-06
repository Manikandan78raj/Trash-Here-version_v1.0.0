import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('should render badge text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render success variant correctly', () => {
    const { container } = render(<Badge variant="success">Completed</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-500/10');
  });

  it('should render warning variant correctly', () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    expect(container.firstChild).toHaveClass('bg-amber-500/10');
  });
});
