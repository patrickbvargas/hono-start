import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	getSelectableRemunerationContractsQueryOptions,
	getSelectableRemunerationEmployeesQueryOptions,
} from "../api/queries";

export function useRemunerationOptions(includeEmployees = false) {
	const { data: contracts } = useSuspenseQuery(
		getSelectableRemunerationContractsQueryOptions(),
	);
	const { data: employees } = useQuery({
		...getSelectableRemunerationEmployeesQueryOptions(),
		enabled: includeEmployees,
	});

	return {
		contracts,
		employees: employees ?? [],
	};
}
