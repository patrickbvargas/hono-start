import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractAssignmentTypesOptions,
	getContractLegalAreasOptions,
	getContractRevenueTypesOptions,
	getContractStatusesOptions,
	getSelectableContractClientsOptions,
	getSelectableContractEmployeesOptions,
} from "../api/get";

export function useContractOptions() {
	const { data: clients } = useSuspenseQuery(
		getSelectableContractClientsOptions(),
	);
	const { data: employees } = useSuspenseQuery(
		getSelectableContractEmployeesOptions(),
	);
	const { data: legalAreas } = useSuspenseQuery(getContractLegalAreasOptions());
	const { data: statuses } = useSuspenseQuery(getContractStatusesOptions());
	const { data: assignmentTypes } = useSuspenseQuery(
		getContractAssignmentTypesOptions(),
	);
	const { data: revenueTypes } = useSuspenseQuery(
		getContractRevenueTypesOptions(),
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
