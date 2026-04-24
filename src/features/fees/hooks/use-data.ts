import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
} from "../api/queries";
import type { FeeSearch } from "../schemas/search";

export function useFeeData(search: FeeSearch) {
	const { data: fees } = useSuspenseQuery(getFeesQueryOptions(search));

	return { fees };
}

export function useFeeOptions(contractId = "") {
	const [{ data: contracts }, { data: revenues }] = useSuspenseQueries({
		queries: [
			getSelectableFeeContractsQueryOptions(),
			getSelectableFeeRevenuesQueryOptions(contractId),
		],
	});

	return {
		contracts,
		revenues,
	};
}
