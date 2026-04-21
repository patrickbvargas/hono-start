import { useQuery } from "@tanstack/react-query";
import { getDashboardEmployeeOptionsQueryOptions } from "../api/queries";

export function useDashboardOptions(includeEmployees = false) {
	const { data: employees } = useQuery({
		...getDashboardEmployeeOptionsQueryOptions(),
		enabled: includeEmployees,
	});

	return {
		employees: employees ?? [],
	};
}
