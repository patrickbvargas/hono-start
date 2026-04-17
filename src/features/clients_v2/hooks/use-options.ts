import { useSuspenseQuery } from "@tanstack/react-query";
import { getClientTypesQueryOptions } from "../api/queries";

export function useClientOptions() {
	const { data: types } = useSuspenseQuery(getClientTypesQueryOptions());

	return { types };
}
