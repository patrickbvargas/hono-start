import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getFeeByIdQueryOptions,
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
} from "../api/queries";
import type { FeeSearch } from "../schemas/search";

export function useFees(search: FeeSearch) {
	const { data: fees } = useSuspenseQuery(getFeesQueryOptions(search));

	return { fees };
}

export function useFee(id: EntityId) {
	const { data: fee } = useSuspenseQuery(getFeeByIdQueryOptions(id));

	return { fee };
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
