import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance for @parakh/mobile.
 *
 * Configured for stale-while-revalidate caching:
 *   · staleTime: 3 minutes (UI renders cached data instantly while refetching in background)
 *   · gcTime: 15 minutes (inactive screens retain memory cache for quick re-entry)
 *   · retry: 2 retries on network failures
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 15,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
