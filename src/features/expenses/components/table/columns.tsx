import { createColumnHelper, type RowData } from "@tanstack/react-table";
import { TableButton } from "@/shared/components/table-button";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";

interface ExpenseReadColumnOptions<T> {
	category: (row: T) => string;
	date: (row: T) => string;
	amount: (row: T) => number;
	enableSorting?: boolean;
	onCategoryClick?: (row: T) => void;
}

export function getExpenseReadColumns<T extends RowData>({
	category,
	date,
	amount,
	enableSorting = false,
	onCategoryClick,
}: ExpenseReadColumnOptions<T>) {
	const c = createColumnHelper<typeof dataTableFeatures, T>();
	return [
		c.accessor(category, {
			id: "category",
			header: "Categoria",
			cell: (context) =>
				onCategoryClick ? (
					<TableButton onClick={() => onCategoryClick(context.row.original)}>
						{context.getValue()}
					</TableButton>
				) : (
					context.getValue()
				),
			enableSorting,
			meta: { minColumnWidth: 220 },
		}),
		c.accessor(date, {
			id: "expenseDate",
			header: "Data",
			cell: ({ getValue }) => formatter.calendarDate(getValue()),
			enableSorting,
		}),
		c.accessor(amount, {
			id: "amount",
			header: "Valor",
			cell: ({ getValue }) => formatter.currency(getValue()),
			enableSorting,
			meta: { cellClassName: "text-right" },
		}),
	];
}
