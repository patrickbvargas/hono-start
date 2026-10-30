import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { PersonSummary } from "../../schemas/model";
import { formatPersonDocument } from "../../utils/format";
import { getPersonLifecycleActions } from "../../utils/lifecycle-actions";

interface PersonListProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<PersonSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const PersonList = ({
	emptyState,
	canManageLifecycle = false,
	data,
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: PersonListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(person: PersonSummary): DetailFieldItem[] => [
			{
				term: "Documento",
				definition: formatPersonDocument(person.document),
			},
			{
				term: "Papéis",
				definition: person.roles.join(", "),
			},
			{ term: "Tipo", definition: person.type },
			{
				term: "Contratos",
				definition: person.contractCount,
			},
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={person.isActive}
						isSoftDeleted={person.isSoftDeleted}
					/>
				),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(person: PersonSummary) => {
			const actions = getPersonLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: person.isSoftDeleted,
			});

			return (
				<EntityActions
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
					onView={() => onView?.(person.id)}
					onEdit={() => onEdit?.(person.id)}
					onRestore={() => onRestore?.(person.id)}
					onDelete={() => onDelete?.(person.id)}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			emptyState={emptyState}
			data={items}
			getRowKey={(person) => person.id}
			renderTitle={(person) => person.fullName}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(person) => (onOpenPage ?? onView)?.(person.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
