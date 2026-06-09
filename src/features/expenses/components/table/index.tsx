import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EXPENSE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ExpenseSummary } from "../../schemas/model";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";

interface ExpenseTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ExpenseSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ExpenseTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ExpenseTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<ExpenseSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => (
					<EntityIdTrigger id={row.original.id} onView={onView} />
				),
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: { headerClassName: "w-18", cellClassName: "whitespace-nowrap" },
			}),
			c.accessor("category", {
				header: "Categoria",
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("category"),
				meta: { minColumnWidth: 220 },
			}),
			c.accessor("expenseDate", {
				header: "Data",
				cell: ({ row }) => formatter.date(row.original.expenseDate),
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("expenseDate"),
			}),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ row }) => formatter.currency(row.original.amount),
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("amount"),
				meta: { cellClassName: "text-right" },
			}),
			c.accessor("isActive", {
				header: "Situação",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
			}),
			c.accessor("createdAt", {
				header: "Criado em",
				cell: ({ row }) => formatter.date(row.original.createdAt),
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("createdAt"),
			}),
			c.display({
				id: "actions",
				cell: ({ row }) => {
					const expense = row.original;
					const actions = getExpenseLifecycleActions({
						canManageLifecycle,
						isSoftDeleted: expense.isSoftDeleted,
					});

					return (
						<EntityActions
							canEdit={actions.canEdit}
							canRestore={actions.canRestore}
							canDelete={actions.canDelete}
							onView={() => onView?.(expense.id)}
							onEdit={() => onEdit?.(expense.id)}
							onRestore={() => onRestore?.(expense.id)}
							onDelete={() => onDelete?.(expense.id)}
						/>
					);
				},
				meta: { cellClassName: "w-11" },
			}),
		];
	}, [canManageLifecycle, onDelete, onEdit, onRestore, onView]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
