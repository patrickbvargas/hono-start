import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type Header,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronUpIcon, InboxIcon } from "lucide-react";
import {
	EmptyState,
	Link,
	Table,
	type TableProps,
} from "@/shared/components/ui";
import { useSort } from "@/shared/hooks/use-sort";
import { cn } from "@/shared/lib/utils";

interface DataTableProps<TData, TValue> extends TableProps {
	columns: ColumnDef<TData, TValue>[] | TableOptions<TData>["columns"];
	data: TData[];
	classNames?: {
		table?: string;
		content?: string;
		header?: string;
		body?: string;
	};
	onRowAction?: (index: number) => void;
	footerContent?: React.ReactNode;
}

export const DataTable = <TData, TValue>({
	columns,
	data,
	onRowAction,
	footerContent,
	className,
	classNames,
	...props
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table className={cn(className, classNames?.table)} {...props}>
			<Table.ScrollContainer>
				<Table.ResizableContainer>
					<Table.Content
						aria-label="TanStack Table"
						className={classNames?.content}
					>
						<Table.Header className={classNames?.header}>
							{table.getFlatHeaders().map((header) => (
								<Table.Column
									id={header.id}
									key={header.id}
									allowsSorting={header.column.getCanSort()}
									isRowHeader={header.column.getIndex() === 0}
									minWidth={header.column.columnDef.meta?.minColumnWidth}
									className={cn(
										"p-0",
										header.column.columnDef.meta?.headerClassName,
									)}
								>
									<SortableColumnHeader header={header} />
									<Table.ColumnResizer />
								</Table.Column>
							))}
						</Table.Header>
						<Table.Body
							renderEmptyState={() => (
								<EmptyState className="w-full min-h-40 flex flex-col items-center justify-center gap-4 text-center">
									<InboxIcon size={18} className="text-muted" />
									<span className="text-sm text-muted">
										Nenhum resultado encontrado
									</span>
								</EmptyState>
							)}
							className={classNames?.body}
						>
							{table.getRowModel().rows.map((row, index) => (
								<Table.Row
									key={row.id}
									id={row.id}
									onPress={() => onRowAction?.(index)}
								>
									{row.getVisibleCells().map((cell) => (
										<Table.Cell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</Table.Cell>
									))}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Content>
				</Table.ResizableContainer>
			</Table.ScrollContainer>
			{footerContent && <Table.Footer>{footerContent}</Table.Footer>}
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

	if (header.isPlaceholder) return null;

	const {
		column: { id, columnDef, getCanSort },
		getContext,
	} = header;

	const content = flexRender(columnDef.header, getContext());

	if (!getCanSort())
		return <span className="block px-3 py-2.5">{content}</span>;

	const isActive = column === id;

	return (
		<Link
			to="."
			preload="intent"
			search={getSortSearch(id)}
			className="group px-3 py-2.5 size-full text-inherit text-xs no-underline gap-1 rounded-lg focus:ring-offset-0 focus:ring-inset"
		>
			{content}
			<Link.Icon
				className={cn(
					"size-4 transition-all duration-200 invisible",
					isActive && "visible opacity-100",
					isActive && direction === "desc" && "rotate-180",
				)}
			>
				<ChevronUpIcon />
			</Link.Icon>
		</Link>
	);
};
