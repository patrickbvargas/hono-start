import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { PersonSummary } from "../../schemas/model";
import { getPersonLifecycleActions } from "../../utils/lifecycle-actions";

import { getPersonTableColumns } from "./columns";

interface PersonTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<PersonSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const PersonTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: PersonTableProps) => {
	const renderActions = React.useCallback(
		(
			person: PersonSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getPersonLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: person.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(person.id) : undefined}
					viewPermission={[
						"org:people:read",
						"org:clients:read",
						"org:suppliers:read",
						"org:employees:read",
					]}
					editPermission="org:people:update"
					restorePermission="org:people:restore"
					deletePermission="org:people:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(person.id) : undefined}
					onEdit={onEdit ? () => onEdit(person.id) : undefined}
					onRestore={onRestore ? () => onRestore(person.id) : undefined}
					onDelete={onDelete ? () => onDelete(person.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(
		() => getPersonTableColumns(renderActions),
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
