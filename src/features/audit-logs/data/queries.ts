import type { Prisma } from "@/generated/prisma/client";
import { withDeterministicTieBreaker } from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import type {
	EntityFilterParams,
	EntitySearchParams,
} from "@/shared/types/entity";
import type { AuditLogFilter } from "../schemas/filter";
import { type AuditLog, auditLogSchema } from "../schemas/model";
import type { AuditLogSearch } from "../schemas/search";

function buildAuditLogWhere({
	firmId,
	filter,
}: EntityFilterParams<AuditLogFilter>): Prisma.AuditLogWhereInput {
	return {
		firmId,
		...(filter.action.length > 0 ? { action: { in: filter.action } } : {}),
		...(filter.entityType.length > 0
			? { entityType: { in: filter.entityType } }
			: {}),
		...(filter.actorName.length > 0
			? { actorName: { in: filter.actorName } }
			: {}),
	};
}

function mapAuditLog(row: {
	id: number;
	createdAt: Date;
	actorName: string;
	actorEmail: string | null;
	action: string;
	entityType: string;
	entityName: string;
	entityId: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	description: string;
}): AuditLog {
	return auditLogSchema.parse({
		id: row.id,
		occurredAt: row.createdAt.toISOString(),
		actorName: row.actorName,
		actorEmail: row.actorEmail,
		action: row.action,
		entityType: row.entityType,
		entityName: row.entityName,
		entityId: row.entityId,
		ipAddress: row.ipAddress,
		userAgent: row.userAgent,
		description: row.description,
	});
}

export async function getAuditLogs({
	firmId,
	search,
}: EntitySearchParams<AuditLogSearch>): Promise<
	QueryPaginatedReturnType<AuditLog>
> {
	const where = buildAuditLogWhere({ firmId, filter: search });

	const sortMap: Record<string, object> = {
		occurredAt: { createdAt: search.direction },
		actorName: { actorName: search.direction },
		action: { action: search.direction },
		entityType: { entityType: search.direction },
		entityName: { entityName: search.direction },
	};

	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { createdAt: "desc" },
		{ id: "asc" },
	);

	const [rawData, total] = await Promise.all([
		prisma.auditLog.findMany({
			where,
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.auditLog.count({ where }),
	]);

	return {
		data: rawData.map(mapAuditLog),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

function mapDistinctOptions(rows: Array<{ value: string }>) {
	return optionSchema.array().parse(
		rows.map((row, index) => ({
			id: index + 1,
			value: row.value,
			label: row.value,
			isActive: true,
		})),
	);
}

export async function getAuditLogActions(
	firmId: number,
): Promise<QueryManyReturnType<Option>> {
	const actions = await prisma.auditLog.findMany({
		where: { firmId },
		distinct: ["action"],
		select: { action: true },
		orderBy: { action: "asc" },
	});

	return mapDistinctOptions(actions.map((row) => ({ value: row.action })));
}

export async function getAuditLogEntityTypes(
	firmId: number,
): Promise<QueryManyReturnType<Option>> {
	const entityTypes = await prisma.auditLog.findMany({
		where: { firmId },
		distinct: ["entityType"],
		select: { entityType: true },
		orderBy: { entityType: "asc" },
	});

	return mapDistinctOptions(
		entityTypes.map((row) => ({ value: row.entityType })),
	);
}

export async function getAuditLogActors(
	firmId: number,
): Promise<QueryManyReturnType<Option>> {
	const actors = await prisma.auditLog.findMany({
		where: { firmId },
		distinct: ["actorName"],
		select: { actorName: true },
		orderBy: { actorName: "asc" },
	});

	return mapDistinctOptions(actors.map((row) => ({ value: row.actorName })));
}
