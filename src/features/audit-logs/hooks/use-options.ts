import { useSuspenseQueries } from "@tanstack/react-query";
import {
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogEntityTypesQueryOptions,
} from "../api/queries";

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
