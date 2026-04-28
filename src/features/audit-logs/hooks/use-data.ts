import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogEntityTypesQueryOptions,
	getAuditLogsQueryOptions,
} from "../api/queries";
import type { AuditLogSearch } from "../schemas/search";

export function useAuditLogs(search: AuditLogSearch) {
	const { data: auditLogs } = useSuspenseQuery(
		getAuditLogsQueryOptions(search),
	);

	return { auditLogs };
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
