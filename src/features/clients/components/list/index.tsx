import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ClientSummary } from "../../schemas/model";
import { formatClientDocument } from "../../utils/format";
import { getClientLifecycleActions } from "../../utils/lifecycle-actions";

interface ClientListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ClientSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ClientList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ClientListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(client: ClientSummary): DetailFieldItem[] => [
			{
				term: "Documento",
				definition: formatClientDocument(client.document),
			},
			{
				term: "Tipo",
				definition: client.type,
			},
			{
				term: "Contratos",
				definition: client.contractCount,
			},
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={client.isActive}
						isSoftDeleted={client.isSoftDeleted}
					/>
				),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(client: ClientSummary) => {
			const actions = getClientLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: client.isSoftDeleted,
			});

			return (
				<EntityActions
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(client.id)}
					onEdit={() => onEdit?.(client.id)}
					onRestore={() => onRestore?.(client.id)}
					onDelete={() => onDelete?.(client.id)}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(client) => client.id}
			renderTitle={(client) => client.fullName}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(client) => onView?.(client.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
