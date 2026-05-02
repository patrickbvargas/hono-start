import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type Header,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronUpIcon } from "lucide-react";
import {
	ScrollArea,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui";
import { useSort } from "@/shared/hooks/use-sort";
import { cn } from "@/shared/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[] | TableOptions<TData>["columns"];
	data: TData[];
	className?: string;
	onRowAction?: (index: number) => void;
	footerContent?: React.ReactNode;
}

export const DataTable = <TData, TValue>({
	columns,
	data,
	className,
	onRowAction,
	footerContent,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div
			className={cn(
				"flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg border border-input",
				className,
			)}
		>
			<ScrollArea
				className={cn(
					"min-h-0 flex-1",
					"data-has-overflow-y:**:data-[slot=scroll-area-viewport]:pr-2",
				)}
			>
				<Table className="min-w-full w-max">
					<TableHeader>
						<TableRow>
							{table.getFlatHeaders().map((header) => (
								<TableHead
									key={header.id}
									colSpan={header.colSpan}
									className={header.column.columnDef.meta?.headerClassName}
								>
									{!header.isPlaceholder && <DataTableHeader header={header} />}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row, index) => (
								<TableRow
									key={row.id}
									onClick={() => onRowAction?.(index)}
									className="cursor-pointer"
									data-state={row.getIsSelected() && "selected"}
								>
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
									Nenhum registro encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</ScrollArea>
			{footerContent && (
				<div className="flex justify-end border-t bg-background px-3 py-2">
					{footerContent}
				</div>
			)}
		</div>
	);
};

interface DataTableHeaderProps<TData> {
	header: Header<TData, unknown>;
}

const DataTableHeader = <TData,>({ header }: DataTableHeaderProps<TData>) => {
	const { column, direction, getSortSearch } = useSort();

	const canSort = header.column.getCanSort();
	const columnId = header.column.id;
	const isActive = column === columnId;

	const content = flexRender(
		header.column.columnDef.header,
		header.getContext(),
	);

	if (!canSort) return <div className="flex items-center py-3">{content}</div>;

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
