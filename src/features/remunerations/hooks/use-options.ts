import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	getSelectableRemunerationContractsOptions,
	getSelectableRemunerationEmployeesOptions,
} from "../api/queries";

export function useRemunerationOptions(includeEmployees = false) {
	const { data: contracts } = useSuspenseQuery(
		getSelectableRemunerationContractsOptions(),
	);
	const { data: employees } = useQuery({
		...getSelectableRemunerationEmployeesOptions(),
		enabled: includeEmployees,
	});

	return {
		contracts,
		employees: employees ?? [],
	};
}
