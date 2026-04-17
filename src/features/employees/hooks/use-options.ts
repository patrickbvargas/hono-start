import { useSuspenseQueries } from "@tanstack/react-query";
import {
	getEmployeeRolesQueryOptions,
	getEmployeeTypesQueryOptions,
} from "../api/queries";

export function useEmployeeOptions() {
	const [{ data: types }, { data: roles }] = useSuspenseQueries({
		queries: [getEmployeeTypesQueryOptions(), getEmployeeRolesQueryOptions()],
	});

	return { types, roles };
}
