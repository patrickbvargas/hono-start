import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractAssignmentTypesQueryOptions,
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getContractStatusesQueryOptions,
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "../api/queries";

export function useContractOptions() {
	const { data: clients } = useSuspenseQuery(
		getSelectableContractClientsQueryOptions(),
	);
	const { data: employees } = useSuspenseQuery(
		getSelectableContractEmployeesQueryOptions(),
	);
	const { data: legalAreas } = useSuspenseQuery(
		getContractLegalAreasQueryOptions(),
	);
	const { data: statuses } = useSuspenseQuery(
		getContractStatusesQueryOptions(),
	);
	const { data: assignmentTypes } = useSuspenseQuery(
		getContractAssignmentTypesQueryOptions(),
	);
	const { data: revenueTypes } = useSuspenseQuery(
		getContractRevenueTypesQueryOptions(),
	);

	return {
		clients,
		employees,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
	};
}
