import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { EntityId } from "@/shared/schemas/entity";
import { entityIdSchema } from "@/shared/schemas/entity";
import type { Option } from "@/shared/schemas/option";
import { assertCan } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { AUDIT_LOG_ERRORS } from "../constants/errors";
import {
	getAuditHistory,
	getAuditLogActions,
	getAuditLogActors,
	getAuditLogById,
	getAuditLogEntityTypes,
	getAuditLogs,
} from "../data/queries";
import type { AuditLog, AuditLogDetail } from "../schemas/model";
import {
	type AuditHistory,
	type AuditLogSearch,
	auditHistorySchema,
	auditLogSearchSchema,
} from "../schemas/search";

export const auditLogKeys = {
	all: ["audit-log"] as const,
	list: (search: AuditLogSearch) => [...auditLogKeys.all, search] as const,
	history: (scope: AuditHistory) =>
		[...auditLogKeys.all, "history", scope] as const,
	detail: (id: EntityId) => [...auditLogKeys.all, "detail", id] as const,
	actions: () => [...auditLogKeys.all, "actions"] as const,
	entityTypes: () => [...auditLogKeys.all, "entity-types"] as const,
	actors: () => [...auditLogKeys.all, "actors"] as const,
};

const getAuditLogsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(auditLogSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<AuditLog>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");

			return await getAuditLogs({ firmId, search: data });
		} catch (error) {
			console.error("[getAuditLogs]", error);
			throw new Error(AUDIT_LOG_ERRORS.GET_FAILED);
		}
	});

const getAuditLogByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(entityIdSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<AuditLogDetail>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");

			return await getAuditLogById({ firmId, id: data.id });
		} catch (error) {
			console.error("[getAuditLogById]", error);
			throw new Error(AUDIT_LOG_ERRORS.DETAIL_FAILED);
		}
	});

const getAuditLogActionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");

			return await getAuditLogActions(firmId);
		} catch (error) {
			console.error("[getAuditLogActions]", error);
			throw new Error(AUDIT_LOG_ERRORS.ACTIONS_GET_FAILED);
		}
	});

const getAuditLogEntityTypesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");

			return await getAuditLogEntityTypes(firmId);
		} catch (error) {
			console.error("[getAuditLogEntityTypes]", error);
			throw new Error(AUDIT_LOG_ERRORS.ENTITY_TYPES_GET_FAILED);
		}
	});

const getAuditLogActorsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");

			return await getAuditLogActors(firmId);
		} catch (error) {
			console.error("[getAuditLogActors]", error);
			throw new Error(AUDIT_LOG_ERRORS.ACTORS_GET_FAILED);
		}
	});

export const getAuditLogsQueryOptions = (search: AuditLogSearch) =>
	queryOptions({
		queryKey: auditLogKeys.list(search),
		queryFn: () => getAuditLogsFn({ data: search }),
	});

export const getAuditLogByIdQueryOptions = (id: EntityId) =>
	queryOptions({
		queryKey: auditLogKeys.detail(id),
		queryFn: () => getAuditLogByIdFn({ data: { id } }),
	});

export const getAuditLogActionsQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.actions(),
		queryFn: getAuditLogActionsFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});

export const getAuditLogEntityTypesQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.entityTypes(),
		queryFn: getAuditLogEntityTypesFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});

export const getAuditLogActorsQueryOptions = () =>
	queryOptions({
		queryKey: auditLogKeys.actors(),
		queryFn: getAuditLogActorsFn,
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
	});

const getAuditHistoryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(auditHistorySchema)
	.handler(async ({ data }): Promise<AuditLog[]> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:audit_logs:read");
			const { firmId } = await getServerScope("audit-log");
			return await getAuditHistory({ firmId, ...data });
		} catch (error) {
			console.error("[getAuditHistory]", error);
			throw new Error(AUDIT_LOG_ERRORS.GET_FAILED);
		}
	});
export const getAuditHistoryQueryOptions = (scope: AuditHistory) =>
	queryOptions({
		queryKey: auditLogKeys.history(scope),
		queryFn: () => getAuditHistoryFn({ data: scope }),
	});
