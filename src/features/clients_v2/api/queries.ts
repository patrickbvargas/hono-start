import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { EntityId } from "@/shared/schemas/entity";
import type { Option } from "@/shared/schemas/option";
import { getServerLoggedUserSession, getServerScope } from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";
import { CLIENT_ERRORS } from "../constants/errors";
import { findClientTypes } from "../data/lookup";
import { findById, findPage, findSelectableClients } from "../data/queries";
import { clientIdInputSchema } from "../schemas/form";
import type { Client } from "../schemas/model";
import { type ClientSearch, clientSearchSchema } from "../schemas/search";

const getClients = createServerFn({ method: "GET" })
	.inputValidator(clientSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Client>> => {
		try {
			getServerLoggedUserSession();
			const { firmId } = getServerScope("client");

			return await findPage({ firmId, search: data });
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

			return await findById({ firmId, id: data.id });
		} catch (error) {
			console.error("[getClientById]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

			throw new Error(CLIENT_ERRORS.CLIENT_DETAIL_FAILED);
		}
	});

const getClientTypes = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			return await findClientTypes();
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

			return await findSelectableClients({ firmId });
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

export const getClientByIdOptions = (id: EntityId) =>
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
