import type { QueryClient } from "@tanstack/react-query";
import { refreshEntityQueries } from "@/shared/lib/entity-management";
import { auditLogKeys } from "../api/queries";

export async function refreshAuditLogQueries(queryClient: QueryClient) {
	await refreshEntityQueries(queryClient, auditLogKeys.all);
}

export async function refreshAuditedEntityQueries(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
) {
	await Promise.all([
		refreshEntityQueries(queryClient, queryKey),
		refreshAuditLogQueries(queryClient),
	]);
}
