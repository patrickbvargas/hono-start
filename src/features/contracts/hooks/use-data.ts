import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getContractAssignmentTypesQueryOptions,
	getContractByIdQueryOptions,
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getContractStatusesQueryOptions,
	getContractsQueryOptions,
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "../api/queries";
import type { ContractSearch } from "../schemas/search";

export function useContracts(search: ContractSearch) {
	const { data: contracts } = useSuspenseQuery(
		getContractsQueryOptions(search),
	);

	return { contracts };
}

export function useContract(id: EntityId) {
	const { data: contract } = useSuspenseQuery(getContractByIdQueryOptions(id));

	return { contract };
}

export function useContractOptions() {
	const [
		{ data: clients },
		{ data: employees },
		{ data: legalAreas },
		{ data: statuses },
		{ data: assignmentTypes },
		{ data: revenueTypes },
	] = useSuspenseQueries({
		queries: [
			getSelectableContractClientsQueryOptions(),
			getSelectableContractEmployeesQueryOptions(),
			getContractLegalAreasQueryOptions(),
			getContractStatusesQueryOptions(),
			getContractAssignmentTypesQueryOptions(),
			getContractRevenueTypesQueryOptions(),
		],
	});

	return {
		clients,
		employees,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
	};
}
