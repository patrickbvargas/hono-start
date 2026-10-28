import type { Prisma } from "@/generated/prisma/client";
import { withDeterministicTieBreaker } from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import type {
	EntityFilterParams,
	EntitySearchParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import type { AuditLogFilter } from "../schemas/filter";
import {
	type AuditLog,
	type AuditLogDetail,
	auditLogDetailSchema,
	auditLogSchema,
} from "../schemas/model";
import type { AuditHistory, AuditLogSearch } from "../schemas/search";
import {
	getAuditDescription,
	getAuditEntityNameLabel,
	getAuditEntityTypeLabel,
} from "../utils/display";

interface AuditAccessParams {
	accessWhere?: Prisma.AuditLogWhereInput;
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

function isSystemActorName(actorName: string) {
	return actorName.trim() === "" || actorName === "Sistema";
}

function buildAuditLogWhere({
	accessWhere,
	firmId,
	filter,
}: EntityFilterParams<AuditLogFilter> &
	AuditAccessParams): Prisma.AuditLogWhereInput {
	const actorFilterValues = filter.actorName.flatMap((value) =>
		value === "Sistema" ? ["Sistema", ""] : [value],
	);
	const searchIncludesSystem = filter.query
		? filter.query.trim().toLocaleLowerCase("pt-BR").includes("sistema")
		: false;

	return {
		AND: [accessWhere ?? getAuditVisibilityWhere(firmId)],
		...(filter.entityId ? { entityId: String(filter.entityId) } : {}),
		...(filter.query
			? {
					OR: [
						{
							actorName: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
						{
							entityName: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
						...(searchIncludesSystem
							? [
									{
										actorName: {
											in: ["Sistema", ""],
										},
									},
								]
							: []),
					],
				}
			: {}),
		...(filter.action.length > 0 ? { action: { in: filter.action } } : {}),
		...(filter.entityType.length > 0
			? { entityType: { in: filter.entityType } }
			: {}),
		...(actorFilterValues.length > 0
			? { actorName: { in: actorFilterValues } }
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
	changeData: unknown;
	description: string;
}): AuditLog {
	return auditLogSchema.parse({
		id: row.id,
		occurredAt: row.createdAt.toISOString(),
		occurredAtLabel: dateTimeFormatter.format(row.createdAt),
		actorName: row.actorName,
		actorEmail: row.actorEmail,
		action: row.action,
		entityType: row.entityType,
		entityTypeLabel: getAuditEntityTypeLabel(row.entityType),
		entityName: getAuditEntityNameLabel(row.entityName, row.entityId),
		entityId: row.entityId,
		ipAddress: row.ipAddress,
		userAgent: row.userAgent,
		description: getAuditDescription({
			action: row.action,
			entityType: row.entityType,
			entityName: row.entityName,
			entityId: row.entityId,
			changeData: row.changeData,
			fallbackDescription: row.description,
		}),
	});
}

function mapAuditLogDetail(row: {
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
	changeData: unknown;
	description: string;
}): AuditLogDetail {
	return auditLogDetailSchema.parse({
		...mapAuditLog(row),
		changeData: row.changeData,
	});
}

export async function getAuditLogs({
	accessWhere,
	firmId,
	search,
}: EntitySearchParams<AuditLogSearch> & AuditAccessParams): Promise<
	QueryPaginatedReturnType<AuditLog>
> {
	const where = buildAuditLogWhere({ firmId, filter: search, accessWhere });

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

export async function getAuditLogById({
	accessWhere,
	firmId,
	id,
}: EntityUniqueParams & AuditAccessParams): Promise<
	QueryOneReturnType<AuditLogDetail>
> {
	const auditLog = await prisma.auditLog.findFirst({
		where: {
			id,
			...(accessWhere ?? getAuditVisibilityWhere(firmId)),
		},
	});

	if (!auditLog) {
		throw new Error("Log de auditoria não encontrado.");
	}

	return mapAuditLogDetail(auditLog);
}

function mapDistinctOptions(rows: Array<{ value: string }>) {
	return mapDistinctOptionsWithLabel(rows, ({ value }) => value);
}

function mapDistinctOptionsWithLabel(
	rows: Array<{ value: string }>,
	getLabel: (row: { value: string }) => string,
) {
	return optionSchema.array().parse(
		rows.map((row, index) => ({
			id: index + 1,
			value: row.value,
			label: getLabel(row),
			isActive: true,
		})),
	);
}

export async function getAuditLogActions(
	firmId: number,
	accessWhere?: Prisma.AuditLogWhereInput,
): Promise<QueryManyReturnType<Option>> {
	const actions = await prisma.auditLog.findMany({
		where: accessWhere ?? getAuditVisibilityWhere(firmId),
		distinct: ["action"],
		select: { action: true },
		orderBy: { action: "asc" },
	});

	return mapDistinctOptions(actions.map((row) => ({ value: row.action })));
}

export async function getAuditLogEntityTypes(
	firmId: number,
	accessWhere?: Prisma.AuditLogWhereInput,
): Promise<QueryManyReturnType<Option>> {
	const entityTypes = await prisma.auditLog.findMany({
		where: accessWhere ?? getAuditVisibilityWhere(firmId),
		distinct: ["entityType"],
		select: { entityType: true },
		orderBy: { entityType: "asc" },
	});

	return mapDistinctOptionsWithLabel(
		entityTypes.map((row) => ({ value: row.entityType })),
		({ value }) => getAuditEntityTypeLabel(value),
	);
}

export async function getAuditLogActors(
	firmId: number,
	accessWhere?: Prisma.AuditLogWhereInput,
): Promise<QueryManyReturnType<Option>> {
	const actors = await prisma.auditLog.findMany({
		where: accessWhere ?? getAuditVisibilityWhere(firmId),
		distinct: ["actorName"],
		select: { actorName: true },
		orderBy: { actorName: "asc" },
	});

	const normalizedActors = Array.from(
		new Map(
			actors.map((row) => {
				const value = isSystemActorName(row.actorName)
					? "Sistema"
					: row.actorName;

				return [value, { value }];
			}),
		).values(),
	);

	return mapDistinctOptions(normalizedActors);
}

export async function getAuditHistory({
	accessWhere,
	firmId,
	entityType,
	entityId,
}: AuditHistory & { firmId: number } & AuditAccessParams): Promise<AuditLog[]> {
	const rows = await prisma.auditLog.findMany({
		where: {
			...(accessWhere ? { AND: [accessWhere] } : {}),
			...(entityType === "Client"
				? { clientId: entityId }
				: entityType === "Employee"
					? { employeeId: entityId }
					: { firmId, entityType, entityId: String(entityId) }),
		},
		orderBy: [{ createdAt: "desc" }, { id: "asc" }],
	});
	return rows.map(mapAuditLog);
}

export function getAuditVisibilityWhere(
	firmId: number,
): Prisma.AuditLogWhereInput {
	return {
		OR: [
			{ firmId },
			{ clientId: { not: null } },
			{ employeeId: { not: null } },
		],
	};
}
