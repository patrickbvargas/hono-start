import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getReceivableByIdQueryOptions,
	getReceivableOptionsQueryOptions,
	getReceivableReceiptsQueryOptions,
	getReceivablesQueryOptions,
} from "../api/queries";
import type { ReceivableSearch } from "../schemas/search";
export function useReceivables(search: ReceivableSearch) {
	const { data: receivables } = useSuspenseQuery(
		getReceivablesQueryOptions(search),
	);
	return { receivables };
}
export function useReceivable(id: number) {
	const { data: receivable } = useSuspenseQuery(
		getReceivableByIdQueryOptions(id),
	);
	return { receivable };
}
export function useReceivableOptions() {
	const { data: options } = useSuspenseQuery(
		getReceivableOptionsQueryOptions(),
	);
	return options;
}
export function useReceivableReceipts(id: number) {
	const { data: receipts } = useSuspenseQuery(
		getReceivableReceiptsQueryOptions(id),
	);
	return { receipts };
}
