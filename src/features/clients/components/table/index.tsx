import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ClientSummary } from "../../schemas/model";
import { getClientLifecycleActions } from "../../utils/lifecycle-actions";

import { getClientTableColumns } from "./columns";

interface ClientTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ClientSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ClientTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ClientTableProps) => {
	const renderActions = React.useCallback(
		(
			client: ClientSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getClientLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: client.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(client.id) : undefined}
					viewPermission="org:clients:read"
					editPermission="org:clients:update"
					restorePermission="org:clients:restore"
					deletePermission="org:clients:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(client.id) : undefined}
					onEdit={onEdit ? () => onEdit(client.id) : undefined}
					onRestore={onRestore ? () => onRestore(client.id) : undefined}
					onDelete={onDelete ? () => onDelete(client.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(
		() => getClientTableColumns(renderActions),
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
