import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractAssignmentTypesQueryOptions,
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getContractStatusesQueryOptions,
	getContractsQueryOptions,
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "../api/queries";
import type { ContractSearch } from "../schemas/search";

export function useContractData(search: ContractSearch) {
	const { data: contracts } = useSuspenseQuery(
		getContractsQueryOptions(search),
	);

	return { contracts };
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
