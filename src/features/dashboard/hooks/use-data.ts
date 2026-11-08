import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getSelectableContractClientsQueryOptions,
} from "@/features/contracts";
import { getReceivableOptionsQueryOptions } from "@/features/receivables";
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

	const canReadTitleOptions =
		hasPermission(session, "org:receivables:read_all") ||
		hasPermission(session, "org:receivables:read_assigned");
	const [
		{ data: clients },
		{ data: titleOptions },
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
				...getReceivableOptionsQueryOptions(),
				queryFn: canReadTitleOptions
					? getReceivableOptionsQueryOptions().queryFn
					: async () => ({
							debtors: [],
							contracts: [],
							analytics: [],
							methods: [],
						}),
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
		contracts: titleOptions.contracts,
		employees,
		legalAreas,
		revenueTypes,
	};
}
