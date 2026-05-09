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
import {
	type ContractEditOptions,
	mergeLegacyContractOption,
} from "../utils/edit-options";

interface UseContractOptionsParams extends Partial<ContractEditOptions> {}

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

export function useContractOptions({
	currentClient,
	currentEmployees = [],
}: UseContractOptionsParams = {}) {
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
	const mergedClients = mergeLegacyContractOption(clients, currentClient);
	const mergedEmployees = currentEmployees.reduce(
		(accumulator, legacyOption) =>
			mergeLegacyContractOption(accumulator, legacyOption),
		employees,
	);

	return {
		clients: mergedClients,
		employees: mergedEmployees,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
	};
}

export function useContractFilterOptions() {
	const [{ data: clients }, { data: legalAreas }, { data: statuses }] =
		useSuspenseQueries({
			queries: [
				getSelectableContractClientsQueryOptions(),
				getContractLegalAreasQueryOptions(),
				getContractStatusesQueryOptions(),
			],
		});

	return {
		clients,
		legalAreas,
		statuses,
	};
}
