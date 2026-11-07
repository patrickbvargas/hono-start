import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getPayableByIdQueryOptions,
	getPayableOptionsQueryOptions,
	getPayablePaymentsQueryOptions,
	getPayablesQueryOptions,
} from "../api/queries";
import type { PayableSearch } from "../schemas/search";
export function usePayables(search: PayableSearch) {
	const { data: payables } = useSuspenseQuery(getPayablesQueryOptions(search));
	return { payables };
}
export function usePayable(id: number) {
	const { data: payable } = useSuspenseQuery(getPayableByIdQueryOptions(id));
	return { payable };
}
export function usePayableOptions() {
	const { data: options } = useSuspenseQuery(getPayableOptionsQueryOptions());
	return options;
}
export function usePayablePayments(id: number) {
	const { data: payments } = useSuspenseQuery(
		getPayablePaymentsQueryOptions(id),
	);
	return { payments };
}
