import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { FeeSummary } from "../../schemas/model";
import { getFeeLifecycleActions } from "../../utils/lifecycle-actions";

import { getFeeTableColumns } from "./columns";

interface FeeTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<FeeSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const FeeTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: FeeTableProps) => {
	const renderActions = React.useCallback(
		(fee: FeeSummary, presentation: "dropdown" | "context" = "dropdown") => {
			const actions = getFeeLifecycleActions({
				canManageLifecycle,
				contractStatusValue: fee.contractStatusValue,
				isSoftDeleted: fee.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(fee.id) : undefined}
					viewPermission={["org:fees:read_all", "org:fees:read_assigned"]}
					editPermission="org:fees:update"
					restorePermission="org:fees:restore"
					deletePermission="org:fees:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(fee.id) : undefined}
					onEdit={onEdit ? () => onEdit(fee.id) : undefined}
					onRestore={onRestore ? () => onRestore(fee.id) : undefined}
					onDelete={onDelete ? () => onDelete(fee.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(
		() => getFeeTableColumns(renderActions),
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
