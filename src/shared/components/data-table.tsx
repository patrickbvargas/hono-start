import {
	type Column,
	type ColumnDef,
	type ColumnPinningState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { PaginationControl } from "./pagination-control";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

type ClassNames = Record<
	| "wrapper"
	| "table"
	| "thead"
	| "tbody"
	| "tfoot"
	| "tr"
	| "th"
	| "td"
	| "sortIcon"
	| "emptyWrapper",
	string
>;

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[] | TableOptions<TData>["columns"];
	data: TData[];
	pageSize?: number;
	defaultSort?: SortingState;
	globalFilter?: unknown;
	globalFilterFn?: FilterFn<TData>;
	defaultColumnPinning?: ColumnPinningState;
	classNames?: Partial<ClassNames>;
	onRowAction?: (index: number) => void;
}

export const DataTable = <TData, TValue>({
	columns,
	data,
	pageSize,
	defaultSort,
	globalFilter,
	globalFilterFn,
	defaultColumnPinning = {
		left: [],
		right: [],
	},
	onRowAction,
	classNames,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		initialState: {
			sorting: defaultSort,
			columnPinning: defaultColumnPinning,
			pagination: { pageIndex: 0, pageSize: pageSize ?? data.length + 999 },
		},
		state: {
			globalFilter,
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: globalFilterFn || "auto",
		enableSortingRemoval: false,
	});

	const containsFooter = React.useMemo(() => {
		return table
			.getAllColumns()
			.some((column) => Boolean(column.columnDef.footer));
	}, [table]);

	return (
		<div className={cn("space-y-4", classNames?.wrapper)}>
			<Table className={classNames?.table}>
				<TableHeader className={classNames?.thead}>
					<TableRow className={classNames?.tr}>
						{table.getFlatHeaders().map((header) => (
							<TableHead
								key={header.id}
								colSpan={header.colSpan}
								onClick={() => {
									if (!header.column.getCanSort()) return;
									header.column.toggleSorting();
								}}
								style={getPinnedColumnStyle(header.column)}
								className={cn(
									classNames?.th,
									header.column.columnDef.meta?.headerClassName,
								)}
								data-pinned={!!header.column.getIsPinned()}
							>
								<div className="flex items-center gap-2">
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{header.column.getCanSort() && (
										<ChevronDownIcon
											size={16}
											className={cn(
												"transition-transform duration-200 ease-in-out",
												"data-[visible=false]:hidden",
												"data-[direction=ascending]:rotate-180",
												classNames?.sortIcon,
											)}
											data-direction={
												header.column.getIsSorted() === "asc"
													? "ascending"
													: "descending"
											}
											data-visible={header.column.getIsSorted() !== false}
										/>
									)}
								</div>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className={classNames?.tbody}>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row, index) => (
							<TableRow
								key={row.id}
								onClick={() => onRowAction?.(index)}
								className={classNames?.tr}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										style={getPinnedColumnStyle(cell.column)}
										className={cn(
											classNames?.td,
											cell.column.columnDef.meta?.cellClassName,
										)}
										data-pinned={!!cell.column.getIsPinned()}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow className={classNames?.tr}>
							<TableCell
								colSpan={columns.length}
								className={cn(
									"h-24 text-center text-muted-foreground",
									classNames?.emptyWrapper,
								)}
							>
								Nenhum registro encontrado.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				{containsFooter && (
					<TableFooter className={classNames?.tfoot}>
						{table.getFooterGroups().map((footerGroup) => (
							<TableRow key={`f${footerGroup.id}`} className={classNames?.tr}>
								{footerGroup.headers.map((header) => (
									<TableCell
										key={header.id}
										style={getPinnedColumnStyle(header.column)}
										className={cn(
											classNames?.td,
											header.column.columnDef.meta?.cellClassName,
										)}
										data-pinned={!!header.column.getIsPinned()}
									>
										{flexRender(
											header.column.columnDef.footer,
											header.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableFooter>
				)}
			</Table>
			{table.getPageCount() > 1 && (
				<PaginationControl
					totalPages={table.getPageCount()}
					currentPage={table.getState().pagination.pageIndex + 1}
					onPageChange={(page) => table.setPageIndex(page - 1)}
				/>
			)}
		</div>
	);
};

function getPinnedColumnStyle<T>(column: Column<T>): React.CSSProperties {
	const isPinned = column.getIsPinned();

	if (!isPinned) return {};

	return {
		zIndex: 1,
		position: "sticky",
		...(isPinned === "left" && {
			left: 0,
			boxShadow: "inset -1px 0 0 0 var(--border)",
		}),
		...(isPinned === "right" && {
			right: 0,
			boxShadow: "inset 1px 0 0 0 var(--border)",
		}),
	};
}

declare module "@tanstack/react-table" {
	// biome-ignore lint/correctness/noUnusedVariables: TData e TValue são necessários para o merge da interface
	interface ColumnMeta<TData, TValue> {
		headerClassName?: string;
		cellClassName?: string;
	}
}
