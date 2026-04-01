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
import { Table } from "@/shared/components/hui";
import { useSort } from "@/shared/hooks/use-sort";
import { cn } from "@/shared/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[] | TableOptions<TData>["columns"];
	data: TData[];
	className?: string;
	onRowAction?: (index: number) => void;
}

export const DataTable = <TData, TValue>({
	columns,
	data,
	onRowAction,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table>
			<Table.ScrollContainer>
				<Table.Content aria-label="TanStack Table">
					<Table.Header>
						{table.getFlatHeaders().map((header) => (
							<Table.Column
								id={header.id}
								key={header.id}
								className={cn(
									"py-3",
									header.column.columnDef.meta?.headerClassName,
								)}
							>
								<SortableColumnHeader header={header} />
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body>
						{table.getRowModel().rows.map((row, index) => (
							<Table.Row
								key={row.id}
								id={row.id}
								onPress={() => onRowAction?.(index)}
							>
								{row.getVisibleCells().map((cell) => (
									<Table.Cell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
		</Table>
	);
};

interface SortableColumnHeaderProps<TData> {
	header: Header<TData, unknown>;
}

const SortableColumnHeader = <TData,>({
	header,
}: SortableColumnHeaderProps<TData>) => {
	const { column, direction, getSortSearch } = useSort();

	const isPlaceholder = header.isPlaceholder;
	const canSort = header.column.getCanSort();
	const columnId = header.column.id;
	const isActive = column === columnId;

	const content = flexRender(
		header.column.columnDef.header,
		header.getContext(),
	);

	if (isPlaceholder) return null;
	if (!canSort) return content;

	return (
		<Link
			to="."
			preload="intent"
			search={getSortSearch(columnId)}
			className="group border border-red-500 flex items-center gap-2 cursor-pointer select-none"
		>
			{content}
			<ChevronUpIcon
				className={cn(
					"size-4 transition-all duration-200",
					isActive
						? "opacity-100 text-primary"
						: "opacity-0 group-hover:opacity-50 text-muted-foreground",
					isActive && direction === "desc" && "rotate-180",
				)}
			/>
		</Link>
	);
};
