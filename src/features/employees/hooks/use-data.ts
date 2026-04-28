import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getEmployeeByIdQueryOptions,
	getEmployeeRolesQueryOptions,
	getEmployeesQueryOptions,
	getEmployeeTypesQueryOptions,
} from "../api/queries";
import type { EmployeeSearch } from "../schemas/search";

export function useEmployees(search: EmployeeSearch) {
	const { data: employees } = useSuspenseQuery(
		getEmployeesQueryOptions(search),
	);

	return { employees };
}

export function useEmployee(id: EntityId) {
	const { data: employee } = useSuspenseQuery(getEmployeeByIdQueryOptions(id));

	return { employee };
}

export function useEmployeeOptions() {
	const [{ data: types }, { data: roles }] = useSuspenseQueries({
		queries: [getEmployeeTypesQueryOptions(), getEmployeeRolesQueryOptions()],
	});

	return { types, roles };
}
