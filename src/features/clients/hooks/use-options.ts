import { useSuspenseQuery } from "@tanstack/react-query";
import { getClientTypesOptions } from "../api/get";

export function useClientOptions() {
	const { data: types } = useSuspenseQuery(getClientTypesOptions());

	return { types };
}
