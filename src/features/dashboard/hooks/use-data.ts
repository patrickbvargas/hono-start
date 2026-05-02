import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
} from "@/features/contracts";
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
	const [{ data: employees }, { data: legalAreas }, { data: revenueTypes }] =
		useSuspenseQueries({
			queries: [
				getDashboardEmployeeOptionsQueryOptions(),
				getContractLegalAreasQueryOptions(),
				getContractRevenueTypesQueryOptions(),
			],
		});

	return {
		employees,
		legalAreas,
		revenueTypes,
	};
}
