import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getSelectableFeeContractsOptions,
	getSelectableFeeRevenuesOptions,
} from "../api/get";

export function useFeeOptions(contractId = "") {
	const { data: contracts } = useSuspenseQuery(
		getSelectableFeeContractsOptions(),
	);
	const { data: revenues } = useSuspenseQuery(
		getSelectableFeeRevenuesOptions(contractId),
	);

	return {
		contracts,
		revenues,
	};
}
