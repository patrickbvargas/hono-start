import type { QueryClient } from "@tanstack/react-query";

export function clearAuthenticatedQueryCache(queryClient: QueryClient) {
	queryClient.clear();
}
