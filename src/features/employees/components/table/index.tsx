import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { EmployeeSummary } from "../../schemas/model";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";

import { getEmployeeTableColumns } from "./columns";

interface EmployeeTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<EmployeeSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const EmployeeTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: EmployeeTableProps) => {
	const renderActions = React.useCallback(
		(
			employee: EmployeeSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getEmployeeLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: employee.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(employee.id) : undefined}
					viewPermission="org:employees:read"
					editPermission="org:employees:update"
					restorePermission="org:employees:restore"
					deletePermission="org:employees:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(employee.id) : undefined}
					onEdit={onEdit ? () => onEdit(employee.id) : undefined}
					onRestore={onRestore ? () => onRestore(employee.id) : undefined}
					onDelete={onDelete ? () => onDelete(employee.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onView, onEdit, onDelete, onRestore],
	);

	const columns = React.useMemo(
		() => getEmployeeTableColumns(renderActions),
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
