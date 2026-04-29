import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { EntityId } from "@/shared/schemas/entity";
import type { Option } from "@/shared/schemas/option";
import { authMiddleware, getScope } from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import { getClientById, getClients, getClientTypes } from "../data/queries";
import { clientIdInputSchema } from "../schemas/form";
import type { ClientDetail, ClientSummary } from "../schemas/model";
import { type ClientSearch, clientSearchSchema } from "../schemas/search";

export const clientKeys = {
	all: ["client"] as const,
	list: (search: ClientSearch) => [...clientKeys.all, search] as const,
	detail: (id: EntityId) => [...clientKeys.all, "detail", id] as const,
	types: () => [...clientKeys.all, "types"] as const,
};

const getClientsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(clientSearchSchema)
	.handler(
		async ({
			data,
			context,
		}): Promise<QueryPaginatedReturnType<ClientSummary>> => {
			try {
				const { firmId } = getScope(context.session, "client");

				return await getClients({ firmId, search: data });
			} catch (error) {
				console.error("[getClients]", error);
				throw new Error(CLIENT_ERRORS.GET_FAILED);
			}
		},
	);

const getClientByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(clientIdInputSchema)
	.handler(
		async ({ data, context }): Promise<QueryOneReturnType<ClientDetail>> => {
			try {
				const { firmId } = getScope(context.session, "client");

				return await getClientById({
					firmId,
					id: data.id,
				});
			} catch (error) {
				console.error("[getClientById]", error);
				if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
					throw error;
				}

				throw new Error(CLIENT_ERRORS.DETAIL_FAILED);
			}
		},
	);

const getClientTypesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			return await getClientTypes();
		} catch (error) {
			console.error("[getClientTypes]", error);
			throw new Error(CLIENT_ERRORS.TYPES_GET_FAILED);
		}
	});

export const getClientsQueryOptions = (search: ClientSearch) =>
	queryOptions({
		queryKey: clientKeys.list(search),
		queryFn: () => getClientsFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getClientByIdQueryOptions = (id: EntityId) =>
	queryOptions({
		queryKey: clientKeys.detail(id),
		queryFn: () => getClientByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getClientTypesQueryOptions = () =>
	queryOptions({
		queryKey: clientKeys.types(),
		queryFn: getClientTypesFn,
		staleTime: "static",
	});
