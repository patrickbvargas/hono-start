import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type { RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type * as z from "zod";
import type { DataTableProps } from "@/shared/components/data-table";
import type { OverlayState } from "@/shared/types/overlay";

export interface DrilldownResult<T> {
	data: T[];
	total: number;
}

export interface DrilldownRequest<TContext, TFilters> {
	context: TContext;
	filters: TFilters;
}

export interface DrilldownProps<
	T extends RowData,
	TContext,
	TFilters,
	TResult extends DrilldownResult<T>,
	TKey extends QueryKey,
> {
	state: OverlayState;
	title: string;
	description: string;
	context: TContext;
	filters: TFilters;
	responseSchema: z.ZodType<TResult>;
	queryOptions: (
		request: DrilldownRequest<TContext, TFilters>,
	) => UseQueryOptions<TResult, Error, TResult, TKey>;
	columns: DataTableProps<T>["columns"];
	getRowId: (row: T) => string;
	renderSummary?: (result: TResult) => ReactNode;
	pageSize?: number;
	onRowAction?: (row: T) => void;
	renderRowContextMenu?: (row: T) => ReactNode;
	rowActionLabel?: string;
	detailOpen?: boolean;
	children?: ReactNode;
	initialSorting?: DataTableProps<T>["initialSorting"];
	className?: string;
	emptyMessage?: string;
	errorMessage?: string;
	returnFocus?:
		| HTMLElement
		| SVGElement
		| (() => HTMLElement | SVGElement | null)
		| null;
}
