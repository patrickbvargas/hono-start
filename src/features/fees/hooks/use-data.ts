import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getFeeByIdQueryOptions,
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
} from "../api/queries";
import type { FeeSearch } from "../schemas/search";
import {
	type FeeEditOptions,
	mergeLegacyFeeOption,
} from "../utils/edit-options";

interface UseFeeOptionsParams extends Partial<FeeEditOptions> {
	contractId?: string;
}

export function useFees(search: FeeSearch) {
	const { data: fees } = useSuspenseQuery(getFeesQueryOptions(search));

	return { fees };
}

export function useFee(id: EntityId) {
	const { data: fee } = useSuspenseQuery(getFeeByIdQueryOptions(id));

	return { fee };
}

export function useFeeOptions({
	contractId = "",
	currentContract,
	currentRevenue,
}: UseFeeOptionsParams = {}) {
	const [{ data: contracts }, { data: revenues }] = useSuspenseQueries({
		queries: [
			getSelectableFeeContractsQueryOptions(),
			getSelectableFeeRevenuesQueryOptions(contractId),
		],
	});

	return {
		contracts: mergeLegacyFeeOption(contracts, currentContract),
		revenues: mergeLegacyFeeOption(revenues, currentRevenue),
	};
}
