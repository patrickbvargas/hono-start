import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getRemunerationByIdQueryOptions,
	getRemunerationsQueryOptions,
	getSelectableRemunerationContractsQueryOptions,
	getSelectableRemunerationEmployeesQueryOptions,
} from "../api/queries";
import type { RemunerationSearch } from "../schemas/search";

export function useRemunerations(search: RemunerationSearch) {
	const { data: remunerations } = useSuspenseQuery(
		getRemunerationsQueryOptions(search),
	);

	return { remunerations };
}

export function useRemuneration(id: EntityId) {
	const { data: remuneration } = useSuspenseQuery(
		getRemunerationByIdQueryOptions(id),
	);

	return { remuneration };
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
