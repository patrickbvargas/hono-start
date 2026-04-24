import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getEmployeeRolesQueryOptions,
	getEmployeesQueryOptions,
	getEmployeeTypesQueryOptions,
} from "../api/queries";
import type { EmployeeSearch } from "../schemas/search";

export function useEmployeeData(search: EmployeeSearch) {
	const { data: employees } = useSuspenseQuery(
		getEmployeesQueryOptions(search),
	);

	return { employees };
}

export function useEmployeeOptions() {
	const [{ data: types }, { data: roles }] = useSuspenseQueries({
		queries: [getEmployeeTypesQueryOptions(), getEmployeeRolesQueryOptions()],
	});

	return { types, roles };
}
