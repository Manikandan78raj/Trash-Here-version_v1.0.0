import { QueryClient } from '@tanstack/react-query';

/**
 * Enterprise-tuned TanStack Query Client for Trash Here.
 * Configured for minimal network overhead, memory garbage collection, and responsive UI.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute before data is considered stale
      gcTime: 5 * 60 * 1000, // 5 minutes before unused cache garbage collected
      structuralSharing: true, // Preserve reference identity across refetches if data unchanged
      refetchOnWindowFocus: false, // Prevent unnecessary network requests on tab focus
      retry: (failureCount, error: any) => {
        // Do not retry client errors (400, 401, 403, 404)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
