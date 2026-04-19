import type { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
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
import { CLIENT_ERRORS } from "../constants/errors";
import type { ClientFilter } from "../schemas/filter";
import {
	type ClientDetail,
	type ClientSummary,
	clientDetailSchema,
	clientSummarySchema,
} from "../schemas/model";
import type { ClientSearch } from "../schemas/search";

function buildClientWhere({
	firmId,
	filter,
}: EntityFilterParams<ClientFilter>): Prisma.ClientWhereInput {
	const searchWhere = filter.query
		? {
				OR: [
					{
						fullName: {
							contains: filter.query,
							mode: "insensitive" as const,
						},
					},
					{
						document: {
							contains: filter.query,
						},
					},
				],
			}
		: {};

	const typeWhere =
		filter.type.length > 0
			? {
					type: {
						value: {
							in: filter.type,
						},
					},
				}
			: {};

	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...searchWhere,
		...typeWhere,
	};
}

export async function getClients({
	firmId,
	search,
}: EntitySearchParams<ClientSearch>): Promise<
	QueryPaginatedReturnType<ClientSummary>
> {
	const where = buildClientWhere({ firmId, filter: search });

	const sortMap: Record<string, object> = {
		fullName: { fullName: search.direction },
		document: { document: search.direction },
		type: { type: { label: search.direction } },
		isActive: { isActive: search.direction },
	};

	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { fullName: "asc" },
		{ id: "asc" },
	);

	const [rawData, total] = await Promise.all([
		prisma.client.findMany({
			where,
			include: {
				type: true,
				_count: {
					select: {
						contracts: true,
					},
				},
			},
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.client.count({ where }),
	]);

	const clients = rawData.map((c) => ({
		id: c.id,
		fullName: c.fullName,
		document: c.document,
		type: c.type.label,
		contractCount: c._count.contracts,
		isActive: c.isActive,
		isSoftDeleted: Boolean(c.deletedAt),
	}));

	return {
		data: clientSummarySchema.array().parse(clients),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getClientById({
	firmId,
	id,
}: EntityUniqueParams): Promise<QueryOneReturnType<ClientDetail>> {
	const rawData = await prisma.client.findFirst({
		where: { id, firmId },
		include: {
			type: true,
			_count: {
				select: {
					contracts: true,
				},
			},
		},
	});

	if (!rawData) {
		throw new Error(CLIENT_ERRORS.NOT_FOUND);
	}

	const client = {
		id: rawData.id,
		fullName: rawData.fullName,
		document: rawData.document,
		email: rawData.email,
		phone: rawData.phone,
		typeId: rawData.type.id,
		type: rawData.type.label,
		typeValue: rawData.type.value,
		contractCount: rawData._count.contracts,
		isActive: rawData.isActive,
		isSoftDeleted: Boolean(rawData.deletedAt),
		createdAt: rawData.createdAt.toISOString(),
		updatedAt: rawData.updatedAt?.toISOString(),
	};

	return clientDetailSchema.parse(client);
}

export async function getClientTypes(): Promise<QueryManyReturnType<Option>> {
	const types = await prisma.clientType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(types);
}

export async function getClientTypeByValue(value: string) {
	return prisma.clientType.findUnique({
		where: { value },
	});
}
