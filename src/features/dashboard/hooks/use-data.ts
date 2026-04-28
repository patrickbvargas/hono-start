import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
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
	const [{ data: employees }] = useSuspenseQueries({
		queries: [getDashboardEmployeeOptionsQueryOptions()],
	});

	return {
		employees,
	};
}
