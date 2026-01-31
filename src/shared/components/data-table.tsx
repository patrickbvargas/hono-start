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
import { useSort } from "@/shared/hooks/use-sort";
import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
};

interface DataTableHeaderProps<TData> {
  header: Header<TData, unknown>;
}

const DataTableHeader = <TData,>({ header }: DataTableHeaderProps<TData>) => {
  const { sortBy, sortOrder, getSortSearch } = useSort();

  const canSort = header.column.getCanSort();
  const columnId = header.column.id;
  const isActive = sortBy === columnId;

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
            ? "opacity-100 text-primary"
            : "opacity-0 group-hover:opacity-50 text-muted-foreground",
          isActive && sortOrder === "desc" && "rotate-180",
        )}
      />
    </Link>
  );
};

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: TData e TValue são necessários para o merge da interface
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}
