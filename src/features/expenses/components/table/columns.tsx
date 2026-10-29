import { createColumnHelper, type RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { TableButton } from "@/shared/components/table-button";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";

import { EXPENSE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ExpenseSummary } from "../../schemas/model";

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
					<TableButton
						title={`Abrir página de ${context.getValue()}`}
						onClick={() => onCategoryClick(context.row.original)}
					>
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
			cell: ({ getValue }) => (
				<SensitiveValue>{formatter.currency(getValue())}</SensitiveValue>
			),
			enableSorting,
			meta: { cellClassName: "text-right" },
		}),
	];
}

export function getExpenseTableColumns(
	renderActions: (row: ExpenseSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, ExpenseSummary>();

	const readColumns = getExpenseReadColumns<ExpenseSummary>({
		category: (row) => row.category,
		date: (row) => row.expenseDate,
		amount: (row) => row.amount,
		enableSorting: true,
	});

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
			enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("id"),
			meta: { headerClassName: "w-18", cellClassName: "whitespace-nowrap" },
		}),
		...readColumns.slice(0, -1),
		c.accessor("notes", {
			header: "Descrição",
			enableSorting: false,
			cell: (context) => (
				<div>
					<span
						className="line-clamp-2 max-w-80 whitespace-normal wrap-break-word"
						title={context.getValue() ?? undefined}
					>
						{context.getValue() || "—"}
					</span>
				</div>
			),
		}),
		...readColumns.slice(-1),
		c.display({
			id: "actions",
			cell: ({ row }) => renderActions(row.original),
			meta: { cellClassName: "w-11" },
		}),
	];
}
