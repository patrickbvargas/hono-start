import { useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getClientByIdQueryOptions,
	getClientsQueryOptions,
	getClientTypesQueryOptions,
} from "../api/queries";
import type { ClientSearch } from "../schemas/search";

export function useClients(search: ClientSearch) {
	const { data: clients } = useSuspenseQuery(getClientsQueryOptions(search));

	return { clients };
}

export function useClient(id: EntityId) {
	const { data: client } = useSuspenseQuery(getClientByIdQueryOptions(id));

	return { client };
}

export function useClientOptions() {
	const { data: types } = useSuspenseQuery(getClientTypesQueryOptions());

	return { types };
}
