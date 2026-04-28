import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
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

export function useRemunerationOptions() {
	const [{ data: contracts }, { data: employees }] = useSuspenseQueries({
		queries: [
			getSelectableRemunerationContractsQueryOptions(),
			getSelectableRemunerationEmployeesQueryOptions(),
		],
	});

	return {
		contracts,
		employees,
	};
}
