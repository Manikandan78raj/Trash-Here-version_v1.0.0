import { describe, it, expect } from 'vitest';
import { queryClient } from '../queryClient';

describe('TanStack Query Global Optimization Suite (TDD)', () => {
  it('should configure queries with optimal staleTime and gcTime', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(60 * 1000); // 1 minute stale time
    expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000); // 5 minutes garbage collection time
  });

  it('should enable structuralSharing to eliminate unnecessary component re-renders', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.structuralSharing).toBe(true);
  });

  it('should disable refetchOnWindowFocus by default to save network bandwidth', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('should implement an exponential backoff retry policy capping retries at 2', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const retryPolicy = defaultOptions.queries?.retry;
    expect(typeof retryPolicy).toBe('function');
    if (typeof retryPolicy === 'function') {
      expect(retryPolicy(1, new Error('Network error'))).toBe(true);
      expect(retryPolicy(2, new Error('Network error'))).toBe(false);
      // Do not retry on 401/403/404 HTTP errors
      const notFoundError = { status: 404, message: 'Not Found' } as any;
      expect(retryPolicy(1, notFoundError)).toBe(false);
    }
  });
});
