import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Option } from "@/shared/schemas/option";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { AUDIT_LOG_ERRORS } from "../constants/errors";
import {
	getAuditLogActions,
	getAuditLogActors,
	getAuditLogEntityTypes,
	getAuditLogs,
} from "../data/queries";
import type { AuditLog } from "../schemas/model";
import { type AuditLogSearch, auditLogSearchSchema } from "../schemas/search";

export const auditLogKeys = {
	all: ["audit-log"] as const,
	list: (search: AuditLogSearch) => [...auditLogKeys.all, search] as const,
	actions: () => [...auditLogKeys.all, "actions"] as const,
	entityTypes: () => [...auditLogKeys.all, "entity-types"] as const,
	actors: () => [...auditLogKeys.all, "actors"] as const,
};

const getAuditLogsFn = createServerFn({ method: "GET" })
	.inputValidator(auditLogSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<AuditLog>> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "audit-log.view");
			const { firmId } = getServerScope("audit-log");

			return await getAuditLogs({ firmId, search: data });
		} catch (error) {
			console.error("[getAuditLogs]", error);
			throw new Error(AUDIT_LOG_ERRORS.GET_FAILED);
		}
	});

const getAuditLogActionsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "audit-log.view");
			const { firmId } = getServerScope("audit-log");

			return await getAuditLogActions(firmId);
		} catch (error) {
			console.error("[getAuditLogActions]", error);
			throw new Error(AUDIT_LOG_ERRORS.ACTIONS_GET_FAILED);
		}
	},
);

const getAuditLogEntityTypesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "audit-log.view");
			const { firmId } = getServerScope("audit-log");

			return await getAuditLogEntityTypes(firmId);
		} catch (error) {
			console.error("[getAuditLogEntityTypes]", error);
			throw new Error(AUDIT_LOG_ERRORS.ENTITY_TYPES_GET_FAILED);
		}
	},
);

const getAuditLogActorsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "audit-log.view");
			const { firmId } = getServerScope("audit-log");

			return await getAuditLogActors(firmId);
		} catch (error) {
			console.error("[getAuditLogActors]", error);
			throw new Error(AUDIT_LOG_ERRORS.ACTORS_GET_FAILED);
		}
	},
);

export const getAuditLogsQueryOptions = (search: AuditLogSearch) =>
	queryOptions({
		queryKey: auditLogKeys.list(search),
		queryFn: () => getAuditLogsFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getAuditLogActionsQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.actions(),
		queryFn: getAuditLogActionsFn,
		staleTime: "static",
	});

export const getAuditLogEntityTypesQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.entityTypes(),
		queryFn: getAuditLogEntityTypesFn,
		staleTime: "static",
	});

export const getAuditLogActorsQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.actors(),
		queryFn: getAuditLogActorsFn,
		staleTime: "static",
	});
