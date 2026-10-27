import {
	useQuery,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getAuditHistoryQueryOptions,
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogByIdQueryOptions,
	getAuditLogEntityTypesQueryOptions,
	getAuditLogsQueryOptions,
} from "../api/queries";
import type { AuditHistory, AuditLogSearch } from "../schemas/search";

export function useAuditLogs(search: AuditLogSearch) {
	const { data: auditLogs } = useSuspenseQuery(
		getAuditLogsQueryOptions(search),
	);

	return { auditLogs };
}

export function useAuditLog(id: EntityId) {
	const { data: auditLog } = useSuspenseQuery(getAuditLogByIdQueryOptions(id));

	return { auditLog };
}

export function useAuditLogOptions() {
	const [{ data: actions }, { data: entityTypes }, { data: actors }] =
		useSuspenseQueries({
			queries: [
				getAuditLogActionsQueryOptions(),
				getAuditLogEntityTypesQueryOptions(),
				getAuditLogActorsQueryOptions(),
			],
		});

	return { actions, entityTypes, actors };
}

export function useAuditHistoryData(scope: AuditHistory) {
	const query = useQuery(getAuditHistoryQueryOptions(scope));
	return {
		auditLogs: query.data,
		isPending: query.isPending,
		error: query.error,
		retry: query.refetch,
	};
}
