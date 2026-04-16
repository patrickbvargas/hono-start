import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import type { EntityId } from "@/shared/schemas/entity";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import type { ClientFilter } from "../schemas/filter";
import { type Client, clientSchema } from "../schemas/model";
import type { ClientSearch } from "../schemas/search";
import { formatClientDocument } from "../utils/formatting";
import { resolveClientTypeIdsByValues } from "./lookup";

interface BuildClientWhereParams {
	firmId: EntityId;
	filter: ClientFilter;
	typeIds: EntityId[];
}

// TODO: refatorar
export function buildClientWhere({
	firmId,
	filter,
	typeIds,
}: BuildClientWhereParams) {
	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(filter.name
			? {
					OR: [
						{
							fullName: {
								contains: filter.name,
								mode: "insensitive" as const,
							},
						},
						{
							document: {
								contains: filter.name,
							},
						},
					],
				}
			: {}),
		...(typeIds.length > 0 ? { typeId: { in: typeIds } } : {}),
	};
}

async function mapClients(
	clients: Array<{
		id: number;
		fullName: string;
		document: string;
		email: string | null;
		phone: string | null;
		typeId: number;
		type: { label: string; value: string };
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}>,
) {
	const contractCounts = await getActiveContractCountByClientIds(
		clients.map((client) => client.id),
	);

	return clientSchema.array().parse(
		clients.map((client) => ({
			id: client.id,
			fullName: client.fullName,
			document: client.document,
			email: client.email,
			phone: client.phone,
			typeId: client.typeId,
			type: client.type.label,
			typeValue: client.type.value,
			contractCount: contractCounts.get(client.id) ?? 0,
			isActive: client.isActive,
			isSoftDeleted: !!client.deletedAt,
			createdAt: client.createdAt.toISOString(),
			updatedAt: client.updatedAt?.toISOString() ?? null,
		})),
	);
}

export async function findPage({
	firmId,
	search,
}: {
	firmId: EntityId;
	search: ClientSearch;
}): Promise<QueryPaginatedReturnType<Client>> {
	const typeIds = await resolveClientTypeIdsByValues(search.type);
	const where = buildClientWhere({ firmId, filter: search, typeIds });

	const sortMap: Record<string, object> = {
		fullName: { fullName: search.direction },
		document: { document: search.direction },
		type: { type: { label: search.direction } },
		isActive: { isActive: search.direction },
		createdAt: { createdAt: search.direction },
	};

	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { fullName: "asc" },
		{ id: "asc" },
	);

	const [clients, total] = await Promise.all([
		prisma.client.findMany({
			where,
			include: { type: true },
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.client.count({ where }),
	]);

	return {
		data: await mapClients(clients),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function findById({
	firmId,
	id,
}: {
	firmId: EntityId;
	id: EntityId;
}): Promise<QueryOneReturnType<Client>> {
	const client = await prisma.client.findFirst({
		where: { id, firmId },
		include: { type: true },
	});

	if (!client) {
		throw new Error(CLIENT_ERRORS.CLIENT_DETAIL_NOT_FOUND);
	}

	const [mappedClient] = await mapClients([client]);

	if (!mappedClient) {
		throw new Error(CLIENT_ERRORS.CLIENT_DETAIL_NOT_FOUND);
	}

	return mappedClient;
}

export async function requireById({
	firmId,
	id,
}: {
	firmId: EntityId;
	id: EntityId;
}) {
	const client = await prisma.client.findFirst({
		where: { firmId: firmId, id: id },
	});

	if (!client) {
		throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);
	}

	return client;
}

export async function findSelectableClients({
	firmId,
}: {
	firmId: EntityId;
}): Promise<QueryManyReturnType<Option>> {
	const clients = await prisma.client.findMany({
		where: { firmId, deletedAt: null, isActive: true },
		orderBy: { fullName: "asc" },
		select: {
			id: true,
			fullName: true,
			document: true,
		},
	});

	return optionSchema.array().parse(
		clients.map((client) => ({
			id: client.id,
			label: `${client.fullName} • ${formatClientDocument(client.document)}`,
			value: String(client.id),
			isDisabled: false,
		})),
	);
}

// TODO: refatorar
export async function getActiveContractCountByClientIds(clientIds: number[]) {
	if (clientIds.length === 0) {
		return new Map<number, number>();
	}

	const rows = await prisma.$queryRaw<
		Array<{ clientId: number; total: number }>
	>(Prisma.sql`
    SELECT
      "clientId" AS "clientId",
      COUNT(*)::int AS "total"
    FROM "contracts"
    WHERE "clientId" IN (${Prisma.join(clientIds)})
      AND "deletedAt" IS NULL
    GROUP BY "clientId"
  `);

	return new Map(rows.map((row) => [row.clientId, Number(row.total)]));
}

export async function countActiveContractsByClientId(clientId: number) {
	const counts = await getActiveContractCountByClientIds([clientId]);
	return counts.get(clientId) ?? 0;
}
