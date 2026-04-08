import { useSuspenseQueries } from "@tanstack/react-query";
import { getEmployeeRolesOptions, getEmployeeTypesOptions } from "../api/get";

export function useEmployeeOptions() {
	const [{ data: types }, { data: roles }] = useSuspenseQueries({
		queries: [getEmployeeTypesOptions(), getEmployeeRolesOptions()],
	});

	return { types, roles };
}
