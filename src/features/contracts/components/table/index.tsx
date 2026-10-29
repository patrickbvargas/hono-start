import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ContractSummary } from "../../schemas/model";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";

import { getContractTableColumns } from "./columns";

interface ContractTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ContractSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ContractTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ContractTableProps) => {
	const renderActions = React.useCallback(
		(
			contract: ContractSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getContractLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: contract.isSoftDeleted,
				statusValue: contract.statusValue,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(contract.id) : undefined}
					viewPermission={[
						"org:contracts:read_all",
						"org:contracts:read_assigned",
					]}
					editPermission={[
						"org:contracts:update_all",
						"org:contracts:update_assigned",
					]}
					restorePermission="org:contracts:restore"
					deletePermission="org:contracts:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(contract.id) : undefined}
					onEdit={onEdit ? () => onEdit(contract.id) : undefined}
					onRestore={onRestore ? () => onRestore(contract.id) : undefined}
					onDelete={onDelete ? () => onDelete(contract.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView, onOpenPage],
	);

	const columns = React.useMemo(
		() => getContractTableColumns(renderActions),
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
