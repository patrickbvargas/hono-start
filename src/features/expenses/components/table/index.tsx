import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ExpenseSummary } from "../../schemas/model";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";

import { getExpenseTableColumns } from "./columns";

interface ExpenseTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ExpenseSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ExpenseTable = ({
	emptyState,
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

	const columns = React.useMemo(
		() => getExpenseTableColumns(renderActions),
		[renderActions],
	);

	return (
		<DataTable
			emptyState={emptyState}
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
