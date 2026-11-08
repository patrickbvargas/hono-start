import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getFinancialOverviewOptionsQueryOptions,
	getFinancialOverviewSummaryQueryOptions,
} from "../api/queries";
import type { FinancialOverviewSearch } from "../schemas/search";

export function useFinancialOverviewData(search: FinancialOverviewSearch) {
	const { data: summary } = useSuspenseQuery(
		getFinancialOverviewSummaryQueryOptions(search),
	);

	return { summary };
}

export function useFinancialOverviewOptions() {
	const { data: options } = useSuspenseQuery(
		getFinancialOverviewOptionsQueryOptions(),
	);

	return (
		options ?? {
			analytics: [],
			paymentMethods: [],
			legalAreas: [],
			kinds: [],
		}
	);
}
