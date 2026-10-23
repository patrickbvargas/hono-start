import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	type Header,
	type RowData,
	type SortingState,
	useTable,
} from "@tanstack/react-table";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useEffect } from "react";
import {
	Button,
	ScrollArea,
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui";
import { useSort } from "@/shared/hooks/use-sort";
import { dataTableFeatures } from "@/shared/lib/table";
import { cn } from "@/shared/lib/utils";
import { PaginationView } from "./pagination";

export interface DataTableProps<TData extends RowData> {
	// biome-ignore lint/suspicious/noExplicitAny: Heterogeneous accessor values follow TanStack column helper contract.
	columns: ColumnDef<typeof dataTableFeatures, TData, any>[];
	data: TData[];
	getRowId?: (row: TData) => string;
	pageSize?: number;
	initialSorting?: SortingState;
	emptyMessage?: string;
	className?: string;
	onRowAction?: (index: number) => void;
	footerContent?: React.ReactNode;
	tableFooterContent?: React.ReactNode;
}

export const DataTable = <TData extends RowData>({
	columns,
	data,
	emptyMessage = "Nenhum registro encontrado.",
	className,
	onRowAction,
	footerContent,
	tableFooterContent,
	pageSize,
	getRowId,
	initialSorting,
}: DataTableProps<TData>) => {
	const table = useTable({
		data,
		getRowId,
		columns,
		features: dataTableFeatures,
		manualPagination: pageSize === undefined,
		manualSorting: pageSize === undefined,
		initialState: {
			pagination: { pageIndex: 0, pageSize: pageSize ?? 10 },
			sorting: initialSorting ?? [],
		},
	});

	const rows = table.getRowModel().rows;
	const { pageIndex, pageSize: size } = table.state.pagination;
	const pageCount = table.getPageCount();
	const setPagination = table.setPagination;

	useEffect(() => {
		if (pageSize !== undefined) {
			setPagination({
				pageIndex: 0,
				pageSize: Math.max(1, Math.floor(pageSize)),
			});
		}
	}, [setPagination, pageSize]);

	return (
		<div
			className={cn(
				"border flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg",
				className,
			)}
		>
			<ScrollArea className="min-h-0 flex-1">
				<Table>
					<TableHeader>
						<TableRow>
							{table.getFlatHeaders().map((header) => (
								<TableHead
									key={header.id}
									colSpan={header.colSpan}
									aria-sort={
										pageSize !== undefined && header.column.getCanSort()
											? header.column.getIsSorted() === "asc"
												? "ascending"
												: header.column.getIsSorted() === "desc"
													? "descending"
													: "none"
											: undefined
									}
									className={header.column.columnDef.meta?.headerClassName}
								>
									{!header.isPlaceholder && (
										<DataTableHeader
											header={header}
											local={pageSize !== undefined}
										/>
									)}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							rows.map((row) => (
								<TableRow key={row.id} onClick={() => onRowAction?.(row.index)}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cell.column.columnDef.meta?.cellClassName}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					{tableFooterContent ? (
						<TableFooter className="border-0">{tableFooterContent}</TableFooter>
					) : null}
				</Table>
			</ScrollArea>
			{pageSize !== undefined && pageCount > 1 ? (
				<div className="border-t bg-background px-3 py-2">
					<PaginationView
						totalRecords={data.length}
						page={pageIndex + 1}
						limit={size}
						renderPage={(target, kind) => {
							const icons = {
								first: ChevronFirstIcon,
								previous: ChevronLeftIcon,
								next: ChevronRightIcon,
								last: ChevronLastIcon,
							};
							const Icon = kind === "number" ? null : icons[kind];
							const labels = {
								first: "Ir para a primeira página",
								previous: "Ir para a página anterior",
								next: "Ir para a próxima página",
								last: "Ir para a última página",
								number: `Ir para a página ${target}`,
							};
							return (
								<Button
									size="icon"
									variant={
										kind === "number" && target === pageIndex + 1
											? "outline"
											: "ghost"
									}
									aria-label={labels[kind]}
									aria-current={
										kind === "number" && target === pageIndex + 1
											? "page"
											: undefined
									}
									disabled={
										target < 1 ||
										target > pageCount ||
										(kind !== "number" && target === pageIndex + 1)
									}
									onClick={() => table.setPageIndex(target - 1)}
								>
									{Icon ? <Icon /> : target}
								</Button>
							);
						}}
					/>
				</div>
			) : null}
			{footerContent && table.getRowModel().rows?.length > 0 ? (
				<div className="flex justify-end border-t bg-background px-3 py-2">
					{footerContent}
				</div>
			) : null}
		</div>
	);
};

interface DataTableHeaderProps<TData extends RowData> {
	header: Header<typeof dataTableFeatures, TData, unknown>;
	local?: boolean;
}

const DataTableHeader = <TData extends RowData>({
	header,
	local,
}: DataTableHeaderProps<TData>) => {
	if (!header.column.getCanSort()) {
		return (
			<div className="flex items-center py-3">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</div>
		);
	}
	if (local) {
		const direction = header.column.getIsSorted();
		return (
			<button
				type="button"
				onClick={header.column.getToggleSortingHandler()}
				className="group flex items-center gap-2 py-3 cursor-pointer select-none"
			>
				{flexRender(header.column.columnDef.header, header.getContext())}
				<ChevronUpIcon
					className={cn(
						"size-4 transition-all duration-200 text-muted-foreground",
						direction ? "opacity-100" : "opacity-0 group-hover:opacity-50",
						direction === "desc" && "rotate-180",
					)}
				/>
			</button>
		);
	}
	return <DataTableSortHeader header={header} />;
};

const DataTableSortHeader = <TData extends RowData>({
	header,
}: DataTableHeaderProps<TData>) => {
	const { column, direction, getSortSearch } = useSort();

	const columnId = header.column.id;
	const isActive = column === columnId;

	const content = flexRender(
		header.column.columnDef.header,
		header.getContext(),
	);

	return (
		<Link
			to="."
			preload="intent"
			search={getSortSearch(columnId)}
			className="group flex items-center gap-2 py-3 cursor-pointer select-none"
		>
			{content}
			<ChevronUpIcon
				className={cn(
					"size-4 transition-all duration-200",
					isActive
						? "opacity-100 text-muted-foreground"
						: "opacity-0 group-hover:opacity-50 text-muted-foreground",
					isActive && direction === "desc" && "rotate-180",
				)}
			/>
		</Link>
	);
};
