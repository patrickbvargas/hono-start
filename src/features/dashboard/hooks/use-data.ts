import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getSelectableContractClientsQueryOptions,
} from "@/features/contracts";
import { getSelectableFeeContractsQueryOptions } from "@/features/fees";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import {
	getDashboardEmployeeOptionsQueryOptions,
	getDashboardSummaryQueryOptions,
} from "../api/queries";
import type { DashboardSearch } from "../schemas/search";

export function useDashboardData(search: DashboardSearch) {
	const { data: summary } = useSuspenseQuery(
		getDashboardSummaryQueryOptions(search),
	);

	return { summary };
}

export function useDashboardOptions() {
	const session = useLoggedUserSession();
	const canReadContractOptions =
		hasPermission(session, "org:contracts:read_all") ||
		hasPermission(session, "org:contracts:read_assigned");

	const canReadFeeOptions =
		hasPermission(session, "org:fees:read_all") ||
		hasPermission(session, "org:fees:read_assigned");
	const [
		{ data: clients },
		{ data: contracts },
		{ data: employees },
		{ data: legalAreas },
		{ data: revenueTypes },
	] = useSuspenseQueries({
		queries: [
			{
				...getSelectableContractClientsQueryOptions(),
				queryFn: canReadContractOptions
					? getSelectableContractClientsQueryOptions().queryFn
					: async () => [],
			},
			{
				...getSelectableFeeContractsQueryOptions(),
				queryFn: canReadFeeOptions
					? getSelectableFeeContractsQueryOptions().queryFn
					: async () => [],
			},
			getDashboardEmployeeOptionsQueryOptions(),
			{
				...getContractLegalAreasQueryOptions(),
				queryFn: canReadContractOptions
					? getContractLegalAreasQueryOptions().queryFn
					: async () => [],
			},
			{
				...getContractRevenueTypesQueryOptions(),
				queryFn: canReadContractOptions
					? getContractRevenueTypesQueryOptions().queryFn
					: async () => [],
			},
		],
	});

	return {
		clients,
		contracts,
		employees,
		legalAreas,
		revenueTypes,
	};
}
