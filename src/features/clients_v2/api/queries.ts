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
import { getClientById, getClients, getClientTypes } from "../data/queries";
import { clientIdInputSchema } from "../schemas/form";
import type { ClientDetail, ClientSummary } from "../schemas/model";
import { type ClientSearch, clientSearchSchema } from "../schemas/search";

const getClientsFn = createServerFn({ method: "GET" })
  .inputValidator(clientSearchSchema)
  .handler(
    async ({ data }): Promise<QueryPaginatedReturnType<ClientSummary>> => {
      try {
        getServerLoggedUserSession();
        const { firmId } = getServerScope("client");

        return await getClients({ firmId, search: data });
      } catch (error) {
        console.error("[getClients]", error);
        throw new Error(CLIENT_ERRORS.GET_FAILED);
      }
    },
  );

const getClientByIdFn = createServerFn({ method: "GET" })
  .inputValidator(clientIdInputSchema)
  .handler(async ({ data }): Promise<QueryOneReturnType<ClientDetail>> => {
    try {
      getServerLoggedUserSession();
      const { firmId } = getServerScope("client");

      return await getClientById({ firmId, id: data.id });
    } catch (error) {
      console.error("[getClientById]", error);
      if (hasExactErrorMessage(error, CLIENT_ERRORS)) throw error;

      throw new Error(CLIENT_ERRORS.DETAIL_FAILED);
    }
  });

const getClientTypesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<QueryManyReturnType<Option>> => {
    try {
      return await getClientTypes();
    } catch (error) {
      console.error("[getClientTypes]", error);
      throw new Error(CLIENT_ERRORS.TYPES_GET_FAILED);
    }
  },
);

export const getClientsQueryOptions = (search: ClientSearch) =>
  queryOptions({
    queryKey: [CLIENT_DATA_CACHE_KEY, search],
    queryFn: () => getClientsFn({ data: search }),
    staleTime: 5 * 60 * 1000,
  });

export const getClientByIdQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: [CLIENT_DATA_CACHE_KEY, "detail", id],
    queryFn: () => getClientByIdFn({ data: { id } }),
    staleTime: 5 * 60 * 1000,
  });

export const getClientTypesQueryOptions = () =>
  queryOptions({
    queryKey: [CLIENT_DATA_CACHE_KEY, "types"],
    queryFn: getClientTypesFn,
    staleTime: "static",
  });
