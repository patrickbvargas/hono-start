import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getClientsQueryOptions,
	getClientTypesQueryOptions,
} from "../api/queries";
import type { ClientSearch } from "../schemas/search";

export function useClientData(search: ClientSearch) {
	const { data: clients } = useSuspenseQuery(getClientsQueryOptions(search));

	return { clients };
}

export function useClientOptions() {
	const { data: types } = useSuspenseQuery(getClientTypesQueryOptions());

	return { types };
}
