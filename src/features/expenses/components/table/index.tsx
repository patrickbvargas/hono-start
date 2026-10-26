import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EXPENSE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ExpenseSummary } from "../../schemas/model";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";
import { getExpenseReadColumns } from "./columns";

interface ExpenseTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ExpenseSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ExpenseTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ExpenseTableProps) => {
	const renderActions = React.useCallback(
		(
			expense: ExpenseSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getExpenseLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: expense.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(expense.id) : undefined}
					viewPermission="org:expenses:read"
					editPermission="org:expenses:update"
					restorePermission="org:expenses:restore"
					deletePermission="org:expenses:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(expense.id) : undefined}
					onEdit={onEdit ? () => onEdit(expense.id) : undefined}
					onRestore={onRestore ? () => onRestore(expense.id) : undefined}
					onDelete={onDelete ? () => onDelete(expense.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, ExpenseSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
				enableSorting: EXPENSE_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: { headerClassName: "w-18", cellClassName: "whitespace-nowrap" },
			}),
			...getExpenseReadColumns<ExpenseSummary>({
				category: (row) => row.category,
				date: (row) => row.expenseDate,
				amount: (row) => row.amount,
				enableSorting: true,
			}),
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
			c.accessor("isActive", {
				header: "Situação",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
			}),
			c.display({
				id: "actions",
				cell: ({ row }) => renderActions(row.original),
				meta: { cellClassName: "w-11" },
			}),
		];
	}, [renderActions]);

	return (
		<DataTable
			columns={columns}
			data={data}
			renderRowContextMenu={(index) => renderActions(data[index], "context")}
			onRowAction={
				onOpenPage ? (index) => onOpenPage(data[index].id) : undefined
			}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
