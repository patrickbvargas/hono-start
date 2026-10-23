import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
} from "@/features/contracts";
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

	const [{ data: employees }, { data: legalAreas }, { data: revenueTypes }] =
		useSuspenseQueries({
			queries: [
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
		employees,
		legalAreas,
		revenueTypes,
	};
}
