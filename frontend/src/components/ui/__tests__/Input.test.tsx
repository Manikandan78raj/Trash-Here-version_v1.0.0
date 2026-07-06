import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input Component', () => {
  it('should render input field correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle user input change', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe('Hello World');
  });

  it('should render error text and error border when error is true', () => {
    render(<Input error errorText="Required field" placeholder="Email" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toHaveClass('border-destructive');
  });

  it('should render helper text when provided without errorText', () => {
    render(<Input helperText="We never share your email" placeholder="Email" />);
    expect(screen.getByText('We never share your email')).toBeInTheDocument();
  });

  it('should render left and right icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">$</span>}
        rightIcon={<span data-testid="right-icon">✔</span>}
        placeholder="Amount"
      />,
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
