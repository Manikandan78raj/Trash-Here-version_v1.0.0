import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OptimizedImage } from '../OptimizedImage';

describe('OptimizedImage Component (TDD Suite)', () => {
  it('should render image with loading="lazy" and decoding="async" by default', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test Image" width={800} height={600} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('should render eager loading and high fetchpriority when priority is true (e.g. for hero images)', () => {
    render(<OptimizedImage src="/hero.webp" alt="Hero Image" priority width={1200} height={800} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('should generate responsive srcSet when srcSet is provided or responsive is true', () => {
    render(<OptimizedImage src="/photo.webp" alt="Responsive Photo" responsive width={800} height={600} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('srcset');
  });
});
