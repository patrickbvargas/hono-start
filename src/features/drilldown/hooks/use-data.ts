import type { QueryKey } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { RowData } from "@tanstack/react-table";
import type { DrilldownProps, DrilldownResult } from "../schemas/model";

export function useDrilldownData<
	T extends RowData,
	TContext,
	TFilters,
	TResult extends DrilldownResult<T>,
	TKey extends QueryKey,
>(props: DrilldownProps<T, TContext, TFilters, TResult, TKey>) {
	const options = props.queryOptions({
		context: props.context,
		filters: props.filters,
	});
	const query = useQuery({
		...options,
		enabled: props.state.isOpen ? (options.enabled ?? true) : false,
		placeholderData: undefined,
		select: (value) => props.responseSchema.parse(value),
	});
	return { query };
}
