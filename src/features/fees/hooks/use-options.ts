import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
} from "../api/queries";

export function useFeeOptions(contractId = "") {
	const { data: contracts } = useSuspenseQuery(
		getSelectableFeeContractsQueryOptions(),
	);
	const { data: revenues } = useSuspenseQuery(
		getSelectableFeeRevenuesQueryOptions(contractId),
	);

	return {
		contracts,
		revenues,
	};
}
