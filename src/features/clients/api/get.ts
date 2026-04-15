import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import { getServerLoggedUserSession, getServerScope } from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CLIENT_DATA_CACHE_KEY } from "../constants";
import { CLIENT_ERRORS } from "../constants/errors";
import type { ClientFilter } from "../schemas/filter";
import { clientIdInputSchema } from "../schemas/form";
import { type Client, clientSchema } from "../schemas/model";
import { type ClientSearch, clientSearchSchema } from "../schemas/search";
import { formatClientDocument } from "../utils/formatting";
import { getActiveContractCountByClientIds } from "./contracts";

interface BuildClientWhereParams {
	firmId: number;
	filter: ClientFilter;
	typeIds: number[];
}

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
						...(filter.name
							? [
									{
										document: {
											contains: filter.name,
										},
									},
								]
							: []),
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

const getClients = createServerFn({ method: "GET" })
	.inputValidator(clientSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Client>> => {
		try {
			getServerLoggedUserSession();
			const { firmId } = getServerScope("client");
			const resolvedTypes =
				data.type.length > 0
					? await prisma.clientType.findMany({
							where: { value: { in: data.type } },
							select: { id: true },
						})
					: [];

			const where = buildClientWhere({
				firmId,
				filter: data,
				typeIds: resolvedTypes.map((type) => type.id),
			});

			const sortMap: Record<string, object> = {
				fullName: { fullName: data.direction },
				document: { document: data.direction },
				type: { type: { label: data.direction } },
				isActive: { isActive: data.direction },
				createdAt: { createdAt: data.direction },
			};
			const orderBy = withDeterministicTieBreaker(
				sortMap[data.column] ?? { fullName: "asc" },
				{ id: "asc" },
			);

			const [clients, total] = await Promise.all([
				prisma.client.findMany({
					where,
					include: { type: true },
					orderBy,
					skip: (data.page - 1) * data.limit,
					take: data.limit,
				}),
				prisma.client.count({ where }),
			]);

			return {
				data: await mapClients(clients),
				total,
				page: data.page,
				pageSize: data.limit,
			};
		} catch (error) {
			console.error("[getClients]", error);
			throw new Error(CLIENT_ERRORS.CLIENT_GET_FAILED);
		}
	});

const getClientById = createServerFn({ method: "GET" })
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<Client>> => {
		try {
			getServerLoggedUserSession();
			const { firmId } = getServerScope("client");
			const client = await prisma.client.findFirst({
				where: { id: data.id, firmId },
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
		} catch (error) {
			console.error("[getClientById]", error);
			if (
				error instanceof Error &&
				error.message === CLIENT_ERRORS.CLIENT_DETAIL_NOT_FOUND
			) {
				throw error;
			}
			throw new Error(CLIENT_ERRORS.CLIENT_DETAIL_FAILED);
		}
	});

const getClientTypes = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const types = await prisma.clientType.findMany({
				orderBy: { label: "asc" },
			});

			return optionSchema.array().parse(types);
		} catch (error) {
			console.error("[getClientTypes]", error);
			throw new Error(CLIENT_ERRORS.CLIENT_TYPES_GET_FAILED);
		}
	},
);

const getSelectableClients = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			getServerLoggedUserSession();
			const { firmId } = getServerScope("client");
			const clients = await prisma.client.findMany({
				where: { firmId, deletedAt: null, isActive: true },
				orderBy: { fullName: "asc" },
				select: {
					id: true,
					fullName: true,
					document: true,
				},
			});

			return clients.map((client) => ({
				id: client.id,
				label: `${client.fullName} • ${formatClientDocument(client.document)}`,
				value: String(client.id),
				isDisabled: false,
			}));
		} catch (error) {
			console.error("[getSelectableClients]", error);
			throw new Error(CLIENT_ERRORS.CLIENT_SELECTABLE_GET_FAILED);
		}
	},
);

export const getClientsOptions = (search: ClientSearch) =>
	queryOptions({
		queryKey: [CLIENT_DATA_CACHE_KEY, search],
		queryFn: () => getClients({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getClientByIdOptions = (id: number) =>
	queryOptions({
		queryKey: [CLIENT_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getClientById({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getClientTypesOptions = () =>
	queryOptions({
		queryKey: [CLIENT_DATA_CACHE_KEY, "types"],
		queryFn: getClientTypes,
		staleTime: "static",
	});

export const getSelectableClientsOptions = () =>
	queryOptions({
		queryKey: [CLIENT_DATA_CACHE_KEY, "options"],
		queryFn: getSelectableClients,
		staleTime: 5 * 60 * 1000,
	});
