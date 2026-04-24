import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	getRemunerationsQueryOptions,
	getSelectableRemunerationContractsQueryOptions,
	getSelectableRemunerationEmployeesQueryOptions,
} from "../api/queries";
import type { RemunerationSearch } from "../schemas/search";

export function useRemunerationData(search: RemunerationSearch) {
	const { data: remunerations } = useSuspenseQuery(
		getRemunerationsQueryOptions(search),
	);

	return { remunerations };
}

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
