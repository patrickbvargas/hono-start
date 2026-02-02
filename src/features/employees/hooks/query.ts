import { useSuspenseQuery } from "@tanstack/react-query";
import { employeesQueryOptions } from "../api/query";
import type { EmployeeSearch } from "../schemas/search";

export function useEmployees(search: EmployeeSearch) {
	return useSuspenseQuery(employeesQueryOptions(search));
}
