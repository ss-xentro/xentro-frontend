'use client';

import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
	if (!queryClient) {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					// Data is considered fresh for 30s — no refetch within this window
					staleTime: 30_000,
					// Keep unused data in cache for 5 minutes before GC
					gcTime: 5 * 60_000,
					// Refetch when browser tab regains focus
					refetchOnWindowFocus: true,
					// Refetch when network reconnects
					refetchOnReconnect: true,
					// Don't refetch when component remounts if data is fresh
					refetchOnMount: true,
					// Retry once on failure
					retry: 1,
					retryDelay: 1000,
				},
				mutations: {
					retry: 0,
				},
			},
		});
	}
	return queryClient;
}
